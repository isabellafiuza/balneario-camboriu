import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f3f7f6',
          100: '#dbe9e5',
          200: '#b8d2ca',
          300: '#8db4a8',
          400: '#5f9181',
          500: '#3d7262',
          600: '#28584c',
          700: '#123b35',
          800: '#0f312c',
          900: '#0b2623',
          950: '#071816',
        },
        secondary: {
          50:  '#fbf7ed',
          100: '#f5ecd1',
          200: '#ecd8a3',
          300: '#e2c06e',
          400: '#d5ad52',
          500: '#c8a24a',
          600: '#ab8334',
          700: '#886427',
          800: '#6f5123',
          900: '#5d441f',
          950: '#35250f',
        },
        neutral: {
          50:  '#faf9f6',
          100: '#f5f3ed',
          200: '#ece7db',
          300: '#ddd5c3',
          400: '#c4baa2',
          500: '#a6987b',
          600: '#85775f',
          700: '#6b5f4d',
          800: '#564c3f',
          900: '#463d34',
          950: '#27211c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(18, 59, 53, 0.08)',
        premium: '0 20px 50px rgba(18, 59, 53, 0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config