import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem", screens: { lg: "1024px", xl: "1200px" } },
    extend: {
      colors: {
        bg:   { DEFAULT: "#0b1220", soft: "#0e1626" },
        card: { DEFAULT: "#0f172a" },
      },
      borderRadius: { xl: "1rem" },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,.3)" }
    },
  },
  plugins: [],
} satisfies Config;
