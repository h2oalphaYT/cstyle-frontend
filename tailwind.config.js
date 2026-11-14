/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Storefront design tokens. Values live in index.css (:root --cs-*), so CSS and Tailwind agree.
        cs: {
          bg: 'rgb(var(--cs-bg-rgb) / <alpha-value>)',
          surface: 'rgb(var(--cs-surface-rgb) / <alpha-value>)',
          raised: 'rgb(var(--cs-surface-raised-rgb) / <alpha-value>)',
          border: 'var(--cs-border)',
          'border-strong': 'var(--cs-border-strong)',
          text: 'rgb(var(--cs-text-rgb) / <alpha-value>)',
          muted: 'rgb(var(--cs-muted-rgb) / <alpha-value>)',
          accent: 'rgb(var(--cs-accent-rgb) / <alpha-value>)',
          'accent-strong': 'rgb(var(--cs-accent-strong-rgb) / <alpha-value>)',
          tile: 'rgb(var(--cs-tile-rgb) / <alpha-value>)',
        },
        // Admin panel colours follow the light/dark toggle (values in index.css).
        admin: {
          layout: 'var(--admin-layout)',
          surface: 'var(--admin-surface)',
          hover: 'var(--admin-hover)',
          border: 'var(--admin-border)',
          text: 'var(--admin-text)',
          muted: 'var(--admin-muted)',
          accent: 'var(--admin-accent)',
        },
        brand: {
          black: '#121212',
          canvas: '#FAFAFA',
          surface: '#1A1A1A',
          champagne: '#C5A880',
          'champagne-dark': '#A88B65',
          gold: '#D4AF37',
          beige: '#F5E6CC',
          'gold-dark': '#B8941F',
          'gold-light': '#E8C35A',
          'text-light': '#F1F1F1',
          'text-dark': '#1A1A1A',
          muted: '#9A9A9A',
          subtle: '#E5E5E5',
        }
      },
      borderRadius: {
        cs: 'var(--cs-radius)',
        'cs-lg': 'var(--cs-radius-lg)',
      },
      spacing: {
        // Spacing scale (4px base) for section rhythm: cs-1 … cs-8
        'cs-1': 'var(--cs-space-1)',
        'cs-2': 'var(--cs-space-2)',
        'cs-3': 'var(--cs-space-3)',
        'cs-4': 'var(--cs-space-4)',
        'cs-5': 'var(--cs-space-5)',
        'cs-6': 'var(--cs-space-6)',
        'cs-7': 'var(--cs-space-7)',
        'cs-8': 'var(--cs-space-8)',
        header: 'var(--cs-header-h)',
      },
      transitionDuration: {
        fast: '200ms',
        base: '400ms',
        slow: '600ms',
      },
      transitionTimingFunction: {
        cs: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out',
        'slide-left': 'slideLeft 0.8s ease-out',
        'slide-right': 'slideRight 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E8C35A 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)',
      },
    },
  },
  plugins: [],
};
