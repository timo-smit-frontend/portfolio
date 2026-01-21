const defaultTheme = require('tailwindcss/defaultTheme')
const tailwindcssAnimated = require('tailwindcss-animated')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [tailwindcssAnimated]
}
