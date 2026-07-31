import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
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
        signal: {
          healthy: '#1A6B4A',
          caution: '#C8922A',
          broken: '#B83A2E',
          neutral: '#4A7FBF',
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
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
