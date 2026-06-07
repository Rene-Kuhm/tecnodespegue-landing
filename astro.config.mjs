// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.tecnodespegue.com',
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: false },
  }),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-AR',
          en: 'en-US',
        },
      },
    }),
  ],
  // i18n — ES en raíz, EN bajo /en/. El defaultLocale NO se prefija para
  // preservar el SEO de las URLs ya indexadas en Google.
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  build: {
    compressHTML: true,
  },
  vite: {
    plugins: [
      tailwindcss(),
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