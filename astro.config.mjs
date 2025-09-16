// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
	site: 'https://humans.cleve.ai',
	adapter: netlify({
		edgeMiddleware: false // Disable edge middleware in development
	}),
	integrations: [
		mdx(),
		react(),
    tailwind({
        applyBaseStyles: false, // Disable Tailwind's base styles if you want full control
    }),
    sitemap(),
    icon(),
    clerk(),
    ],
	vite: {
		build: {
			// Enable chunk splitting for better caching
			rollupOptions: {
				output: {
					manualChunks(id) {
						// Split vendor chunks for better caching
						if (id.includes('convex')) {
							return 'convex-vendor';
						}
						if (id.includes('react') || id.includes('react-dom')) {
							return 'react-vendor';
						}
						if (id.includes('@tiptap')) {
							return 'tiptap-vendor';
						}
						if (id.includes('@clerk')) {
							return 'clerk-vendor';
						}
						if (id.includes('node_modules')) {
							return 'vendor';
						}
					}
				}
			},
			// Optimize chunks
			chunkSizeWarningLimit: 1000,
			// Use default minifier (esbuild)
			minify: true
		},
		// Optimize dependencies
		optimizeDeps: {
			include: ['react', 'react-dom', 'convex/react']
		}
	}
});
