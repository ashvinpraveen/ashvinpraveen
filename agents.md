# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Project Management
- `npm install` - Install dependencies
- `npm run dev` - Start development server at `localhost:4321`
- `npm run build` - Build production site to `./dist/`
- `npm run preview` - Preview build locally before deploying

### Astro CLI Commands
- `npm run astro add` - Add integrations (e.g., `npm run astro add tailwind`)
- `npm run astro check` - Check project for TypeScript/content errors
- `npm run astro sync` - Generate content collection types
- `npm run astro info` - Show project setup information

## Architecture Overview

This is an Astro-based static site generator blog built with TypeScript. The architecture follows Astro's file-based routing and content collection patterns.

### Key Architectural Concepts

**Content Collections**: Blog posts are managed through Astro's content collections system:
- Blog posts in `src/content/blog/` with `.md` and `.mdx` files
- Content schema defined in `src/content.config.ts` with frontmatter validation
- Posts require `title`, `description`, `pubDate`, and optional `updatedDate`, `heroImage`

**Routing System**:
- File-based routing in `src/pages/`
- Dynamic routes: `/blog/[...slug].astro` handles individual blog posts
- Static routes: `/blog/index.astro` for blog listing, `/about.astro`, root `/`

**Layout Hierarchy**:
- `BlogPost.astro` layout wraps individual blog posts with metadata, hero images, and formatted dates
- Shared components: `Header.astro`, `Footer.astro`, `BaseHead.astro` for consistent structure
- `FormattedDate.astro` component handles date display formatting

### Critical Files for Content Management

- `src/consts.ts` - Global site configuration (title, description)
- `src/content.config.ts` - Content collection schema and validation
- `src/pages/rss.xml.js` - RSS feed generation from blog collection

### Image Handling
- Static assets in `public/` directory
- Blog images in `src/assets/` processed through Astro's image optimization
- Hero images specified in frontmatter and rendered with optimized `<Image>` component

## Development Workflow

When working with blog content:
1. Add new posts to `src/content/blog/` as `.md` or `.mdx` files
2. Include required frontmatter: `title`, `description`, `pubDate`
3. Optionally add `heroImage` path relative to `src/assets/`
4. Content is automatically available at `/blog/post-filename/`

When modifying components:
- Edit reusable components in `src/components/`
- Layout changes in `src/layouts/BlogPost.astro`
- Page-level changes in `src/pages/`

The site uses Astro's static site generation by default, with content collections providing type safety and automated routing for blog posts.