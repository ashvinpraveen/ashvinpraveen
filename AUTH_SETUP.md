# Auth + CMS Setup (Clerk + Convex)

This repo is scaffolded to support authentication (Clerk) and a backend (Convex) for editing content and multi-tenant personal sites.

## 1) Install dependencies

- Copy `.env.example` to `.env` and fill values
- Install packages and generate Convex types

```
npm install
npx convex dev
```

Keep `npx convex dev` running in a separate terminal while developing.

## 2) Configure Clerk

- Create a Clerk application and copy the Publishable and Secret keys
- Set in `.env`:
  - `CLERK_PUBLISHABLE_KEY=...`
  - `CLERK_SECRET_KEY=...`

Clerk integration is wired via `@clerk/astro` in `astro.config.mjs`. Sign-in/up pages: `/sign-in`, `/sign-up`. Header shows auth buttons.

## 3) Configure Convex

- `convex/schema.ts` defines tables for `users`, `sites`, `posts`
- Run `npx convex dev` to create a dev deployment and generate `convex/_generated/*`
- Implement Convex functions in:
  - `convex/sites.ts` (user upsert, site fetch)
  - `convex/posts.ts` (list, get, create)
- Set `VITE_CONVEX_URL` in `.env` to the URL printed by `convex dev` (or your prod URL)

Optional: configure Clerk verification in Convex (JWT/JWKS). See Convex + Clerk docs.

## 4) Wire API routes to Convex

Update placeholders to call Convex after codegen exists:

- `src/pages/api/posts/create.ts` → call `client.mutation(api.posts.createPost, { ... })`
- `src/pages/api/sites/[slug].ts` → call `client.query(api.sites.getSiteBySlug, ...)` and `client.query(api.posts.listBySite, ...)`

Example snippet:

```
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL!);
```

## 5) Multi-tenant routing

- Public tenant route: `/u/[slug]` renders a user’s site from Convex
- Protected dashboard: `/app` and `/app/editor` require login

## 6) Migration strategy for existing Markdown

Two options:
- Keep current static blog for the root site and add dynamic per-user sites via Convex
- Or migrate content into Convex and render all posts dynamically (update `/blog` pages to fetch from Convex)

Start with hybrid: keep the current blog as-is; use Convex for `/app` and `/u/*`.

## 7) Deployment

- Ensure `CLERK_PUBLISHABLE_KEY` is set in your hosting provider (e.g., Vercel)
- For Convex, deploy with `npx convex deploy` and set `VITE_CONVEX_URL` to the prod URL

## 8) Roadmap

- Add post editing and publishing, list user’s posts in `/app`
- Support custom domains per site (map domain → site slug)
- Add MDX rendering and image uploads via Convex storage or external storage

