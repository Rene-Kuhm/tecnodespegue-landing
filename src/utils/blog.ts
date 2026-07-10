/**
 * Format date to localized long format
 */
export function formatDate(date: Date | string, locale = 'es-AR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // Frontmatter publication dates are date-only values. UTC prevents the
    // previous calendar day from appearing in negative-offset time zones.
    timeZone: 'UTC',
  }).format(d);
}

/**
 * Calculate reading time in minutes from markdown content
 * Default: 200 words per minute
 */
export function calculateReadTime(content: string, wpm = 200): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Get unique categories from posts
 */
export function getCategories(posts: { data: { category: string } }[]): string[] {
  return [...new Set(posts.map(p => p.data.category))].sort();
}

/**
 * Get all unique tags from posts, sorted by frequency
 */
export function getTopTags(posts: { data: { tags?: string[] } }[], limit = 10): string[] {
  const counts = new Map<string, number>();
  posts.forEach(p => {
    (p.data.tags ?? []).forEach(tag => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Cover image for blog cards and article heroes.
 * Generic social images are replaced with a per-post OG render so every article
 * gets its own visual identity without storing duplicated bitmap assets.
 */
export function getPostCoverImage(post: {
  data: {
    title: string;
    description: string;
    category: string;
    author?: string;
    image?: string;
    seo?: { image?: string };
  };
}, variant: 'cover' | 'social' = 'cover'): string {
  const explicit = post.data.seo?.image ?? post.data.image;
  if (explicit && !/\/og-image(?:-en)?\.png$/.test(explicit)) return explicit;

  const params = new URLSearchParams({
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    author: post.data.author ?? 'René Kuhm',
    variant,
    v: '4',
  });

  return `/api/og?${params.toString()}`;
}
