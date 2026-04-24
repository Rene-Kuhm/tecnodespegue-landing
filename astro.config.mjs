// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.tecnodespegue.com',
  integrations: [sitemap()],
  build: {
    compressHTML: true,
  },
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