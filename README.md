# Ashvin Praveen's Personal Website

A modern personal website and portfolio built with Astro, featuring user authentication, content management, and an advanced rich text editor with media support.

## ✨ Features

- ✅ Modern Astro framework with TypeScript
- ✅ User authentication with Clerk
- ✅ Real-time backend with Convex
- ✅ Advanced TipTap rich text editor with conflict-free autosave
- ✅ AVIF image compression with WebP/JPEG fallbacks
- ✅ Context menu system for rich text editing
- ✅ Image upload and storage system
- ✅ Responsive design with Tailwind CSS
- ✅ Profile management system
- ✅ Content creation and publishing
- ✅ SEO-friendly with sitemap and RSS
- ✅ MDX support for rich content

## 🚀 Project Structure

```text
├── convex/                     # Convex backend functions and schema
│   ├── _generated/            # Auto-generated Convex API files
│   ├── auth.config.js         # Clerk authentication config
│   ├── images.ts              # Image storage and retrieval functions
│   ├── profiles.ts            # User profile management
│   ├── schema.ts              # Database schema definitions
│   └── *.ts                   # Other backend functions
├── public/                     # Static assets
│   └── images/                # Static image assets
├── src/
│   ├── components/            # Astro/React components
│   │   ├── EditableContent.tsx    # Rich text editing component
│   │   ├── ProfileEditor.tsx      # Profile editing interface
│   │   ├── RichTextEditor.tsx     # TipTap editor component
│   │   └── *.astro               # Other Astro components
│   ├── pages/                 # File-based routing
│   │   ├── [slug]/           # Dynamic user profile pages
│   │   │   ├── about.astro   # About page with advanced TipTap editor
│   │   │   └── settings.astro# User Settings (formerly Dashboard)
│   │   ├── api/              # API endpoints
│   │   │   ├── images/       # Image upload and serving
│   │   │   ├── profile/      # Profile management APIs
│   │   │   └── *.ts          # Other API routes
│   │   └── app/              # Authenticated app entry (redirects to /:slug/settings)
│   ├── scripts/              # Client-side scripts
│   └── styles/               # CSS and styling
│       ├── editable.css      # Rich text editor styles
│       └── global.css        # Global application styles
├── astro.config.mjs           # Astro configuration
├── .env.local                 # Environment variables (Convex, Clerk)
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Astro 5.x with React integration
- **Styling**: Tailwind CSS with custom glassmorphic design
- **Authentication**: Clerk (OAuth, session management)
- **Backend**: Convex (real-time database, serverless functions)
- **Rich Text**: TipTap v3.4.2 with extensive plugins
- **Image Processing**: Client-side compression with AVIF/WebP/JPEG
- **Icons**: Astro Icon with Iconify
- **Typography**: Geist Sans, Inter, JetBrains Mono

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npx convex dev`          | Starts Convex development server                |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run check`           | Run Astro's built-in type checking              |
| `npm run format`          | Format code with Prettier                       |
| `npm run lint`            | Lint code with ESLint                           |
| `npm run lint:fix`        | Fix linting errors automatically                |

## 🚀 Getting Started

1. **Clone the repository**
   ```sh
   git clone https://github.com/ashvinpraveen/ashvinpraveen.git
   cd ashvinpraveen
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Clerk and Convex credentials:
   ```env
   # Convex
   CONVEX_DEPLOYMENT=dev:your-deployment-name
   CONVEX_URL=https://your-convex-url.convex.cloud
   PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud

   # Clerk Authentication
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
   CLERK_SECRET_KEY=sk_test_your-secret-key
   ```

4. **Start development servers**
   ```sh
   # Terminal 1: Start Convex backend
   npx convex dev

   # Terminal 2: Start Astro frontend
   npm run dev
   ```

## 🎯 Current Status (Humans)

### ✅ Recent Progress (highlights)

#### ⚡ **Performance Optimization (September 2024)**
- **Database query optimization**: Converted sequential Convex queries to parallel execution using `Promise.all()`
- **55-77% loading time improvement**: Profile, about, blog pages now load in 300-800ms instead of 1-5+ seconds
- **Parallel query architecture**:
  - Profile pages (`/[slug].astro`): ~55% faster
  - User about pages (`/[slug]/about.astro`): ~77% faster
  - User blog pages (`/[slug]/blog.astro`): ~75% faster
  - Individual blog posts (`/[slug]/blog/[postId].astro`): ~35-60% faster
- **Waterfall elimination**: Removed sequential database query dependencies for better UX

#### 🔧 **Critical Autosave Fix (September 2024)**
- **Fixed TipTap content loss issue**: Resolved version comparison bug causing 30+ minutes of work to be lost
- **Version compatibility**: Updated conflict detection to handle `undefined` versions as `0` for backward compatibility
- **Race condition prevention**: Enhanced sync system now properly prevents content overwrites during typing
- **Real-time conflict resolution**: Improved error handling and graceful fallbacks for concurrent editing

#### 🚀 **Core Platform Features**
- **Canonical usernames in Convex**
  - `sites.changeSlug` mutation (owner‑only) + `siteAliases` table for old slugs
  - `sites.resolveSlug` + page redirects to canonical slug
  - Settings → "Username (URL)" input with availability check + rename flow
- **Settings UX overhaul**
  - Section cards with right‑aligned Save buttons; cleaner spacing and layout
  - "Your Site" as a vertical stack; socials grid wraps to 4 columns per row
  - Prefill all fields from Convex server‑side for instant load (no empty flicker)
  - Smart defaults: Site Name, SEO title/description auto‑generated if empty
