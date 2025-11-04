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
        brightPink: {
          DEFAULT: '#ef476f',
          100: '#390511', 200: '#720a22', 300: '#ac0f34', 400: '#e51445', 500: '#ef476f', 600: '#f26d8c', 700: '#f591a9', 800: '#f9b6c5', 900: '#fcdae2',
        },
        coral: {
          DEFAULT: '#f78c6b',
          100: '#431204', 200: '#862507', 300: '#c9370b', 400: '#f45626', 500: '#f78c6b', 600: '#f9a187', 700: '#fab9a5', 800: '#fcd0c3', 900: '#fde8e1',
        },
        mantis: {
          DEFAULT: '#83d483',
          100: '#113311', 200: '#236623', 300: '#349934', 400: '#4fc34f', 500: '#83d483', 600: '#9bdd9b', 700: '#b4e5b4', 800: '#cdeecd', 900: '#e6f6e6',
        },
        emerald: {
          DEFAULT: '#06d6a0',
          100: '#012b20', 200: '#02563f', 300: '#03805f', 400: '#04ab7f', 500: '#06d6a0', 600: '#1cf9be', 700: '#55fbce', 800: '#8efcdf', 900: '#c6feef',
        },
        lightSeaGreen: {
          DEFAULT: '#0cb0a9',
          100: '#022322', 200: '#054743', 300: '#076a65', 400: '#0a8d87', 500: '#0cb0a9', 600: '#10ede2', 700: '#4bf2ea', 800: '#87f7f1', 900: '#c3fbf8',
        },
        ncsBlue: {
          DEFAULT: '#118ab2',
          100: '#031b23', 200: '#073747', 300: '#0a526a', 400: '#0d6e8e', 500: '#118ab2', 600: '#18b5e9', 700: '#51c8ef', 800: '#8bdaf4', 900: '#c5edfa',
        },
        midnightGreen: {
          DEFAULT: '#073b4c',
          100: '#010c0f', 200: '#03171e', 300: '#04232d', 400: '#062e3c', 500: '#073b4c', 600: '#0e7699', 700: '#16b3e7', 800: '#62cdf0', 900: '#b1e6f8',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-ncsBlue': '0 8px 32px 0 rgba(17, 138, 178, 0.25)',
      },
    },
  },
  plugins: [],
}

