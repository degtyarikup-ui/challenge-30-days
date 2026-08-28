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
        background: '#ffffff',
        surface: '#fafaf9',
        'surface-subtle': '#f7f7f5',
        'surface-hover': '#f1f1ef',
        border: '#e7e7e4',
        'border-strong': '#d4d4d0',
        'text-primary': '#2f2f2f',
        'text-secondary': '#73726e',
        'text-muted': '#9b9a97',
        sereja: {
          DEFAULT: '#2563eb',
          light: '#eff6ff',
          border: '#bfdbfe',
          text: '#1d4ed8',
        },
        lera: {
          DEFAULT: '#db2777',
          light: '#fdf2f8',
          border: '#fbcfe8',
          text: '#be185d',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          border: '#fecaca',
          text: '#b91c1c',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}
