---
locale: es
translationKey: vaulta
routeSlug: vaulta
title: "Vaulta"
eyebrow: "Seguridad local multiplataforma"
description: "Gestor de contraseñas offline-first para Android y Windows, con almacenamiento cifrado y releases descargables."
status: "Código y releases públicos"
role: "Arquitectura, seguridad de aplicación y desarrollo multiplataforma"
stack: ["Flutter", "Dart", "Argon2id", "AES-256-GCM", "Android", "Windows"]
evidence:
  - "Aplicaciones para Android y Windows."
  - "Derivación de claves con Argon2id y cifrado autenticado AES-256-GCM."
  - "Desbloqueo biométrico en Android."
  - "Integración opcional con Windows Hello."
  - "Código fuente y releases descargables disponibles públicamente."
limitations:
  - "Vaulta no cuenta con una auditoría criptográfica externa."
  - "La disponibilidad de mecanismos biométricos depende del dispositivo y del sistema operativo."
repositoryUrl: "https://github.com/Rene-Kuhm/vaulta"
releaseUrl: "https://github.com/Rene-Kuhm/vaulta/releases"
featured: true
seo:
  title: "Vaulta: caso de estudio de seguridad local"
  description: "Arquitectura de Vaulta para Android y Windows con Argon2id, AES-256-GCM, biometría y releases públicas."
---

## El problema

Un gestor de contraseñas debe proteger datos sensibles sin convertir la conectividad en un requisito. Vaulta fue diseñado con una premisa offline-first: las credenciales permanecen bajo control del dispositivo y el formato cifrado debe detectar cualquier modificación.

## La solución

La aplicación deriva claves con Argon2id y protege el contenido mediante AES-256-GCM. Android incorpora desbloqueo biométrico y Windows puede integrarse con Windows Hello cuando el sistema lo permite. El mismo producto se distribuye para ambas plataformas mediante releases públicas.

## Decisiones de seguridad

- **Cifrado autenticado:** AES-256-GCM protege confidencialidad e integridad.
- **Derivación resistente:** Argon2id endurece la clave derivada de la contraseña maestra.
- **Biometría como conveniencia:** el desbloqueo del sistema complementa el modelo, no reemplaza el cifrado del vault.
- **Transparencia:** el código y los binarios publicados permiten revisar la implementación y probar el producto.

## Límite importante

No se afirma que Vaulta sea inmune a vulnerabilidades. El proyecto no ha recibido una auditoría criptográfica externa; esa limitación debe formar parte de cualquier evaluación de riesgo.
