/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    daisyui: {
        themes: [
          {
            mytheme: {
              
    "primary": "#009cff",
              
    "secondary": "#b58d00",
              
    "accent": "#035e00",
              
    "neutral": "#04050d",
              
    "base-100": "#fcfcfc",
              
    "info": "#0088db",
              
    "success": "#00a461",
              
    "warning": "#e95b00",
              
    "error": "#e60034",
              },
            },
          ],
        },
    plugins: [daisyui],
  }