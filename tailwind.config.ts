import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "alfa-green": "#009A76",
        "alfa-navy": "#0B2A55",
        "alfa-navy-dark": "#071C3F",
        "alfa-gold": "#D89A1D",
        "alfa-background": "#F7F9FC",
        "alfa-surface": "#FFFFFF",
        "alfa-text": "#0C2446",
        "alfa-muted": "#64748B",
        "alfa-error": "#C62828",
        "alfa-warning": "#D68A00",
        "alfa-success": "#087A55",
      },
    },
  },
  plugins: [],
};

export default config;
