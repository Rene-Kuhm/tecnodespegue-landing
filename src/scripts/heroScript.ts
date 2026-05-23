export const TERMINAL_LINES = [
  "importando {Nombre} desde '@components'",
  "importando {Botón} desde '@components'",
  "importando {Card} desde '@components'"
];

export function typeWriter(
  target: HTMLElement | { element: HTMLElement; text: string }[],
  textOrCallback?: string | (() => void),
  callback?: () => void
) {
  let steps: { element: HTMLElement; text: string }[] = [];
  let finalCallback: (() => void) | undefined = undefined;

  if (Array.isArray(target)) {
    steps = target;
    if (typeof textOrCallback === 'function') {
      finalCallback = textOrCallback;
    }
  } else {
    steps = [{ element: target, text: typeof textOrCallback === 'string' ? textOrCallback : '' }];
    finalCallback = callback;
  }

  let stepIndex = 0;

  function runStep() {
    if (stepIndex < steps.length) {
      const { element, text } = steps[stepIndex];
      // Clear initial content of this element
      element.textContent = '';
      
      let charIndex = 0;
      const maxChunkSize = text.length > 40 ? 3 : 1;

      function type() {
        if (charIndex < text.length) {
          // Calculate chunk size, but don't exceed remaining characters
          const chunkSize = Math.min(maxChunkSize, text.length - charIndex);
          const nextChunk = text.substring(charIndex, charIndex + chunkSize);

          for (const char of nextChunk) {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.opacity = '0';
            element.appendChild(span);

            // Animate opacity using Web Animations API
            span.animate(
              [
                { opacity: 0 },
                { opacity: 1 }
              ],
              {
                duration: 40,
                fill: 'forwards'
              }
            );
          }

          charIndex += chunkSize;
          requestAnimationFrame(type);
        } else {
          // Move to next step
          stepIndex++;
          // Minimal delay between elements for natural feel
          setTimeout(runStep, 100);
        }
      }

      // Start typing this step
      type();
    } else if (finalCallback) {
      finalCallback();
    }
  }

  // Start sequential typing
  runStep();
}