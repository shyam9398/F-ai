/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF5A1F',
        primaryHover: '#FF6B35',
        border: '#ECECEC',
        lightGray: '#F8F8F8',
        text: '#111827',
        secondaryText: '#6B7280',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        button: '14px',
        tag: '999px',
      },
    },
  },
  plugins: [],
};
