/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#0a0a0f',
          100: '#0f0f1a',
          200: '#1a1a2e',
          300: '#16213e',
          400: '#0f3460',
          500: '#533483',
          600: '#8b5cf6',
          700: '#a855f7',
          800: '#c084fc',
          900: '#e879f9',
        },
        gradient: {
          start: '#0a0a0f',
          mid: '#0f0f1a',
          end: '#1a1a2e',
          accent: '#0f3460',
        }
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%)',
        'dark-gradient-radial': 'radial-gradient(ellipse at center, #0f0f1a 0%, #0a0a0f 100%)',
        'dark-gradient-conic': 'conic-gradient(from 180deg at 50% 50%, #0a0a0f 0deg, #0f0f1a 72deg, #1a1a2e 144deg, #16213e 216deg, #0f3460 288deg, #0a0a0f 360deg)',
        'cool-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 25%, #1a1a2e 50%, #16213e 75%, #0f3460 100%)',
        'cool-gradient-radial': 'radial-gradient(ellipse at center, #0f0f1a 0%, #0a0a0f 100%)',
        'cool-gradient-conic': 'conic-gradient(from 180deg at 50% 50%, #0a0a0f 0deg, #0f0f1a 72deg, #1a1a2e 144deg, #16213e 216deg, #0f3460 288deg, #0a0a0f 360deg)',
      }
    },
  },
  plugins: [],
};
