/**
 * favicon-preview.mjs (CommonJS)
 * Genera un preview compuesto mostrando el favicon
 * a distintos tamaños lado a lado + en contexto de browser tab.
 */

const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const OUT = './docs';

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16, label: '16x16' },
    { name: 'favicon-32x32.png', size: 32, label: '32x32' },
    { name: 'favicon-96x96.png', size: 96, label: '96x96' },
    { name: 'apple-touch-icon.png', size: 180, label: '180x180' },
    { name: 'web-app-manifest-192x192.png', size: 192, label: '192x192' },
    { name: 'web-app-manifest-512x512.png', size: 512, label: '512x512' },
  ];

  // Crear un canvas de preview 1600x800
  const canvas = sharp({
    create: { width: 1600, height: 800, channels: 4, background: { r: 14, g: 14, b: 18, alpha: 1 } }
  });

  const composites = [];
  let xPos = 60;
  const yPos = 200;

  for (const { name, size, label } of sizes) {
    const buf = await sharp(path.join('./public', name))
      .resize(size, size)
      .toBuffer();
    composites.push({
      input: buf,
      top: yPos,
      left: xPos,
    });
    xPos += size + 60;
  }

  await canvas
    .composite(composites)
    .png()
    .toFile(path.join(OUT, 'favicon-sizes.png'));
  console.log('✓ favicon-sizes.png written');

  // Crear preview de browser tab (simulación)
  const tabSim = await sharp({
    create: { width: 1400, height: 480, channels: 4, background: { r: 32, g: 33, b: 36, alpha: 1 } }
  });

  // 4 tabs simulados
  const tabFavicons = ['favicon-16x16.png', 'favicon-16x16.png', 'favicon-16x16.png', 'favicon-16x16.png'];
  const tabComposites = [];
  for (let i = 0; i < 4; i++) {
    const favBuf = await sharp(path.join('./public', tabFavicons[i]))
      .resize(16, 16)
      .toBuffer();
    // Cada tab es un rectángulo con esquinas redondeadas simuladas (color del tab)
    const tabBg = await sharp({
      create: { width: 280, height: 36, channels: 4, background: { r: 50, g: 51, b: 56, alpha: 1 } }
    })
      .composite([{ input: favBuf, top: 10, left: 12 }])
      .png()
      .toBuffer();
    tabComposites.push({
      input: tabBg,
      top: 30,
      left: 30 + i * 290,
    });
  }

  await tabSim
    .composite(tabComposites)
    .png()
    .toFile(path.join(OUT, 'favicon-tab-preview.png'));
  console.log('✓ favicon-tab-preview.png written');
})();
