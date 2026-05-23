import { typeWriter } from './heroScript';

export function initCompileReveals() {
  const containers = document.querySelectorAll('.compile-container');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -15% 0px' // Triggers when 15% from bottom of viewport
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const container = entry.target as HTMLElement;
        if (!container.classList.contains('started')) {
          container.classList.add('started');
          runCompileSequence(container);
        }
        observer.unobserve(container);
      }
    });
  }, observerOptions);

  containers.forEach((container) => {
    observer.observe(container);
  });
}

async function runCompileSequence(container: HTMLElement) {
  // 1. Get elements
  const terminalText = container.querySelector('.terminal-type-target') as HTMLElement;
  const progressBar = container.querySelector('.progress-bar') as HTMLElement;
  const revealContent = container.querySelector('.reveal-content') as HTMLElement;
  const badgeContainer = container.querySelector('.badge-container') as HTMLElement;

  if (!terminalText || !progressBar || !revealContent || !badgeContainer) return;

  // 2. Setup variables
  const sectionName = container.getAttribute('data-section') || '';
  const importPath = container.getAttribute('data-import') || '';
  
  // Calculate dynamic random duration (200ms - 600ms)
  const minDelay = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--compile-delay-min')) || 200;
  const maxDelay = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--compile-delay-max')) || 600;
  const compileDuration = Math.round(Math.random() * (maxDelay - minDelay) + minDelay);

  // Full import text to type
  const fullText = `> importando { ${sectionName} } desde '${importPath}'`;
  terminalText.textContent = ''; // Clear initial SSR text for typing

  // --- Phase 1: Terminal Import typing ---
  await new Promise<void>((resolve) => {
    typeWriter(terminalText, fullText, () => {
      resolve();
    });
  });

  // Small pause after typing
  await new Promise((resolve) => setTimeout(resolve, 100));

  // --- Phase 2: Progress bar ---
  progressBar.style.animation = `compile-progress ${compileDuration}ms linear forwards`;
  progressBar.style.transformOrigin = 'left';
  
  await new Promise((resolve) => setTimeout(resolve, compileDuration + 100));

  // --- Phase 3: Content Mount ---
  revealContent.classList.remove('pointer-events-none');
  revealContent.style.transition = 'opacity 500ms ease-out, transform 500ms cubic-bezier(0.16, 1, 0.3, 1)';
  revealContent.style.opacity = '1';
  revealContent.style.transform = 'scale(1)';

  await new Promise((resolve) => setTimeout(resolve, 350));

  // --- Phase 4: Confirmation Badge pop ---
  // Generate the badge element dynamically inside the container
  badgeContainer.innerHTML = `
    <div class="compile-badge">
      <span class="compile-text">✓ compilado en ${compileDuration}ms</span>
    </div>
  `;
  badgeContainer.classList.remove('hidden');
}