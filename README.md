# Photography Portfolio + CMS

A minimalist photographer's portfolio — a clone of the look, theme and structure of
[raulbelinchon.com](https://www.raulbelinchon.com) — built on **Next.js 16** with a
custom, self-hosted **CMS** so the owner edits everything without touching code.
The backend is **Convex** (database + file storage + auth). Everything runs on free
tiers.

## Features

- Faithful minimalist theme: near-white ground, near-black ink, neutral grotesque
  type, fixed left sidebar with expandable sections, image-first galleries.
- Data-driven navigation — adding a gallery in the CMS updates the menu automatically.
- Gallery detail pages with a keyboard-navigable **lightbox**.
- Responsive images via `next/image` (with optional blur placeholders).
- **In-app CMS** at `/admin`: galleries CRUD with image upload / reorder / cover /
  alt text / delete, a news editor, and a Biography / Contact / Settings editor.
- Single-owner auth (Convex Auth, password) with proxy-protected admin routes
  *and* server-side auth checks on every admin mutation.
- **Storage-agnostic images** — designed to migrate from Convex file storage to
  Cloudflare R2 by flipping one field (see below).
- SEO: per-route titles, `robots.txt`, and a dynamic `sitemap.xml`.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS v4** — minimalist theme.
- **Convex** — database, file storage, reactive queries, and auth.
- **Convex Auth** (`@convex-dev/auth`, Password provider) — single-owner admin login.
- **next/image** — responsive images + blur placeholders.

## Routes

| Public | |
|---|---|
| `/` | Home / Recent Work — the gallery flagged "Featured" |
| `/portfolio` | Curated grid of every published gallery |
| `/projects`, `/projects/[slug]` | Projects index + detail |
| `/stories`, `/stories/[slug]` | Stories index + detail |
| `/publications`, `/publications/[slug]` | Publications index + detail |
| `/commissions`, `/commissions/[slug]` | Commissions index + detail |
| `/about` | Biography (statement, exhibitions, awards, collections, publications) |
| `/news`, `/news/[slug]` | News list + post |
| `/contact` | Contact details |

| Admin (auth-gated) | |
|---|---|
| `/admin` | Login + dashboard |
| `/admin/galleries`, `/admin/galleries/[id]` | Manage galleries + images |
| `/admin/news` | Manage news posts |
| `/admin/pages` | Edit Biography / Contact / Site settings |

Admin sub-routes are protected by `proxy.ts`; every admin Convex mutation also
re-checks auth server-side.

## Local development

This repo is already wired to a **local Convex deployment** (see `.env.local`), so
no Convex account/login is needed for local work. Run two processes:

```bash
# 1) Convex backend (also regenerates convex/_generated and pushes functions)
npx convex dev

# 2) Next.js dev server (separate terminal)
npm run dev
```

Open the printed URL — **http://localhost:3000**, or **http://localhost:3001** if
3000 is already in use on your machine.

### First-time content

The seed recreates the exact section/gallery structure with placeholder images
(Lorem Picsum) and the biography text — **14 galleries** across Projects, Stories,
Publications and Commissions, plus 2 news posts. Load it via the **"Load demo
content"** button on the `/admin` dashboard, or:

```bash
npx convex run seed:run                       # seed only if empty
npx convex run 'seed:run' '{"force":true}'    # wipe + reseed
```

### Creating the admin account

Sign-up is gated by an `ADMIN_SIGNUP_KEY` env var on the deployment (set to
`letmein` on the local deployment). On `/admin`, choose **"Need to create the owner
account?"**, enter an email/password and the signup key. After registering once you
can clear the key:

```bash
npx convex env set ADMIN_SIGNUP_KEY ""
```

Convex is reactive — edits made in `/admin` appear on the public site instantly.

## Environment variables

Env is validated with **Zod** and fails fast on anything missing or malformed:

- **`lib/env.ts`** — the Next.js app: client `NEXT_PUBLIC_*` vars (validated on
  server and client) plus server-only build vars.
- **`convex/env.ts`** — the Convex deployment runtime (`ADMIN_SIGNUP_KEY`,
  `R2_PUBLIC_URL`, `CONVEX_SITE_URL`); present values are shape-checked, all optional
  so a deploy never breaks on an unset one.

Copy **`.env.example`** → `.env.local` and fill in the app vars. Convex deployment
vars live on the deployment (`npx convex env set NAME value`), not in `.env` files —
`.env.example` documents the full list and where each one is set.

> `convex/auth.config.ts` intentionally reads `process.env` directly (not the Zod
> module): Convex statically scans that file's imports and treats every
> `process.env.*` reference as a *required* deployment var.

## Image storage — Convex now, Cloudflare R2 later

Images are stored **storage-agnostically**: every `images` row has a `provider`
(`"convex" | "r2" | "external"`) and a single helper, `resolveImageUrl()` in
`convex/lib.ts`, turns a row into a URL. Pages and components never know where the
bytes live.

- **Today:** uploads go to Convex file storage (`provider: "convex"`); seeded
  placeholders use `provider: "external"` (Lorem Picsum URLs).
- **Migrating to R2:** install `@convex-dev/r2`, set `R2_PUBLIC_URL`, and change the
  upload path in `convex/images.ts` to write `provider: "r2"` + `r2Key`. Existing
  rows keep resolving through the same helper — **no page/component changes**. R2's
  free tier (10 GB, zero egress) is the target for an image-heavy site.

`next.config.ts` already allows `*.convex.cloud`, `*.r2.dev`, and the Picsum hosts.

## Production deploy (free)

**Backend — Convex Cloud:**

```bash
npx convex login                      # interactive (browser)
npx convex deploy                     # creates/pushes the prod deployment
npx @convex-dev/auth --prod \         # sets SITE_URL + JWT keys on prod
  --web-server-url https://YOUR-APP.vercel.app
npx convex env set ADMIN_SIGNUP_KEY <something> --prod
```

**Frontend — Vercel (Hobby):**

1. Import the repo into Vercel.
2. Set the **build command** to: `npx convex deploy --cmd 'npm run build'`
3. Add env var `CONVEX_DEPLOY_KEY` (Convex dashboard → prod deploy key). The command
   above injects the correct `NEXT_PUBLIC_CONVEX_URL` at build time.
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain (used by `sitemap.xml` / `robots.txt`).
5. Set Convex prod `SITE_URL` to your Vercel domain.

## Scripts

```bash
npm run dev      # Next.js dev server
npm run build    # production build (TypeScript-checked)
npm run start    # serve the production build
npm run lint     # ESLint
```

## Project layout

```
app/(site)/...    public pages (route group with the sidebar shell)
app/admin/...     CMS (auth-gated)
app/robots.ts     robots.txt
app/sitemap.ts    dynamic sitemap.xml
components/        SidebarNav, SiteShell, GalleryGrid/Detail, SmartImage, admin widgets
convex/           schema.ts, galleries/images/news/pages.ts, auth.ts, http.ts, lib.ts, seed.ts
lib/              sections + metadata helpers
```

> Note: Next 16 uses the `proxy.ts` convention instead of `middleware.ts`. Convex Auth's
> middleware helper is used inside `proxy.ts` to handle auth checks.
