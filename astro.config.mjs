// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.tecnodespegue.com',
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: true },
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          assetFileNames: ({ name }) => {
            if (name?.endsWith('.woff2')) return 'fonts/[name][extname]';
            return '_astro/[name].[hash][extname]';
          },
        },
      },
    },
  },
});