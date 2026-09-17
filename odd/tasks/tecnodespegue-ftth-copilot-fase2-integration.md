# ODD · Tecnodespegue · FTTH-Copilot Fase 2 — Integraciones

**Feature:** `tecnodespegue-ftth-copilot-fase2-integration`
**Mirror Engram:** `odd/tecnodespegue-ftth-copilot-fase2-integration/tasks`
**Repo:** `/home/tecnodespegue/tecnodespegue-landing`
**Branch:** `feat/ftth-copilot-fase2-integration`
**Base:** `origin/main` con T6 + T7 ya mergeados (PR #45 + PR #46)
**Status:** 🟡 En planificación · T1–T5

---

## Objective

Sobre el landing actual (que ya tiene T6 + T7 mergeados en main), integrar FTTH-Copilot en **tres puntos canónicos** del sitio sin modificar la landing `/ftth-copilot` salvo lo estrictamente necesario para enlaces:

1. **Portfolio** — FTTH-Copilot como proyecto destacado.
2. **Nav** — enlace visible a `/ftth-copilot` en la navegación principal.
3. **Home CTA** — banner discreto que derive a la landing.

Mantener diseño, i18n, SEO y performance actuales. No demo embebida. No cambios grandes de layout.

## Problem / Why

El sitio ya tiene una landing dedicada de calidad para FTTH-Copilot, pero queda **inaccesible desde los flujos naturales de navegación**: un visitante que llega a `tecnodespegue.com` ve la home, el portfolio, los servicios, etc. — pero nada le señala que existe `/ftth-copilot` salvo que tipee la URL o lo busque específicamente. La Fase 2 corrige eso con tres puntos de entrada de baja fricción.

## Scope (in / out)

**In (esta fase):**
- Agregar FTTH-Copilot al array `projectsByLocale` de `src/components/Portfolio.astro` como proyecto destacado (posición 1, `port-card-lg`).
- Agregar enlace "FTTH-Copilot" al array de links de `src/components/Nav.astro` (entre "Portfolio" y "Stack"), localizado ES/EN.
- Crear `src/components/FtthCopilotHomeBanner.astro` — banner discreto que deriva a `/ftth-copilot`. Bilingüe ES/EN.
- Insertar el banner en `src/pages/index.astro` y `src/pages/en/index.astro` entre Hero y HeroStatStrip.
- Mantener: SEO, hreflang, canonical, performance ≥98 mobile / 99 desktop, i18n, accesibilidad, prefers-reduced-motion, Marvel visual language.

**Out (no en esta fase):**
- Modificar la landing `/ftth-copilot` o `/en/ftth-copilot` (más allá de enlaces salientes si hicieran falta — no hacen falta).
- OG image específica para `/ftth-copilot` (sigue usando la genérica).
- Demo embebida de 30-45s.
- Reordenamiento amplio del portfolio más allá de insertar FTTH-Copilot al principio.
- Reordenamiento del Nav más allá de agregar un enlace.

## Constraints

- **No cambiar arquitectura ni layout grande** — los 3 cambios son incrementales y localizados.
- **Mantener Marvel visual language** — `kicker`, glassmorphism, scan lines, gradientes del sitio.
- **Mantener i18n** — todo copy bilingüe ES/EN.
- **Mantener SEO** — no agregar nada que rompa `hreflang`, `canonical`, OG, Twitter, JSON-LD.
- **Mantener performance** — no meter animaciones pesadas ni dependencias nuevas.
- **Conventional commits**, sin Co-Authored-By ni AI attribution.
- **PR chico** — idealmente <400 líneas (regla del repo).

## Architectural Decisions

1. **FTTH-Copilot como 1° proyecto del Portfolio** (no último, no en sección aparte) — para que sea "destacado" tanto por posición como por tamaño visual (`port-card-lg`, 8 cols desktop). El usuario explícitamente pidió "destacado"; ponerlo al final con `port-card-sm` no calificaría.
   - Flow-engineering pasa a 2° (sm); los demás se desplazan 1 posición.
   - El CSS bento de nth-child(3-6) sigue funcionando porque apunta a posiciones absolutas, no a proyectos específicos.
2. **Link en Nav como anchor nuevo** — entre "Portfolio" y "Stack". El link usa `localizedPath('/ftth-copilot', locale)` que ya existe. Sin icono (los demás links tampoco tienen).
3. **HomeBanner = nuevo componente** `FtthCopilotHomeBanner.astro` — NO inline en la página. Razón: copy bilingüe + CSS Marvel complejo + accesibilidad; encapsularlo en componente es consistente con el patrón ya establecido para FTTH-Copilot.
4. **Banner placement: entre Hero y HeroStatStrip** — alta visibilidad sin alterar el hero (que es pieza cinemática con sus propias animaciones). Es el primer bloque de contenido bajo el fold.
5. **Banner estilo "callout" horizontal** — un kicker + texto + CTA en una sola línea (apila en mobile). Fondo con gradiente sutil Marvel, glass border, hover lift. NO usa Three.js ni GSAP.
6. **`link` en lugar de `caseUrl`** en el item del Portfolio — porque la página `/ftth-copilot` es una landing, no un case study. El botón "Ver en vivo" encaja mejor que "Ver caso de estudio".

## File Layout (cambios)

**Modificados:**
```
src/
├── components/
│   ├── Nav.astro                          (+1 link, ~5 líneas)
│   └── Portfolio.astro                    (+1 item en projectsByLocale.es y .en, +icono/color/stack)
└── pages/
    ├── index.astro                        (+1 import + 1 <FtthCopilotHomeBanner/>)
    └── en/
        └── index.astro                    (+1 import + 1 <FtthCopilotHomeBanner/>)
```

**Nuevos:**
```
src/components/
└── FtthCopilotHomeBanner.astro            (~150 líneas, ES+EN, Marvel style)
```

```
odd/tasks/tecnodespegue-ftth-copilot-fase2-integration.md   (este doc)
```

## Tasks

### T1 · Setup ODD doc + Engram mirror + rama ✅
- [x] Crear `odd/tasks/tecnodespegue-ftth-copilot-fase2-integration.md` ✅
- [x] Crear rama `feat/ftth-copilot-fase2-integration` desde `origin/main` post-merge de T6+T7 ✅
- [x] Guardar mirror en Engram con topic key `odd/tecnodespegue-ftth-copilot-fase2-integration/tasks` (id 1132, project `tecnodespegue-landing`) ✅
- [x] **Verificación:** working tree limpio, main local actualizado con T6+T7 (commit `96ac5aa`). ✅

### T2 · Implementar las 3 integraciones ✅
- [x] `src/components/Portfolio.astro` (550 → 572 líneas, +22): FTTH-Copilot como 1° proyecto en `es` y `en` con `port-card-lg`, color `cosmic`, icono `bolt`, `link: '/ftth-copilot'` (ES) / `/en/ftth-copilot` (EN), repo GitHub. Flow-engineering y los demás se desplazan 1 posición. ✅
- [x] `src/components/Nav.astro` (463 → 468 líneas, +5): link FTTH-Copilot entre Portfolio y Stack, en `.nav-menu` desktop + `.nav-mobile-inner` mobile. Sin traducción (es marca). ✅
- [x] `src/components/FtthCopilotHomeBanner.astro` (NUEVO, 230 líneas): banner discreto bilingüe, layout horizontal (desktop) / apilado (mobile), Marvel gradient + gold border, `.btn-primary` CTA con icono `arrow_forward`. CSS only, `prefers-reduced-motion` aware. ✅
- [x] `src/pages/index.astro` (50 → 53 líneas, +3): import + `<FtthCopilotHomeBanner locale={locale} />` entre `<Hero />` y `<HeroStatStrip locale={locale} />`. ✅
- [x] `src/pages/en/index.astro` (48 → 51 líneas, +3): import + `<FtthCopilotHomeBanner locale="en" />` entre `<Hero locale="en" />` y `<TrustSignals locale="en" />` (la EN home no tiene HeroStatStrip; el banner va entre Hero y el siguiente bloque). ✅
- [x] **Verificación:** `npx astro check` PASS, `npm run build` PASS. ✅
- **Total líneas T2:** +263 a través de 5 archivos (1 nuevo, 4 modificados). Working tree dirty.

### T3 · Build + verify ✅
- [x] `npx astro check` → 0 errors, 0 warnings (73 hints pre-existentes; ninguno nuevo en archivos tocados). ✅
- [x] `npm run build` → PASS, 1.35s, sin warnings. ✅
- [x] `npm run preview` → HTTP 200 en `/`, `/en`, `/ftth-copilot`, `/en/ftth-copilot`. ✅
- [x] **HTML renderizado:**
  - `/` (ES home): 8 occurrences de "FTTH-Copilot", hrefs a `/ftth-copilot` (Nav desktop, Nav mobile, Portfolio card, banner CTA = 4 entry points).
  - `/en` (EN home): 8 occurrences de "FTTH-Copilot", hrefs a `/en/ftth-copilot` (mismos 4 entry points).
  - `/ftth-copilot` y `/en/ftth-copilot` intactas — sin cambios.

### T4 · Update ODD doc + Engram mirror ⏳
- [x] Marcar T2, T3, T4 como ✅ en este doc. ✅ (este edit)
- [ ] Update Engram con progreso final + métricas.

### T5 · Commit + push + PR
- [ ] Conventional commit: `feat(integration): FTTH-Copilot Fase 2 — Portfolio + Nav + Home CTA`.
- [ ] `git push -u origin feat/ftth-copilot-fase2-integration`.
- [ ] Crear PR contra `main` con descripción clara.
- [ ] **NO auto-merge.**

## Authorized Scope

T1–T5 según este documento. Cualquier desvío requiere autorización explícita del usuario antes de proceder.

## Acceptance Criteria

- [ ] FTTH-Copilot aparece como 1° proyecto en el Portfolio (ES + EN) con `port-card-lg`.
- [ ] El Nav tiene un nuevo link "FTTH-Copilot" entre Portfolio y Stack (ES + EN).
- [ ] El home muestra el banner discreto entre Hero y HeroStatStrip (ES + EN).
- [ ] Ningún cambio a las páginas `/ftth-copilot` o `/en/ftth-copilot`.
- [ ] SEO intacto: hreflang, canonical, OG, Twitter, JSON-LD.
- [ ] Performance no cae bajo 98 mobile / 99 desktop.
- [ ] Conventional commit, sin Co-Authored-By, sin AI attribution.
- [ ] PR abierto contra `main`, sin auto-merge.

## Verification Evidence (a completar)

- [ ] Build output (post-T3)
- [ ] HTTP 200 en las 4 rutas
- [ ] Greps verificando Portfolio tiene 7 proyectos, Nav tiene 8 links, banner renderiza
- [ ] PR URL (post-T5)

## Next Step

Arrancar con **T2 · Implementar las 3 integraciones**, delegando a un writer con brief detallado.
