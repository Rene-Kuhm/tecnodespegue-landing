/**
 * RSS feed para el blog en inglés (/en/rss.xml).
 * Genera un feed con todos los posts en EN, ordenados por fecha descendente.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => data.locale === 'en');
  return rss({
    title: 'TecnoDespegue — Engineering Blog',
    description: 'Fullstack development, AI automation, software architecture, and tech strategy. No fluff — just real production experience.',
    site: context.site!,
    items: posts
      .filter(p => !p.data.draft)
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map(post => ({
        title: post.data.title,
        description: post.data.seo?.description ?? post.data.description,
        pubDate: post.data.date,
        link: `/en/blog/${post.id.replace(/^en\//, '')}/`,
        categories: [post.data.category, ...(post.data.tags ?? [])],
        author: post.data.author,
      })),
    customData: '<language>en-US</language>',
  });
}