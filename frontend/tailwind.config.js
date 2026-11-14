/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepBlack: '#050505',
        secondaryBlack: '#101010',
        cardBg: '#151515',
        pureWhite: '#FFFFFF',
        primaryText: '#F5F5F5',
        secondaryText: '#A1A1AA',
        mutedText: '#71717A',
        borderLine: '#292929',
        borderLight: '#E8E8E8',
        subtleHighlight: '#D4D4D8',
        subtleGray: '#F7F7F8',
        surfaceDark: '#0D0D0D',
        surfaceLight: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        editorial: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Grotesk', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'spin-reverse-slow': 'spinReverse 35s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 25px -5px rgba(255, 255, 255, 0.08)',
        'cardHover': '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
