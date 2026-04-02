# OG Image Generation Instructions

## Opción 1: Screenshot Manual (Rápido)

1. Abrí `scripts/generate-og-image.html` en Chrome
2. Zoom 100%
3. Screenshot (1200x630)
4. Guardá como `public/og-image.png`

## Opción 2: Online Tools (Recomendado)

### Usando Canva:
1. Ir a https://www.canva.com/
2. "Custom dimensions" → 1200 x 630 px
3. Background negro #0e0e0e
4. Texto:
   - "TecnoDespegue" (Space Grotesk, 72px, blanco)
   - Subtítulos (Inter, 36px, #adaaaa)
   - Badge cyan
5. Export como PNG

### Usando Figma:
1. Frame 1200x630
2. Copiar diseño del HTML
3. Export PNG @ 1x

## Opción 3: Headless Screenshot (Avanzado)

Si tenés Node + Puppeteer:

```bash
npm install puppeteer
node scripts/screenshot-og.js
```

## Verificación

Una vez generada la imagen:

1. Guardarla en `public/og-image.png`
2. Testear en:
   - https://www.opengraph.xyz/
   - https://cards-dev.twitter.com/validator
3. Verificar tamaño: 1200x630, < 1MB

---

**Status actual:** SVG creado, PNG pendiente manual.
**Fallback:** SVG funciona en muchos casos, pero PNG es más compatible.
