/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golden: '#B8860B', // Golden brown theme color
        goldenDark: '#8B6508',
      }
    },
  },
  plugins: [],
}
