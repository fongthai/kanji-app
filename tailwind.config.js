/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1512px',
      'xl': '1801px',
      '2xl': '2400px',
    },
    extend: {},
  },
  plugins: [],
}
