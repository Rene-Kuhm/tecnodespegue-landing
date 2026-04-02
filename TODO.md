# TODO - Pre-Launch Checklist

## 🔴 Critical (Antes de Deploy)

- [ ] **Actualizar email de contacto** en `src/components/CTA.astro`
  - Actual: `contacto@tecnodespegue.com`
  - Cambiar a: tu email real

- [ ] **Actualizar WhatsApp** en `src/components/CTA.astro`
  - Actual: `https://wa.me/5491112345678`
  - Cambiar a: `https://wa.me/549TUTELEFONO` (formato argentino sin 0 ni 15)

- [ ] **Agregar favicon** en `/public/favicon.svg`
  - Diseño sugerido: Logo TD en cyan sobre fondo negro

- [ ] **Actualizar links sociales** en `src/components/Footer.astro`
  - GitHub
  - LinkedIn
  - Otros

## 🟡 Important (Mejoras visuales)

- [ ] **Hero image**: Reemplazar placeholder en `Hero.astro`
  - Imagen sugerida: Geometría abstracta con líneas cyan
  - Formato: WebP optimizado
  - Path: `/public/hero-visual.webp`

- [ ] **Meta tags SEO** en `Layout.astro`:
  - [ ] Open Graph tags
  - [ ] Twitter Card
  - [ ] Canonical URL
  - [ ] Descripción optimizada

- [ ] **Analytics**: Agregar Google Analytics / Plausible

## 🟢 Nice to Have (Futuras iteraciones)

- [ ] Formulario de contacto real (Formspree / Netlify Forms)
- [ ] Animaciones scroll reveal (Intersection Observer)
- [ ] Página 404 personalizada
- [ ] Blog section (opcional)
- [ ] Case studies / Portfolio
- [ ] Testimonios de clientes
- [ ] Modo light/dark toggle (aunque default es dark)

## 📝 Content Review

- [ ] Revisar todos los textos en español
- [ ] Verificar que no haya typos
- [ ] Asegurar tono de voz consistente (técnico pero accesible)
- [ ] Validar que las tecnologías listadas son correctas

## 🧪 Testing

- [ ] Test en Chrome
- [ ] Test en Firefox
- [ ] Test en Safari (mobile)
- [ ] Test responsive (320px, 768px, 1440px)
- [ ] Test performance (Lighthouse)
- [ ] Test accesibilidad (WCAG AA)

## 🚀 Deploy

- [ ] Configurar dominio (tecnodespegue.com?)
- [ ] SSL certificate
- [ ] Configurar redirects (www → non-www)
- [ ] Setup CI/CD (GitHub Actions + Vercel)
- [ ] Configurar variables de entorno si hace falta

---

## Quick Deploy Commands

```bash
# Local test
npm run build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

---

**Prioridad**: Empezá por los 🔴 Critical antes de mostrar la landing a clientes.
