/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // supports it later, but remains disabled by default
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a', // Primary #1E3A8A
          900: '#1e3b8a',
          950: '#172554',
        },
        gold: {
          50: '#fdfbeb',
          100: '#fbf7c7',
          200: '#f7ed8f',
          300: '#f1db50',
          400: '#eac625',
          500: '#d4af37', // Gold Accent #D4AF37
          600: '#b88d22',
          700: '#94691c',
          800: '#77521c',
          900: '#65431c',
          950: '#3a230c',
        },
        cream: {
          50: '#faf8f5',
          100: '#f5efe6',
          200: '#ebe0d0',
          300: '#dbcaa8',
          400: '#c5ae7c',
          500: '#b3975a',
          600: '#a3834b',
          700: '#88693c',
          800: '#6e5433',
          900: '#5a452c',
          950: '#332617',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(30, 58, 138, 0.06), 0 1px 3px rgba(212, 175, 55, 0.03)',
        'luxury-lg': '0 20px 40px -15px rgba(30, 58, 138, 0.08), 0 2px 8px rgba(212, 175, 55, 0.04)',
      },
      borderRadius: {
        'luxury': '12px',
        'luxury-lg': '16px',
        'luxury-xl': '24px',
      }
    },
  },
  plugins: [],
}
