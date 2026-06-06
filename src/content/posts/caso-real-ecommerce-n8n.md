---
title: "Cómo automatizamos un e-commerce con n8n + IA: caso real"
description: "De 4 horas diarias de tareas manuales a 30 minutos. El flujo que armamos para un cliente, las herramientas, los errores que cometimos y los números reales."
date: 2025-06-12
author: "René Kuhm"
category: "Automatización"
tags: ["n8n", "automation", "ia", "workflow", "ecommerce", "caso-real"]
readTime: 8
image: "/og-image.png"
seo:
  title: "Caso real: automatizar e-commerce con n8n + IA (ahorro de 4h/día)"
  description: "Cómo automatizamos un e-commerce de moda con n8n, GPT-4 y APIs custom. Stack, errores, métricas y lecciones aprendidas."
---

# Cómo automatizamos un e-commerce con n8n + IA: caso real

Uno de nuestros clientes (tienda de indumentaria, ~200 SKUs, 800 pedidos/mes) llegaba al final del día con **4 horas de tareas manuales** encima del dueño: responder consultas de WhatsApp, publicar en redes, actualizar stock, hacer seguimiento de envíos, responder reviews.

Hoy hace todo eso en **30 minutos de revisión**.

Acá te cuento exactamente qué hicimos, las herramientas, los errores que cometimos, y los números reales después de 6 meses en producción.

## El contexto (antes)

**Tienda:** marca de ropa, 2 años en el mercado.
**Volumen:** ~800 pedidos/mes, ~25 consultas WhatsApp/día.
**Stack previo:** Tiendanube + WhatsApp Business + Instagram + Mercado Libre.
**Pain:** el dueño se levantaba a las 6am a responder mensajes, publicaba manualmente en 3 redes, y se acostaba después de medianoche cruzando planillas de stock.

**4h/día en tareas que se podían automatizar.** Era un agujero negro.

## El approach: qué decidimos automatizar (y qué no)

Antes de tocar n8n o GPT, hicimos un inventario. Listamos todo lo que el dueño hacía en una semana, y para cada tarea preguntamos:

1. **¿Es repetitivo?** Si no, no automatiza.
2. **¿Hay un patrón claro en los inputs?** Si no, no automatiza.
3. **¿El costo de error es bajo?** Si un bot se equivoca, ¿se puede revertir rápido?

Lo que **SÍ** automatizamos:

- Respuestas FAQ en WhatsApp (envíos, talles, cambios)
- Publicación cruzada en Instagram + Facebook desde catálogo
- Generación de descripciones de producto con GPT
- Sincronización de stock Tiendanube ↔ Mercado Libre
- Tracking automático de envíos + notificaciones
- Respuestas a reviews (positivas y negativas)

Lo que **NO** automatizamos:

- Atención al cliente compleja (devoluciones con queja, problemas de logística)
- Creación de colecciones nuevas (mucho criterio estético)
- Decisiones de pricing dinámico (probamos, pero el costo de error era alto)

## El stack

```
n8n (self-hosted en Railway, $5/mes)
├── WhatsApp Cloud API (gratis)
├── Meta Graph API (Instagram + Facebook)
├── Tiendanube API
├── MercadoLibre API
├── OpenAI GPT-4o-mini (para descripciones + respuestas)
├── PostgreSQL (logs + analytics)
└── n8n Error Workflows (notificaciones a Telegram)
```

**Costo mensual total: ~$15-25** dependiendo del volumen de GPT calls.

### Por qué n8n y no Zapier/Make

| | Zapier | Make | n8n |
|---|---|---|---|
| Costo | $600+/mes a escala | $100+/mes a escala | $5/mes (self-hosted) |
| Flexibilidad | Baja (acciones pre-armadas) | Media | Alta (código custom) |
| Self-hosted | No | No | Sí |
| Curva de aprendizaje | Baja | Baja | Media |

Para este cliente, los flows incluían lógica custom (reglas de pricing por hora del día, escalado de urgencias, etc.). n8n nos dio la flexibilidad de meter JavaScript donde lo necesitábamos sin pagar premium.

## Los 6 flows principales

### 1. WhatsApp FAQ Bot

**Trigger:** mensaje entrante en WhatsApp Business.
**Flow:**
1. Clasifica intención con GPT-4o-mini (envío, talle, cambio, queja, otro)
2. Si es FAQ → responde con template pre-aprobado
3. Si es queja/problema → escala al dueño con contexto
4. Si es otro → responde "te paso con humano" + tag en CRM

**Resultado:** 80% de consultas resueltas automáticamente. El 20% que escala es lo que **realmente necesita atención humana**.

> Aprendimos: tener siempre un "kill switch" para pausar el bot cuando hay picos de quejas o se rompe algo upstream. Lo activamos 3 veces en 6 meses.

### 2. Publicación cruzada IG + Facebook

**Trigger:** producto nuevo en Tiendanube (webhook).
**Flow:**
1. Toma el producto + fotos
2. Genera caption con GPT (3 variaciones: lifestyle, técnico, promo)
3. Publica en IG con hashtag set rotativo
4. Cross-post a Facebook con copy adaptado
5. Log de engagement en PostgreSQL

