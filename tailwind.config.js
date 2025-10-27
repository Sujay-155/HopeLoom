/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d8f2d',
        'primary-dark': '#247124',
        'primary-light': '#a6d7a6',
        'bg-light': '#f8fcf8',
        'bg-white': '#ffffff',
        'text-dark': '#222222',
        'text-light': '#fefefe',
        'text-muted': '#555555',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
