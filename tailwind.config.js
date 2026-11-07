/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF9F3',
          100: '#F5EFE0',
          200: '#EBDEC2',
          300: '#DFCE9F',
          400: '#D2BC7F',
          500: '#C5A869', // Official Ballon d'Or Champagne Bronze Gold
          600: '#A98B4B',
          700: '#896E37',
          800: '#695326',
          900: '#4A3918',
          950: '#2C210C',
        },
        gala: {
          black: '#090A0D',
          dark: '#0E1015',
          card: '#13151D',
          cardSubtle: '#171A24',
          border: 'rgba(255, 255, 255, 0.08)',
          borderGold: 'rgba(197, 168, 105, 0.25)',
          muted: '#8E94A5',
          accent: '#C5A869',
        }
      },
      fontFamily: {
        brand: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 2px 14px rgba(197, 168, 105, 0.1)',
        'gold-glow-lg': '0 4px 24px rgba(197, 168, 105, 0.15)',
        'gold-inner': 'inset 0 0 10px rgba(197, 168, 105, 0.1)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #DFCE9F 0%, #C5A869 50%, #896E37 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(19, 21, 29, 0.98) 0%, rgba(11, 13, 18, 0.98) 100%)',
        'hero-radial': 'radial-gradient(circle at 50% 10%, rgba(197, 168, 105, 0.06) 0%, rgba(9, 10, 13, 1) 70%)',
      },
    },
  },
  plugins: [],
}



