import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF5EF',
          200: '#F8EDE3', // Palette 1
          300: '#EFE0D2',
          400: '#E5D0C0',
          500: '#D4BBA5',
        },
        sage: {
          light: '#BDD2B6', // Palette 2
          DEFAULT: '#A2B29F', // Palette 3
          medium: '#A2B29F',
          dark: '#798777', // Palette 4
          deep: '#5B6859',
          forest: '#3F493D',
          charcoal: '#283227',
          night: '#1A2119',
        },
        moss: {
          50: '#F6F8F5',
          100: '#E7ECE5',
          200: '#BDD2B6', // Palette 2
          300: '#A2B29F', // Palette 3
          400: '#8C9C89',
          500: '#798777', // Palette 4
          600: '#647162',
          700: '#4F5B4E',
          800: '#3D463C',
          900: '#2A3129',
          950: '#1A201A',
        },
        primary: {
          50: '#FAF5EF',
          100: '#F8EDE3',
          200: '#BDD2B6',
          300: '#A2B29F',
          500: '#798777',
          600: '#647162',
          700: '#4F5B4E',
          800: '#3D463C',
          900: '#283227',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
};