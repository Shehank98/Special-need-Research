/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // OpenDyslexic first, Noto Sans Sinhala for Sinhala glyphs, then fallbacks.
        dyslexic: ['OpenDyslexic', 'Noto Sans Sinhala', 'Comic Sans MS', 'sans-serif'],
      },
      colors: {
        // Warm, low-stress palette (no pure white).
        cream: '#fdf6e3',
        ink: '#2c2c2c',
        pastel: {
          blue: '#cfe8ef',
          green: '#d8f3dc',
          yellow: '#fff3b0',
          pink: '#ffd6e0',
          purple: '#e7d6ff',
        },
      },
      letterSpacing: {
        readable: '0.05em',
      },
    },
  },
  plugins: [],
};