**Resultado:** el dueño pasó de 1h/día publicando a 5 minutos revisando que las publicaciones salieron bien. Y los captions son **mejores** que los que escribía él (GPT los hace con más estructura).

### 3. Generación de descripciones

**Trigger:** producto sin descripción o con descripción < 50 chars.
**Flow:**
1. Pull del producto (nombre, categoría, materiales del feed)
2. Prompt a GPT con template por categoría (remera, pantalón, accesorio)
3. Genera 2 versiones: corta (1 línea) y larga (3 párrafos SEO)
4. Push a Tiendanube vía API
5. Notificación al dueño para revisar

**Resultado:** catalog de 200 SKUs completado en 2 días (vs 3 meses manual). 70% de las descripciones se publicaron sin edición.

### 4. Sincronización de stock

**Trigger:** cada 5 minutos (cron).
**Flow:**
1. Lee stock de Tiendanube
2. Compara con stock de Mercado Libre
3. Si hay diferencia → actualiza ML vía API
4. Si un SKU está por debajo de threshold → pausa el listing en ML
5. Si vuelve a haber stock → reactiva

**Resultado:** cero oversells en 6 meses. Antes pasaba 1-2 veces por mes.

### 5. Tracking automático

**Trigger:** cambio de status en Tiendanube (webhook) o ML.
**Flow:**
1. Detecta cambio a "despachado" / "en camino" / "entregado"
2. Envía WhatsApp template al cliente con link de tracking
3. Si el envío se atrasa > 48h → notifica al dueño

**Resultado:** reclamos por "dónde está mi pedido" cayeron 90%. El dueño ya no tiene que explicar manualmente cada envío.

### 6. Respuestas a reviews

**Trigger:** review nueva en Mercado Libre o Google.
**Flow:**
1. Clasifica sentimiento con GPT
2. Si es positiva → agradece con template personalizado
3. Si es negativa → escala al dueño con análisis de qué pasó mal
4. Si es neutra → responde con info útil

**Resultado:** todas las reviews tienen respuesta en <24h. El rating promedio subió 0.3 estrellas en 6 meses.

## El error que casi nos cuesta el cliente

En el mes 2, el flow de WhatsApp FAQ se rompió silenciosamente. Un cambio en la API de WhatsApp requería re-autenticación, y como el flow no tenía alerta, dejó de responder mensajes por **3 días**.

El dueño se enteró porque un cliente le mandó un WhatsApp personal indignado.

**Lo que aprendimos:**

> Cada flow crítico DEBE tener un health check + alerta. Si un flow falla > 1h, alguien tiene que enterarse.

Ahora tenemos un "error workflow" en n8n que:
- Monitorea todos los flows cada 5 min
- Si detecta un flow caído → manda Telegram al dueño + a mí
- Log de errores en una tabla de PostgreSQL

No se volvió a romper en silencio.

## Los números reales (6 meses después)

| Métrica | Antes | Después | Delta |
|---|---|---|---|
| Horas manuales/día | 4 | 0.5 | **-87%** |
| Tiempo respuesta WhatsApp | 2-4h | < 5 min | **-95%** |
| Reviews sin responder | ~30% | 0% | **-100%** |
| Oversells/mes | 1-2 | 0 | **-100%** |
| Costo mensual del sistema | — | $22 | — |
| ROI (horas × valor hora) | — | $0 contra $1800/mes | **+8100%** |

El dueño recuperó **30 horas semanales**. Una de esas horas la usa para diseñar colecciones nuevas. Otra para descansar.

## Lo que NO haría de nuevo

1. **Empezar con GPT-4.** Usamos GPT-4o-mini desde el día 1. 80% más barato, 95% de la calidad para tareas de automation.

2. **No hacer flows perfectos desde el inicio.** Hicimos v1 en 2 semanas, lo dejamos correr, y mejoramos basándonos en datos reales. Hacerlo "perfecto" en planificación nos hubiera llevado 3 meses.

3. **No subestimar el error handling.** El error del mes 2 fue 100% evitable. Ahora SIEMPRE: health check + alerta + log.

4. **No meter IA donde no aporta.** Las respuestas FAQ eran FAQ reales. La publicación en redes la hacía GPT pero el dueño elegía entre 3 variaciones. La IA **asiste**, no reemplaza.

## Conclusión

Automatizar no es tirar herramientas de IA. Es:

1. **Mapear qué es repetitivo** y qué no
2. **Validar que la IA no rompe cosas críticas** (siempre human-in-the-loop al inicio)
3. **Medir antes y después** con números reales
4. **Iterar rápido** — v1 feo que corre > v10 perfecto en un board

Si tenés un e-commerce o un negocio con tareas repetitivas, **empezá por una sola cosa**. La que más tiempo te come. Hacela bien. Después seguí con la siguiente.

Los flows de este cliente están documentados en [mi repo de n8n templates](https://github.com/Rene-Kuhm) — los podés clonar y adaptar.

---

*René Kuhm · TecnoDespegue · Automatización con IA en producción*
