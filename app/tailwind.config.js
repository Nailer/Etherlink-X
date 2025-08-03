/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        dark: {
          DEFAULT: '#1F2937',
          light: '#374151',
          lighter: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode with class strategy
}

