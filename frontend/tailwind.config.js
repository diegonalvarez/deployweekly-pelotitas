/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ── Core dark palette (cool midnight, not pure gray) ── */
        base:            '#0A0E14',
        'base-dark':     '#06080D',
        surface:         '#11161F',
        'surface-light': '#161C28',
        'surface-hover': '#1B2230',
        'surface-card':  '#1F273A',
        'surface-raised':'#252E44',

        /* ── Brand: Court Lime (electric, sport, distinctive) ── */
        brand:           '#D4FF3F',
        'brand-dark':    '#B8E635',
        'brand-light':   '#D4FF3F1F',
        'brand-glow':    '#D4FF3F4D',
        'brand-ink':     '#0A0E14',  /* text-on-brand */

        /* ── Sport accents ──────────────────────────────────── */
        padel:           '#6BA9FF',
        'padel-light':   '#6BA9FF1F',
        tennis:          '#FF5C2B',  /* CLAY — was green */
        'tennis-light':  '#FF5C2B1F',
        clay:            '#FF5C2B',
        'clay-light':    '#FF5C2B1F',
        sky:             '#6BA9FF',
        'sky-light':     '#6BA9FF1F',

        /* ── Text (slightly warmer than pure white) ─────────── */
        'text-primary':   '#F4F6FB',
        'text-secondary': '#94A0B5',
        'text-muted':     '#5A6478',
        'text-faint':     '#3A4358',

        /* ── Borders (cool, structural) ─────────────────────── */
        'border-dark':    '#1E2532',
        'border-default': '#2A3142',
        'border-light':   '#465070',

        /* ── Semantic ───────────────────────────────────────── */
        negative:  '#FF5470',
        warning:   '#FFB547',
        info:      '#6BA9FF',
        success:   '#5DD39E',
      },

      borderRadius: {
        pill:      '9999px',
        'pill-lg': '500px',
        '2xl':     '1rem',
        '3xl':     '1.5rem',
      },

      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto',
          'Helvetica Neue', 'Arial', 'sans-serif',
        ],
        display: [
          'Inter', 'system-ui', '-apple-system', 'sans-serif',
        ],
        mono: [
          'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo',
          'Monaco', 'Consolas', 'monospace',
        ],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'display-1': ['5rem',    { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-2': ['4rem',    { lineHeight: '0.97', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-3': ['3rem',    { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-4': ['2.25rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
      },

      letterSpacing: {
        tightest: '-0.04em',
        'tight-2': '-0.025em',
      },

      boxShadow: {
        soft:           '0 1px 2px 0 rgba(0,0,0,0.3)',
        medium:         '0 4px 12px 0 rgba(0,0,0,0.35)',
        heavy:          '0 16px 48px -12px rgba(0,0,0,0.7)',
        'heavy-lg':     '0 24px 72px -16px rgba(0,0,0,0.8)',
        'glow-brand':    '0 0 0 1px rgba(212,255,63,0.25), 0 8px 32px -8px rgba(212,255,63,0.45)',
        'glow-brand-sm': '0 0 0 1px rgba(212,255,63,0.2), 0 4px 16px -4px rgba(212,255,63,0.3)',
        'glow-clay':     '0 0 0 1px rgba(255,92,43,0.3), 0 8px 32px -8px rgba(255,92,43,0.4)',
        'glow-sky':      '0 0 0 1px rgba(107,169,255,0.3), 0 8px 32px -8px rgba(107,169,255,0.4)',
        /* Backwards-compatible aliases — old code uses these names. */
        'glow-green':    '0 0 0 1px rgba(212,255,63,0.25), 0 8px 32px -8px rgba(212,255,63,0.45)',
        'glow-green-sm': '0 0 0 1px rgba(212,255,63,0.2), 0 4px 16px -4px rgba(212,255,63,0.3)',
        'glow-blue':     '0 0 0 1px rgba(107,169,255,0.3), 0 8px 32px -8px rgba(107,169,255,0.4)',
        'inner-line':   'inset 0 1px 0 0 rgba(255,255,255,0.04)',
        'card':         '0 1px 0 0 rgba(255,255,255,0.03), 0 2px 6px -1px rgba(0,0,0,0.4)',
        'card-hover':   '0 1px 0 0 rgba(255,255,255,0.05), 0 12px 32px -8px rgba(0,0,0,0.5)',
      },

      backdropBlur: {
        xs:    '2px',
        '2xl': '40px',
        '3xl': '64px',
      },

      animation: {
        'fade-in':         'fadeIn 0.4s ease-out forwards',
        'fade-in-up':      'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down':    'fadeInDown 0.4s ease-out forwards',
        'slide-up':        'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down':      'slideDown 0.3s ease-out forwards',
        'slide-in-right':  'slideInRight 0.3s ease-out forwards',
        'slide-in-left':   'slideInLeft 0.3s ease-out forwards',
        'pulse-glow':      'pulseGlow 2.4s ease-in-out infinite',
        'float':           'float 6s ease-in-out infinite',
        'float-slow':      'float 9s ease-in-out infinite',
        'float-delayed':   'float 7s ease-in-out 2s infinite',
        'spin-slow':       'spin 12s linear infinite',
        'bounce-soft':     'bounceSoft 2.4s ease-in-out infinite',
        'shimmer':         'shimmer 2.4s linear infinite',
        'scale-in':        'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse':      'glowPulse 3s ease-in-out infinite',
        'dot-pulse':       'dotPulse 1.6s ease-in-out infinite',
        'marquee':         'marquee 40s linear infinite',
        'marquee-reverse': 'marqueeReverse 40s linear infinite',
        'gradient-x':      'gradientX 8s ease infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,255,63,0.0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(212,255,63,0.08), 0 0 32px 0 rgba(212,255,63,0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-18px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '0.9' },
        },
        dotPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.4)', opacity: '0.6' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },

      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },

      transitionTimingFunction: {
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo':'cubic-bezier(0.87, 0, 0.13, 1)',
      },

      backgroundImage: {
        'gradient-radial':       'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':        'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand':        'linear-gradient(135deg, #D4FF3F 0%, #B8E635 100%)',
        'gradient-clay':         'linear-gradient(135deg, #FF5C2B 0%, #FF8A5B 100%)',
        'gradient-sky':          'linear-gradient(135deg, #6BA9FF 0%, #88B8FF 100%)',
        'gradient-brand-subtle': 'linear-gradient(135deg, rgba(212,255,63,0.12) 0%, rgba(212,255,63,0.02) 100%)',
        'gradient-dark':         'linear-gradient(180deg, #11161F 0%, #0A0E14 100%)',
        'gradient-mesh':         'radial-gradient(at 20% 0%, rgba(212,255,63,0.06) 0%, transparent 50%), radial-gradient(at 80% 100%, rgba(107,169,255,0.05) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(255,92,43,0.03) 0%, transparent 60%)',
        'court-grid':            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v40H0zM0 0h40v1H0z' fill='%231E2532'/%3E%3C/svg%3E\")",
      },

      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '100': '25rem',
        '120': '30rem',
        sidebar: '15rem',
        'sidebar-collapsed': '4rem',
      },
    },
  },
  plugins: [],
}
