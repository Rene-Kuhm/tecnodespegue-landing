---
title: "Automatización con IA: cómo reducí 40 horas semanales a 4"
description: "Pipeline real de extracción, clasificación y respuesta automática con Python, OpenAI y n8n. Números incluidos."
date: 2025-04-28
author: "René Kuhm"
category: "Automatización"
tags: ["ia", "automatización", "n8n", "python", "productividad"]
readTime: 6
featured: false
image: "/og-image.png"
locale: es
seo:
  title: "Automatización IA: de 40 a 4 horas semanales — Caso real"
  description: "Cómo construí un pipeline con IA que procesa leads, responde emails y genera reportes automáticamente. Ahorro real de 36 horas semanales."
---

# Automatización con IA: cómo reducí 40 horas semanales a 4

Hace 18 meses, una consultora de recruiting en Buenos Aires me contrató para "hacer algunos scripts". Terminamos reemplazando dos posiciones de tiempo completo con un sistema que corre 24/7.

Este es el caso real, con números, herramientas y errores que cometimos.

## El problema antes de la automatización

La consultora recibía:

- **~500 emails diarios** de candidatos con CVs adjuntos
- **120 mensajes de WhatsApp** de clientes pidiendo updates
- **40 solicitudes** de entrevistas por LinkedIn
- **3 reportes semanales** manuales en Excel para cada cliente

Tres personas dedicaban **40 horas semanales** a tareas que eran 90% clasificación, extracción y formato.

## La arquitectura final

```
Entradas (Email, WhatsApp, LinkedIn)
    ↓
[n8n] Trigger + Normalización
    ↓
[Python] Extracción de datos con LLM
    ↓
[Supabase] Almacenamiento + clasificación
    ↓
[n8n] Decision tree + Acciones
    ↓
Salidas (Email auto, Notificación, Reporte)
```

## Paso 1: Ingesta y normalización con n8n

n8n (self-hosted en Railway) conecta:

- **IMAP** para emails de Gmail y Outlook
- **WhatsApp Business API** vía 360dialog
- **LinkedIn** vía API + webhooks de PhantomBuster

Cada entrada se normaliza a un JSON estándar:

```json
{
  "source": "email",
  "sender": "juan@example.com",
  "raw_content": "...",
  "attachments": ["cv_juan.pdf"],
  "timestamp": "2025-04-15T10:30:00Z"
}
```

**Error que cometimos**: intentamos procesar PDFs directamente en n8n. Es lento y caro. La solución fue guardar el archivo en S3, mandar la URL a una función Python, y que el workflow continúe vía webhook.

## Paso 2: Extracción estructurada con LLM

Usamos **OpenAI GPT-4o-mini** vía API. No es el modelo más grande; para extracción estructurada no hace falta.

Prompt template (simplificado):

```python
system_prompt = """
Extraé la información del CV en este schema JSON:
- nombre: string
- email: string
- telefono: string
- experiencia_años: number
- tecnologias: string[]
- seniority: "junior" | "semi-senior" | "senior" | "lead"
- disponibilidad: "inmediata" | "1_mes" | "3_meses"

Si falta información, usá null. No inventes datos.
"""
```

**Costo real**: ~USD 0.003 por CV procesado. Con 500 CVs diarios = **USD 4.50/día**.

Comparado con un analista junior (USD 1,200/mes), el ROI se alcanza en día 5.

## Paso 3: Clasificación y routing

Una vez estructurados, los candidatos se clasifican:

| Score | Acción |
|-------|--------|
| > 85% match | Email automático al candidato + notificación al recruiter |
| 60-85% | Guardar en shortlist manual para revisión |
| < 60% | Email de agradecimiento automático + feedback genérico |

El criterio de match viene de un job description parseado con el mismo LLM.

## Paso 4: Reportes automáticos

Cada viernes a 18:00, n8n dispara:

1. Query a Supabase por candidatos de la semana
2. Agregación con Python (pandas + jinja2)
3. Generación de PDF con **Playwright + HTML template**
4. Envío por email a cada cliente con los candidatos recomendados

**Tiempo previo**: 3 horas por cliente × 12 clientes = 36 horas/semana.
**Tiempo actual**: 0 horas. El sistema no falló en 8 meses.

## Las 3 cosas que no automatizamos

No todo debería ser automático. Dejamos fuera del pipeline:

1. **Entrevistas técnicas**: la IA evalúa código, pero no cultural fit
2. **Negociación salarial**: requiere juicio humano y contexto emocional
3. **Reclamos formales**: un email enojado automatizado empeora todo

## Stack y costos mensuales reales

| Servicio | Costo/mes | Rol |
|----------|-----------|-----|
| n8n (Railway) | USD 19 | Orchestration |
| OpenAI API | USD 135 | Extracción + clasificación |
| Supabase | USD 25 | Database + Auth |
| S3 (R2) | USD 8 | CVs + reportes |
| PhantomBuster | USD 48 | LinkedIn scraping |
| 360dialog | USD 55 | WhatsApp API |
| **Total** | **USD 290** | |

Reemplaza **USD 2,400/mes** en salarios + **36 horas/semana** de un founder.

## Empezá hoy: MVP de automatización en 48 horas

Si querés prototipar rápido:

1. **n8n cloud** (gratis hasta 5 workflows)
2. **Zapier Make** si no sabés código
3. **OpenAI API** con prompts simples
4. **Google Sheets** como base de datos temporal

Empezá con UN solo flujo que te moleste. No intentes automatizar todo de una.

## Conclusión

La IA no reemplaza recruiters. Reemplaza **clasificación manual, copy-paste de Excel, y esperar a que alguien lea un email**.

Las 36 horas recuperadas se usan en entrevistas de calidad, negociación con clientes, y estrategia de crecimiento.

¿Querés ver si tu workflow se puede automatizar? [Escribinos](/#contacto) y en 15 minutos te decimos qué partes tienen ROI positivo.
