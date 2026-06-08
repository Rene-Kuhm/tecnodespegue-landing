---
title: "How we automated an e-commerce with n8n + AI: real case"
description: "From 4 hours a day of manual tasks to 30 minutes. The workflow we built for a client, the tools, the mistakes we made, and the real numbers."
date: 2025-06-12
author: "René Kuhm"
category: "Automation"
tags: ["n8n", "automation", "ai", "workflow", "ecommerce", "case-study"]
readTime: 8
image: "/og-image-en.png"
locale: en
seo:
  title: "Real case: automating e-commerce with n8n + AI (4h/day saved)"
  description: "How we automated a fashion e-commerce with n8n, GPT-4, and custom APIs. Stack, mistakes, metrics, and lessons learned."
---

# How we automated an e-commerce with n8n + AI: real case

One of our clients (clothing store, ~200 SKUs, 800 orders/month) ended each day with **4 hours of manual tasks** on top of the owner: answering WhatsApp queries, posting on social media, updating stock, tracking shipments, replying to reviews.

Today they do all that in **30 minutes of review time**.

Here's exactly what we did, the tools, the mistakes we made, and the real numbers after 6 months in production.

## The context (before)

**Store:** clothing brand, 2 years in the market.
**Volume:** ~800 orders/month, ~25 WhatsApp queries/day.
**Previous stack:** Tiendanube + WhatsApp Business + Instagram + Mercado Libre.
**Pain:** the owner was waking up at 6 AM to reply to messages, posting manually to 3 networks, and going to bed after midnight cross-referencing stock spreadsheets.

**4h/day in tasks that could be automated.** It was a black hole.

## The approach: what we decided to automate (and what we didn't)

Before touching n8n or GPT, we did an inventory. We listed everything the owner did in a week, and for each task we asked:

1. **Is it repetitive?** If not, don't automate it.
2. **Is there a clear pattern in the inputs?** If not, don't automate it.
3. **Is the cost of error low?** If a bot messes up, can it be reverted quickly?

What we **DID** automate:

- FAQ replies on WhatsApp (shipping, sizes, exchanges)
- Cross-posting on Instagram + Facebook from catalog
- Product description generation with GPT
- Stock sync Tiendanube ↔ Mercado Libre
- Automatic shipment tracking + notifications
- Review replies (positive and negative)

What we **DID NOT** automate:

- Complex customer support (returns with complaints, logistics problems)
- Creating new collections (too much aesthetic judgment)
- Dynamic pricing decisions (we tried, but the cost of error was too high)

## The stack

```
n8n (self-hosted on Railway, $5/month)
├── WhatsApp Cloud API (free)
├── Meta Graph API (Instagram + Facebook)
├── Tiendanube API
├── MercadoLibre API
├── OpenAI GPT-4o-mini (for descriptions + replies)
├── PostgreSQL (logs + analytics)
└── n8n Error Workflows (Telegram notifications)
```

**Total monthly cost: ~$15-25** depending on GPT call volume.

### Why n8n and not Zapier/Make

| | Zapier | Make | n8n |
|---|---|---|---|
| Cost | $600+/month at scale | $100+/month at scale | $5/month (self-hosted) |
| Flexibility | Low (pre-built actions) | Medium | High (custom code) |
| Self-hosted | No | No | Yes |
| Learning curve | Low | Low | Medium |

For this client, the flows included custom logic (pricing rules by time of day, urgency escalation, etc.). n8n gave us the flexibility to drop in JavaScript where we needed it without paying premium.

## The 6 main flows

### 1. WhatsApp FAQ Bot

**Trigger:** incoming message on WhatsApp Business.
**Flow:**
1. Classify intent with GPT-4o-mini (shipping, size, exchange, complaint, other)
2. If it's an FAQ → reply with pre-approved template
3. If it's a complaint/problem → escalate to owner with context
4. If it's something else → reply "I'll pass you to a human" + tag in CRM

**Result:** 80% of queries resolved automatically. The 20% that escalates is what **actually needs human attention**.

> Lesson learned: always have a "kill switch" to pause the bot when there are complaint spikes or something upstream breaks. We triggered it 3 times in 6 months.

### 2. Cross-posting IG + Facebook

