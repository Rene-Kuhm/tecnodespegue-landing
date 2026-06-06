---
title: "Inkwell — Blog con content collection"
subtitle: "Markdown + MDX + SEO + RSS + i18n"
description: "Blog estático con Astro content collections, MDX, syntax highlighting, TOC, dark mode, RSS feed, sitemap automático y búsqueda. Performance obsesiva."
category: "blog"
stack: ["Astro", "MDX", "TypeScript", "Tailwind", "Pagefind", "Shiki"]
price: 49
compareAtPrice: 89
license: "personal"
featured: false
publishedAt: 2025-06-22
images: ["/templates/inkwell-1.png", "/templates/inkwell-2.png"]
cover: "/templates/inkwell-cover.png"
demoUrl: "https://inkwell-demo.tecnodespegue.com"
downloadUrl: "https://tecnodespegue.gumroad.com/l/inkwell"
version: "1.2.0"
tags: ["blog", "mdx", "seo", "rss", "i18n", "pagefind", "search"]
features:
  - "Content collections con TypeScript schemas"
  - "MDX (Markdown + JSX en posts)"
  - "Syntax highlighting con Shiki (build-time, zero runtime)"
  - "Table of contents con scroll-spy"
  - "Búsqueda full-text con Pagefind (build-time, sin runtime JS)"
  - "RSS + Atom + JSON feeds automáticos"
  - "Sitemap + structured data (BlogPosting, Person, Organization)"
  - "Tags + categorías con páginas dedicadas"
  - "Newsletter con Formspree, ConvertKit, Buttondown"
  - "Comments con Giscus (GitHub Discussions)"
  - "Reading time automático"
  - "Tabla de contenidos + scroll-spy"
  - "Multi-idioma (es, en, pt) con i18n routing"
  - "Dark mode + light mode con transición"
  - "OG images dinámicas con @vercel/og"
  - "Performance: 100/100 Lighthouse"
includes:
  - "Astro project con content collections"
  - "5 posts de ejemplo en MDX"
  - "3 page templates (index, post, tag)"
  - "Search UI con Pagefind"
  - "RSS + sitemap automático"
  - "i18n con 3 idiomas (es, en, pt)"
  - "Giscus comments setup"
  - "Newsletter integration"
  - "OG image generator"
requirements:
  - "Node.js 18+"
  - "Sin base de datos (es 100% estático)"
---

# Inkwell — Blog con content collection

Blog estático ultra-rápido con todo lo que un blog técnico necesita. **MDX, syntax highlighting, búsqueda, RSS, sitemap, i18n** — sin runtime JS, todo build-time.

## Lo que hace diferente

**0KB de JavaScript en el cliente.** Todo se renderiza en build-time, así que la página es HTML + CSS puro. El resultado: **Lighthouse 100/100** out of the box.

## Features

### Markdown + MDX
- `.md` para posts simples
- `.mdx` para posts con JSX embebido (componentes custom, demos interactivas)
- Frontmatter con TypeScript schemas validados
- Hooks de validación en build (no llega nada roto a producción)

### Syntax highlighting
- Shiki en build-time (zero runtime JS)
- Soporte para 200+ lenguajes
- Temas light + dark automáticos
- Code blocks con numeración, copy button, line highlight

### Búsqueda
- **Pagefind** — genera el índice en build-time
- Búsqueda full-text sin servidor
- Highlight de matches
- Funciona 100% offline (caché)

### SEO
- Sitemap automático
- RSS + Atom + JSON feeds
- Structured data (BlogPosting, BreadcrumbList, Person)
- OG images generadas dinámicamente
- Canonical URLs
- Meta tags Open Graph + Twitter Cards

### Contenido
- Table of contents con scroll-spy
- Reading time automático
- Related posts (por tags compartidos)
- Tags + categorías con páginas dedicadas
- Pagination con infinite scroll opcional
- Posts en borrador (no se publican hasta que los quites del draft)

### Comunidad
- Comments con Giscus (usa GitHub Discussions, es gratis)
- Newsletter con Formspree, ConvertKit, Buttondown, Resend
- Share buttons (X, LinkedIn, copy link)

### i18n
- Multi-idioma con routing
- 3 idiomas listos (es, en, pt)
- URLs localizadas (`/es/blog/post-slug`)
- Language switcher

## Ideal para

- Blogs técnicos / dev blogs
- Documentación pública
- Newsletters
- Portfolios con sección de writing
- Knowledge bases
- Tutoriales largos

## Demo

**[inkwell-demo.tecnodespegue.com](https://inkwell-demo.tecnodespegue.com)** — tiene 5 posts de ejemplo con MDX, syntax highlighting, TOC, comments, búsqueda.

## Setup

```bash
pnpm install
pnpm new-post --title="Mi primer post" --tags="astro,mdx"
pnpm dev  # localhost:4321
```

**~2 min** de setup.

## Stack

- **Astro 6** (output estático)
- **MDX** (markdown + JSX)
- **TypeScript** (schemas validados)
- **Tailwind 4**
- **Shiki** (syntax highlighting build-time)
- **Pagefind** (búsqueda build-time)

## Por qué no Next.js, Hugo, etc.

Comparamos con las alternativas:

| | Astro Inkwell | Hugo | Next.js blog | Gatsby |
|---|---|---|---|---|
| JS bundle | 0 KB | 0 KB | 80-200KB | 150KB+ |
| Build time (100 posts) | 8s | 2s | 25s | 45s |
| MDX support | Nativo | Limitado | Con plugin | Con plugin |
| Search | Pagefind | Lunr | Algolia (pago) | FlexSearch |
| Hosting | Gratis (estático) | Gratis | $$ | $$ |

Astro gana en flexibilidad (componentes React/Vue/Svelte si los necesitás) sin sacrificar el bundle de 0KB.

---

*Personal license (1 proyecto). Para usar en múltiples proyectos / clientes: contactanos por la extended license.*
