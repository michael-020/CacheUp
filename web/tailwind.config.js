/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "red": {
          "200": "#CDA7A7",
          "300": "#9C8A8A",
          "400": "#988787",
          "500": "#6D5F5F",
          "600": "#D34343",
        },
        "gray": {
          "400": "#DCDCDB",
          "600": "#9C9C9C",
          "700": "#868383",
        },
        "yellow": {
          "400": "#F2E315",
        },
        "green": {
          "400": "#4DC665",
        },
        "violet": {
          "300": "#DEDCFF",
        }
      }
    },
  },
  plugins: [],
}