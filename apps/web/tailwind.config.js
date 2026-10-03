/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"Iosevka Charon"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Libre Caslon Display"', 'serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        }
      }
    },
  },
  plugins: [],
}
