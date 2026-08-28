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
        background: '#F5F6F9',
        card: '#FFFFFF',
        'card-dark': '#15161A',
        'card-dark-hover': '#1E1F24',
        'surface-subtle': '#E9EBF0',
        'surface-muted': '#EFF1F5',
        'text-black': '#0D0E12',
        'text-dark': '#2B2C34',
        'text-muted': '#828490',
        lime: {
          DEFAULT: '#D4FF00',
          hover: '#C4EE00',
          subtle: '#F4FFC2',
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
        'none': 'none',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
