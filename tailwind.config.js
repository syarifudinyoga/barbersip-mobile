/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#125AB8",
          darkBlue: "#0F4C9C",
          lightBlue: "#60A5FA",
          cyan: "#22D3EE",
          purple: "#A855F7",
        },
        surface: {
          deep: "#030611",
          night: "#020617",
          card: "#0f172a",
          secondary: "#111827",
          subtle: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};

