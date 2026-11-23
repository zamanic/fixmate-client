import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

/**
 * BetterAuth server instance — the single source of identity for FixMate.
 *
 *  • users live in BetterAuth's `user` collection (collection name: `user`)
 *  • our extra profile fields ride along as `additionalFields`
 *  • the `jwt()` plugin exposes `/api/auth/jwks`, which the Express server
 *    fetches to verify bearer tokens — no shared secret between the tiers.
 *
 * See `.project/CONTRACT.md` §2 and §5.
 */

const CLIENT_URL = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const DB_NAME = process.env.DB_NAME ?? "fixmate";

const uri = process.env.BETTER_AUTH_DB_URL ?? process.env.MONGODB_URI;
if (!uri) {
  throw new Error("BetterAuth needs BETTER_AUTH_DB_URL (or MONGODB_URI) to be set.");
}

/** One pooled client per process — hot reloads would otherwise leak sockets. */
const globalForMongo = globalThis as unknown as { __fixmateMongo?: MongoClient };
const client =
  globalForMongo.__fixmateMongo ??
  new MongoClient(uri, {
    appName: "FixMate",
    // Serverless defaults. Bound the connect so an unreachable cluster fails in
    // seconds instead of stalling a render for the 30s driver default, and keep
    // the pool small because every Vercel instance keeps its own connections.
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 5,
    minPoolSize: 0,
  });
globalForMongo.__fixmateMongo = client;

const db = client.db(DB_NAME);

/**
 * Make the pooled client usable again after a connect that failed.
 *
 * A failed connect — Atlas briefly unreachable, a 10s server-selection timeout —
 * leaves `client.topology` pointing at a topology that has been *closed*, and
 * the driver then keeps using that field for every later operation without
 * checking it: `mongodb/lib/operations/execute_operation.js` reads
 *
 *     client.topology == null ? await autoConnect(client) : client.topology
 *
 * so nothing ever reconnects. Every session read on such an instance rejects
 * with `MongoTopologyClosedError: Topology is closed` for the life of the
 * process, which is what carried `/sign-in` and `/dashboard` to the route error
 * boundary (BetterAuth logs the same and adds "It is not retried until the
 * application restarts").
 *
 * `connect()` returns immediately while a topology is open and builds a fresh
 * one when it isn't — see `mongo_client.js#_connect` — so awaiting it before a
 * session read heals the instance at no cost on the happy path. It never throws
 * here: when Atlas is genuinely down the caller still needs to degrade
 * gracefully, and the next request simply retries.
 */
export async function ensureMongoConnected(): Promise<boolean> {
  try {
    await client.connect();
    return true;
  } catch {
    return false;
  }
}

/** Only these two can be self-selected at sign-up — `admin` never can. */
const SIGNUP_ROLES = ["customer", "technician"] as const;
type SignupRole = (typeof SIGNUP_ROLES)[number];

export const auth = betterAuth({
  appName: "FixMate",
  baseURL: CLIENT_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client }),
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? CLIENT_URL)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.BETTER_AUTH_GOOGLE_SECRET ?? "",
    },
  },

  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "customer", input: true },
      phone: { type: "string", required: false, input: true },
      area: { type: "string", required: false, input: true },
      bio: { type: "string", required: false, input: true },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },

  plugins: [
    jwt({
      jwt: {
        issuer: CLIENT_URL,
        audience: CLIENT_URL,
        expirationTime: "1h",
      },
    }),
  ],

  /**
   * Server-side role clamp. Whatever the sign-up form sends, an account can
   * only ever be created as `customer` or `technician` (spec: never `admin`).
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const requested = String((user as { role?: unknown }).role ?? "");
          const role: SignupRole = (SIGNUP_ROLES as readonly string[]).includes(requested)
            ? (requested as SignupRole)
            : "customer";
          return { data: { ...user, role } };
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
