/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0f",       // deep black
        card: "#111118",     // dark card
        accent: "#7c3aed",   // purple
        accent2: "#22d3ee",  // cyan
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};