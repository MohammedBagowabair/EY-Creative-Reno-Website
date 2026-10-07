/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plaster: { DEFAULT: '#F2EFE9', 2: '#E8E3DA', 3: '#DCD5C9' },
        ink: { DEFAULT: '#1D1F1E', soft: '#5E615F', 2: '#2A2D2B' },
        copper: { DEFAULT: '#B4532A', ink: '#9A4320', glow: '#E08A5E' },
        mint: { DEFAULT: '#A9DCCD', soft: '#D7EFE7' },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
