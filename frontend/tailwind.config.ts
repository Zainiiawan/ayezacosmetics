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
        'rose-gold': '#b76e79',
        'rose-gold-light': '#e8c4c4',
        'rose-gold-dark': '#8b4d5b',
        'black': '#0a0a0a',
        'white': '#ffffff',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rose-gold-gradient': 'linear-gradient(135deg, #b76e79 0%, #e8c4c4 100%)',
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(183, 110, 121, 0.15)',
        'luxury-lg': '0 10px 40px rgba(183, 110, 121, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;