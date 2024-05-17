/* global require */
/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
const iOSHeight = require("@rvxlab/tailwind-plugin-ios-full-height");

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        n: {
          1: "#FFFFFF",
          2: "#F3F5F7",
          3: "#FBFBFB",
          4: "#6C7275",
          5: "#343839",
          6: "#232627",
          7: "#141718",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      zIndex: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // plugins: [require("tailwindcss-animate")],
  plugins: [
    require("tailwind-scrollbar"),
    require("tailwindcss-animate"),
    iOSHeight,
    plugin(function ({ addBase, addComponents, addUtilities }) {
      addBase({
        html: {
          "@apply text-[1rem]": {},
        },
        body: {
          "@apply bg-n-7 text-[1rem] leading-6 -tracking-[.01em] text-n-7 antialiased md:bg-n-1 dark:text-n-1 dark:md:bg-n-6":
            {},
        },
      });
      addComponents({
        ".h1": {
          "@apply text-6xl font-bold -tracking-[.025em]": {},
        },
        ".h2": {
          "@apply text-5xl font-bold -tracking-[.025em]": {},
        },
        ".h3": {
          "@apply text-4xl font-bold -tracking-[.045em]": {},
        },
        ".h4": {
          "@apply text-3xl font-bold -tracking-[.02em]": {},
        },
        ".h5": {
          "@apply text-2xl font-semibold -tracking-[.03em]": {},
        },
        ".h6": {
          "@apply text-xl font-semibold -tracking-[.03em]": {},
        },
        ".body1": {
          "@apply text-[1.5rem] leading-9 -tracking-[.03em]": {},
        },
        ".body1S": {
          "@apply text-[1.375rem] leading-7 -tracking-[.02em]": {},
        },
        ".body2": {
          "@apply text-[1.0625rem] leading-6 -tracking-[.01em]": {},
        },
        ".base1": {
          "@apply text-[1rem] leading-6 font-medium -tracking-[.03em]": {},
        },
        ".base2": {
          "@apply sm:text-[0.875rem] text-[0.8rem] leading-6 font-medium -tracking-[.02em]":
            {},
        },
        ".caption1": {
          "@apply text-[0.75rem] leading-5 font-medium -tracking-[.03em]": {},
        },
        ".caption2": {
          "@apply text-[0.6875rem] leading-4 font-medium -tracking-[.01em]": {},
        },
        ".shadow-ring-lg": {
          "@apply shadow-lg ring-2 ring-black/5 ring-opacity-20": {},
        },
        ".shadow-ring": {
          "@apply shadow ring  ring-black/5 ring-opacity-20": {},
        },
      });
      addUtilities({
        ".tap-highlight-color": {
          "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
        },
      });
    }),
  ],
};
