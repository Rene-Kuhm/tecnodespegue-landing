# TecnoDespegue — Landing + Blog + Templates

Sitio web de **TecnoDespegue** con landing, blog técnico y catálogo de templates (próximamente).

**Stack:** Astro 6 + TypeScript + Tailwind 4 + GSAP + Three.js + Lenis

---

## 🚀 Quick start

```bash
# 1. Instalar dependencias
pnpm install   # o: npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 3. Correr en dev
pnpm dev   # http://localhost:4321

# 4. Build producción
pnpm build

# 5. Pre-deploy check
node scripts/check-deploy.mjs

# 6. Preview local del build
pnpm preview
```

---

## 📁 Estructura

```
.
├── astro.config.mjs          # Config de Astro (output: hybrid para endpoints)
├── vercel.json                # Headers de seguridad + redirects
├── package.json
├── tsconfig.json
├── .env.example               # Variables de entorno (template)
├── public/                     # Assets estáticos (imgs, favicon, robots.txt)
│   ├── og-image.png
│   ├── hero-mockup.webp
│   ├── favicon.svg
│   ├── robots.txt
│   └── ...
├── scripts/
│   └── check-deploy.mjs        # Validación pre-deploy
└── src/
    ├── components/             # Componentes Astro
    │   ├── Nav.astro
    │   ├── Hero.astro
    │   ├── Footer.astro
    │   ├── ContactForm.astro
    │   ├── Newsletter.astro
    │   ├── BlogHero.astro
    │   ├── PostCard.astro
    │   ├── RelatedPosts.astro
    │   ├── TableOfContents.astro
    │   ├── TemplateCard.astro
    │   ├── CompileBadge.astro
    │   ├── CustomCursor.astro
    │   ├── PageTransition.astro
    │   ├── ScrollReveal.astro
    │   ├── Comments.astro
    │   └── Icon.astro
    ├── config/
    │   └── site.config.ts      # Config centralizada (dominio, email, forms, etc)
    ├── content/
    │   ├── posts/              # Blog posts en Markdown
    │   └── templates/           # Templates en Markdown (próximamente)
    ├── content.config.ts        # Schemas de collections
    ├── layouts/
    │   └── Layout.astro         # Layout base (head, meta, structured data)
    ├── pages/
    │   ├── index.astro          # Home
    │   ├── 404.astro            # Not found
    │   ├── privacidad.astro     # Política de privacidad
    │   ├── api/
    │   │   └── og.ts            # OG image generator (Vercel serverless)
    │   ├── blog/
    │   │   ├── index.astro      # Blog index con búsqueda + filtros
    │   │   └── [slug].astro     # Blog post detail
    │   └── templates/
    │       └── index.astro      # Templates (próximamente)
    ├── scripts/
    │   ├── three/               # Three.js helpers
    │   │   ├── particlePortal.ts
    │   │   └── code3D.ts
    │   ├── animations/          # GSAP + Lenis
    │   │   ├── lenis.ts
    │   │   ├── scrollAnimations.ts
    │   │   └── compileReveal.ts
    │   ├── heroScript.ts
    │   └── compileReveal.ts
    ├── styles/
    │   └── global.css           # Sistema de diseño Marvel + tokens CSS
    └── utils/
        └── blog.ts              # Helpers de blog (formatDate, readTime, etc)
```

---

## ⚙️ Configuración

Toda la config del sitio vive en **`src/config/site.config.ts`** con fallbacks a `import.meta.env.*`.

| Variable | Descripción | Default |
|---|---|---|
| `PUBLIC_SITE_URL` | Dominio principal (https) | `https://www.tecnodespegue.com` |
| `PUBLIC_SITE_HOSTNAME` | Hostname para OG / sitemap | `www.tecnodespegue.com` |
| `PUBLIC_CONTACT_EMAIL` | Email de contacto | `renekuhm2@gmail.com` |
| `PUBLIC_CONTACT_PHONE` | Teléfono | `+54-9-2334-409838` |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp sin + ni espacios | `5492334409838` |
| `PUBLIC_FORMSPREE_ENDPOINT` | Formspree URL | `https://formspree.io/f/mojpnepv` |
| `PUBLIC_TIKTOK_PIXEL_ENABLED` | `true` / `false` | `true` |
| `PUBLIC_TIKTOK_PIXEL_ID` | TikTok Pixel ID | `D8AARK3C77U6KT5BPNHG` |
| `PUBLIC_PLAUSIBLE_ENABLED` | `true` / `false` | `true` |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Dominio en Plausible | `www.tecnodespegue.com` |

**En Vercel:** Settings → Environment Variables → agregar las que necesites override.

