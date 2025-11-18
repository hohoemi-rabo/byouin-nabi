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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
        },
        success: {
          DEFAULT: "var(--success)",
          dark: "var(--success-dark)",
        },
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          600: "var(--gray-600)",
          800: "var(--gray-800)",
          900: "var(--gray-900)",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: "var(--font-size-base)",
        lg: "var(--font-size-large)",
        sm: "var(--font-size-small)",
      },
      minHeight: {
        tap: "var(--min-tap-size)",
        header: "var(--header-height)",
        footer: "var(--footer-height)",
      },
      minWidth: {
        tap: "var(--min-tap-size)",
      },
    },
  },
  plugins: [],
};

export default config;
