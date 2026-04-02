# Getting Started - TecnoDespegue Landing

## 🚀 Quick Start

La landing ya está corriendo en modo desarrollo.

### Ver el Proyecto

1. **Servidor local**: http://localhost:4321/
2. El servidor se recarga automáticamente al editar archivos

### Comandos Disponibles

```bash
# Detener el servidor
# Presioná Ctrl+C en la terminal donde está corriendo

# Reiniciar el servidor
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📱 Testing Checklist

### Visual
- [ ] Hero section con gradient cyan en "futuro digital"
- [ ] Badge animado "IA-READY SOLUTIONS" con punto pulsante
- [ ] Navbar fixed con glass effect
- [ ] Grid background sutil en hero y CTA
- [ ] Cards con hover effects (borde cyan al 20%)
- [ ] Badges técnicos con efecto hover
- [ ] Footer con links

### Interactividad
- [ ] Navegación suave entre secciones (scroll smooth)
- [ ] Hover states en botones con glow effect
- [ ] Iconos de Material Symbols cargando correctamente
- [ ] CTAs funcionando (mailto y WhatsApp - actualizar con datos reales)

### Responsive
- [ ] Mobile: Hero stack vertical, nav colapsada
- [ ] Tablet: Grid de servicios responsive
- [ ] Desktop: Layout asimétrico completo

## 🎨 Personalización Rápida

### Cambiar Colores
Editá `tailwind.config.js`:
```js
colors: {
  'primary': '#c1fffe',  // Tu cyan
  'secondary': '#00fd87', // Tu green
  // ...
}
```

### Cambiar Contenido
Todos los textos están en `src/components/*.astro`:
- **Hero.astro**: Título principal y descripción
- **Services.astro**: Los 4 servicios principales
- **Why.astro**: Razones para elegir TecnoDespegue
- **Tech.astro**: Stack tecnológico (badges)
- **CTA.astro**: Email y WhatsApp (¡actualizar con datos reales!)

### Cambiar Fuentes
Editá `src/layouts/Layout.astro` y `tailwind.config.js` si querés usar otras tipografías.

## 🔍 Estructura de Secciones

1. **Nav** - Fixed navbar con glass effect
2. **Hero** - Título hero + badge animado + visual placeholder
3. **Services** - Grid asimétrico (8+4+4+8 cols) con iconos Material
4. **Why** - Grid 2 cols: razones + card analytics con métrica 99.9%
5. **Tech** - Badges de tecnologías con hover
6. **CTA** - "¿Listo para despegar?" + botones email/whatsapp
7. **Footer** - Links legales + social

## 🛠️ Next Steps

### Antes de Deploy:
1. **Actualizar contactos** en `CTA.astro`:
   - Email real
   - WhatsApp con número argentino (+54...)
2. **Agregar imagen hero**: Reemplazar placeholder en `Hero.astro`
3. **Revisar links del footer** en `Footer.astro`
4. **Agregar favicon.svg** en `/public/`
5. **Configurar dominio** y SSL

### Opcional:
- Agregar Google Analytics
- Implementar formulario de contacto
- Crear página 404 personalizada
- Agregar animaciones scroll reveal con Intersection Observer

## 📦 Deploy a Producción

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Build Manual
```bash
npm run build
# Output en: dist/
# Subir dist/ a cualquier hosting estático
```

## 🐛 Troubleshooting

**Fonts no cargan:**
- Verificá conexión a Google Fonts
- Chequeá `Layout.astro` links

**Tailwind no aplica estilos:**
- Ejecutá `npm run dev` nuevamente
- Verificá `tailwind.config.js`

**Material Icons no aparecen:**
- Chequeá link en `Layout.astro`
- Usá nombres válidos de Material Symbols

## 📞 Soporte

Cualquier issue, contactar al Squire. ⚔️

---

**Diseñado con "The Neon Architect" design system**
**Built by Tecno Squire for TecnoDespegue**
