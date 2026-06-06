---
title: "Studio — Portfolio + Servicios para freelancers"
subtitle: "Para devs, designers y consultores"
description: "Portfolio + landing de servicios para freelancers. Showcase de proyectos, pricing de paquetes, booking de calls, testimonials, blog integrado. Hecho para convertir."
category: "portfolio"
stack: ["Astro", "TypeScript", "Tailwind", "Cal.com embed", "Resend"]
price: 69
compareAtPrice: 119
license: "personal"
featured: false
publishedAt: 2025-06-28
images: ["/templates/studio-1.png", "/templates/studio-2.png"]
cover: "/templates/studio-cover.png"
demoUrl: "https://studio-demo.tecnodespegue.com"
downloadUrl: "https://tecnodespegue.gumroad.com/l/studio"
version: "1.1.0"
tags: ["portfolio", "freelancer", "services", "booking", "cal-com", "studio"]
features:
  - "Hero cinemático con portfolio showcase"
  - "Grid de proyectos con filtros (categoría, tecnología)"
  - "Case studies (página detalle con problema → solución → resultado)"
  - "Servicios con pricing de 3 paquetes"
  - "Testimonials con fotos + LinkedIn link"
  - "Sección de proceso (5-7 pasos)"
  - "Booking de calls con Cal.com embed"
  - "Form de contacto con reply-to configurado"
  - "Blog integrado (opcional, usa Inkwell)"
  - "Stack tecnológico con iconos SVG"
  - "Resume / about con timeline"
  - "Sección 'currently working on' / 'open to work'"
  - "Mobile-first responsive"
  - "SEO local (LocalBusiness schema)"
  - "RSS blog feed"
includes:
  - "Astro project con todas las secciones"
  - "3 case studies de ejemplo"
  - "Configuración Cal.com lista"
  - "Email template para Formspree/Resend"
  - "Figma file con todos los componentes"
  - "Tutorial video (35 min)"
requirements:
  - "Node 18+"
  - "Cuenta Cal.com (gratis)"
  - "Cuenta Resend o Formspree"
---

# Studio — Portfolio para freelancers

Portfolio + landing de servicios **hecho para convertir**. Para devs, designers, consultores que quieren mostrar su trabajo, ofrecer paquetes, y captar clientes.

## Lo que incluye

### Hero
- Headline bold + tagline
- CTA primario (book call) + secundario (ver portfolio)
- Status badge ("open to work" / "currently at X")
- Avatar + nombre + rol

### Portfolio showcase
- Grid filtrable (categoría: web, mobile, design, etc)
- Hover preview con imagen ampliada
- Tags de tecnologías
- Link a case study

### Case studies
- Página detalle por proyecto con:
  - Hero con mockup
  - Contexto / problema
  - Solución técnica
  - Resultados (métricas reales)
  - Stack tecnológico
  - Galería de imágenes
  - CTA al siguiente proyecto

### Servicios
- 3 paquetes (Basic / Pro / Premium) con pricing
- Features por paquete
- Tiempo de entrega
- Ideal para quién
- CTA: "Hablemos de tu proyecto"

### Testimonials
- Cards con foto + nombre + empresa + LinkedIn link
- Cita destacada
- Video testimonials (opcional)

### Proceso
- 5-7 pasos con duración
- Iconos SVG custom
- Animación scroll-in

### Booking
- Cal.com embed inline
- Múltiples tipos de meeting (15 min / 30 min / 60 min)
- Timezone detection
- Confirmation + email reminder

### Contacto
- Form con validación
- Reply-to configurado al email real
- Honeypot anti-spam
- Mensaje de éxito animado

### Blog (opcional)
- Si querés escribir, agregás posts en `src/content/posts/`
- Integrado con Inkwell (el template de blog que también vendo)
- O usás cualquier CMS externo (Contentful, Sanity, Notion)

### About / Resume
- Timeline de experiencia
- Stack tecnológico con iconos
- "Available for" badges
- Link a LinkedIn, GitHub, Twitter, etc

## Ideal para

- Freelancers que quieren un portfolio profesional sin pagar $3K a un diseñador
- Devs / designers / consultores
- Agencias pequeñas (1-3 personas)
- Coaches / consultores
- Cualquiera que venda servicios intangibles

## Por qué Astro y no WordPress

| | Studio (Astro) | WordPress | Webflow |
|---|---|---|---|
| Costo mensual | $0 (estático) | $25+ | $16+ |
| Velocidad | 0.5s LCP | 3-5s | 2-3s |
| Customización | 100% código | Limitada | Visual only |
| SEO | Excelente | Regular | OK |
| Mantenimiento | 0 | Updates + plugins | Bajo |

**Astro wins para portfolios.** Más rápido, más barato, más fácil de mantener.

## Setup

```bash
pnpm install
# Configurar Cal.com URL, Formspree, Resend
pnpm dev
```

**~15 min** si ya tenés tus proyectos, fotos y copy listos.

---

*Personal license: 1 freelancer. Para usar como agencia con múltiples clientes: contactanos por extended license.*
