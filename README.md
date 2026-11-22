# FixMate — Client

**FixMate** is a two-sided marketplace for device and home-appliance repair. Customers browse vetted repair services, file a repair request, track it through a status pipeline, and pay — but only after the job is marked **completed**. Technicians list services, manage their own queue, and drive each request through the pipeline. Admins moderate listings, manage roles, and watch the whole marketplace on a single analytics dashboard.

This repository is the **client** (Next.js 16, App Router, TypeScript). The Express API lives in the companion repo **fixmate-server**.

- **Live URL:** https://fix-mate-client-kohl.vercel.app
- **API base URL:** `https://fix-mate-server-delta.vercel.app` (via `NEXT_PUBLIC_API_URL`)

---

## Feature highlights

1. **Animated public storefront** — a scroll-scrubbed film hero, featured-service grid fetched with `limit(6)`, “How it works” rail, category chips and testimonial band. Every section is composed from one motion vocabulary (`src/lib/motion/variants.ts`) and one design-token set, with a reduced-motion path that renders the final state instead of animating.
2. **Server-side service discovery** — `/services` search, category filter, price/rating sort and pagination all execute in MongoDB and live in the URL, so any result set is shareable and survives a reload. `/services/[id]` shows the full listing plus a booking modal.
3. **BetterAuth + JWT-by-JWKS auth with three roles** — email/password and Google sign-in; the Express API never sees a shared secret, it verifies the BetterAuth-issued JWT against the client’s JWKS endpoint. `proxy.ts` plus per-role layouts gate `/dashboard/*`, routing anonymous visitors to `/sign-in?redirectTo=…` and cross-role access to `/unauthorized`.
4. **Business-enforced repair pipeline** — a repair request moves `requested → accepted | rejected | cancelled`, then `accepted → in-progress → completed → paid`, with every transition enforced on the server (`409 INVALID_TRANSITION` otherwise). Illegal moves are impossible from the UI because the UI never offers them.
5. **Pay-after-completion with Stripe Checkout** — **Pay Now** only appears on a `completed` + `unpaid` job. The amount is always read from the stored booking, never from the client. `payment_intent` + webhook are idempotent: exactly one payment row per booking.
6. **Technician workspace** — create and edit services (any edit resets approval to `pending`), toggle availability, delete with a confirmation dialog, and upload service photos to ImgBB. The request queue exposes accept / reject / start / complete actions with a final-amount field.
7. **Admin console with real charts** — a single `$facet` aggregation feeds the dashboard (user/service/booking counts, revenue totals, monthly bookings, top categories), rendered with Recharts. Moderation covers roles (never your own), listing approval, every booking and every transaction.
8. **Craft floor** — light/dark theme toggle, skeleton loaders, empty states with CTAs, a custom 404 with “Return to Home”, an error boundary, equal-height card grids, toast feedback via Sonner (no `alert()`), and full mobile/tablet/desktop responsiveness.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.4.6** (App Router, `src/`, Turbopack) |
| React | React **19.3** with the **React Compiler** |
| Language | TypeScript 5 |
| Next features | Cache Components, Partial Prefetching, `proxy.ts` |
| Styling | Tailwind CSS **v4** + `tw-animate-css`, shadcn (Base UI / Nova) components |
| Animation | Framer Motion 14, Swiper 14 |
| Charts | Recharts 3 |
| Auth | BetterAuth 1.7 + `@better-auth/mongo-adapter` + `jwt()` plugin |
| Feedback | Sonner 2, custom dialogs |
| Theme | `next-themes` |
| Icons | `lucide-react` |
| Data | `mongodb` driver 7 (BetterAuth persistence only — all app data goes through the Express API) |

**Companion server:** Express 5 (ESM) · MongoDB driver 7 · `jose` 6 (JWKS verification) · Stripe 23 · Node `node:crypto`.

