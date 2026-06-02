export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        field: {
          50: "#f2f8f1",
          100: "#dcefd9",
          200: "#b9dfb5",
          300: "#88c982",
          400: "#56ad5e",
          500: "#2f8f46",
          600: "#25763a",
          700: "#1f5f32",
          800: "#184b29",
          900: "#12351f"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(31, 95, 50, 0.12)",
        glow: "0 24px 80px rgba(37, 118, 58, 0.18)"
      }
    }
  },
  plugins: []
};
