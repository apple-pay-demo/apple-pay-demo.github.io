/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', 'src/**/*.{vue,ts,js}'],
  content: ['./index.html', 'src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#0F172A', // quase preto com viés azul
        'blue-800': '#1E40AF',
        'blue-700': '#1D4ED8',
        'blue-600': '#2563EB',
        'blue-500': '#3B82F6'
      }
    }
  },
  plugins: []
}