**Trigger:** new product on Tiendanube (webhook).
**Flow:**
1. Take the product + photos
2. Generate caption with GPT (3 variations: lifestyle, technical, promo)
3. Post to IG with rotating hashtag set
4. Cross-post to Facebook with adapted copy
5. Engagement log in PostgreSQL

**Result:** the owner went from 1h/day posting to 5 minutes reviewing that posts went out correctly. And the captions are **better** than what he wrote (GPT does them with more structure).

### 3. Description generation

**Trigger:** product without description or with description < 50 chars.
**Flow:**
1. Pull product (name, category, materials from feed)
2. Prompt GPT with category template (t-shirt, pants, accessory)
3. Generate 2 versions: short (1 line) and long (3 SEO paragraphs)
4. Push to Tiendanube via API
5. Notification to owner for review

**Result:** catalog of 200 SKUs completed in 2 days (vs 3 months manual). 70% of descriptions were published without editing.

### 4. Stock sync

**Trigger:** every 5 minutes (cron).
**Flow:**
1. Read stock from Tiendanube
2. Compare with stock from Mercado Libre
3. If there's a difference → update ML via API
4. If a SKU is below threshold → pause the listing on ML
5. If stock is back → reactivate

**Result:** zero oversells in 6 months. Before it happened 1-2 times per month.

### 5. Automatic tracking

**Trigger:** status change on Tiendanube (webhook) or ML.
**Flow:**
1. Detect change to "dispatched" / "in transit" / "delivered"
2. Send WhatsApp template to customer with tracking link
3. If shipment is delayed > 48h → notify owner

**Result:** complaints about "where's my order" dropped 90%. The owner no longer has to manually explain each shipment.

### 6. Review replies

**Trigger:** new review on Mercado Libre or Google.
**Flow:**
1. Classify sentiment with GPT
2. If positive → thank with personalized template
3. If negative → escalate to owner with analysis of what went wrong
4. If neutral → reply with useful info

**Result:** all reviews have a reply in <24h. Average rating went up 0.3 stars in 6 months.

## The mistake that almost cost us the client

In month 2, the WhatsApp FAQ flow broke silently. A change in the WhatsApp API required re-authentication, and since the flow had no alert, it stopped replying to messages for **3 days**.

The owner found out because an angry customer sent him a personal WhatsApp.

**What we learned:**

> Every critical flow MUST have a health check + alert. If a flow fails > 1h, someone has to know.

Now we have an "error workflow" in n8n that:
- Monitors all flows every 5 min
- If it detects a downed flow → sends Telegram to the owner + me
- Error log in a PostgreSQL table

It hasn't broken silently again.

## The real numbers (6 months later)

| Metric | Before | After | Delta |
|---|---|---|---|
| Manual hours/day | 4 | 0.5 | **-87%** |
| WhatsApp response time | 2-4h | < 5 min | **-95%** |
| Unanswered reviews | ~30% | 0% | **-100%** |
| Oversells/month | 1-2 | 0 | **-100%** |
| Monthly system cost | — | $22 | — |
| ROI (hours × hourly value) | — | $0 vs $1800/month | **+8100%** |

The owner recovered **30 hours a week**. One of those hours he uses to design new collections. Another to rest.

## What I WOULDN'T do again

1. **Starting with GPT-4.** We used GPT-4o-mini from day one. 80% cheaper, 95% of the quality for automation tasks.

2. **Not making flows perfect from the start.** We made v1 in 2 weeks, let it run, and improved based on real data. Making it "perfect" in planning would have taken us 3 months.

3. **Underestimating error handling.** The month 2 error was 100% avoidable. Now ALWAYS: health check + alert + log.

4. **Putting AI where it doesn't add value.** FAQ replies were real FAQs. Social posting was done by GPT but the owner chose between 3 variations. AI **assists**, it doesn't replace.

## Conclusion

Automating isn't about throwing AI tools at things. It's about:

1. **Mapping what's repetitive** and what's not
2. **Validating that AI doesn't break critical things** (always human-in-the-loop at the start)
3. **Measuring before and after** with real numbers
4. **Iterating fast** — ugly v1 that runs > perfect v10 on a board

If you have an e-commerce or a business with repetitive tasks, **start with one thing**. The one that eats the most of your time. Do it well. Then move on to the next.

This client's flows are documented in [my n8n templates repo](https://github.com/Rene-Kuhm) — you can clone and adapt them.

---

*René Kuhm · TecnoDespegue · AI automation in production*