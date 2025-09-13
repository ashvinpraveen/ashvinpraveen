/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'Atkinson', 'system-ui', 'sans-serif'],
				headings: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			colors: {
				// HSL-based design system
				primary: 'hsl(0 0% 100%)',        // white
				muted: 'hsl(0 0% 100% / 0.75)',   // 75% white
				subtle: 'hsl(0 0% 100% / 0.6)',   // 60% white
				surface: 'hsl(217 33% 17%)',      // dark surface
				background: 'hsl(217 33% 17%)',   // dark background
				border: 'hsl(0 0% 100% / 0.15)',  // subtle border
			},
			backgroundColor: {
				// Overlay backgrounds for glassmorphism effects
				'overlay-subtle': 'hsl(0 0% 100% / 0.03)',
				'overlay-light': 'hsl(0 0% 100% / 0.04)',
				'overlay-medium': 'hsl(0 0% 100% / 0.06)',
				'overlay-strong': 'hsl(0 0% 100% / 0.08)',
				// Dark backgrounds for cards and surfaces
				'surface-light': 'hsl(0 0% 0% / 0.45)',
				'surface-medium': 'hsl(0 0% 0% / 0.80)',
				'surface-strong': 'hsl(0 0% 0% / 0.85)',
			},
			boxShadow: {
				// Consistent shadow system
				'glass': '0 8px 30px hsl(0 0% 0% / 0.2), 0 4px 10px hsl(0 0% 0% / 0.12)',
				'profile': '0 8px 24px hsl(0 0% 0% / 0.35)',
			},
			textColor: {
				// Override Tailwind's default text colors
				DEFAULT: 'hsl(0 0% 100% / 0.92)', // body text
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': 'hsl(0 0% 100% / 0.92)',
						'--tw-prose-headings': 'hsl(0 0% 100% / 0.97)',
						'--tw-prose-lead': 'hsl(0 0% 100% / 0.75)',
						'--tw-prose-links': 'hsl(0 0% 100% / 0.9)',
						'--tw-prose-bold': 'hsl(0 0% 100% / 0.97)',
						'--tw-prose-counters': 'hsl(0 0% 100% / 0.6)',
						'--tw-prose-bullets': 'hsl(0 0% 100% / 0.6)',
						'--tw-prose-hr': 'hsl(0 0% 100% / 0.15)',
						'--tw-prose-quotes': 'hsl(0 0% 100% / 0.85)',
						'--tw-prose-quote-borders': 'hsl(0 0% 100% / 0.25)',
						'--tw-prose-captions': 'hsl(0 0% 100% / 0.75)',
						'--tw-prose-code': 'hsl(0 0% 100% / 0.95)',
						'--tw-prose-pre-code': 'hsl(0 0% 100% / 0.92)',
						'--tw-prose-pre-bg': 'hsl(0 0% 100% / 0.04)',
						'--tw-prose-th-borders': 'hsl(0 0% 100% / 0.2)',
						'--tw-prose-td-borders': 'hsl(0 0% 100% / 0.1)',
						'--tw-prose-kbd': 'hsl(0 0% 100% / 0.95)',
						'--tw-prose-kbd-shadows': 'hsl(0 0% 100% / 0.2)',

						// Remove Tailwind's default colors
						color: 'hsl(0 0% 100% / 0.92)',
						maxWidth: '72ch',
					},
				},
			}),
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
		require('@tailwindcss/aspect-ratio'),
	],
}