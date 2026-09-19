/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B2A5B",   // Deep Navy — main background / primary
        royal: "#164A9C",  // Royal Blue — secondary / gradients
        gold: "#F5C542",   // Academic Gold — JP2, highlights, buttons
        paper: "#FFFFFF",  // Pure White — main text / icons
        mist: "#DCE9F8",   // Soft Blue — cards / subtle backgrounds
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(11, 42, 91, 0.08)",
      },
    },
  },
  plugins: [],
};