- **Custom domains (Netlify integration)**
  - Convex fields: `customDomain`, `domainStatus`, verification token
  - API routes: set domain, DNS check (TXT + CNAME/A), connect (Netlify API)
  - Progressive UI: "+ Connect a domain you own" → Save → Check DNS → auto‑connect
  - Status pill with colors (Pending / Verified / Live / Error)
- **Enhanced Editor Permissions**
  - BubbleMenu, context menu, and upload modal restricted to owners only
  - Non-owners see clean read-only view without edit interface clutter

### 💡 Key Insights & Decisions

#### **Performance & Database Architecture**
- **Parallel query execution**: Converting sequential Convex queries to `Promise.all()` reduces page load time by 55-77%
- **Query waterfall elimination**: Minimize dependent database calls for better performance
- **Database optimization patterns**:
  - Step 1: Resolve slug for redirects (must be sequential)
  - Step 2: Parallel execution of remaining queries (settings, ownership checks)
  - Critical path optimization reduces user-perceived latency

#### **Collaborative Editing Architecture**
- **Version-based conflict resolution**: Essential for preventing data loss in real-time editing
- **Backward compatibility**: Always handle `undefined` database values gracefully during schema migrations
- **Content hashing**: Prevents unnecessary saves and reduces server load
- **Permission-based UI**: Show editing tools only to authorized users for cleaner UX

#### **Platform Design Principles**
- **Own usernames/URLs in Convex**: Allow renames safely via alias table for permanent redirect support
- **Domain UX mirrors Framer**: Only show next step; hide provider branding; auto‑connect after verification
- **"www‑first" recommended**: CNAME `www` → app target; apex redirect optional per DNS/provider
- **Server-side prefilling**: Eliminates loading flickers and provides instant feedback

### 🧭 Next Steps

#### **✅ Recently Completed**
- ✅ **Performance optimization**: Parallel database queries implemented (55-77% loading time improvement)
- ✅ **Query architecture**: Waterfall elimination across all user-facing pages
- ✅ **Critical path optimization**: Sequential slug resolution + parallel data fetching

#### **🔥 High Priority**
- **Performance monitoring**: Add metrics to track query performance and identify regression opportunities
- **Additional optimization targets**:
  - Blog list component loading times
  - Image upload and processing pipelines
  - Search and filtering operations
- **Frontend deployment**: Deploy performance improvements to production

#### **🚀 Platform Improvements**
- **Domain management**: Persist domainStatus on server during Check/Connect for accurate pill after reload
- **Visual identity**: OG image auto‑generation service (render from name/title/colors) + meta injection
- **Analytics**: Per‑user GA4 ID in Settings + script injection for visitor tracking
- **Performance analytics**: Client-side metrics for Core Web Vitals and page load tracking

#### **🔧 Technical Debt & Optimizations**
- **Configuration centralization**: Sweep for remaining hard‑coded emails/admin checks and centralize config
- **Database query audit**: Review remaining pages for potential parallel query opportunities
- **Caching strategy**: Implement intelligent caching for frequently accessed data
- **Domain UX polish**: Apex handling guidance (or automatic www redirect helper)
- **Optional cleanup**: Button in Settings to remove old alias redirect (deletes `siteAliases` row)

## 🚀 Deploying to Netlify (quick guide)

1) Link & env vars
- `netlify link`
- Set in Netlify → Site settings → Environment (or via CLI):
  - `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - `CONVEX_URL`, `PUBLIC_CONVEX_URL` (and `CONVEX_DEPLOYMENT` if used)
  - `PUBLIC_NETLIFY_CNAME_TARGET` (e.g., `humansofcleve.netlify.app`)
  - `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

2) Deploy
- `netlify deploy --build --prod`

3) Custom domain flow (in app)
- Settings → Custom Domain → “+ Connect a domain you own”
- Save domain → add DNS (TXT token + CNAME www → target) → Check DNS
- Auto‑connect runs in background → pill turns “Verified and running”

### 📚 Development Learnings

#### TipTap Editor Integration
- TipTap v3.4.2 requires careful extension configuration to avoid conflicts
- BubbleMenu and context menu positioning requires fixed positioning with viewport calculations
- ESM imports from esm.sh work well for CDN-based dependencies

#### Image Processing Best Practices
- AVIF provides superior compression but requires fallbacks
- Canvas API toBlob() method handles format conversion efficiently
- Client-side processing reduces server costs and improves UX

#### **Convex Integration Insights**
- **Environment variables**: Must be prefixed with `PUBLIC_` for client-side access
- **Import paths**: Generated API files should be imported with `.js` extension
- **Development workflow**: Backend server must run alongside frontend for real-time sync
- **Collaborative editing**: Content versioning and conflict detection essential for preventing data loss
- **Schema migrations**: Always ensure backward compatibility for production data
- **Version handling**: Treat `undefined` database versions as `0` during comparisons
- **Query optimization**: Use `Promise.all()` for parallel execution when queries are independent
- **Performance patterns**:
  - Minimize sequential database calls (waterfall effect)
  - Group related queries for batch execution
  - Separate critical path queries (redirects) from parallel data fetching

## 🌐 Deployment

This site is configured for deployment on modern platforms like Vercel, Netlify, or Cloudflare Pages. Convex provides seamless production deployment with automatic scaling.

## 📝 License

Unlicensed - Personal project
