# Plan: Clone of raulbelinchon.com — Next.js + Convex + in-app CMS

## Context

We're building a faithful clone of the photographer portfolio **raulbelinchon.com**
(a minimalist site originally built on the Format platform) as a self-owned,
free-to-host stack. The goal: same design/theme/style, all the same sections, a
custom **in-app CMS** so the owner edits content without touching code, and a
backend on **Convex** (free tier). Image storage starts on **Convex file storage**
but is architected to migrate to **Cloudflare R2** later with no page/component
changes. Hosting is free: **Vercel (Hobby)** for the Next.js app + **Convex free
tier** for DB/storage/auth.

### Locked decisions
- **CMS:** custom protected `/admin` dashboard, fully Convex-backed (one system).
- **Image storage:** Convex `ctx.storage` now; storage-agnostic schema + a single
  `resolveImageUrl()` helper so a later swap to `@convex-dev/r2` only flips a
  `provider` field. Zero egress R2 free tier is the eventual target.
- **Admin auth:** Convex Auth (`@convex-dev/auth`) Password provider, single owner.
- **Seed content:** recreate the exact section/gallery/nav structure + bio text,
  seeded with placeholder/stock images (avoids copying copyrighted photos; real
  images get uploaded through the CMS).

## Tech stack
- **Next.js 15 (App Router, TypeScript)** + **Tailwind CSS** for the minimalist theme.
- **Convex** — database, file storage, reactive queries.
- **@convex-dev/auth** — Password provider, single admin.
- **next/image** — responsive sizing + blur placeholders (works for Convex & R2 URLs).
- Deploy: **Vercel** (frontend) + **Convex** (backend), both free tiers.

## Site structure (matches the original)

Public routes:
| Route | Purpose |
|---|---|
| `/` | Home — "Recent Work" landing: featured project full-bleed (e.g. *The Mud Angels*) with title + artist statement |
| `/portfolio` | Curated grid of selected images linking into galleries |
| `/projects` | Index of project galleries |
| `/projects/[slug]` | Individual project gallery |
| `/stories` | Index of documentary stories |
| `/stories/[slug]` | Individual story gallery |
| `/publications` | Index of magazine publications |
| `/publications/[slug]` | Individual publication |
| `/commissions` | Index of commissioned work |
| `/commissions/[slug]` | Individual commission |
| `/about` | Info → Biography (statement, exhibitions, awards, collections, publications) |
| `/news` | Info → News list |
| `/news/[slug]` | Individual news post |
| `/contact` | Contact details / form |

**≥2 seeded sub-pages per section** (satisfies the requirement):
- Projects: `skf-some-kind-of-freedom`, `theatres`, `ciudades-subterraneas`
- Stories: `jose-y-familia`, `valentina`, `rosario`
- Publications: `el-pais-semanal`, `exit`, `citizen-k`
- Commissions: `british-museum`, `mar-menor`, `bioparc`
- Info: `/about`, `/news` (+ seeded posts)
- Recent Work / Home featured: `the-mud-angels`, `the-remains`

Admin routes (protected by Convex Auth):
| Route | Purpose |
|---|---|
| `/admin` | Login + dashboard overview |
| `/admin/galleries` | List/create/delete/reorder galleries across all sections |
| `/admin/galleries/[id]` | Edit one gallery: title, slug, section, statement, cover, **upload/reorder/alt/delete images** |
| `/admin/news` | Manage news posts |
| `/admin/pages` | Edit singletons: Home featured pick, Biography, Contact, site settings (title, nav order) |

## Design / theme (faithful to original)
- **Palette:** near-white background (`#ffffff`/`#fafafa`), near-black text (`#111`),
  subtle grey for secondary text. No borders, no shadows — image-first.
- **Type:** neutral grotesque sans (Helvetica Neue/Arial stack, or Google `Inter`/
  `Archivo`), small nav text with generous letter-spacing.
- **Layout:** fixed **left sidebar nav** with expandable category groups
  (Projects/Stories/Publications/Commissions expand to their galleries; Info →
  Biography/News). Collapses to a hamburger on mobile. Main content area to the right.
- **Galleries:** large single-column image scroll on detail pages; responsive
  justified/masonry grid on index pages. Lots of whitespace.
- **Nav is data-driven:** a shared `<SidebarNav>` reads sections + galleries from
  Convex, so adding a gallery in the CMS auto-updates the menu.
- Footer: minimal copyright line.