---

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                     # landing (film hero, featured, how-it-works)
│  ├─ services/                    # /services explore + /services/[id] detail
│  ├─ about/
│  ├─ sign-in/ · sign-up/ · unauthorized/
│  ├─ payment/success/ · payment/cancel/
│  ├─ dashboard/
│  │  ├─ customer/                 # overview · bookings · payments
│  │  ├─ technician/               # overview · add-service · my-services · requests
│  │  ├─ admin/                    # overview · users · services · bookings · transactions
│  │  └─ profile/
│  ├─ api/auth/[...all]/route.ts   # BetterAuth handler (also serves /api/auth/jwks)
│  ├─ error.tsx · not-found.tsx
│  └─ layout.tsx · globals.css     # design tokens (light + dark)
├─ components/                     # ui/ primitives + feature components
├─ lib/
│  ├─ auth.ts                      # BetterAuth server config (jwt plugin, mongo adapter)
│  ├─ auth-client.ts · auth-server.ts
│  ├─ api.ts · server-api.ts       # fetch helpers (client / server components)
│  ├─ motion/variants.ts           # the single motion vocabulary
│  └─ images.ts                    # every photograph, generated from a prompt
└─ proxy.ts                        # route protection (Next 16 proxy convention)
```

---

## Getting started

### Prerequisites

- **Node.js 20+** (developed on Node 26)
- A **MongoDB Atlas** cluster (or a local MongoDB) — the same database is used by both apps
- A **Stripe** test account (only needed for the payment flow)

### 1. Start the API (fixmate-server)

```bash
cd "../FixMate - Server"
npm install
cp .env.example .env      # then fill in MONGODB_URI + STRIPE keys
npm run seed              # idempotent demo data
npm run dev               # nodemon index.js  → http://localhost:8000
```

### 2. Start the client

```bash
cd "../FixMate - Client"
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # → http://localhost:3000
```

> Both apps must run **together**. The Express server verifies JWTs by fetching the JWKS from `${CLIENT_URL}/api/auth/jwks`, so it cannot authenticate anyone while the client is down.

### Environment variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express API origin, e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` | This app’s origin — also the JWT issuer/audience |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Origins allowed to call BetterAuth |
| `BETTER_AUTH_SECRET` | BetterAuth signing secret |
| `BETTER_AUTH_DB_URL` / `MONGODB_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name — `fixmate` |
| `BETTER_AUTH_GOOGLE_CLIENT_ID` / `_SECRET` | Google OAuth credentials |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | `true` to show the Google button |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB key used by technician photo uploads |

The server-side keys it needs (`MONGODB_URI`, `CLIENT_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `INTEGRATION_IDENTIFIER`, `DB_NAME`, `PORT`) are documented in the server repo’s `.env.example`.

### Available scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm start       # serve the production build
npm run lint    # ESLint
```

---

## Examiner test accounts

The seed in `fixmate-server` creates one account per role. **All three share the same password.**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@fixmate.test` | `FixMate1` |
| Technician | `technician@fixmate.test` | `FixMate1` |
| Customer | `customer@fixmate.test` | `FixMate1` |

Sign in with each to see the matching dashboard. The seed also includes a second technician (`ali@fixmate.test`) and a second customer (`maya@fixmate.test`) so cross-account isolation can be checked, plus bookings in every status — including one `completed` + `unpaid` job you can pay with Stripe’s test card **`4242 4242 4242 4242`** (any future expiry, any CVC).

---

## Deployment

Both apps run on **Vercel**:

| App | Production URL |
|---|---|
| Client | https://fix-mate-client-kohl.vercel.app (alias: `fix-mate-client-zamanics-projects.vercel.app`) |
| API | https://fix-mate-server-delta.vercel.app |

Client project environment: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` (every client alias), `BETTER_AUTH_SECRET`, `BETTER_AUTH_DB_URL` (or `MONGODB_URI`), `DB_NAME`, `BETTER_AUTH_GOOGLE_CLIENT_ID` / `BETTER_AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED`, `NEXT_PUBLIC_IMGBB_API_KEY`. `BETTER_AUTH_URL` must equal the API’s `CLIENT_URL` exactly — that pair is the JWT issuer/audience the server verifies, and the API fetches `/api/auth/jwks` from it.

> Deployment Protection (**Vercel Authentication**) must stay **off** on both projects. With it on, every request — including `/api/auth/jwks` — 302s to `vercel.com/sso-api`, so the site is unreachable and the API can never fetch the signing keys.

The Stripe webhook must be registered against `POST <api>/api/payments/webhook` with its signing secret set as `STRIPE_WEBHOOK_SECRET`; until then the success page confirms payment through `GET /api/payments/verify` instead.
