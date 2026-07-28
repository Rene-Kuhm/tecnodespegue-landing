---
locale: en
translationKey: flow-engineering
routeSlug: flow-engineering
title: "Flow Engineering"
eyebrow: "Engineering platform"
description: "An open source system for directing engineering work with structured context, verifiable specifications, and drift signals."
status: "Public source & case study · version 1.3.0"
role: "Architecture, implementation, and technical governance"
stack: ["Python", "CLI", "MCP", "SDD", "Engram", "GitHub Actions"]
repositoryUrl: "https://github.com/Rene-Kuhm/flow-engineering"
evidence:
  - "544 commits verified at 4be4db7."
  - "Python package 1.3.0 with a CLI and optional MCP server."
  - "State machine, drift detection, and deterministic snapshots."
  - "Engram memory bridge and prompt registry."
  - "CI on Python 3.12 and 3.13 with Ruff, security analysis, mypy, and pytest."
  - "80% minimum coverage threshold."
limitations:
  - "Internal tooling project for AI-assisted development; it does not expose commercial metrics or client outcomes."
  - "The facts describe the verified state at commit 4be4db7, not an independent benchmark."
featured: true
seo:
  title: "Flow Engineering: an SDD platform case study"
  description: "Verified architecture and evidence for Flow Engineering: CLI, MCP, drift detection, snapshots, Engram memory, and CI."
---

## The problem

Agents and teams lose quality when decisions, specifications, and the real state of the code live in separate places. The goal was to build an engineering layer that kept those elements connected and detected when implementation moved away from the agreed context.

## The solution

Flow Engineering organizes work as an explicit flow. A state machine governs progress, deterministic snapshots make runs comparable, and drift detection flags divergence. The CLI is the primary interface; MCP extends integration without becoming a required dependency.

## Architecture decisions

- **Core before interface:** state and verification logic do not depend on MCP.
- **Reproducible results:** deterministic snapshots reduce ambiguity between runs.
- **Bounded memory:** the Engram bridge preserves context while the prompt registry exposes the instructions governing each operation.
- **Quality as a gate:** typing, linting, security, tests, and coverage run in CI across two Python versions.

## What it demonstrates

This project demonstrates systems design, developer tooling, and operational discipline. It is not presented as a commercial success story: the available evidence covers the repository's structure and verification.
