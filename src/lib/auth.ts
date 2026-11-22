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
const client = globalForMongo.__fixmateMongo ?? new MongoClient(uri, { appName: "FixMate" });
globalForMongo.__fixmateMongo = client;

const db = client.db(DB_NAME);

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
