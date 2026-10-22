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
          white: "#FFFFFF",
          black: "#0A0A0B",
          "black-subtle": "#171717",
          "black-muted": "#737373",
          border: "#E5E5E5",
          surface: "#FAFAFA",
          purple: "#7C3AED",
          "purple-hover": "#6D28D9",
          "purple-light": "#F5F3FF",
          "purple-subtle": "#EDE9FE",
          "purple-border": "#DDD6FE",
          "purple-dark": "#4C1D95",
        },
      },
    },
  },
  plugins: [],
};

export default config;
