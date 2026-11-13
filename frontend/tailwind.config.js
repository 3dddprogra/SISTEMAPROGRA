/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vino: {
          50: '#FAF0F2',
          100: '#F5DDE3',
          200: '#E8B8C4',
          300: '#D68B9E',
          400: '#BF5E76',
          500: '#9C213D',
          600: '#80142E',
          700: '#670D22',
          800: '#4F091A',
          900: '#380512',
          DEFAULT: '#670D22',
        },
        celeste: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          DEFAULT: '#0284C7',
        },
        beige: {
          50: '#FAF7F2',
          100: '#F4EFE6',
          200: '#EAE0D0',
          300: '#D9C8A8',
          400: '#C4AD86',
          500: '#A88E65',
          600: '#7E6847',
          700: '#5A4830',
          800: '#3D3020',
          900: '#251C12',
          DEFAULT: '#FAF7F2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(103, 13, 34, 0.08), 0 2px 6px -1px rgba(61, 48, 32, 0.05)',
        'warm-lg': '0 10px 30px -4px rgba(103, 13, 34, 0.12), 0 4px 12px -2px rgba(61, 48, 32, 0.08)',
      },
    },
  },
  plugins: [],
};
