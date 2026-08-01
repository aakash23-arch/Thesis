import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // Design principle 4: "Borders, not shadows." Overriding (not extending) the
    // shadow scale makes `shadow-*` unavailable outside of `shadow-none`, so the
    // rule is enforced by the config rather than by discipline.
    boxShadow: {
      none: 'none',
    },
    extend: {
      colors: {
        page: '#FAFBFC',
        surface: '#FFFFFF',
        recessed: '#F1F3F5',
        ink: {
          primary: '#0F1419',
          secondary: '#5C6670',
          tertiary: '#9CA3AB',
        },
        accent: {
          DEFAULT: '#1A6B4A',
          hover: '#145A3D',
          light: '#E8F5EE',
        },
        // Signal colours are the spec palette, used for FILLS -- gauge bands, chart
        // series, status dots. The `*-ink` twins are the same signal darkened only
        // as far as WCAG AA needs for text on light surfaces; `*-light` are the
        // tinted backgrounds those inks sit on.
        signal: {
          healthy: '#1A6B4A',
          'healthy-ink': '#1A6B4A', // 6.47:1 on white -- passes as-is
          'healthy-light': '#E8F5EE',
          caution: '#C8922A',
          'caution-ink': '#8A6318', // #C8922A is 2.76:1 -- this is 5.41:1
          'caution-light': '#FAF2E1',
          broken: '#B83A2E',
          'broken-ink': '#B83A2E', // 5.70:1 on white -- passes as-is
          'broken-light': '#FBEBE9',
          neutral: '#4A7FBF',
          'neutral-ink': '#2F6099', // #4A7FBF is 4.13:1 -- this is 6.45:1
          'neutral-light': '#EAF1F9',
        },
        border: {
          DEFAULT: '#E2E5E9',
          strong: '#CDD1D6',
          focus: '#1A6B4A',
        },
      },
      fontFamily: {
        serif: ['var(--font-instrument-serif)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      fontSize: {
        hero: ['3.5rem', { lineHeight: '1.1' }],
        'page-title': ['2rem', { lineHeight: '1.2' }],
        'section-head': ['1.25rem', { lineHeight: '1.4' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        'data-figure': ['1.5rem', { lineHeight: '1.3' }],
        'data-small': ['0.875rem', { lineHeight: '1.4' }],
      },
      maxWidth: {
        content: '1120px',
      },
      borderRadius: {
        card: '0.5rem',
        pill: '1.5rem',
      },
      transitionDuration: {
        instrument: '150ms',
      },
      transitionTimingFunction: {
        instrument: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'gauge-rise': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
