# TODO - Pre-Launch Checklist

## ✅ Completado

- [x] **Hero visual mejorado** - Geometría animada con glows y efectos
- [x] **Scroll reveal animations** - Elementos aparecen al scrollear
- [x] **Custom cursor** - Cursor personalizado desktop
- [x] **Progress bar** - Barra de progreso al scrollear
- [x] **Testimonials section** - 3 casos de éxito con métricas
- [x] **Trust signals** - Stats + badges de confianza
- [x] **Contact form** - Formulario funcional completo
- [x] **Mejores CTAs** - "Agendar Consulta Gratis" más específico
- [x] **Favicon SVG** - Logo TD animado
- [x] **Meta tags SEO** - OG, Twitter, keywords completos
- [x] **Métricas en servicios** - -70% tickets, <100ms response time
- [x] **Micro-interacciones** - Hover effects, animaciones suaves

## 🔴 Critical (Antes de Deploy)

- [ ] **Actualizar email de contacto** en `src/components/ContactForm.astro` y `CTA.astro`
  - Actual: `contacto@tecnodespegue.com`
  - Cambiar a: tu email real

- [ ] **Actualizar WhatsApp** en `src/components/CTA.astro`
  - Actual: `https://wa.me/5491112345678`
  - Cambiar a: `https://wa.me/549TUTELEFONO` (formato argentino sin 0 ni 15)

- [ ] **Actualizar links sociales** en `src/components/Footer.astro`
  - GitHub: Cambiar a tu perfil
  - LinkedIn: Cambiar a tu company page

- [ ] **Configurar formulario backend**
  - Opciones: Formspree, Netlify Forms, o tu API
  - Ver comentarios en `ContactForm.astro`

- [ ] **Crear OG image** en `/public/og-image.png`
  - Tamaño: 1200x630px
  - Incluir logo + tagline

## 🟡 Important (Mejoras visuales)

- [ ] **Analytics**: Agregar Google Analytics / Plausible
  - Script tag en Layout.astro

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
