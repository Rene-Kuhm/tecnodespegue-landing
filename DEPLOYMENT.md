# Deployment Guide

## Pre-Deploy Checklist

### ✅ Completado
- [x] Contactos actualizados (email, WhatsApp)
- [x] OG image PNG generado
- [x] Formulario con fallback
- [x] SEO meta tags completos
- [x] Favicon SVG
- [x] Responsive design
- [x] Performance optimizado

### 🟡 Antes de Deploy
- [ ] Configurar Formspree (5 min)
- [ ] Test en mobile real
- [ ] Test formulario completo

---

## Opciones de Deploy

### 1. Vercel (Recomendado) - GRATIS

**Por qué Vercel:**
- Zero config para Astro
- HTTPS automático
- Preview deployments
- CDN global
- Gratis para personal projects

**Deploy:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd tecnodespegue-landing
vercel

# Producción
vercel --prod
```

**O conectar con GitHub:**
1. https://vercel.com/new
2. Import repo: `Rene-Kuhm/tecnodespegue-landing`
3. Framework preset: Astro
4. Deploy ✅

**Custom domain:**
- Settings → Domains → Add `tecnodespegue.com`
- Configurar DNS records que te indica

---

### 2. Netlify - GRATIS

```bash
npm i -g netlify-cli
netlify deploy --prod
```

O conectar GitHub en https://app.netlify.com/

**Ventaja:** Netlify Forms gratis (skip Formspree)

---

### 3. Cloudflare Pages - GRATIS

1. https://dash.cloudflare.com/
2. Pages → Create project
3. Connect GitHub
4. Build command: `npm run build`
5. Output: `dist`

**Ventaja:** Súper rápido, CDN de Cloudflare

---

### 4. GitHub Pages - GRATIS

```bash
# astro.config.mjs
export default defineConfig({
  site: 'https://rene-kuhm.github.io',
  base: '/tecnodespegue-landing',
})
```

```bash
npm run build
# Push dist/ to gh-pages branch
```

**Desventaja:** No custom domain fácil

---

## Post-Deploy

### Verificar

- [ ] https://tecnodespegue.com carga correctamente
- [ ] Formulario envía emails
- [ ] Responsive en mobile
- [ ] WhatsApp abre correctamente
- [ ] OG tags: https://www.opengraph.xyz/
- [ ] Performance: https://pagespeed.web.dev/

### Monitoring

**Google Analytics (opcional):**
```html
<!-- src/layouts/Layout.astro -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible (recomendado - privacy-friendly):**
```html
<script defer data-domain="tecnodespegue.com" src="https://plausible.io/js/script.js"></script>
```

---

## Performance Expected

- **Lighthouse:**
  - Performance: 95+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 100

- **Load time:** < 1s
- **FCP:** < 0.8s
- **LCP:** < 1.5s

---

## Troubleshooting

**Fonts no cargan:**
- Verificar Google Fonts links en Layout.astro

**Formulario no funciona:**
- Verificar Formspree Form ID
- Testear fallback mailto

**OG image no aparece:**
- Verificar URL completa en meta tags
- Cache puede tardar 24h en algunos bots

---

## Dominio Personalizado

### Comprar dominio (si no tenés):
- **Namecheap:** ~$10/año
- **Cloudflare Registrar:** Al costo (~$9/año)
- **Google Domains:** $12/año

### Configurar DNS:
Si deployás en Vercel:
```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

Si deployás en Netlify:
```
A     @       75.2.60.5
CNAME www     TU-SITE.netlify.app
```

---

**Recomendación:** Empezá con Vercel, es el más simple y poderoso para Astro.
