/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          100: 'rgb(30 41 59)',
          200: 'rgb(15 23 42)',
          300: 'rgb(2 6 23)'
        }
      }
    }
  },
  plugins: [],
  output: {
    removeComments: true
  }
} 