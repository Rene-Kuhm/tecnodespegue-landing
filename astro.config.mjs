// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.tecnodespegue.com',
  // output: 'static' es el default en Astro 6 — los endpoints con `prerender = false`
  // se sirven como serverless functions en Vercel automáticamente
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: false },
  }),
  integrations: [sitemap()],
  build: {
    compressHTML: true,
  },
  vite: {
    plugins: [
      tailwindcss(),
      // Inject security headers in dev server
      {
        name: 'security-headers',
        configureServer(server) {
          server.middlewares.use((_req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('X-XSS-Protection', '0');
            res.setHeader('X-DNS-Prefetch-Control', 'off');
            res.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
            next();
          });
        },
      },
    ],
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