## Convex data model (`convex/schema.ts`)
- **`galleries`**: `section` ("portfolio"|"project"|"story"|"publication"|"commission"),
  `slug`, `title`, `subtitle?`, `statement?` (long text), `coverImageId?`, `order`,
  `published`, `isFeatured?` (Home), `createdAt`.
- **`images`** (storage-agnostic): `galleryId`, `order`, `alt?`, `caption?`, `width`,
  `height`, `blurDataUrl?`, **`provider`** ("convex"|"r2"), `convexStorageId?`
  (`Id<"_storage">`), `r2Key?`. → migration to R2 only sets `provider`+`r2Key`.
- **`news`**: `slug`, `title`, `date`, `body` (long), `coverImageId?`, `published`, `order`.
- **`pages`** (singletons keyed by `key`): `home` (`featuredGalleryId`, `intro`),
  `bio` (`statement`, `soloExhibitions[]`, `groupExhibitions[]`, `awards[]`,
  `collections[]`, `publications[]`), `contact` (`email`, `instagram?`, `phone?`,
  `representation?`), `settings` (`siteTitle`, `navOrder`).
- Auth tables provided by `@convex-dev/auth`.

## Convex functions (`convex/`)
- `galleries.ts` — `listBySection`, `getBySlug`, `listAll` (admin); mutations
  `create`/`update`/`remove`/`reorder`.
- `images.ts` — `listByGallery`; `generateUploadUrl` (action), `addImage`,
  `updateImage`, `removeImage`, `reorder`; **`resolveImageUrl(image)`** helper
  (branches on `provider`) used everywhere a URL is needed.
- `news.ts` — `list`, `getBySlug`, `create`/`update`/`remove`.
- `pages.ts` — `getPage(key)`, `upsertPage(key, content)`.
- `auth.ts` — Convex Auth config, Password provider.
- `seed.ts` — internal mutation that populates the placeholder structure above.

## Project layout
```
app/
  layout.tsx, page.tsx (Home)
  portfolio/page.tsx
  projects/page.tsx, projects/[slug]/page.tsx
  stories/page.tsx, stories/[slug]/page.tsx
  publications/page.tsx, publications/[slug]/page.tsx
  commissions/page.tsx, commissions/[slug]/page.tsx
  about/page.tsx, news/page.tsx, news/[slug]/page.tsx, contact/page.tsx
  admin/...(login, galleries, galleries/[id], news, pages)
components/ (SidebarNav, GalleryGrid, ImageScroll, Lightbox, Footer, admin widgets)
convex/ (schema.ts, galleries.ts, images.ts, news.ts, pages.ts, auth.ts, seed.ts)
lib/ (convex client, image helpers)
```

## Implementation steps
1. **Scaffold** — `create-next-app` (TS, App Router, Tailwind, ESLint); install
   `convex`, `@convex-dev/auth`.
2. **Init Convex** — `npx convex dev`; add `ConvexClientProvider`; wire env vars.
3. **Schema + functions** — implement all tables/queries/mutations above + auth.
4. **Design system** — Tailwind theme (colors/font), root layout, data-driven
   `<SidebarNav>`, footer, responsive/mobile menu.
5. **Public pages** — Home (featured), section indexes, `[slug]` detail galleries,
   about, news, contact.
6. **Image components** — `next/image` responsive grid + single-column scroll +
   optional lightbox; blur placeholders from stored `blurDataUrl`.
7. **Admin** — Convex Auth gate, dashboard, galleries CRUD + upload/reorder, page
   editors, news CRUD.
8. **Seed** — run `seed.ts` to populate placeholder content mirroring the real site.
9. **Polish** — SEO metadata, sitemap, favicon, loading/empty states, `next.config`
   image domains for Convex storage URLs.
10. **Deploy** — Convex prod (`npx convex deploy`) + Vercel (Hobby), env vars; README
    with setup + the documented R2 migration path.

## Verification
- `npm run dev` + `npx convex dev`: load every public route; confirm sidebar nav
  auto-populates from Convex and galleries render placeholder images with blur-up.
- `/admin`: log in (Convex Auth), create a gallery, upload an image, reorder, set
  cover → confirm it appears live on the public site (Convex reactivity).
- Edit Biography + Contact in `/admin/pages` → confirm reflected on `/about`, `/contact`.
- `npm run build` passes with no type/lint errors.
- Deploy to Vercel preview, smoke-test all routes + an upload end-to-end.
- (Later) R2 migration check: install `@convex-dev/r2`, switch upload path to set
  `provider: "r2"`; existing `provider: "convex"` images keep resolving via the same
  `resolveImageUrl()` helper — no page changes.
```
