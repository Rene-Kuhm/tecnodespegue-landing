---
title: "Por qué Astro es el framework más rápido para landing pages"
description: "98/100 en PageSpeed sin trucos. Análisis técnico de por qué Astro supera a Next.js en sites estáticos y cómo logramos estos números."
date: 2025-05-01
author: "René Kuhm"
category: "Desarrollo"
tags: ["astro", "performance", "seo", "pagespeed", "frontend"]
readTime: 5
featured: true
image: "/og-image.png"
seo:
  title: "Astro vs Next.js: por qué elegimos Astro para landing pages de alto rendimiento"
  description: "Datos técnicos de por qué Astro da 98/100 en PageSpeed. Zero JS by default, islands architecture, y optimizaciones que aplicamos en producción."
---

# Por qué Astro es el framework más rápido para landing pages

Este sitio — el que estás viendo ahora — corre en Astro 6 y marca **98/100 en Performance** en PageSpeed Insights. No usamos CDN de imágenes, no usamos SSR, no usamos service workers.

Esto es lo que aprendimos construyéndolo y por qué lo recomendamos para landing pages de producto.

## El problema con los frameworks modernos

React, Vue, Svelte — todos son excelentes para aplicaciones. Pero cuando el 90% de tu landing page es contenido estático, enviar un runtime de JavaScript de 100KB+ al navegador es **overhead sin valor**.

La mayoría de las landing pages necesitan:

- Texto e imágenes (HTML + CSS puro)
- Un formulario (quizás 5KB de JS)
- Una animación de scroll (CSS transforms)
- Analytics (script diferido)

Next.js envía React + ReactDOM + tu bundle de página. Astro envía **solo lo que necesitás**.

## Zero JS by default

Astro funciona con un principio simple: **si no es interactivo, no envíes JavaScript**.

Un componente Astro puro renderiza a HTML estático. Punto. No hay hidratación, no hayVirtual DOM, no hay reconciliación.

```astro
---
// Este componente se compila a HTML + CSS. Cero JS.
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

Si necesitás interacción, usás **Islands Architecture**:

```astro
<!-- Solo este componente envía JS al navegador -->
<InteractiveForm client:visible />
```

`client:visible` significa: "cargá el JavaScript solo cuando el usuario scroll hasta acá". El resto de la página es estática.

## Comparativa real: Astro vs Next.js

Misma landing page, mismo contenido, mismo CSS:

| Métrica | Astro (este sitio) | Next.js 14 (App Router) |
|---------|-------------------|-------------------------|
| First Contentful Paint | 0.9s | 1.4s |
| Largest Contentful Paint | 1.8s | 2.6s |
| Total Blocking Time | 0 ms | 120 ms |
| JS transferido | 2.1 KB | 128 KB |
| Time to Interactive | 1.2s | 2.9s |
| Lighthouse Performance | 98 | 82 |

Next.js es superior para aplicaciones con estado complejo. Astro gana en sitios contenido-first por diseño.

## Optimizaciones que aplicamos

### 1. Fuentes auto-hospedadas

No cargamos Google Fonts desde su CDN. Usamos `@fontsource-variable` con subset latin-only:

- **Space Grotesk Variable**: headlines, 42KB
- **Inter Variable**: body text, 65KB

Preload directo en `<head>`:

```html
<link rel="preload" href="/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
```

Con `font-display: optional`, el navegador usa la fuente si ya está en caché, o fallback inmediato. **Cero layout shift**.

### 2. CSS mergeado en un único chunk

En `astro.config.mjs`:

```js
build: {
  cssCodeSplit: false,
}
```

Esto genera un único archivo CSS en lugar de chunks por ruta. Para una landing page de una sola página, una request HTTP menos = mejor.

### 3. HTML minificado

```js
build: {
  compressHTML: true,
}
```

Elimina whitespace, comentarios y atributos redundantes. Ahorra ~15% en transfer size.

### 4. Animaciones GPU-composited

Todas las animaciones usan `transform` y `opacity`:

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

No animamos `width`, `height`, `top`, `left`. Eso fuerza recalculo de layout (reflow) y jank en mobile.

### 5. Analytics diferido

Plausible Analytics se carga con `requestIdleCallback` post-`window.load`:

```js
window.addEventListener('load', function () {
  'requestIdleCallback' in window
    ? requestIdleCallback(loadPlausible)
    : setTimeout(loadPlausible, 0);
});
```

Ni siquiera compite con el parseo del HTML crítico.

## Cuándo NO usar Astro

Astro no es la respuesta para todo. No lo uses si:

- Necesitás estado global complejo (usá Next.js + Zustand)
- Tu app es principalmente un dashboard interactivo (React puro o Remix)
- Necesitás SSR con revalidación por request (Next.js ISR)
- Tu equipo solo sabe React y no quiere aprender otro framework

## Content Collections: blogs y docs sin esfuerzo

La feature que más nos convenció de Astro es **Content Collections**:

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

Markdown con frontmatter validado por Zod, typed safety, y SEO automático por post.

Este blog que estás leyendo corre sobre Content Collections. Cero boilerplate para listados, categorías o RSS.

## Conclusión

Para landing pages, portfolios, blogs y documentación, Astro es el framework con mejor ratio de **rendimiento / complejidad** en 2025.

No es que Next.js sea lento. Es que Next.js trae un runtime que no necesitás. Astro te quita la decisión: solo envía JS cuando explícitamente lo pedís.

¿Querés una landing que cargue en menos de 1 segundo? [Hablemos](/#contacto).
