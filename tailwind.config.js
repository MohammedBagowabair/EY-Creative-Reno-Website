/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // EYCR brand: slate navy + mist blue, taken from the EYCR logos
        navy: { DEFAULT: '#384254', deep: '#262E3D' },
        mist: { DEFAULT: '#BFD0DA', soft: '#DCE6EC', pale: '#EEF3F6' },
        ink: { DEFAULT: '#1B212C', soft: '#525A67' },
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
