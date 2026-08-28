/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        card: '#12141C',
        'card-hover': '#181B26',
        'card-border': '#232736',
        accent: {
          sereja: '#3B82F6', // Vibrant Blue
          'sereja-glow': 'rgba(59, 130, 246, 0.3)',
          lera: '#EC4899',   // Vibrant Pink/Rose
          'lera-glow': 'rgba(236, 72, 153, 0.3)',
          gold: '#F59E0B',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
        'glow-pink': '0 0 20px -5px rgba(236, 72, 153, 0.5)',
        'glow-gold': '0 0 20px -5px rgba(245, 158, 11, 0.5)',
      }
    },
  },
  plugins: [],
}
