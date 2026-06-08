import { typeWriter } from './heroScript';

// Cache CSS variable values ONCE at module load to completely avoid recurring 
// 'getComputedStyle' forced synchronous layouts (reflows) inside IntersectionObserver.
let minDelay = 200;
let maxDelay = 600;

if (typeof window !== 'undefined') {
  try {
    const computed = getComputedStyle(document.documentElement);
    minDelay = parseInt(computed.getPropertyValue('--compile-delay-min')) || 200;
    maxDelay = parseInt(computed.getPropertyValue('--compile-delay-max')) || 600;
  } catch (e) {
    // Fail-safe fallback values remain
  }
}

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
  const locale = container.getAttribute('data-locale') || 'es';
  
  // Calculate dynamic random duration using pre-cached variables
  const compileDuration = Math.round(Math.random() * (maxDelay - minDelay) + minDelay);

  // Full import text to type
  const fullText = locale === 'en'
    ? `> importing { ${sectionName} } from '${importPath}'`
    : `> importando { ${sectionName} } desde '${importPath}'`;

  // --- Phase 1: Terminal Import typing ---
  // typeWriter synchronously clears and populates the text with invisible spans 
  // preventing layout shifts (CLS) on section mount.
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
  badgeContainer.innerHTML = `
    <div class="compile-badge">
      <span class="compile-text">✓ ${locale === 'en' ? 'compiled in' : 'compilado en'} ${compileDuration}ms</span>
    </div>
  `;
  badgeContainer.classList.remove('hidden');
}
