// src/i18n/ui.ts
// Diccionarios de strings de UI. ES es la fuente de verdad.
// Agregar keys primero en `es`, luego en `en`.

import type { Locale } from './locales';

const es = {
  nav: {
    home: 'Inicio',
    solutions: 'Soluciones',
    blog: 'Blog',
    portfolio: 'Portfolio',
    stack: 'Stack',
    process: 'Proceso',
    contact: 'Contacto',
    cta: 'Iniciá tu Proyecto',
    mobileMenuOpen: 'Abrir menú',
    mobileMenuClose: 'Cerrar menú',
  },
  footer: {
    tagline: 'Software interno, integraciones y automatización para operaciones con menos fricción.',
    contact: 'Contacto',
    socials: 'Redes',
    location: 'Eduardo Castex, La Pampa, Argentina',
    privacy: 'Privacidad',
    rights: 'Todos los derechos reservados.',
  },
  meta: {
    skipToContent: 'Saltar al contenido',
  },
  blog: {
    badge: 'Blog',
    heroTitle: 'Blog de Ingeniería',
    heroSub: 'Desarrollo fullstack, automatizaciones con IA, arquitectura y estrategia. Sin humo.',
    articles: 'artículos',
    reading: 'Lectura',
    updated: 'Actualizado',
    minRead: 'min de lectura',
    relatedTitle: 'Artículos Relacionados',
    relatedCta: '¿Te ayudamos a implementar esto?',
    relatedCtaDesc: 'Consulta de 30 minutos sin cargo.',
    relatedCtaBtn: 'Hablá con un experto',
  },
  notFound: {
    badge: '404 — Página no encontrada',
    title: 'Esta página ',
    titleHighlight: 'no existe',
    titleSuffix: '',
    desc: 'La URL que buscás no existe, fue movida o nunca estuvo en nuestro radar.',
    ctaHome: 'Volver al Inicio',
    ctaWhatsapp: 'Hablar por WhatsApp',
  },
  privacy: {
    badge: 'Legal',
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: ',
    back: '← Volver al inicio',
  },
};

type UIDict = {
  [Section in keyof typeof es]: {
    [Key in keyof typeof es[Section]]: string;
  };
};

const en: UIDict = {
  nav: {
    home: 'Home',
    solutions: 'Solutions',
    blog: 'Blog',
    portfolio: 'Portfolio',
    stack: 'Stack',
    process: 'Process',
    contact: 'Contact',
    cta: 'Start your Project',
    mobileMenuOpen: 'Open menu',
    mobileMenuClose: 'Close menu',
  },
  footer: {
    tagline: 'Internal software, integrations, and automation for operations with less friction.',
    contact: 'Contact',
    socials: 'Social',
    location: 'Eduardo Castex, La Pampa, Argentina',
    privacy: 'Privacy',
    rights: 'All rights reserved.',
  },
  meta: {
    skipToContent: 'Skip to content',
  },
  blog: {
    badge: 'Blog',
    heroTitle: 'Engineering Blog',
    heroSub: 'Fullstack development, AI automation, architecture, and strategy. No fluff.',
    articles: 'articles',
    reading: 'Reading',
    updated: 'Updated',
    minRead: 'min read',
    relatedTitle: 'Related Articles',
    relatedCta: 'Want help implementing this?',
    relatedCtaDesc: 'A 30-minute no-charge consultation.',
    relatedCtaBtn: 'Talk to an expert',
  },
  notFound: {
    badge: '404 — Page Not Found',
    title: 'This page ',
    titleHighlight: 'does not exist',
    titleSuffix: '',
    desc: 'The URL you\'re looking for doesn\'t exist, was moved, or was never on our radar.',
    ctaHome: 'Back to Home',
    ctaWhatsapp: 'Talk on WhatsApp',
  },
  privacy: {
    badge: 'Legal',
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: ',
    back: '← Back to home',
  },
} as const;

export const ui: Record<Locale, UIDict> = { es, en };

export type { UIDict };

// Hook de traducciones
export function useTranslations(locale: Locale): UIDict {
  return ui[locale];
}
