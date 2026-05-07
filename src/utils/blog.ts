/**
 * Format date to Spanish long format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
