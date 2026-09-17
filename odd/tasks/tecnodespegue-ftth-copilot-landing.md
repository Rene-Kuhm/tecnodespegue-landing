# ODD · Tecnodespegue · Landing FTTH-Copilot

**Feature:** `tecnodespegue-ftth-copilot-landing`
**Mirror Engram:** `odd/tecnodespegue-ftth-copilot-landing/tasks`
**Repo:** `/home/tecnodespegue/tecnodespegue-landing`
**Branch (a crear):** `feat/ftth-copilot-landing`
**Status:** 🟡 En planificación · T1–T6

---

## Objective

Incorporar FTTH-Copilot dentro de TecnoDespegue con su propia landing dedicada bilingüe en `/ftth-copilot` y `/en/ftth-copilot`, manteniendo intactos Portfolio, Nav y la home. Esta es la **Fase 1** del brief aprobado: se evalúan las próximas fases (Portfolio destacado, link en Nav, CTA adicional en home) después de feedback real.

## Problem / Why

El landing actual presenta a TecnoDespegue alrededor de software a medida, automatización, IA e ingeniería. FTTH-Copilot encaja perfectamente pero tiene suficiente entidad propia para merecer una landing dedicada, no una tarjeta más del Portfolio. La idea: `tecnodespegue.com` = marca general, `tecnodespegue.com/ftth-copilot` = producto dedicado.

## Scope (in / out)

**In (esta fase):**
- Nueva ruta `/ftth-copilot` (ES) con su landing completa
- Nueva ruta `/en/ftth-copilot` (EN) como espejo bilingüe
- Hero con kicker + headline + lead + CTAs
- Diagrama visual del flujo: OLT/NMS → Telemetría → Organic Diagnostic Router → TruthGate → Diagnóstico → Incidente/Alerta
- Sección de 3 modos de operación: DIRECT, ASSISTED, INVESTIGATION
- Sección de capacidades (12 fabricantes OLT, SmartOLT/Mikrowisp/MikroTik, NOC/AIOps, SOC, predicción óptica, incidentes, alertas, Prometheus/Grafana/Phoenix, seguridad multi-tenant)
- CTA final "Buscamos ISPs para validación técnica" (no "Descargar FTTH-Copilot")
- `hreflang` alternates y `canonical` correctos
- Mobile-first, performance-conscious (mantener ≥98 mobile / 99 desktop)
- Reutilizar componentes existentes cuando sea posible: `Icon`, `GlowOrbs`, `Footer`, `Nav` (sin tocar)

**Out (fases futuras):**
- Modificación del Portfolio (agregar FTTH-Copilot destacado)
- Link en el Nav principal a `/ftth-copilot`
- CTA adicional en la home
- OG image específica para `/ftth-copilot` (usar genérica por ahora)

## Constraints

- **Bilingüe ES/EN obligatorio** — el sitio entero lo es; mantener consistencia.
- **Performance ≥98 mobile / 99 desktop** — no meter Three.js pesado, animaciones pesadas, ni imágenes no optimizadas.
- **Patrón Marvel ya establecido** — usar `kicker` rojo/dorado, glassmorphism, scan lines, gradientes del sitio. No inventar nueva dirección visual.
- **Reutilizar Layout, Nav, Footer, Icon, GlowOrbs** — sin reinventar.
- **Conventional commits**, sin Co-Authored-By ni AI attribution.
- **PR chico** — idealmente <400 líneas (regla del repo).

## Architectural Decisions

1. **No usar el `Hero.astro` global** — es muy pesado (Three.js + GSAP) para una landing de marketing. Hacer un hero propio, mobile-first, accesible, con animaciones sutiles (CSS + prefers-reduced-motion).
2. **Diagrama como SVG inline** — más liviano que imágenes raster, accesible (texto alt), estilable con CSS, animable con CSS keyframes.
3. **Componentes separados** vs páginas largas — los modos (DIRECT/ASSISTED/INVESTIGATION) y las capacidades se van a reutilizar conceptualmente; mejor componentes aunque solo se usen 2 veces (una por locale).
4. **Textos en cada página (no centralizados en `ui.ts`)** — siguen el patrón de `Portfolio.astro` y `CaseStudyPage.astro`, donde el copy bilingüe está embebido en el componente. Esto evita inflar `ui.ts` con strings específicos de FTTH-Copilot.
5. **CSS Modules-style scoping** — cada componente tiene su `<style>` al final (patrón existente).

