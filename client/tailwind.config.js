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
        background: '#F4F5F8',
        card: '#FFFFFF',
        'card-dark': '#18191E',
        'card-dark-hover': '#22242B',
        'surface-subtle': '#EAECF0',
        'surface-muted': '#F0F2F5',
        'text-black': '#0F1015',
        'text-dark': '#2B2C34',
        'text-muted': '#787A85',
        lime: {
          DEFAULT: '#D2FF00',
          hover: '#C2ED00',
          subtle: '#F4FFC2',
          glow: 'rgba(210, 255, 0, 0.4)',
        },
        danger: {
          DEFAULT: '#FF3B30',
          subtle: '#FFEBEA',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'card-elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'lime': '0 8px 25px -4px rgba(210, 255, 0, 0.5)',
        'dark': '0 10px 25px -5px rgba(24, 25, 30, 0.3)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
