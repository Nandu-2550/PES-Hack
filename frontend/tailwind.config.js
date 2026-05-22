/** @type {import('tailwindcss').Config} */
export default {
  // Scan all source files so PurgeCSS only includes used classes
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Extend with AgriHub-specific animation timings if needed
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(16,185,129,0.06)',
        'glow-md': '0 0 24px rgba(16,185,129,0.10)',
        'glow-lg': '0 0 40px rgba(16,185,129,0.15)',
        'card':    '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
