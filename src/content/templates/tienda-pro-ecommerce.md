---
title: "TiendaNube Pro — E-commerce full-stack"
subtitle: "Headless commerce con Stripe, panel admin, multi-idioma"
description: "E-commerce completo con Next.js 15, Stripe, panel admin, multi-idioma, dark mode y SSR. Catálogo, carrito, checkout, webhooks, emails transaccionales."
category: "ecommerce"
stack: ["Next.js 15", "TypeScript", "Tailwind", "Stripe", "Prisma", "PostgreSQL", "Resend"]
price: 199
compareAtPrice: 349
license: "commercial"
featured: true
publishedAt: 2025-06-20
images: ["/templates/tienda-1.png", "/templates/tienda-2.png", "/templates/tienda-3.png"]
cover: "/templates/tienda-cover.png"
demoUrl: "https://tienda-demo.tecnodespegue.com"
downloadUrl: "https://tecnodespegue.gumroad.com/l/tienda-pro"
version: "3.0.0"
tags: ["ecommerce", "stripe", "nextjs", "multi-idioma", "ssr", "headless"]
features:
  - "Catálogo con búsqueda + filtros + sort"
  - "Carrito persistente (localStorage + DB)"
  - "Checkout con Stripe (3D Secure listo)"
  - "Webhooks de Stripe: payment, refund, subscription"
  - "Panel admin: productos, órdenes, clientes, analytics"
  - "Multi-idioma (es, en, pt) con i18n"
  - "Multi-moneda (USD, EUR, ARS, MXN, BRL)"
  - "Wishlist + comparador"
  - "Reviews + ratings"
  - "Emails transaccionales (Resend + React Email)"
  - "Cupones + descuentos"
  - "Inventario en tiempo real con alertas"
  - "SEO completo (sitemap, structured data, OG)"
  - "Analytics: GA4 + Plausible ready"
includes:
  - "Next.js 15 app con App Router + RSC"
  - "Schema Prisma completo (Product, Order, User, Review, Coupon, etc)"
  - "Stripe integration completa + webhooks"
  - "Panel admin con auth protegida"
  - "Sistema multi-idioma (3 idiomas listos)"
  - "Templates de email (orden, envío, refund)"
  - "Seed con 50 productos de demo"
  - "Tests con Vitest + Playwright"
  - "CI/CD con GitHub Actions"
  - "Deploy guides (Vercel + Railway + Supabase)"
requirements:
  - "Node.js 18+"
  - "PostgreSQL 14+"
  - "Cuenta Stripe (test mode incluido)"
  - "Cuenta Resend (gratis hasta 100 emails/día)"
---

# TiendaNube Pro — E-commerce full-stack

E-commerce completo, listo para vender. **Catálogo, carrito, Stripe, panel admin, multi-idioma, multi-moneda** — todo lo que necesitás para lanzar una tienda online sin reinventar la rueda.

## Features

### Customer-facing
- **Homepage** con hero, featured products, categorías, testimonios, newsletter
- **Catálogo** con búsqueda full-text, filtros (categoría, precio, rating, atributos), sort
- **PDP** (página de producto) con gallery, variants (talle, color), reviews, related products
- **Carrito** persistente (localStorage + server-side si está logueado)
- **Checkout** con Stripe Elements, address autocomplete, guest checkout
- **Account** con órdenes, wishlist, addresses, métodos de pago guardados
- **Wishlist** + compartir por email
- **Reviews** con fotos, verificación de compra, moderación

### Admin panel
- Dashboard con KPIs (revenue, AOV, conversion, top products)
- **Productos**: CRUD, variants, imágenes múltiples, inventario
- **Órdenes**: gestión de fulfillment, status tracking, emails
- **Clientes**: lista, segmentación, lifetime value
- **Cupones**: percentage, fixed, free shipping, BOGO, restricciones
- **Analytics**: charts de ventas, cohort analysis, top products
- **Settings**: store config, shipping zones, taxes, integrations

### Multi-idioma + multi-moneda
- 3 idiomas listos (es, en, pt) — agregás más con 1 línea
- 5 monedas (USD, EUR, ARS, MXN, BRL) con auto-detección por IP
- URLs localizadas (`/es/products/...`)
- Currency switcher

### Stripe integration
- Payment Intents + 3D Secure
- Apple Pay / Google Pay
- Subscriptions (para productos de suscripción)
- Webhooks firmados: `payment_intent.succeeded`, `charge.refunded`, `customer.subscription.*`
- Tax calculation automática

### Emails transaccionales
- Confirmación de orden
- Shipping notification
- Refund processed
- Abandoned cart recovery
- Welcome series

Todos con React Email + Resend. Templates editables, dark mode.

## Stack

- **Next.js 15** App Router + RSC
- **TypeScript** estricto
- **Prisma** + **PostgreSQL**
- **Stripe** + **Stripe Elements**
- **Resend** + **React Email**
- **Tailwind 4**
- **shadcn/ui**

## Ideal para

- Marcas que quieren vender online rápido
- Estudios que arman tiendas para clientes
- Productos físicos o digitales
- Modelos de suscripción
- Tiendas B2C con catálogo de 50-5000 SKUs

## Demo

**[tienda-demo.tecnodespegue.com](https://tienda-demo.tecnodespegue.com)** — tiene 50 productos seed, podés probar el flujo completo de compra con Stripe test mode.

## Setup

```bash
pnpm install
cp .env.example .env
# Configurar DATABASE_URL, STRIPE_*, RESEND_*
pnpm prisma migrate dev
pnpm seed
pnpm dev
```

**~10 min** de setup si ya tenés Postgres y Stripe configurados.

## Por qué este precio

Hicimos 8 e-commerce en producción para clientes reales. **Este template tiene todas las decisiones arquitectónicas que aprendimos en el camino** — la estructura de la DB, los webhooks que importan, los emails que convierten, los flujos de fulfillment que no se rompen.

Es el equivalente a comprar 3 meses de experiencia empaquetada.

---

*MIT-style commercial license · Soporte por email 6 meses · Updates gratis de por vida*
