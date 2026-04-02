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

## ✅ Completado Hoy (2026-04-03)

- [x] **Email actualizado** → renekuhm2@gmail.com
- [x] **WhatsApp actualizado** → +54 9 2334 409838
- [x] **Formulario con Formspree** → Listo con fallback mailto
- [x] **OG image PNG** → Generado 1200x630, 60KB
- [x] **Sociales** → Comentados hasta crear perfiles

## 🔴 Critical (Antes de Deploy)

- [ ] **Configurar Formspree Form ID**
  - Ver `FORMSPREE_SETUP.md` para instrucciones
  - 5 minutos en https://formspree.io/
  - Actualizar línea 97 de `ContactForm.astro`

- [ ] **Crear perfiles sociales** (opcional)
  - GitHub, LinkedIn
  - Descomentar links en `Footer.astro` cuando estén listos

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
