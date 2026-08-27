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

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    locale: z.enum(['es', 'en']),
    translationKey: z.string().min(1),
    routeSlug: z.string().min(1),
    title: z.string().max(100),
    eyebrow: z.string().max(80),
    description: z.string().max(240),
    status: z.string().max(80),
    role: z.string().max(120),
    stack: z.array(z.string()).min(1),
    evidence: z.array(z.string()).min(1),
    limitations: z.array(z.string()).min(1),
    repositoryUrl: z.string().url().optional(),
    releaseUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { posts, caseStudies };
