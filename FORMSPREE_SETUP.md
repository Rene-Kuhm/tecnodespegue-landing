# Formspree Setup Guide

## Quick Setup (5 minutos)

1. **Ir a Formspree:**
   https://formspree.io/

2. **Crear cuenta gratis:**
   - Login con Google o GitHub
   - Plan Free: 50 submissions/mes (suficiente para empezar)

3. **Crear nuevo form:**
   - Click "New Form"
   - Nombre: "TecnoDespegue Contact"
   - Email: `renekuhm2@gmail.com`
   - Copy el Form ID que te dan (format: `xyzabc123`)

4. **Actualizar el código:**
   En `src/components/ContactForm.astro`, línea 97:
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
   ```
   Cambiar `YOUR_FORM_ID` por tu Form ID real.

5. **Commit y push:**
   ```bash
   git add src/components/ContactForm.astro
   git commit -m "feat: connect Formspree with real form ID"
   git push origin main
   ```

## Features del Form

✅ **Spam protection** (reCAPTCHA automático después de X submissions)
✅ **Email notifications** a `renekuhm2@gmail.com`
✅ **Dashboard** para ver todos los mensajes
✅ **Fallback mailto** si Formspree falla

## Alternativas

### Netlify Forms (si deployás en Netlify)
1. Agregar `netlify` attribute al form
2. Zero config, gratis 100 submissions/mes

### Web3Forms (100% gratis)
1. https://web3forms.com/
2. API key gratuita
3. Sin límite de submissions

## Cómo Testear

1. Deploy la landing
2. Completá el form
3. Chequeá tu email `renekuhm2@gmail.com`
4. Verificá en Formspree dashboard

---

**Nota:** El código actual tiene fallback a mailto si Formspree no está configurado o falla.
