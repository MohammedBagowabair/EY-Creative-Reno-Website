/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F4F3EF', 2: '#E9E8E2', 3: '#DCDAD2' },
        ink: { DEFAULT: '#111417', 2: '#1C2126', 3: '#2A3138', soft: '#5A5F66' },
        cobalt: { DEFAULT: '#2440C4', deep: '#1B3299', soft: '#D8DEFF', sky: '#AFC0FF' },
        volt: '#FFD24A',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
