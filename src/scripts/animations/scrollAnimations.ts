/**
 * scrollAnimations.ts
 * Animaciones de entrada triggered por scroll usando GSAP ScrollTrigger.
 * Se integra con Lenis (smooth scroll bridge ya configurado en lenis.ts).
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Revelación staggered genérica para un grupo de hijos */
export function revealStagger(
  container: Element | string,
  childSelector: string,
  options: {
    y?: number; x?: number; scale?: number; opacity?: number;
    duration?: number; stagger?: number; delay?: number; ease?: string; start?: string;
  } = {}
) {
  const {
    y = 60, x = 0, scale = 1, opacity = 0,
    duration = 0.8, stagger = 0.12, delay = 0,
    ease = 'power3.out', start = 'top 82%',
  } = options;

  const targets = typeof container === 'string'
    ? document.querySelectorAll(container)
    : container instanceof NodeList || Array.isArray(container)
      ? container
      : [container];

  return gsap.fromTo(
    targets,
    { y, x, scale, opacity },
    {
      y: 0, x: 0, scale: 1, opacity: 1,
      duration, stagger, delay, ease,
      scrollTrigger: {
        trigger: typeof container === 'string' ? container : (container as Element),
        start,
        toggleActions: 'play none none none',
      },
    }
  );
}

/** Revelación simple de un solo elemento */
export function revealElement(
  target: Element | string,
  options: {
    y?: number; x?: number; opacity?: number;
    duration?: number; delay?: number; ease?: string; start?: string;
  } = {}
) {
  const {
    y = 40, x = 0, opacity = 0,
    duration = 0.9, delay = 0,
    ease = 'power3.out', start = 'top 85%',
  } = options;

  return gsap.fromTo(
    target,
    { y, x, opacity },
    {
      y: 0, x: 0, opacity: 1,
      duration, delay, ease,
      scrollTrigger: {
        trigger: target as Element,
        start,
        toggleActions: 'play none none none',
      },
    }
  );
}

