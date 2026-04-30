/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ── Core dark palette ─────────────────────────── */
        base:            '#121212',
        'base-dark':     '#0a0a0a',
        surface:         '#181818',
        'surface-light': '#1f1f1f',
        'surface-hover': '#252525',
        'surface-card':  '#272727',
        'surface-raised':'#2a2a2a',

        /* ── Brand ─────────────────────────────────────── */
        brand:           '#1ed760',
        'brand-dark':    '#1db954',
        'brand-light':   '#1ed76033',
        'brand-glow':    '#1ed76066',

        /* ── Sport accents ─────────────────────────────── */
        padel:           '#539df5',
        'padel-light':   '#539df533',
        tennis:          '#1ed760',
        'tennis-light':  '#1ed76033',

        /* ── Text ──────────────────────────────────────── */
        'text-primary':   '#ffffff',
        'text-secondary': '#b3b3b3',
        'text-muted':     '#7c7c7c',
        'text-faint':     '#535353',

        /* ── Borders ───────────────────────────────────── */
        'border-dark':    '#282828',
        'border-default': '#3e3e3e',
        'border-light':   '#7c7c7c',

        /* ── Semantic ──────────────────────────────────── */
        negative:  '#f3727f',
        warning:   '#ffa42b',
        info:      '#539df5',
        success:   '#1ed760',
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
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'display-1': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-2': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-3': ['3rem',    { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },

      boxShadow: {
        medium:       'rgba(0,0,0,0.3) 0px 8px 8px',
        heavy:        'rgba(0,0,0,0.5) 0px 8px 24px',
        'heavy-lg':   'rgba(0,0,0,0.6) 0px 16px 48px',
        'glow-green': '0 0 20px rgba(30,215,96,0.3), 0 0 60px rgba(30,215,96,0.1)',
        'glow-green-sm': '0 0 10px rgba(30,215,96,0.25)',
        'glow-blue':  '0 0 20px rgba(83,157,245,0.3), 0 0 60px rgba(83,157,245,0.1)',
        'inner-glow':  'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },

      backdropBlur: {
        xs:   '2px',
        '2xl': '40px',
        '3xl': '64px',
      },

      animation: {
        'fade-in':       'fadeIn 0.5s ease-out forwards',
        'fade-in-up':    'fadeInUp 0.6s ease-out forwards',
        'fade-in-down':  'fadeInDown 0.4s ease-out forwards',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        'slide-down':    'slideDown 0.3s ease-out forwards',
        'slide-in-right':'slideInRight 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-slow':    'float 8s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'spin-slow':     'spin 12s linear infinite',
        'bounce-soft':   'bounceSoft 2s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'scale-in':      'scaleIn 0.3s ease-out forwards',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'dot-pulse':     'dotPulse 1.5s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
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
          '0%, 100%': { boxShadow: '0 0 5px rgba(30,215,96,0.2)' },
          '50%':      { boxShadow: '0 0 20px rgba(30,215,96,0.4), 0 0 40px rgba(30,215,96,0.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        dotPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.3)', opacity: '0.7' },
        },
      },

      transitionDuration: {
        '400': '400ms',
      },

      backgroundImage: {
        'gradient-radial':       'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':        'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand':        'linear-gradient(135deg, #1ed760 0%, #1db954 100%)',
        'gradient-brand-subtle': 'linear-gradient(135deg, rgba(30,215,96,0.15) 0%, rgba(30,215,96,0.05) 100%)',
        'gradient-dark':         'linear-gradient(180deg, #181818 0%, #121212 100%)',
        'gradient-mesh':         'radial-gradient(at 40% 20%, rgba(30,215,96,0.08) 0%, transparent 50%), radial-gradient(at 80% 80%, rgba(83,157,245,0.06) 0%, transparent 50%)',
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
    },
  },
  plugins: [],
}
