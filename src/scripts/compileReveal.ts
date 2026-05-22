import { TERMINAL_LINES } from './heroScript';

export async function compilePhases(element: HTMLElement, lines: string[] = TERMINAL_LINES) {
  const minDelay = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--compile-delay-min')) || 200;
  const maxDelay = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--compile-delay-max')) || 600;
  
  const phases = [
    { label: 'importando', class: 'phase-import' },
    { label: 'compilando', class: 'phase-compile' },
    { label: 'optimizando', class: 'phase-optimize' },
    { label: 'listo', class: 'phase-ready' }
  ];

  for (const phase of phases) {
    // Update element text and class
    element.textContent = `> ${phase.label}`;
    element.className = `compile-phase ${phase.class}`;
    
    // Add line to terminal if available
    if (lines.length > 0) {
      const lineElement = document.createElement('div');
      lineElement.className = `terminal-line ${phase.class}`;
      lineElement.textContent = lines.shift() || '';
      element.parentElement?.appendChild(lineElement);
    }
    
    // Wait for random delay between min and max
    await new Promise(resolve => {
      setTimeout(resolve, Math.random() * (maxDelay - minDelay) + minDelay);
    });
  }
}