/** Inicializa todas las animaciones de scroll de la página */
export function initScrollAnimations() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Services ──────────────────────────────────────────────────────────────
  const servicesSection = document.querySelector('#soluciones');
  if (servicesSection) {
    const kicker = servicesSection.querySelector('.kicker');
    const titleLines = servicesSection.querySelectorAll('.services-title-line');
    const lead = servicesSection.querySelector('.services-lead');
    const burst = servicesSection.querySelector('.services-burst');
    const cards = servicesSection.querySelectorAll('[data-svc-card]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: servicesSection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (kicker) tl.fromTo(kicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    if (titleLines.length) tl.fromTo(titleLines, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, 0.1);
    if (lead) tl.fromTo(lead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.25);
    if (burst) tl.fromTo(burst, { opacity: 0, scale: 0.5, rotate: -15 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }, 0.35);
    if (cards.length) {
      tl.fromTo(cards, { opacity: 0, y: 70, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out' }, 0.45);
    }
  }

  // ── Portfolio ─────────────────────────────────────────────────────────────
  const portfolioSection = document.querySelector('#portfolio');
  if (portfolioSection) {
    const pKicker = portfolioSection.querySelector('.kicker');
    const pTitle = portfolioSection.querySelector('.port-title');
    const pLead = portfolioSection.querySelector('.port-lead');
    const pCards = portfolioSection.querySelectorAll('[data-port-card]');

    const pTl = gsap.timeline({
      scrollTrigger: {
        trigger: portfolioSection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (pKicker) pTl.fromTo(pKicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    if (pTitle) pTl.fromTo(pTitle, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    if (pLead) pTl.fromTo(pLead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
    if (pCards.length) {
      pTl.fromTo(pCards, { opacity: 0, y: 60, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.13, ease: 'power3.out' }, 0.3);
    }
  }

  // ── Tech Stack ─────────────────────────────────────────────────────────────
  const techSection = document.querySelector('#stack');
  if (techSection) {
    const tKicker = techSection.querySelector('.kicker');
    const tTitle = techSection.querySelector('.tech-title');
    const tCells = techSection.querySelectorAll('.tech-cell');
    const tCallout = techSection.querySelector('.tech-callout');

    const tTl = gsap.timeline({
      scrollTrigger: {
        trigger: techSection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (tKicker) tTl.fromTo(tKicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    if (tTitle) tTl.fromTo(tTitle, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    if (tCells.length) tTl.fromTo(tCells, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(1.4)' }, 0.2);
    if (tCallout) tTl.fromTo(tCallout, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4);
  }

  // ── Why Us ────────────────────────────────────────────────────────────────
  const whySection = document.querySelector('#proceso');
  if (whySection) {
    const wKicker = whySection.querySelector('.kicker');
    const wTitle = whySection.querySelector('.why-title');
    const wLead = whySection.querySelector('.why-lead');
    const wConsole = whySection.querySelector('.why-console');
    const wItems = whySection.querySelectorAll('.why-item');

    const wTl = gsap.timeline({
      scrollTrigger: {
        trigger: whySection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (wKicker) wTl.fromTo(wKicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    if (wTitle) wTl.fromTo(wTitle, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    if (wLead) wTl.fromTo(wLead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
    if (wConsole) wTl.fromTo(wConsole, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.3);
    if (wItems.length) wTl.fromTo(wItems, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 0.5);
  }

  // ── Refactor ──────────────────────────────────────────────────────────────
  const refactorSection = document.querySelector('#optimizacion');
  if (refactorSection) {
    const rKicker = refactorSection.querySelector('.kicker');
    const rTitle = refactorSection.querySelector('.refactor-title');
    const rLead = refactorSection.querySelector('.refactor-lead');
    const rScanline = refactorSection.querySelector('.refactor-sim-scan');
    const rCols = refactorSection.querySelectorAll('.refactor-sim-col');

    const rTl = gsap.timeline({
      scrollTrigger: {
        trigger: refactorSection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (rKicker) rTl.fromTo(rKicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    if (rTitle) rTl.fromTo(rTitle, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    if (rLead) rTl.fromTo(rLead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
    if (rScanline) rTl.fromTo(rScanline, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3);
    if (rCols.length) rTl.fromTo(rCols, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }, 0.35);
  }

  // ── CTA ────────────────────────────────────────────────────────────────────
  const ctaSection = document.querySelector('#contacto');
  if (ctaSection) {
    const cKicker = ctaSection.querySelector('.kicker');
    const cTitle = ctaSection.querySelector('.cta-title');
    const cBoom = ctaSection.querySelector('.cta-burst');
    const cLead = ctaSection.querySelector('.cta-lead');
    const cForm = ctaSection.querySelector('.cta-form-wrap');
    const cCtas = ctaSection.querySelectorAll('.cta-btn');

    const cTl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaSection,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    if (cKicker) cTl.fromTo(cKicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    if (cTitle) cTl.fromTo(cTitle, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
    if (cBoom) cTl.fromTo(cBoom, { opacity: 0, scale: 0.5, rotate: -10 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }, 0.25);
    if (cLead) cTl.fromTo(cLead, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.35);
    if (cForm) cTl.fromTo(cForm, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.45);
    if (cCtas.length) cTl.fromTo(cCtas, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' }, 0.55);
  }

  // ── Trust Signals ───────────────────────────────────────────────────────────
  const trustSection = document.querySelector('[data-trust]');
  if (trustSection) {
    const stats = trustSection.querySelectorAll('[data-trust-stat]');
    const chips = trustSection.querySelectorAll('.trust-chip');

    if (stats.length) {
      gsap.fromTo(
        stats,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: trustSection, start: 'top 82%', toggleActions: 'play none none none' },
        }
      );
    }
    if (chips.length) {
      gsap.fromTo(
        chips,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: trustSection, start: 'top 82%', toggleActions: 'play none none none' },
        }
      );
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footer = document.querySelector('footer');
  if (footer) {
    gsap.fromTo(
      footer,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: footer, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  }
}