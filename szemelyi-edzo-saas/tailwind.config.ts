import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(35 40% 96%)",
        foreground: "hsl(20 15% 12%)",
        card: "hsl(35 30% 98%)",
        border: "hsl(20 15% 85%)",
        primary: "hsl(15 80% 55%)",
        muted: "hsl(20 10% 50%)",
        accent: "hsl(165 35% 40%)"
      },
      fontFamily: {
        display: ["'DM Serif Display'", "serif"],
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
