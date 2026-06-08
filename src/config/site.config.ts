/**
 * site.config.ts
 * Configuración centralizada del sitio. Cambiar acá propaga a todas las páginas.
 *
 * NOTA: En producción (Vercel), estos valores se pueden overridear con env vars
 * definidas en Vercel Dashboard → Settings → Environment Variables.
 */

import { z } from 'astro:content';

export const siteConfig = {
  // Dominio principal (sin trailing slash, con https://)
  url: import.meta.env.PUBLIC_SITE_URL || 'https://www.tecnodespegue.com',
  hostname: import.meta.env.PUBLIC_SITE_HOSTNAME || 'www.tecnodespegue.com',

  // Branding
  name: 'TecnoDespegue',
  tagline: 'Ingeniería de software & automatización con IA',
  description: 'Desarrollo fullstack, automatizaciones con IA y soluciones a medida. Desde Argentina para el mundo.',

  // Contacto
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'renekuhm2@gmail.com',
  phone: import.meta.env.PUBLIC_CONTACT_PHONE || '+54-9-2334-409838',
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER || '5492334409838', // sin + ni espacios para wa.me
  location: {
    street: 'Eduardo Castex',
    region: 'La Pampa',
    country: 'AR',
  },

  // Redes sociales
  social: {
    github: 'https://github.com/Rene-Kuhm',
    instagram: 'https://instagram.com/renekuhm',
    tiktok: 'https://tiktok.com/@kuhmdev',
    youtube: 'https://youtube.com/@tecnodespegue',
    linkedin: 'https://linkedin.com/in/renekuhm',
  },

  // Integraciones (dejar vacío para deshabilitar)
  formspree: {
    enabled: true,
    endpoint: import.meta.env.PUBLIC_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mojpnepv',
  },
  tiktokPixel: {
    enabled: import.meta.env.PUBLIC_TIKTOK_PIXEL_ENABLED !== 'false', // habilitado por defecto, desactivar con PUBLIC_TIKTOK_PIXEL_ENABLED=false
    id: import.meta.env.PUBLIC_TIKTOK_PIXEL_ID || 'D8AARK3C77U6KT5BPNHG',
  },
  plausible: {
    enabled: import.meta.env.PUBLIC_PLAUSIBLE_ENABLED !== 'false', // habilitado por defecto
    domain: import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN || 'www.tecnodespegue.com',
  },

  // API endpoint (para /api/tiktok-event en Vercel serverless)
  apiUrl: import.meta.env.PUBLIC_API_URL || '',

  // Locale
  locale: 'es_AR',

  // OG images por locale (crear /og-image-en.png cuando esté disponible)
  ogImage: '/og-image.png',
  ogImageEn: '/og-image.png', // TODO: crear versión EN con texto "Custom Software · AI Automation"
  ogImageWidth: 1200,
  ogImageHeight: 630,
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Schema para validación en build (zod)
 */
export const siteConfigSchema = z.object({
  url: z.string().url(),
  email: z.string().email(),
  phone: z.string(),
  whatsappNumber: z.string(),
});