## File Layout (a crear)

```
src/
├── pages/
│   ├── ftth-copilot.astro           (ES — landing)
│   └── en/
│       └── ftth-copilot.astro       (EN — landing espejo)
└── components/
    └── ftth-copilot/
        ├── FtthCopilotFlow.astro         (diagrama SVG del flujo)
        ├── FtthCopilotModes.astro        (cards DIRECT/ASSISTED/INVESTIGATION)
        ├── FtthCopilotCapabilities.astro  (grid de capacidades)
        └── FtthCopilotValidation.astro    (CTA "Buscamos ISPs")
```

## Tasks

### T1 · Setup ODD doc + Engram mirror
- [x] Crear `odd/tasks/tecnodespegue-ftth-copilot-landing.md` ✅
- [x] Crear rama `feat/ftth-copilot-landing` desde `main` actualizado ✅
- [x] Guardar mirror en Engram con topic key `odd/tecnodespegue-ftth-copilot-landing/tasks` (id 1131, project `tecnodespegue-landing`) ✅
- [x] **Verificación:** `git branch --show-current` muestra `feat/ftth-copilot-landing`, mirror en Engram responde OK. ✅

### T2 · Componentes reutilizables
- [x] Crear `src/components/ftth-copilot/FtthCopilotFlow.astro` (226 líneas, SVG inline del flujo, animado desktop, accesible, prefers-reduced-motion). ✅
- [x] Crear `src/components/ftth-copilot/FtthCopilotModes.astro` (259 líneas, 3 cards DIRECT/ASSISTED/INVESTIGATION). ✅
- [x] Crear `src/components/ftth-copilot/FtthCopilotCapabilities.astro` (240 líneas, grid de 9 capacidades). ✅
- [x] Crear `src/components/ftth-copilot/FtthCopilotValidation.astro` (186 líneas, CTA "Buscamos ISPs"). ✅
- [x] **Verificación:** `npx astro check` PASS, `npm run build` PASS, 911 líneas totales. ✅
- **Decisión registrada:** iconos Lucide no existentes en `Icon.astro` dictionary (`cable`, `router`, etc.) se reemplazaron por alternativas semánticas del dictionary actual (`layers`, `bolt`, etc.). Si se quieren los iconos originales, va como follow-up PR pequeño.

### T3 · Crear página ES `/ftth-copilot`
- [x] Crear `src/pages/ftth-copilot.astro` que importe Layout, Nav, Footer y los 4 componentes creados en T2 (301 líneas). ✅
- [x] Hero propio con: kicker "FTTH-COPILOT · PLATAFORMA NOC/SOC", headline "Tu red FTTH genera datos. / FTTH-Copilot los convierte en decisiones.", subtítulo, CTAs "Solicitar prueba técnica" / "Ver arquitectura" / "GitHub". ✅
- [x] Pasar `locale="es"`, `alternatePaths={{ es: '/ftth-copilot', en: '/en/ftth-copilot' }}`, `path="/ftth-copilot"` al Layout. ✅
- [x] Title SEO: "FTTH-Copilot | Plataforma NOC/SOC para ISPs FTTH | TecnoDespegue". ✅
- [x] Description SEO: "Plataforma NOC/SOC para ISPs que correlaciona telemetría, eventos, topología e IA para diagnosticar, anticipar e investigar incidentes con evidencia verificable." ✅
- [x] **Verificación:** `npm run build` compila, página aparece en `dist/client/ftth-copilot/index.html`. ✅

