/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          light: '#e8f5e9',
          DEFAULT: '#1b5e20',
          dark: '#0d3c12',
          accent: '#2e7d32',
        }
      },
      fontFamily: {
        // Hindi
        noto: ['"Noto Sans Devanagari"', 'sans-serif'],
        mukta: ['Mukta', 'sans-serif'],
        hind: ['Hind', 'sans-serif'],
        // English
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
