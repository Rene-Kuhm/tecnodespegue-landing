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

  // Pre-initialize ALL steps to prevent layout shifts (CLS)!
  // We synchronously clear and populate each target with invisible spans immediately 
  // so that they preserve their layout space and never collapse the container height.
  const initializedSteps = steps.map(step => {
    const { element, text } = step;
    
    // Clear initial content
    element.textContent = '';
    
    // Populate with opacity: 0 character spans
    const spans = text.split('').map(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '0';
      element.appendChild(span);
      return span;
    });

    return { element, text, spans };
  });

  let stepIndex = 0;

  function runStep() {
    if (stepIndex < initializedSteps.length) {
      const { spans, text } = initializedSteps[stepIndex];
      let charIndex = 0;
      const maxChunkSize = text.length > 40 ? 3 : 1;

      function type() {
        if (charIndex < spans.length) {
          const chunkSize = Math.min(maxChunkSize, spans.length - charIndex);

          for (let c = 0; c < chunkSize; c++) {
            const span = spans[charIndex + c];
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
          // Finished this step, proceed to the next after minimal delay
          stepIndex++;
          setTimeout(runStep, 100);
        }
      }

      // Start sequential typing
      type();
    } else if (finalCallback) {
      finalCallback();
    }
  }

  runStep();
}