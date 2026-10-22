import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFF0",
          yellow: "#F6C324",
          black: "#191919",
          "yellow-hover": "#e5b41e",
          "yellow-light": "#fef8e7",
          "yellow-border": "#fbe18b",
          "black-subtle": "#2a2a2a",
          "black-muted": "#666666",
        },
      },
    },
  },
  plugins: [],
};

export default config;
