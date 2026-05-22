export const TERMINAL_LINES = [
  "importando {Nombre} desde '@components'",
  "importando {Botón} desde '@components'",
  "importando {Card} desde '@components'"
];

export function typeWriter(element: HTMLElement, text: string, callback?: () => void) {
  const maxChunkSize = text.length > 40 ? 3 : 1;
  let i = 0;

  function type() {
    if (i < text.length) {
      // Calculate chunk size, but don't exceed remaining characters
      const chunkSize = Math.min(maxChunkSize, text.length - i);
      const nextChunk = text.substring(i, i + chunkSize);
      
      // Use Web Animations API for each character in the chunk
      for (const char of nextChunk) {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        element.appendChild(span);
        
        // Animate the opacity with a slight stagger
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
      
      i += chunkSize;
      requestAnimationFrame(type);
    } else if (callback) {
      callback();
    }
  }

  // Start typing after a brief delay
  setTimeout(type, 500);
}