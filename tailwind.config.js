/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-dim': '#00e6e6',
        'primary': '#c1fffe',
        'surface-container-highest': '#262626',
        'surface-container-lowest': '#000000',
        'surface-dim': '#0e0e0e',
        'secondary-fixed': '#00fd87',
        'background': '#0e0e0e',
        'surface-container-low': '#131313',
        'on-surface-variant': '#adaaaa',
        'primary-container': '#00ffff',
        'on-primary-container': '#005d5d',
        'surface-container-high': '#201f1f',
        'surface': '#0e0e0e',
        'on-surface': '#ffffff',
        'secondary': '#00fd87',
        'surface-container': '#1a1919',
        'outline': '#777575',
        'outline-variant': '#494847',
        'surface-variant': '#262626',
      },
      fontFamily: {
        'headline': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'label': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        'lg': '0.25rem',
        'xl': '0.5rem',
        'full': '0.75rem',
      },
    },
  },
  plugins: [],
}
