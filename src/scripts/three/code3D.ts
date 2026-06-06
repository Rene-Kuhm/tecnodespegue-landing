/**
 * Code3D.ts
 * Escena Three.js con líneas de código (syntax-highlighted) flotando en 3D
 * dentro del área del monitor. Líneas de código con colors por token (kw, fn, var, str).
 * Orbitan lentamente, parallax con mouse, rotan con scroll.
 *
 * - ~30-50 líneas visibles
 * - Material con additive blending + glow
 * - Tamaño de fuente auto-scaling con viewport
 */

import * as THREE from 'three';

interface CodeLine {
  tokens: { text: string; type: 'kw' | 'fn' | 'var' | 'str' | 'comment' | 'plain' }[];
}

const SAMPLE_CODE: CodeLine[] = [
  { tokens: [{ text: '// tecnoDespegue/engine', type: 'comment' }] },
  { tokens: [{ text: 'import', type: 'kw' }, { text: ' {', type: 'plain' }, { text: 'pipeline', type: 'var' }, { text: '} ', type: 'plain' }, { text: 'from', type: 'kw' }, { text: " '", type: 'plain' }, { text: '@core/deploy', type: 'str' }, { text: "'", type: 'str' }] },
  { tokens: [{ text: 'import', type: 'kw' }, { text: ' {', type: 'plain' }, { text: 'AI', type: 'var' }, { text: '} ', type: 'plain' }, { text: 'from', type: 'kw' }, { text: " '", type: 'plain' }, { text: '@core/agents', type: 'str' }, { text: "'", type: 'str' }] },
  { tokens: [{ text: '', type: 'plain' }] },
  { tokens: [{ text: 'const', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'stack', type: 'var' }, { text: ' = [', type: 'plain' }] },
  { tokens: [{ text: "  '", type: 'plain' }, { text: 'TypeScript', type: 'str' }, { text: "', '", type: 'plain' }, { text: 'React', type: 'str' }, { text: "', '", type: 'plain' }, { text: 'Node', type: 'str' }, { text: "'", type: 'str' }] },
  { tokens: [{ text: "  '", type: 'plain' }, { text: 'Next.js', type: 'str' }, { text: "', '", type: 'plain' }, { text: 'Astro', type: 'str' }, { text: "', '", type: 'plain' }, { text: 'Python', type: 'str' }, { text: "'", type: 'str' }] },
  { tokens: [{ text: ']', type: 'plain' }] },
  { tokens: [{ text: '', type: 'plain' }] },
  { tokens: [{ text: 'export', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'async', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'function', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'ship', type: 'fn' }, { text: '(', type: 'plain' }, { text: 'idea', type: 'var' }, { text: ': ', type: 'plain' }, { text: 'Idea', type: 'var' }, { text: ') {', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'const', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'plan', type: 'var' }, { text: ' = ', type: 'plain' }, { text: 'await', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'AI', type: 'var' }, { text: '.', type: 'plain' }, { text: 'architect', type: 'fn' }, { text: '(', type: 'plain' }, { text: 'idea', type: 'var' }, { text: ')', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'const', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'app', type: 'var' }, { text: ' = ', type: 'plain' }, { text: 'await', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'pipeline', type: 'var' }, { text: '.', type: 'plain' }, { text: 'build', type: 'fn' }, { text: '(', type: 'plain' }, { text: 'plan', type: 'var' }, { text: ', ', type: 'plain' }, { text: 'stack', type: 'var' }, { text: ')', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'return', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'await', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'pipeline', type: 'var' }, { text: '.', type: 'plain' }, { text: 'deploy', type: 'fn' }, { text: '(', type: 'plain' }, { text: 'app', type: 'var' }, { text: ')', type: 'plain' }] },
  { tokens: [{ text: '}', type: 'plain' }] },
  { tokens: [{ text: '', type: 'plain' }] },
  { tokens: [{ text: '// ', type: 'comment' }, { text: '→ 84 tests passed', type: 'comment' }] },
  { tokens: [{ text: '// ', type: 'comment' }, { text: '→ deployed to edge', type: 'comment' }] },
  { tokens: [{ text: '// ', type: 'comment' }, { text: '→ cache purged', type: 'comment' }] },
  { tokens: [{ text: '// ', type: 'comment' }, { text: '→ health: 200 OK', type: 'comment' }] },
  { tokens: [{ text: '', type: 'plain' }] },
  { tokens: [{ text: 'const', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'metrics', type: 'var' }, { text: ' = {', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'uptime', type: 'var' }, { text: ': ', type: 'plain' }, { text: "'99.9%'", type: 'str' }, { text: ',', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'p95', type: 'var' }, { text: ': ', type: 'plain' }, { text: "'87ms'", type: 'str' }, { text: ',', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'errors', type: 'var' }, { text: ': ', type: 'plain' }, { text: '0.02', type: 'str' }, { text: ',', type: 'plain' }] },
  { tokens: [{ text: '  ', type: 'plain' }, { text: 'deploys', type: 'var' }, { text: ': ', type: 'plain' }, { text: '38', type: 'str' }] },
  { tokens: [{ text: '}', type: 'plain' }] },
  { tokens: [{ text: '', type: 'plain' }] },
  { tokens: [{ text: 'await', type: 'kw' }, { text: ' ', type: 'plain' }, { text: 'ship', type: 'fn' }, { text: '(', type: 'plain' }, { text: 'yourIdea', type: 'var' }, { text: ')', type: 'plain' }] },
  { tokens: [{ text: '', type: 'plain' }] },
  { tokens: [{ text: '// ', type: 'comment' }, { text: '✓ live · 4ms', type: 'comment' }] },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: '#C586C0',      // keyword morado
  fn: '#DCDCAA',      // function amarillo
  var: '#9CDCFE',     // variable cyan
  str: '#CE9178',     // string naranja
  comment: '#6A9955', // comment verde
  plain: '#D4D4D4',   // texto plano
};

