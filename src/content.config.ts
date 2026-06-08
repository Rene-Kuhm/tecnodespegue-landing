import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    // Locale del post. Posts en `src/content/posts/*.md` son 'es';
    // posts en `src/content/posts/en/*.md` son 'en'.
    locale: z.enum(['es', 'en']).default('es'),
    title: z.string().max(100, 'El título no puede exceder 100 caracteres'),
    description: z.string().max(200, 'La descripción no puede exceder 200 caracteres'),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('René Kuhm'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    readTime: z.number().positive().optional(),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

const templates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/templates' }),
  schema: z.object({
    title: z.string().max(100),
    subtitle: z.string().max(150).optional(),
    description: z.string().max(300),
    category: z.enum(['landing', 'ecommerce', 'dashboard', 'blog', 'componentes', 'marketing', 'portfolio']),
    stack: z.array(z.string()).default([]), // ['Next.js', 'TypeScript', 'Tailwind']
    price: z.number().positive(), // precio en USD
    compareAtPrice: z.number().positive().optional(), // precio tachado para descuentos
    license: z.enum(['personal', 'commercial', 'extended']).default('personal'),
    featured: z.boolean().default(false),
    publishedAt: z.coerce.date(),
    images: z.array(z.string()).default([]), // previews del template
    cover: z.string().optional(), // imagen principal
    demoUrl: z.string().url().optional(),
    downloadUrl: z.string().optional(), // ruta al ZIP/file (puede ser externa a Stripe/DigitalOcean Spaces)
    features: z.array(z.string()).default([]), // bullets de features
    includes: z.array(z.string()).default([]), // qué viene en el paquete
    requirements: z.array(z.string()).default([]), // requirements (Node 18+, etc)
    version: z.string().default('1.0.0'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { posts, templates };