### T4 · Crear página EN `/en/ftth-copilot`
- [x] Crear `src/pages/en/ftth-copilot.astro` como espejo de T3 con copy traducido (299 líneas). ✅
- [x] Hero: kicker "FTTH-COPILOT · NOC/SOC PLATFORM", headline "Your FTTH network generates data. / FTTH-Copilot turns it into decisions.", CTAs "Request technical trial" / "View architecture" / "GitHub". ✅
- [x] Pasar `locale="en"`, `alternatePaths={{ es: '/ftth-copilot', en: '/en/ftth-copilot' }}`, `path="/en/ftth-copilot"`. ✅
- [x] Title SEO: "FTTH-Copilot | NOC/SOC Platform for FTTH ISPs | TecnoDespegue". ✅
- [x] **Verificación:** `npm run build` compila, página aparece en `dist/client/en/ftth-copilot/index.html`. ✅

### T5 · Build + verify
- [x] `npm run build` sin errores ni warnings nuevos en los archivos nuevos. ✅
- [x] `npx astro check` → 0 errors, 0 warnings (1 hint `ts(6133)` por import de Icon no usado — info-level, no bloqueante). ✅
- [x] `npm run preview` levanta correctamente y ambas rutas (`/ftth-copilot`, `/en/ftth-copilot`) responden HTTP 200. ✅
- [x] Headers de seguridad presentes: CSP, X-Frame-Options, HSTS, X-Content-Type-Options. ✅
- [x] `hreflang` alternates correctos en ambas páginas (apuntan recíprocamente ES↔EN). ✅
- [x] `canonical` correcto: `/ftth-copilot` y `/en/ftth-copilot`. ✅
- [x] Open Graph + Twitter Cards + JSON-LD (Organization, ProfessionalService) presentes. ✅
- [x] CSS scoped correctamente con `data-astro-cid-*` por página (no leak entre páginas). ✅
- [x] **Verificación:** Lighthouse NO corrido en este ambiente (no hay Chrome DevTools). El build sin warnings y la verificación HTTP/HTML son el proxy funcional disponible.

### T6 · Commit + push + PR
- [ ] Conventional commit: `feat(landing): add FTTH-Copilot dedicated landing (ES + EN)`.
- [ ] `git push -u origin feat/ftth-copilot-landing`.
- [ ] Crear PR contra `main` con descripción clara.
- [ ] **Pendiente:** autorización explícita del usuario para push + PR.

### T6 · Commit + push + PR
- [ ] Conventional commits: `feat(landing): add FTTH-Copilot dedicated landing (ES + EN)`.
- [ ] `git push -u origin feat/ftth-copilot-landing`.
- [ ] Crear PR contra `main` con descripción clara (qué, por qué, link a este doc ODD).
- [ ] **Verificación:** PR URL devuelto, CI pasa.

## Authorized Scope

T1–T6 según este documento. Cualquier desvío requiere autorización explícita del usuario antes de proceder.

## Acceptance Criteria

- [ ] Las páginas `/ftth-copilot` y `/en/ftth-copilot` existen y renderizan correctamente.
- [ ] `hreflang` y `canonical` configurados.
- [ ] Contenido refleja el brief aprobado (hero, diagrama, 3 modos, capacidades, CTA de validación).
- [ ] Bilingüe ES/EN con copy coherente.
- [ ] Performance no cae bajo 98 mobile / 99 desktop (medido en `npm run preview`).
- [ ] PR abierto contra `main`, listo para revisión.

## Verification Evidence (a completar)

- [x] Build output (post-T5) ✅ — `dist/client/ftth-copilot/index.html` + `dist/client/en/ftth-copilot/index.html` (build con @astrojs/vercel, output bajo `dist/client/`)
- [ ] Lighthouse scores (post-T5) — NO corrido: ambiente headless sin Chrome DevTools disponible. Build sin warnings nuevos y HTTP 200 son el proxy funcional.
- [ ] PR URL (post-T6)
- [ ] Screenshots desktop + mobile — NO capturados: ambiente sin browser headless.

## Next Step

**T6 · Commit + push + PR** — pedir autorización explícita al usuario antes de `git push` y `gh pr create`. El working tree tiene 1650 líneas nuevas (4 componentes + 2 páginas + 1 ODD doc) listas para commitear.
