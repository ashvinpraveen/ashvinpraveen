# Ashvin Praveen's Personal Website

A modern personal website and portfolio built with Astro, featuring user authentication and content management.

## ✨ Features

- ✅ Modern Astro framework with TypeScript
- ✅ User authentication with Clerk
- ✅ Real-time backend with Convex
- ✅ Rich text editing capabilities
- ✅ Responsive design with Tailwind CSS
- ✅ Profile management system
- ✅ Content creation and publishing
- ✅ SEO-friendly with sitemap and RSS
- ✅ MDX support for rich content

## 🚀 Project Structure

```text
├── convex/                 # Convex backend functions and schema
├── public/                 # Static assets
├── src/
│   ├── components/         # Astro/React components
│   ├── pages/             # File-based routing
│   │   ├── api/           # API endpoints
│   │   └── app/           # Authenticated app pages
│   ├── scripts/           # Client-side scripts
│   └── styles/            # CSS and styling
├── astro.config.mjs       # Astro configuration
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Astro 5.x with React integration
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Backend**: Convex (real-time database)
- **Rich Text**: TipTap editor
- **Icons**: Astro Icon with Iconify
- **Typography**: Geist Sans, Inter, JetBrains Mono

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
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
   Create a `.env` file with your Clerk and Convex credentials

4. **Start development server**
   ```sh
   npm run dev
   ```

## 🌐 Deployment

This site is configured for deployment on modern platforms like Vercel, Netlify, or Cloudflare Pages.

## 📝 License

Unlicensed - Personal project