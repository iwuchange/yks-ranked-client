/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        hex: {
          void: "#01040c",
          navy: "#0a1628",
          deep: "#0d1b33",
          panel: "#12203a",
          steel: "#1a2d4d",
          gold: "#c89b3c",
          "gold-bright": "#f0e6d2",
          "gold-dim": "#785a28",
          cyan: "#0ac8dc",
          blue: "#0a96c8",
        },
      },
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        body: ['"Noto Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        hex: "0 0 24px rgba(200, 155, 60, 0.25)",
        glow: "0 0 40px rgba(10, 200, 220, 0.18)",
      },
    },
  },
  plugins: [],
};
