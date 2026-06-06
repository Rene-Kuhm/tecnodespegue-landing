---
title: "Forge — Dashboard analytics con IA"
subtitle: "Admin dashboard con auth, charts, y reportes AI"
description: "Dashboard admin completo con autenticación, charts interactivos, reportes generados por IA, dark mode y real-time updates. Next.js 15 + TypeScript."
category: "dashboard"
stack: ["Next.js 15", "TypeScript", "Tailwind", "shadcn/ui", "Recharts", "OpenAI", "Prisma"]
price: 149
compareAtPrice: 249
license: "commercial"
featured: true
publishedAt: 2025-06-18
images: ["/templates/forge-1.png", "/templates/forge-2.png", "/templates/forge-3.png"]
cover: "/templates/forge-cover.png"
demoUrl: "https://forge-demo.tecnodespegue.com"
downloadUrl: "https://tecnodespegue.gumroad.com/l/forge"
version: "1.4.0"
tags: ["dashboard", "analytics", "auth", "charts", "ia", "nextjs", "shadcn"]
features:
  - "Auth con NextAuth (email + OAuth Google/GitHub)"
  - "10+ charts interactivos con Recharts"
  - "Reportes generados por IA con streaming"
  - "Real-time updates con Server-Sent Events"
  - "Tabla con búsqueda, filtros, sort, paginación"
  - "Exportar a CSV / PDF / Google Sheets"
  - "Multi-tenant con row-level security"
  - "Dark mode + light mode con persistencia"
  - "Audit log de todas las acciones"
  - "API REST + webhooks"
includes:
  - "Next.js 15 app con App Router"
  - "Schema Prisma completo (User, Org, Project, etc)"
  - "30+ componentes shadcn/ui customizados"
  - "Sistema de auth + middleware"
  - "API routes con examples"
  - "Seed data realista"
  - "Storybook con todos los componentes"
  - "Tests con Vitest"
requirements:
  - "Node.js 18+"
  - "PostgreSQL 14+"
  - "Cuenta OpenAI (opcional, modo mock incluido)"
---

# Forge — Dashboard analytics

Dashboard admin completo, listo para producción. **Auth, charts, IA, real-time, multi-tenant** — todo lo que necesitás para empezar un producto SaaS sin escribir 3 meses de boilerplate.

## Qué viene incluido

### Autenticación robusta
- Email + password con hash Argon2
- OAuth con Google y GitHub
- Magic links
- 2FA con TOTP (Google Authenticator compatible)
- Sesiones con refresh tokens rotativos
- Middleware de protección de rutas server-side

### Charts y visualizaciones
- Line, bar, area, pie, scatter, heatmap, candlestick
- 10+ tipos pre-armados, copy-paste ready
- Animaciones suaves entre estados
- Tooltips con drill-down
- Exportar a CSV, PDF, PNG

### Reportes con IA
- Generación de insights automáticos ("esta semana, los ingresos subieron 23% por...")
- Streaming de texto (SSE) — el usuario ve el reporte escribirse en vivo
- Configurable: tono, longitud, fuentes de datos
- Modo mock (sin gastar tokens de OpenAI)

### Real-time
- Server-Sent Events para updates sin polling
- Indicador de "live" en el header
- Reconnect automático
- Throttling client-side

### Tabla de datos
- Búsqueda full-text
- Filtros múltiples (chips, date range, multi-select)
- Sort por cualquier columna
- Paginación con infinite scroll
- Bulk actions (export, delete, archive)
- Row selection

### Multi-tenant
- Row-level security en Prisma
- Switch de organización en el header
- Permisos por rol (Owner, Admin, Member, Guest)
- Audit log de quién hizo qué y cuándo

## Stack

- **Next.js 15** App Router
- **TypeScript** estricto
- **Tailwind 4**
- **shadcn/ui** (Radix + Tailwind, totalmente customizable)
- **Recharts** para charts
- **Prisma** ORM
- **NextAuth v5**
- **OpenAI GPT-4o-mini** (con modo mock)

## Ideal para

- Productos SaaS B2B con dashboard interno
- Equipos que necesitan empezar sin escribir todo el boilerplate
- Proyectos con clientes que necesitan ver analytics
- Productos con plan Free + Paid (Stripe-ready)

## Demo

**[forge-demo.tecnodespegue.com](https://forge-demo.tecnodespegue.com)** — usuario: `demo@tecnodespegue.com` / pass: `demo1234`

## Setup rápido

```bash
git clone tu-fork
pnpm install
cp .env.example .env
# Configurar DATABASE_URL + OPENAI_API_KEY (opcional)
pnpm prisma migrate dev
pnpm seed
pnpm dev
```

Tarda ~5 min tener todo corriendo.

---

*Mantenido por TecnoDespegue · MIT-style commercial license · Soporte por 6 meses incluido*
