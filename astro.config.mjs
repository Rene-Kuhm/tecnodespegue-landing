// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.tecnodespegue.com',
  trailingSlash: 'never',
  devToolbar: {
    enabled: false,
  },
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: false },
  }),
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin/') &&
        !page.includes('/404') &&
        !page.includes('/en/404') &&
        !page.includes('/en/admin/'),
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
    // Inline critical CSS para reducir render-blocking requests
    // (saving ~130ms en LCP segun PageSpeed Insights)
    inlineStylesheets: 'auto',
  },
  vite: {
    // @ts-ignore – Vite plugin type mismatch between tailwindcss / security-headers and Astro's expected PluginOption
    plugins: [
      ...tailwindcss(),
      {
        name: 'security-headers',
        configureServer(server) {
          server.middlewares.use((_req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('X-XSS-Protection', '0');
            res.setHeader('X-DNS-Prefetch-Control', 'off');
            res.setHeader(
              'Permissions-Policy',
              'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
            );
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            res.setHeader(
              'Content-Security-Policy',
              [
                "default-src 'self'",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-ancestors 'none'",
                // Scripts: self + Plausible analytics inline. Tailwind v4 y Astro
                // no necesitan 'unsafe-inline' gracias a sus nonces; pero mantenemos
                // 'unsafe-inline' como fallback para los inline scripts que Astro
                // emite para los styles scoped. TODO: migrar a nonces cuando Astro
                // lo soporte nativamente para reducir el riesgo XSS.
                "script-src 'self' 'unsafe-inline' https://plausible.io",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                'connect-src ' +
                  "'self' " +
                  'https://plausible.io ' +
                  'https://api.web3forms.com ' +
                  'https://formspree.io',
                'frame-src https://www.youtube.com https://player.vimeo.com',
                'media-src https:',
                'worker-src ' + "'self'",
                'manifest-src ' + "'self'",
              ].join('; ')
            );
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
