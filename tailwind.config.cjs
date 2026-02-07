/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji"],
      },
      colors: {
        ocean: {
          950: "#050b16",
          900: "#071026",
          800: "#0a1736",
          700: "#0c204b",
          600: "#0e2a61",
          500: "#12347a",
          400: "#1f4aa6",
          300: "#3a67d6",
          200: "#7aa0ff",
          100: "#c7d7ff"
        }
      }
    },
  },
  plugins: [],
};
