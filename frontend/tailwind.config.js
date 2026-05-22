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
    },
  },
  plugins: [],
};
