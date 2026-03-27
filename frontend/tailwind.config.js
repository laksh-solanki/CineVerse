/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        accent: "#f97316",
        neon: "#14b8a6",
      },
      boxShadow: {
        glow: "0 0 40px rgba(249, 115, 22, 0.3)",
      },
    },
  },
  plugins: [],
};
