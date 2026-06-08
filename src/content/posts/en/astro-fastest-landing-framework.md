---
title: "Why Astro is the fastest framework for landing pages"
description: "98/100 on PageSpeed with no tricks. Technical analysis of why Astro beats Next.js on static sites and how we hit those numbers."
date: 2025-05-01
author: "René Kuhm"
category: "Development"
tags: ["astro", "performance", "seo", "pagespeed", "frontend"]
readTime: 5
featured: true
image: "/og-image-en.png"
locale: en
seo:
  title: "Astro vs Next.js: why we chose Astro for high-performance landing pages"
  description: "Technical data on why Astro delivers 98/100 on PageSpeed. Zero JS by default, islands architecture, and optimizations we apply in production."
---

# Why Astro is the fastest framework for landing pages

This site — the one you're looking at right now — runs on Astro 6 and scores **98/100 on Performance** in PageSpeed Insights. We don't use an image CDN, we don't use SSR, we don't use service workers.

This is what we learned building it and why we recommend it for product landing pages.

## The problem with modern frameworks

React, Vue, Svelte — they're all excellent for applications. But when 90% of your landing page is static content, shipping a 100KB+ JavaScript runtime to the browser is **overhead with no value**.

Most landing pages need:

- Text and images (pure HTML + CSS)
- A form (maybe 5KB of JS)
- A scroll animation (CSS transforms)
- Analytics (deferred script)

Next.js ships React + ReactDOM + your page bundle. Astro ships **only what you need**.

## Zero JS by default

Astro works on a simple principle: **if it's not interactive, don't ship JavaScript**.

A pure Astro component renders to static HTML. Period. No hydration, no virtual DOM, no reconciliation.

```astro
---
// This component compiles to HTML + CSS. Zero JS.
const stats = [
  { label: 'Performance', value: '98/100' },
  { label: 'SEO', value: '100/100' },
];
---
<div class="grid grid-cols-2 gap-4">
  {stats.map(stat => (
    <div class="p-4 border rounded">
      <p class="text-2xl font-bold">{stat.value}</p>
      <p class="text-sm text-gray-500">{stat.label}</p>
    </div>
  ))}
</div>
```

If you need interaction, you use **Islands Architecture**:

```astro
<!-- Only this component ships JS to the browser -->
<InteractiveForm client:visible />
```

`client:visible` means: "load the JavaScript only when the user scrolls here." The rest of the page is static.

## Real comparison: Astro vs Next.js

Same landing page, same content, same CSS:

| Metric | Astro (this site) | Next.js 14 (App Router) |
|---------|-------------------|-------------------------|
| First Contentful Paint | 0.9s | 1.4s |
| Largest Contentful Paint | 1.8s | 2.6s |
| Total Blocking Time | 0 ms | 120 ms |
| JS transferred | 2.1 KB | 128 KB |
| Time to Interactive | 1.2s | 2.9s |
| Lighthouse Performance | 98 | 82 |

Next.js is superior for state-heavy applications. Astro wins for content-first sites by design.

## Optimizations we apply

### 1. Self-hosted fonts

We don't load Google Fonts from their CDN. We use `@fontsource-variable` with latin-only subset:

- **Space Grotesk Variable**: headlines, 42KB
- **Inter Variable**: body text, 65KB

Direct preload in `<head>`:

```html
<link rel="preload" href="/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
```

With `font-display: optional`, the browser uses the font if it's already cached, or falls back immediately. **Zero layout shift**.

### 2. CSS merged into a single chunk

In `astro.config.mjs`:

```js
build: {
  cssCodeSplit: false,
}
```

This generates a single CSS file instead of chunks per route. For a single-page landing, one fewer HTTP request = better.

### 3. Minified HTML

```js
build: {
  compressHTML: true,
}
```

Removes whitespace, comments, and redundant attributes. Saves ~15% in transfer size.

### 4. GPU-composited animations

All animations use `transform` and `opacity`:

```css
.scroll-reveal {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease;
}
.scroll-reveal.visible {
  transform: translateY(0);
  opacity: 1;
}
```

We don't animate `width`, `height`, `top`, `left`. That forces layout recalculation (reflow) and jank on mobile.

### 5. Deferred analytics

Plausible Analytics loads with `requestIdleCallback` post-`window.load`:

```js
window.addEventListener('load', function () {
  'requestIdleCallback' in window
    ? requestIdleCallback(loadPlausible)
    : setTimeout(loadPlausible, 0);
});
```

It doesn't even compete with parsing the critical HTML.

## When NOT to use Astro

Astro isn't the answer to everything. Don't use it if:

- You need complex global state (use Next.js + Zustand)
- Your app is primarily an interactive dashboard (pure React or Remix)
- You need SSR with per-request revalidation (Next.js ISR)
- Your team only knows React and doesn't want to learn another framework

## Content Collections: blogs and docs with no effort

The feature that convinced us most about Astro is **Content Collections**:

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});
```

Markdown with Zod-validated frontmatter, typed safety, and automatic SEO per post.

This blog you're reading runs on Content Collections. Zero boilerplate for listings, categories, or RSS.

## Conclusion

For landing pages, portfolios, blogs, and documentation, Astro is the framework with the best **performance / complexity** ratio in 2025.

It's not that Next.js is slow. It's that Next.js brings a runtime you don't need. Astro takes the decision off your hands: it only ships JS when you explicitly ask for it.

Want a landing that loads in under 1 second? [Let's talk](/#contact).