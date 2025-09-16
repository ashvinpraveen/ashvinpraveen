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
	site: 'https://example.com',
	adapter: netlify(),
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
});
