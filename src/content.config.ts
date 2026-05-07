import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().max(100, 'El título no puede exceder 100 caracteres'),
    description: z.string().max(200, 'La descripción no puede exceder 200 caracteres'),
    date: z.coerce.date(),
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

export const collections = { posts };
