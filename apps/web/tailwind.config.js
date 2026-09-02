/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ipl: {
          blue: '#1a3a6b',
          gold: '#d4af37',
          orange: '#f97316',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
