/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
          muted: '#A3A3A3',
          subtle: '#E5E5E5',
        }
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
