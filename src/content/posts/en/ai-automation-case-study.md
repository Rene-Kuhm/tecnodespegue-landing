---
title: "AI Automation: how I cut 40 hours a week down to 4"
description: "Real pipeline for extraction, classification, and automatic response with Python, OpenAI, and n8n. Numbers included."
date: 2025-04-28
author: "René Kuhm"
category: "Automation"
tags: ["ai", "automation", "n8n", "python", "productivity"]
readTime: 6
featured: false
image: "/og-image-en.png"
locale: en
seo:
  title: "AI Automation: from 40 to 4 hours per week — Real case"
  description: "How I built an AI pipeline that processes leads, replies to emails, and generates reports automatically. Real 36-hour weekly savings."
---

# AI Automation: how I cut 40 hours a week down to 4

Eighteen months ago, a recruiting consultancy in Buenos Aires hired me to "write a few scripts." We ended up replacing two full-time positions with a system that runs 24/7.

This is the real case, with numbers, tools, and the mistakes we made.

## The problem before automation

The consultancy received:

- **~500 emails daily** from candidates with attached CVs
- **120 WhatsApp messages** from clients asking for updates
- **40 interview requests** via LinkedIn
- **3 weekly reports** done manually in Excel for each client

Three people spent **40 hours a week** on tasks that were 90% classification, extraction, and formatting.

## The final architecture

```
Inputs (Email, WhatsApp, LinkedIn)
    ↓
[n8n] Trigger + Normalization
    ↓
[Python] Data extraction with LLM
    ↓
[Supabase] Storage + classification
    ↓
[n8n] Decision tree + Actions
    ↓
Outputs (Auto email, Notification, Report)
```

## Step 1: Ingestion and normalization with n8n

n8n (self-hosted on Railway) connects:

- **IMAP** for Gmail and Outlook emails
- **WhatsApp Business API** via 360dialog
- **LinkedIn** via API + PhantomBuster webhooks

Each input is normalized to a standard JSON:

```json
{
  "source": "email",
  "sender": "juan@example.com",
  "raw_content": "...",
  "attachments": ["cv_juan.pdf"],
  "timestamp": "2025-04-15T10:30:00Z"
}
```

**Mistake we made**: we tried to process PDFs directly in n8n. It's slow and expensive. The solution was to save the file to S3, send the URL to a Python function, and have the workflow continue via webhook.

## Step 2: Structured extraction with LLM

We use **OpenAI GPT-4o-mini** via API. It's not the largest model; for structured extraction you don't need more.

Prompt template (simplified):

```python
system_prompt = """
Extract CV information into this JSON schema:
- name: string
- email: string
- phone: string
- years_experience: number
- technologies: string[]
- seniority: "junior" | "mid" | "senior" | "lead"
- availability: "immediate" | "1_month" | "3_months"

If information is missing, use null. Don't make up data.
"""
```

**Real cost**: ~USD 0.003 per CV processed. With 500 CVs daily = **USD 4.50/day**.

Compared to a junior analyst (USD 1,200/month), ROI is reached by day 5.

## Step 3: Classification and routing

Once structured, candidates are classified:

| Score | Action |
|-------|--------|
| > 85% match | Automatic email to candidate + recruiter notification |
| 60-85% | Save to manual shortlist for review |
| < 60% | Automatic thank-you email + generic feedback |

The match criterion comes from a job description parsed with the same LLM.

## Step 4: Automatic reports

Every Friday at 6:00 PM, n8n triggers:

1. Query Supabase for the week's candidates
2. Aggregation with Python (pandas + jinja2)
3. PDF generation with **Playwright + HTML template**
4. Email to each client with recommended candidates

**Previous time**: 3 hours per client × 12 clients = 36 hours/week.
**Current time**: 0 hours. The system hasn't failed in 8 months.

## The 3 things we didn't automate

Not everything should be automatic. We left these out of the pipeline:

1. **Technical interviews**: AI evaluates code, but not cultural fit
2. **Salary negotiation**: requires human judgment and emotional context
3. **Formal complaints**: an automated angry email makes everything worse

## Stack and real monthly costs

| Service | Cost/month | Role |
|----------|-----------|-----|
| n8n (Railway) | USD 19 | Orchestration |
| OpenAI API | USD 135 | Extraction + classification |
| Supabase | USD 25 | Database + Auth |
| S3 (R2) | USD 8 | CVs + reports |
| PhantomBuster | USD 48 | LinkedIn scraping |
| 360dialog | USD 55 | WhatsApp API |
| **Total** | **USD 290** | |

Replaces **USD 2,400/month** in salaries + **36 hours/week** of a founder.

## Start today: automation MVP in 48 hours

If you want to prototype fast:

1. **n8n cloud** (free up to 5 workflows)
2. **Zapier or Make** if you don't know code
3. **OpenAI API** with simple prompts
4. **Google Sheets** as a temporary database

Start with ONE single flow that bothers you. Don't try to automate everything at once.

## Conclusion

AI doesn't replace recruiters. It replaces **manual classification, copy-paste from Excel, and waiting for someone to read an email**.

The 36 recovered hours are used in quality interviews, client negotiation, and growth strategy.

Want to see if your workflow can be automated? [Get in touch](/#contact) and in 15 minutes we'll tell you which parts have positive ROI.