---

## 🚢 Deploy a Vercel

### Opción 1: GitHub (recomendado)

1. Push a GitHub
2. Vercel → New Project → Import repo
3. Configurar:
   - **Framework Preset:** Astro
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. **Environment Variables** (Settings → Environment Variables):
   - Agregar las variables que quieras overridear (PUBLIC_SITE_URL, PUBLIC_FORMSPREE_ENDPOINT, etc)
5. **Domains** → agregar `tecnodespegue.com` y `www.tecnodespegue.com`
6. **Enforce HTTPS** ✅
7. Deploy automático en cada push

### Opción 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add PUBLIC_SITE_URL production
# ... agregar todas las envs
vercel --prod
```

---

## 🛠️ Features incluidos

### Hero cinemático
- Imagen mockup de monitor (WebP optimizado, 47KB)
- Glassmorphism, gradientes, animaciones GSAP
- Lenis smooth scroll
- Mouse parallax con Three.js

### Blog técnico
- 5 posts (3 originales + 2 nuevos)
- Markdown + MDX
- Búsqueda en vivo con debounce
- Filtros por categoría y tag
- Table of contents con scroll-spy
- Posts relacionados (por tags compartidos)
- Newsletter con Formspree
- RSS feed automático

### Templates (próximamente)
- Catálogo con grid glassmorphism
- Roadmap de 5 templates
- Form de notificación con descuento early-bird
- Search + filtros + sort

### Seguridad
- 0 vulnerabilidades npm audit
- Security headers via `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: HSTS`
  - `Content-Security-Policy` restrictivo
  - `Permissions-Policy` deshabilita camera, geo, etc.

### Performance
- WebP para imagen principal (95% más liviano)
- 0 JS en páginas estáticas
- FCP < 100ms, TTFB < 50ms
- Lighthouse score estimado: 95-100

### OG Images dinámicas
- Endpoint `/api/og?title=...&description=...`
- Genera OG images con `@vercel/og`
- Para usar: en cada post, cambiar `<meta property="og:image" content="/og-image.png" />` por `/api/og?title=<title>&description=<desc>`

### Accesibilidad
- aria-labels en nav
- `prefers-reduced-motion` respetado en todo
- Semantic HTML
- Keyboard navigation

---

## 📝 Comandos

| Comando | Acción |
|---|---|
| `pnpm dev` | Dev server con HMR |
| `pnpm build` | Build producción |
| `pnpm preview` | Preview local del build |
| `pnpm astro` | CLI de Astro |
| `node scripts/check-deploy.mjs` | Pre-deploy check |

---

## 🐛 Troubleshooting

### "Cannot find siteConfig" después de cambiar config
Reiniciá el dev server: `pnpm dev` mata + reinicia.

### OG image no se genera
- Verificá que `PUBLIC_OG_API_ENABLED=true` en Vercel
- El endpoint requiere Node 18+ en Vercel (default)
- Los OG dinámicos solo funcionan en deploy (no en build estático)

### Forms no llegan
- Verificá que `PUBLIC_FORMSPREE_ENDPOINT` apunte a tu ID real
- Andá a https://formspree.io/dashboard para ver los submissions

### TikTok pixel no trackea
- Verificá que `PUBLIC_TIKTOK_PIXEL_ID` sea tu ID real
- En TikTok Ads Manager → Events → Web Events, validá el pixel
- Asegurate de tener `PUBLIC_TIKTOK_PIXEL_ENABLED=true`

### Plausible no muestra datos
- Verificá que `PUBLIC_PLAUSIBLE_DOMAIN` coincida con tu dominio
- En Plausible → Settings → Sites, agregá tu dominio
- Esperá 24h para la primera visita tracked

---

## 📚 Stack detallado

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Astro | 6.x |
| Lenguaje | TypeScript | 5.9 |
| Styling | Tailwind CSS | 4.x |
| Animaciones | GSAP + ScrollTrigger | 3.15 |
| Smooth scroll | Lenis | 1.3 |
| 3D | Three.js | 0.171 |
| OG images | @vercel/og | latest |
| Hosting | Vercel | (recommended) |
| Analytics | Plausible | (privacy-friendly) |
| Pixel | TikTok Pixel | (optional) |
| Forms | Formspree | (transactional emails) |

---

## 📄 Licencia

Código: © 2025 TecnoDespegue · Todos los derechos reservados.
Contenido (blog posts): CC BY-NC 4.0.

---

## 🤝 Soporte

¿Problemas con el deploy? Corre primero:
```bash
node scripts/check-deploy.mjs
```

Y leé el output. Si hay errores, están arriba. Si hay warnings, son opcionales.
