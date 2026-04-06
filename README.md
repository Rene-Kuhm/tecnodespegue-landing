# TecnoDespegue Landing

> Landing page profesional para **TecnoDespegue** — agencia de desarrollo fullstack y automatizaciones con IA, basada en Eduardo Castilla, La Pampa, Argentina.

[![Astro](https://img.shields.io/badge/Astro-6.1-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Vista previa

**Design System: "The Neon Architect"** — Dark mode editorial con asimetría intencional, profundidad atmosférica y glows digitales.

| Palette | Token |
|---------|-------|
| Electric Cyan | `#c1fffe` / `#00ffff` |
| Neon Green | `#00fd87` / `#00ff88` |
| Background | `#0e0e0e` (the void) |
| Surface | `#1a1919` (elevated cards) |

**Tipografía**: Space Grotesk (headlines) + Inter (body)

---

## Estructura

```
src/
├── components/
│   ├── Hero.astro              # Hero con geometría animada y CTAs
│   ├── TrustSignals.astro      # Métricas clave (proyectos, uptime, respuesta)
│   ├── Services.astro          # 4 servicios (IA, Fullstack, Workflows, Consultoría)
│   ├── Portfolio.astro         # 5 proyectos reales con links a repos y demos
│   ├── Why.astro               # Diferenciadores (foco técnico, código limpio, comunicación)
│   ├── Testimonials.astro      # 3 casos de éxito reales con métricas
│   ├── Tech.astro              # 16 tecnologías dominadas
│   ├── CTA.astro               # Call to action + formulario de contacto
│   ├── ContactForm.astro       # Formulario con Formspree + fallback mailto
│   ├── Nav.astro               # Navegación fija con glass effect
│   ├── Footer.astro            # Contacto, redes sociales, ubicación
│   ├── ScrollReveal.astro      # Animaciones al scrollear (Intersection Observer)
│   ├── CustomCursor.astro      # Cursor personalizado desktop
│   └── ProgressBar.astro       # Barra de progreso de scroll
├── layouts/
│   └── Layout.astro            # Layout base con SEO, OG tags, fonts
├── pages/
│   └── index.astro             # Página principal
└── styles/
    └── global.css              # Design tokens, utilidades, animaciones
```

---

## Stack

| Tecnología | Uso |
|-----------|-----|
| [Astro 6](https://astro.build/) | Framework — static-first, zero JS by default |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos — utility-first con design tokens custom |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estricto |
| [Formspree](https://formspree.io/) | Backend del formulario de contacto |
| [Google Fonts](https://fonts.google.com/) | Space Grotesk + Inter |
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
| **Trust Signals** | 4 métricas: proyectos, uptime, respuesta, tecnologías |
| **Services** | IA & Automatización, Fullstack, Workflows, Consultoría |
| **Portfolio** | 5 proyectos reales: Aguamarina, E-Commerce, Automation, HydroTemp, Vaulta |
| **Why** | 3 diferenciadores con iconos |
| **Testimonials** | 3 casos de éxito con métricas reales |
| **Tech** | 16 tecnologías en badges |
| **CTA + Contact** | Formulario Formspree con fallback mailto |
| **Footer** | Email, WhatsApp, 5 redes sociales, ubicación |

---

## Portfolio incluido

| Proyecto | Stack | Tipo |
|----------|-------|------|
| [Aguamarina Mosaicos](https://acuamarina-ceramica.vercel.app) | Next.js 15, React 19, PostgreSQL, Railway | E-Commerce |
| [E-Commerce Premium](https://github.com/Rene-Kuhm/e-commerce-profecional) | Next.js, React 19, TypeScript, Zod | E-Commerce |
| [TecnoDespegue Automation](https://github.com/Rene-Kuhm/tecnodespegue-automation) | Python, OpenClaw, GPT-5, Postiz | IA & Automatización |
| [HydroTemp AIO Driver](https://github.com/Rene-Kuhm/hydrotemp-aio-mac) | Python, USB HID, macOS | Hardware |
| [Vaulta Password Manager](https://github.com/Rene-Kuhm/Gestor-de-Contrase-as) | Flutter, Dart, Material 3 | Mobile & Desktop |

---

## Rendimiento

- **0 JS** enviado al cliente por default (Astro islands)
- **Fonts preconnect** para evitar layout shift
- **OG Image** optimizada (1200x630, 60KB)
- **Scroll animations** con Intersection Observer nativo (no librerías)
- **Static output** — HTML puro, deploy en cualquier CDN

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

Eduardo Castilla, La Pampa, Argentina

---

## Licencia

MIT © 2026 TecnoDespegue
