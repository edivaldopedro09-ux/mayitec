/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mayitec: {
          purple: '#9b51e0', // Roxo do logo
          blue: '#2d9cdb',   // Azul do logo
          dark: '#333333',   // Texto escuro
          light: '#f8f9fa',  // Fundo limpo
        }
      },
      backgroundImage: {
        'mayitec-gradient': 'linear-gradient(135deg, #9b51e0 0%, #2d9cdb 100%)',
      }
    },
  },
  plugins: [],
}