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
          black: "#000000",
          "black-subtle": "#171717",
          "black-muted": "#737373",
          border: "#E5E5E5",
          surface: "#FAFAFA",
        },
      },
    },
  },
  plugins: [],
};

export default config;
