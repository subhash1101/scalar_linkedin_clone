/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f0fe',
          100: '#c5d8fc',
          200: '#9dbef8',
          300: '#70a2f4',
          400: '#4d8df1',
          500: '#0a66c2',
          600: '#0854a4',
          700: '#063e7d',
          800: '#042c5c',
          900: '#021a3c',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
