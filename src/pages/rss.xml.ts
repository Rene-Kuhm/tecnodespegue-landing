/**
 * RSS feed para el blog en español (/rss.xml).
 * Genera un feed con todos los posts en ES, ordenados por fecha descendente.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => (data.locale ?? 'es') === 'es');
  return rss({
    title: 'TecnoDespegue — Blog de Ingeniería',
    description: 'Desarrollo fullstack, automatizaciones con IA, arquitectura de software y estrategia tecnológica. Sin humo, solo experiencia real.',
    site: context.site!,
    items: posts
      .filter(p => !p.data.draft)
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map(post => ({
        title: post.data.title,
        description: post.data.seo?.description ?? post.data.description,
        pubDate: post.data.date,
        link: `/blog/${post.id}/`,
        categories: [post.data.category, ...(post.data.tags ?? [])],
        author: post.data.author,
      })),
    customData: '<language>es-AR</language>',
  });
}