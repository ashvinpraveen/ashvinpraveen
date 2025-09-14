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
			fontSize: {
				// Centralized typography scale
				'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
				'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px - body text
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px - h3
				'2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px - h2
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px - h1
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px - hero
				'5xl': ['3rem', { lineHeight: '1' }],             // 48px - display
				'6xl': ['3.75rem', { lineHeight: '1' }],          // 60px - display large
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
						// Use centralized color system
						'--tw-prose-body': theme('colors.DEFAULT'),
						'--tw-prose-headings': theme('colors.primary'),
						'--tw-prose-lead': theme('colors.muted'),
						'--tw-prose-links': 'hsl(0 0% 100% / 0.9)',
						'--tw-prose-bold': theme('colors.primary'),
						'--tw-prose-counters': theme('colors.subtle'),
						'--tw-prose-bullets': theme('colors.subtle'),
						'--tw-prose-hr': theme('colors.border'),
						'--tw-prose-quotes': 'hsl(0 0% 100% / 0.85)',
						'--tw-prose-quote-borders': 'hsl(0 0% 100% / 0.25)',
						'--tw-prose-captions': theme('colors.muted'),
						'--tw-prose-code': 'hsl(0 0% 100% / 0.95)',
						'--tw-prose-pre-code': 'hsl(0 0% 100% / 0.92)',
						'--tw-prose-pre-bg': theme('backgroundColor.overlay-medium'),
						'--tw-prose-th-borders': 'hsl(0 0% 100% / 0.2)',
						'--tw-prose-td-borders': 'hsl(0 0% 100% / 0.1)',
						'--tw-prose-kbd': 'hsl(0 0% 100% / 0.95)',
						'--tw-prose-kbd-shadows': 'hsl(0 0% 100% / 0.2)',

						// Use centralized typography scale
						color: theme('colors.DEFAULT'),
						fontSize: theme('fontSize.base'),
						lineHeight: theme('fontSize.base.1.lineHeight'),
						maxWidth: '72ch',

						// Centralized heading sizes
						h1: {
							fontSize: theme('fontSize.3xl.0'),
							lineHeight: theme('fontSize.3xl.1.lineHeight'),
							fontFamily: theme('fontFamily.headings'),
							fontWeight: '600',
							marginTop: '1.5em',
							marginBottom: '0.75em',
						},
						h2: {
							fontSize: theme('fontSize.2xl.0'),
							lineHeight: theme('fontSize.2xl.1.lineHeight'),
							fontFamily: theme('fontFamily.headings'),
							fontWeight: '600',
							marginTop: '1.25em',
							marginBottom: '0.5em',
						},
						h3: {
							fontSize: theme('fontSize.xl.0'),
							lineHeight: theme('fontSize.xl.1.lineHeight'),
							fontFamily: theme('fontFamily.headings'),
							fontWeight: '600',
							marginTop: '1em',
							marginBottom: '0.5em',
						},
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