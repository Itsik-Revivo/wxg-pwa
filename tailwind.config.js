/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#1B3A6B', light: '#2E5FA3', dark: '#122847' },
        accent:   '#E8A020',
        success:  '#2E7D32',
        warning:  '#F57F17',
        danger:   '#C62828',
      },
      fontFamily: { sans: ['Rubik', 'Arial', 'sans-serif'] },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
};
