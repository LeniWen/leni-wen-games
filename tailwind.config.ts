import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        hangman: 'linear-gradient(180deg, #190131 0%, #282B96 100%)',
      },
      screens: {
        mobile: '375px',
        tablet: '768px',
        desktop: '1440px',
      },
    },
  },
  plugins: [],
} satisfies Config