interface Code3DOptions {
  container: HTMLElement;
  density?: 'low' | 'mid' | 'high';
}

export class Code3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private codeGroup: THREE.Group;
  private lines: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number; rotSpeed: number }[] = [];
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private startTime = performance.now();

  constructor(options: Code3DOptions) {
    this.container = options.container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Camera
    const { clientWidth, clientHeight } = this.container;
    this.camera = new THREE.PerspectiveCamera(50, clientWidth / Math.max(clientHeight, 1), 0.1, 100);
    this.camera.position.set(0, 0, 8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(clientWidth, clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);

    // Code group (líneas)
    this.codeGroup = new THREE.Group();
    this.scene.add(this.codeGroup);

    // Crear las líneas
    this.buildCodeLines(options.density ?? 'mid');

    // Mouse listener
    this.container.addEventListener('mousemove', this.onMouseMove);

    // Resize
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    // Start render loop
    this.animate();
  }

  private buildCodeLines(density: 'low' | 'mid' | 'high') {
    // Cantidad de líneas a renderizar (cicla el sample)
    const counts = { low: 20, mid: 32, high: 48 };
    const count = counts[density];

    for (let i = 0; i < count; i++) {
      const codeLine = SAMPLE_CODE[i % SAMPLE_CODE.length];
      const mesh = this.createLineMesh(codeLine);
      if (!mesh) continue;

      // Posición aleatoria en un volumen 3D
      const spread = 4.5;
      const x = (Math.random() - 0.5) * spread * 2;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread - 0.5;

      mesh.position.set(x, y, z);
      mesh.rotation.y = (Math.random() - 0.5) * 0.4;

      this.codeGroup.add(mesh);
      this.lines.push({
        mesh,
        baseY: y,
        speed: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
      });
    }
  }

  private createLineMesh(line: CodeLine): THREE.Mesh | null {
    if (!line.tokens.length) {
      // Línea vacía: skip o crear línea tenue
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
      const geom = new THREE.PlaneGeometry(0.1, 0.1);
      return new THREE.Mesh(geom, mat);
    }

    // Renderizar la línea a un canvas con syntax highlighting
    const fontSize = 16;
    const fontFamily = 'JetBrains Mono, "Courier New", monospace';
    const padX = 6;

    // Canvas temporal para medir
    const measureCtx = document.createElement('canvas').getContext('2d')!;
    measureCtx.font = `${fontSize}px ${fontFamily}`;

    // Calcular width total + positions por token
    let totalWidth = padX;
    const tokenRects: { x: number; w: number; color: string }[] = [];
    for (const token of line.tokens) {
      const w = measureCtx.measureText(token.text).width;
      tokenRects.push({ x: totalWidth, w, color: TOKEN_COLORS[token.type] });
      totalWidth += w;
    }
    totalWidth += padX;
    const lineHeight = fontSize + 6;

    // Render canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(Math.ceil(totalWidth), 2);
    canvas.height = lineHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.imageSmoothingEnabled = false;

    for (let i = 0; i < line.tokens.length; i++) {
      const token = line.tokens[i];
      const rect = tokenRects[i];
      ctx.fillStyle = rect.color;
      ctx.shadowColor = rect.color;
      ctx.shadowBlur = 4;
      ctx.fillText(token.text, rect.x, lineHeight / 2);
    }
    ctx.shadowBlur = 0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    // Tamaño en world space
    const planeWidth = Math.min(totalWidth / fontSize, 6);
    const planeHeight = lineHeight / fontSize;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    return new THREE.Mesh(geometry, material);
  }

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    this.targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  private onResize() {
    const { clientWidth, clientHeight } = this.container;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  private animate = () => {
    this.rafId = requestAnimationFrame(this.animate);

    const t = (performance.now() - this.startTime) / 1000;

    // Mouse smoothing
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Mover cámara con mouse (parallax sutil)
    this.camera.position.x = this.mouseX * 0.4;
    this.camera.position.y = -this.mouseY * 0.4;
    this.camera.lookAt(0, 0, 0);

    // Animar cada línea
    for (const line of this.lines) {
      // Float up-down
      line.mesh.position.y = line.baseY + Math.sin(t * line.speed + line.phase) * 0.3;
      // Slow rotation
      line.mesh.rotation.y += line.rotSpeed * 0.01;
      // Opacity flicker suave
      const mat = line.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + Math.sin(t * 0.5 + line.phase) * 0.2;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.container.removeEventListener('mousemove', this.onMouseMove);

    for (const line of this.lines) {
      line.mesh.geometry.dispose();
      const mat = line.mesh.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.dispose();
    }
    this.scene.clear();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}