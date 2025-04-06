// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}", // If you're still using /pages
    ],
    theme: {
      extend: {
        backgroundImage: {
          shimmer: 'linear-gradient(to right, #333 0%, #888 50%, #333 100%)',
        },
        backgroundSize: {
          shimmer: '200% 100%',
        },
        animation: {
          shimmer: 'shimmer 1.5s infinite linear',
        },
        keyframes: {
          shimmer: {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        },
      },
    },
    plugins: [],
  }