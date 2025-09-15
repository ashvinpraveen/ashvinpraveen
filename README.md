# Ashvin Praveen's Personal Website

A modern personal website and portfolio built with Astro, featuring user authentication, content management, and an advanced rich text editor with media support.

## ✨ Features

- ✅ Modern Astro framework with TypeScript
- ✅ User authentication with Clerk
- ✅ Real-time backend with Convex
- ✅ Advanced TipTap rich text editor with media support
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
│   │   │   └── about.astro   # About page with advanced TipTap editor
│   │   ├── api/              # API endpoints
│   │   │   ├── images/       # Image upload and serving
│   │   │   ├── profile/      # Profile management APIs
│   │   │   └── *.ts          # Other API routes
│   │   └── app/              # Authenticated app pages
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

## 🎯 Current Development Status

### ✅ Completed Features

#### TipTap Rich Text Editor (`/src/pages/[slug]/about.astro`)
- **Advanced TipTap v3.4.2 Implementation**: Complete rich text editor with 18+ extensions
- **Right-Click Context Menu**: Beautiful glassmorphic context menu with categorized actions
- **Image Compression System**: Client-side AVIF/WebP/JPEG compression with automatic fallbacks
- **Modal Dialog System**: Glassmorphic modals replacing browser prompts for URL inputs
- **Media Embeds**: Support for YouTube videos, Spotify embeds, and image uploads
- **Advanced Formatting**: Tables, task lists, headings, links, and text formatting
- **File Upload Interface**: Drag-and-drop style upload with progress tracking

#### Backend Infrastructure
- **Convex Database**: Schema for users, sites, posts, pages, projects, social links, and images
- **Image Storage**: Base64 image storage with metadata (filename, mime type, size, user ID)
- **API Endpoints**: Upload (`/api/images/upload`) and serving (`/api/images/[imageId]`) endpoints
- **Authentication**: Clerk integration for user management

#### UI/UX Design
- **Glassmorphic Design**: Modern glass effect with backdrop blur throughout
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Dark Theme**: Consistent dark theme with HSL color system
- **Interactive Elements**: Hover states, smooth transitions, and micro-interactions

### 🚧 Known Issues

- None currently. Previous Convex API typing and image upload errors are resolved.

### 🔄 Recent Session Summary (September 2024)

#### Major Accomplishments
1. **Restored Complete TipTap Implementation**: After code was accidentally truncated, fully restored:
   - Modal dialog system with glassmorphic design
   - Image upload and compression functionality
   - AVIF format conversion with smart fallbacks
   - Context menu system with 18+ actions

2. **Advanced Image Processing**: Implemented cutting-edge web image optimization:
   - AVIF compression (50-80% better than JPEG)
   - Automatic fallback to WebP, then JPEG
   - Client-side compression reducing file sizes by 60-90%
   - Proper file extension handling based on output format

3. **Environment Configuration**: Fixed development setup:
   - Added `PUBLIC_CONVEX_URL` to `.env.local`
   - Configured proper port handling (4321)
   - Set up dual development servers (Astro + Convex)

#### Code Architecture Highlights
- **Modular Design**: Separated concerns between UI, business logic, and API calls
- **Error Handling**: Comprehensive error handling with user feedback
- **Performance**: Client-side image processing reduces server load
- **Browser Compatibility**: Feature detection and graceful degradation
- **Developer Experience**: Extensive logging and debugging capabilities

### 🎯 Next Steps

1. **Add TipTap to Other Pages**: Implement the editor component on blog posts and other content
2. **Enhance Media Support**: Add more embed types (Twitter, GitHub Gists, CodePen)
3. **Performance Optimization**: Add lazy loading and caching for images

### 📚 Development Learnings

#### TipTap Editor Integration
- TipTap v3.4.2 requires careful extension configuration to avoid conflicts
- BubbleMenu and context menu positioning requires fixed positioning with viewport calculations
- ESM imports from esm.sh work well for CDN-based dependencies

#### Image Processing Best Practices
- AVIF provides superior compression but requires fallbacks
- Canvas API toBlob() method handles format conversion efficiently
- Client-side processing reduces server costs and improves UX

#### Convex Integration Insights
- Environment variables must be prefixed with `PUBLIC_` for client-side access
- Generated API files should be imported with `.js` extension
- Development server must run alongside frontend for real-time sync

## 🌐 Deployment

This site is configured for deployment on modern platforms like Vercel, Netlify, or Cloudflare Pages. Convex provides seamless production deployment with automatic scaling.

## 📝 License

Unlicensed - Personal project
