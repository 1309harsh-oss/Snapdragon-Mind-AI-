/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#08090C',
          surface: '#111318',
          card: '#161920',
          border: '#242834',
          subtle: '#2D3242',
          red: '#FF2438',
          redDark: '#D91225',
          redGlow: 'rgba(255, 36, 56, 0.15)',
          accent: '#00F0FF',
          text: '#F1F5F9',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
