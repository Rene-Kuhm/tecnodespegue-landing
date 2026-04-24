# TecnoDespegue Landing

> Landing page profesional para **TecnoDespegue** — agencia de desarrollo fullstack y automatizaciones con IA, basada en Eduardo Castex, La Pampa, Argentina.

[![Astro](https://img.shields.io/badge/Astro-6.1-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-98%2F100-4CAF50?logo=googlechrome&logoColor=white)](https://pagespeed.web.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Rendimiento (PageSpeed Insights — producción)

| Métrica | Resultado |
|---------|-----------|
| **Performance** | 🟢 **98 / 100** |
| First Contentful Paint | **0.9 s** |
| Largest Contentful Paint | **1.8 s** |
| Total Blocking Time | **0 ms** |
| Cumulative Layout Shift | **0** |
| SEO | **100 / 100** |
| Accesibilidad | **100 / 100** |

> Top 1% de sitios web medidos — alcanzado sin CDN de imágenes, sin SSR y sin service workers.

**Técnicas aplicadas:**
- Fuentes auto-hospedadas (`@fontsource-variable`) con `font-display: optional` — sin layout shift
- Preload de WOFF2 latin-only directamente en `<head>`
- CSS mergeado en un único chunk (`cssCodeSplit: false`) con nombre predecible
- Plausible Analytics diferido vía `requestIdleCallback` post-`window.load`
- Animaciones de scroll y cursor via `transform` GPU-composited — sin forced reflow
- `ProgressBar` con `scrollHeight` leído en `requestAnimationFrame`, listeners `passive: true`
- HTML minificado en build (`build.compressHTML: true`)
- Sitemap auto-generado por `@astrojs/sitemap`

---

## Vista previa

**Design System: "The Neon Architect"** — Dark mode editorial con asimetría intencional, profundidad atmosférica y glows digitales.

| Palette | Token |
|---------|-------|
| Electric Cyan | `#c1fffe` / `#00ffff` |
| Neon Green | `#00fd87` / `#00ff88` |
| Background | `#0e0e0e` (the void) |
| Surface | `#1a1919` (elevated cards) |

**Tipografía**: Space Grotesk Variable (headlines) + Inter Variable (body) — auto-hospedadas, sin Google Fonts

---

## Estructura

```
src/
├── components/
│   ├── Hero.astro              # Hero con geometría animada y CTAs
│   ├── TrustSignals.astro      # Métricas clave (proyectos, clientes, respuesta, tecnologías)
│   ├── Services.astro          # 4 servicios (IA, Fullstack, Workflows, Consultoría)
│   ├── Portfolio.astro         # 6 proyectos reales con links a repos y demos
│   ├── Why.astro               # Diferenciadores (foco técnico, código limpio, comunicación)
│   ├── Testimonials.astro      # Casos de éxito reales con métricas
│   ├── Tech.astro              # Tecnologías dominadas
│   ├── CTA.astro               # Call to action + formulario de contacto
│   ├── ContactForm.astro       # Formulario con Formspree + fallback mailto
│   ├── Nav.astro               # Navegación fija con glass effect
│   ├── Footer.astro            # Contacto, redes sociales, ubicación
│   ├── ScrollReveal.astro      # Animaciones al scrollear (Intersection Observer)
│   ├── CustomCursor.astro      # Cursor personalizado desktop (GPU-composited)
│   └── ProgressBar.astro       # Barra de progreso de scroll (passive listeners)
├── layouts/
│   └── Layout.astro            # Layout base con SEO, OG tags, JSON-LD, fonts preload
├── pages/
│   ├── index.astro             # Página principal
│   ├── 404.astro               # Página de error (noindex)
│   └── privacidad.astro        # Política de privacidad (Ley 25.326)
└── styles/
    └── global.css              # Design tokens, @font-face, utilidades, animaciones
```

---

## Stack

| Tecnología | Uso |
|-----------|-----|
| [Astro 6](https://astro.build/) | Framework — static-first, zero JS by default |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos — utility-first con design tokens custom |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estricto |
| [@fontsource-variable](https://fontsource.org/) | Fuentes auto-hospedadas (Space Grotesk + Inter, latin only) |
| [Formspree](https://formspree.io/) | Backend del formulario de contacto |
| [Plausible Analytics](https://plausible.io/) | Analítica sin cookies, servidores UE |
| [Material Symbols](https://fonts.google.com/icons) | Iconografía |

---

## Desarrollo local

**Requisitos**: Node.js >= 22.12.0

```bash
# Clonar
git clone https://github.com/Rene-Kuhm/tecnodespegue-landing.git
cd tecnodespegue-landing

# Instalar dependencias
npm install

# Levantar en desarrollo
npm run dev
# → http://localhost:4321

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## Deploy

### Vercel (recomendado)

```bash
npx vercel --prod
```

Zero config — Vercel detecta Astro automáticamente. HTTPS, CDN global y preview deploys gratis.

### Docker + Nginx (self-hosted)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t tecnodespegue-landing .
docker run -p 80:80 tecnodespegue-landing
```

---

## Secciones

| Sección | Descripción |
|---------|-------------|
| **Hero** | Headline con gradient + geometría animada + CTAs |
| **Trust Signals** | 4 métricas: 15+ proyectos, 3+ clientes, respuesta <24h, 20+ tecnologías |
| **Services** | IA & Automatización, Fullstack, Workflows, Consultoría |
| **Portfolio** | 6 proyectos reales: Aguamarina, E-Commerce, Automation, HydroTemp, Vaulta, CampusMind |
| **Why** | 3 diferenciadores con iconos |
| **Testimonials** | Casos de éxito con métricas reales |
| **Tech** | Stack tecnológico en badges |
| **CTA + Contact** | Formulario Formspree con fallback mailto |
| **Footer** | Email, WhatsApp, 5 redes sociales, ubicación |

---

## Portfolio incluido

| Proyecto | Stack | Tipo | Link |
|----------|-------|------|------|
| [Aguamarina Mosaicos](https://aguamarinamosaicos.com) | Next.js 15, React 19, PostgreSQL, Railway | E-Commerce | 🌐 Producción |
| [E-Commerce Premium](https://github.com/Rene-Kuhm/e-commerce-profecional) | Next.js, React 19, TypeScript, Zod | E-Commerce | GitHub |
| [TecnoDespegue Automation](https://github.com/Rene-Kuhm/tecnodespegue-automation) | Python, OpenClaw, OpenRouter, Postiz | IA & Automatización | GitHub |
| [HydroTemp AIO Driver](https://github.com/Rene-Kuhm/hydrotemp-aio-mac) | Python, USB HID, macOS, LaunchAgent | Hardware & Drivers | GitHub |
| [Vaulta Password Manager](https://github.com/Rene-Kuhm/Gestor-de-Contrase-as) | Flutter, Dart, Material 3, Encryption | Mobile & Desktop | GitHub |
| [CampusMind](https://github.com/Rene-Kuhm/CampusMind-sass) | Next.js 16, NestJS, Turborepo, pgvector, GPT-4o | SaaS & IA | GitHub |

---

## Privacidad y legal

- **[Política de Privacidad](/privacidad)** — conforme a la Ley 25.326 de Argentina y principios del RGPD
- Sin cookies de rastreo — Plausible Analytics procesa datos agregados y anónimos en servidores UE
- Formulario procesado por Formspree (encargado del tratamiento, EE.UU.)
- Alojamiento en Vercel (EE.UU.) — cifrado HTTPS/TLS end-to-end

---

## Contacto

| Canal | Link |
|-------|------|
| Email | renekuhm2@gmail.com |
| WhatsApp | [Chat directo](https://wa.me/5492334409838) |
| GitHub | [@Rene-Kuhm](https://github.com/Rene-Kuhm) |
| Instagram | [@renekuhm](https://instagram.com/renekuhm) |
| TikTok | [@kuhmdev](https://tiktok.com/@kuhmdev) |
| YouTube | [@tecnodespegue](https://youtube.com/@tecnodespegue) |
| LinkedIn | [renekuhm](https://linkedin.com/in/renekuhm) |

---

## Autor

**René Kuhm** — Fullstack Developer & AI Automation Specialist

Eduardo Castex, La Pampa, Argentina

---

## Licencia

MIT © 2026 TecnoDespegue
