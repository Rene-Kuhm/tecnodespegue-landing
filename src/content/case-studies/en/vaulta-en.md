---
locale: en
translationKey: vaulta
routeSlug: vaulta
title: "Vaulta"
eyebrow: "Cross-platform local security"
description: "An offline-first password manager for Android and Windows with encrypted storage and downloadable releases."
status: "Public source and releases"
role: "Architecture, application security, and cross-platform development"
stack: ["Flutter", "Dart", "Argon2id", "AES-256-GCM", "Android", "Windows"]
evidence:
  - "Applications for Android and Windows."
  - "Key derivation with Argon2id and authenticated AES-256-GCM encryption."
  - "Biometric unlock on Android."
  - "Optional Windows Hello integration."
  - "Public source code and downloadable releases."
limitations:
  - "Vaulta has not undergone an external cryptographic audit."
  - "Biometric mechanisms depend on device and operating-system support."
repositoryUrl: "https://github.com/Rene-Kuhm/vaulta"
releaseUrl: "https://github.com/Rene-Kuhm/vaulta/releases"
featured: true
seo:
  title: "Vaulta: a local security case study"
  description: "Vaulta architecture for Android and Windows using Argon2id, AES-256-GCM, biometrics, and public releases."
---

## The problem

A password manager must protect sensitive data without making connectivity a requirement. Vaulta was designed around an offline-first premise: credentials stay under the device owner's control and the encrypted format must detect modification.

## The solution

The application derives keys with Argon2id and protects content with AES-256-GCM. Android supports biometric unlock, while Windows can integrate with Windows Hello when the system supports it. The product is distributed for both platforms through public releases.

## Security decisions

- **Authenticated encryption:** AES-256-GCM protects confidentiality and integrity.
- **Hardened derivation:** Argon2id strengthens the key derived from the master password.
- **Biometrics for convenience:** operating-system unlock complements the model; it does not replace vault encryption.
- **Transparency:** published source and binaries allow people to inspect the implementation and try the product.

## Important limitation

Vaulta is not described as immune to vulnerabilities. The project has not undergone an external cryptographic audit, and that limitation belongs in any risk assessment.
