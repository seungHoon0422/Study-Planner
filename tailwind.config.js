/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: {
            DEFAULT: '#FFB6C1',
            light: '#FFD1DC',
            dark: '#FF9EAA',
          },
          lavender: '#E6E6FA',
          mint: '#B2F2BB',
          peach: '#FFD8B1',
          bg: '#FFF5F7',
        }
      }
    },
  },
  plugins: [],
}
