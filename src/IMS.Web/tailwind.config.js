export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#1e3a5f",
        },
        accent: {
          DEFAULT: "#2563eb",
        },
        dark: {
          bg: "#0f172a",
          card: "#1e293b",
          border: "#334155",
        },
        light: {
          bg: "#f1f5f9",
          card: "#ffffff",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
