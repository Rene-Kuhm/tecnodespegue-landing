/**
 * build-favicons.mjs
 *
 * Genera un monograma TD vectorial estilo Marvel y exporta
 * todos los tamaños de favicon (16, 32, 96, 180, 192, 512) + .ico.
 *
 * Diseño:
 * - Cuadrado redondeado con fondo negro #0A0A0A
 * - "T" roja (#ED1D24) y "D" con detalle dorado (#F8B400)
 * - Glow rojo sutil alrededor del monograma
 * - Bold condensed estilo Space Grotesk Display / Big Shoulders
 * - Legible a 16x16 (sin detalles finos)
 */

const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const OUT = './public';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// SVG del monograma TD — 64x64 viewBox para escalado limpio
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF3B47"/>
      <stop offset="100%" stop-color="#B01418"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE699"/>
      <stop offset="50%" stop-color="#F8B400"/>
      <stop offset="100%" stop-color="#C5A572"/>
    </linearGradient>
    <filter id="redGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" result="red"/>
      <feMerge>
        <feMergeNode in="red"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="0" y="0" width="64" height="64" rx="12" fill="#0A0A0A"/>
  <rect x="2" y="2" width="60" height="60" rx="10" fill="none" stroke="#ED1D24" stroke-width="0.6" stroke-opacity="0.25"/>
  <g filter="url(#redGlow)">
    <rect x="8" y="13" width="22" height="5" fill="url(#redGrad)" rx="0.6"/>
    <rect x="16" y="13" width="6" height="32" fill="url(#redGrad)" rx="0.6"/>
    <rect x="30" y="13" width="6" height="32" fill="url(#redGrad)" rx="0.6"/>
    <path d="M 36 13 L 44 13 Q 54 13 54 29 Q 54 45 44 45 L 36 45 Z" fill="url(#redGrad)"/>
    <path d="M 36 19 L 43 19 Q 48 19 48 29 Q 48 39 43 39 L 36 39 Z" fill="#0A0A0A"/>
    <rect x="22" y="29" width="32" height="2.2" fill="url(#goldGrad)" transform="rotate(-12 22 29)"/>
  </g>
  <circle cx="52" cy="52" r="1.6" fill="url(#goldGrad)"/>
</svg>`;

fs.writeFileSync(path.join(OUT, 'favicon.svg'), svg.trim(), 'utf-8');
console.log('✓ favicon.svg written');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
];

(async () => {
  const buf = Buffer.from(svg);

  for (const { name, size } of sizes) {
    await sharp(buf)
      .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, name));
    console.log(`✓ ${name} (${size}x${size})`);
  }

  // OG image 1200x630 con el monograma centrado (extended para aspect ratio social)
  const ogSquare = await sharp(buf)
    .resize(450, 450, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .extend({ top: 90, bottom: 90, left: 375, right: 375, background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png()
    .toBuffer();
  await sharp(ogSquare)
    .resize(1200, 630, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'og-image.png'));
  console.log('✓ og-image.png (1200x630)');

  // .ico multi-resolución (16 + 32 + 48)
  const ico16 = await sharp(buf).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(buf).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(buf).resize(48, 48).png().toBuffer();

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(3, 4);

  const entries = [];
  let offset = 6 + (16 * 3);
  for (const [img, size] of [[ico16, 16], [ico32, 32], [ico48, 48]]) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size, 0);
    e.writeUInt8(size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(img.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += img.length;
  }

  const ico = Buffer.concat([header, ...entries, ico16, ico32, ico48]);
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), ico);
  console.log('✓ favicon.ico (16+32+48)');

  console.log('\nAll favicons generated.');
})();
