/**
 * particlePortal.ts
 * Escena Three.js: portal de partículas estilo Marvel/Doctor Strange.
 * - 8000 partículas dispuestas en forma de disco/portal
 * - Anillos rotando en distintos ejes
 * - Núcleo energético central con shader custom
 * - Auto-resize, pausa cuando no está visible, cleanup completo
 */

import * as THREE from 'three';

export interface ParticlePortalOptions {
  container: HTMLElement;
  accentColor?: string;       // rojo Marvel default
  cosmicColor?: string;       // púrpura cósmico
  density?: 'low' | 'mid' | 'high';
}

export class ParticlePortal {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points;
  private rings: THREE.Mesh[] = [];
  private coreMesh: THREE.Mesh | null = null;
  private rafId: number | null = null;
  private isVisible = true;
  private resizeObserver: ResizeObserver | null = null;
  private clock = new THREE.Clock();
  private cleanupFns: Array<() => void> = [];

  private accentColor: THREE.Color;
  private cosmicColor: THREE.Color;
  private particleCount: number;

  constructor(opts: ParticlePortalOptions) {
    this.container = opts.container;
    this.accentColor = new THREE.Color(opts.accentColor ?? 0xED1D24);
    this.cosmicColor = new THREE.Color(opts.cosmicColor ?? 0xB14EFF);

    const densityMap = { low: 4000, mid: 8000, high: 14000 };
    this.particleCount = densityMap[opts.density ?? 'mid'];

    // Scene setup
    this.scene = new THREE.Scene();

    const rect = this.container.getBoundingClientRect();
    const aspect = rect.width / Math.max(rect.height, 1);

    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setClearColor(0x000000, 0);

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    this.particles = this.buildParticles();
    this.scene.add(this.particles);

    this.rings = this.buildRings();
    this.rings.forEach((r) => this.scene.add(r));

    this.coreMesh = this.buildCore();
    if (this.coreMesh) this.scene.add(this.coreMesh);

    // Visibility / resize
    this.setupResize();
    this.setupVisibility();

    this.animate();
  }

  private buildParticles(): THREE.Points {
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    const innerRadius = 1.2;
    const outerRadius = 4.2;

    for (let i = 0; i < this.particleCount; i++) {
      // Distribución en forma de disco/toroidal
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (1.8 / Math.max(radius * 0.6, 0.4));

      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color: mezclar entre accent y cósmico según la distancia
      const t = (radius - innerRadius) / (outerRadius - innerRadius);
      const color = new THREE.Color().lerpColors(this.accentColor, this.cosmicColor, t);
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.08 + 0.02;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Material: shader simple con attenuation y glow aditivo
    const material = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
  }

  private buildRings(): THREE.Mesh[] {
    const ringGroup: THREE.Mesh[] = [];

    const ringConfigs = [
      { radius: 2.4, tube: 0.012, color: 0xED1D24, tilt: { x: Math.PI * 0.45, y: 0, z: 0 } },
      { radius: 3.0, tube: 0.008, color: 0xF8B400, tilt: { x: 0, y: Math.PI * 0.4, z: 0 } },
      { radius: 3.6, tube: 0.006, color: 0xB14EFF, tilt: { x: Math.PI * 0.3, y: Math.PI * 0.2, z: 0 } },
    ];

    ringConfigs.forEach((cfg) => {
      const geometry = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 200);
      const material = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = cfg.tilt.x;
      mesh.rotation.y = cfg.tilt.y;
      mesh.rotation.z = cfg.tilt.z;
      // Userdata para animación
      mesh.userData.spinAxis = cfg.tilt.x !== 0 ? 'x' : 'y';
      mesh.userData.spinSpeed = 0.003 + Math.random() * 0.002;
      ringGroup.push(mesh);
    });

    return ringGroup;
  }

  private buildCore(): THREE.Mesh {
    const geometry = new THREE.IcosahedronGeometry(0.55, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF6B47,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isCore = true;
    return mesh;
  }

  private setupResize(): void {
    const handleResize = () => {
      const rect = this.container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.camera.aspect = rect.width / Math.max(rect.height, 1);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    this.cleanupFns.push(() => window.removeEventListener('resize', handleResize));

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(this.container);
      this.cleanupFns.push(() => this.resizeObserver?.disconnect());
    }
  }

  private setupVisibility(): void {
    const handleVisibility = () => {
      this.isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    this.cleanupFns.push(() => document.removeEventListener('visibilitychange', handleVisibility));
  }

  private animate = (): void => {
    if (!this.isVisible) {
      this.rafId = requestAnimationFrame(this.animate);
      return;
    }

    const dt = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    // Rotar partículas (todo el grupo)
    this.particles.rotation.y += dt * 0.08;
    this.particles.rotation.x = Math.sin(t * 0.3) * 0.08;

    // Rotar anillos en ejes distintos
    this.rings.forEach((ring, i) => {
      const axis = ring.userData.spinAxis as 'x' | 'y' | 'z';
      const speed = ring.userData.spinSpeed as number;
      const dir = i % 2 === 0 ? 1 : -1;
      ring.rotation[axis] += speed * dir;
    });

    // Core pulsante
    if (this.coreMesh) {
      const scale = 1 + Math.sin(t * 2) * 0.12;
      this.coreMesh.scale.setScalar(scale);
      this.coreMesh.rotation.x = t * 0.5;
      this.coreMesh.rotation.y = t * 0.7;
      this.coreMesh.rotation.z = t * 0.3;
    }

    // Parallax sutil con el mouse
    if (this.mouseActive) {
      this.camera.position.x += (this.targetCamX - this.camera.position.x) * 0.04;
      this.camera.position.y += (this.targetCamY - this.camera.position.y) * 0.04;
    }
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.animate);
  };

  private mouseActive = false;
  private targetCamX = 0;
  private targetCamY = 0;

  public setMouse(x: number, y: number): void {
    this.mouseActive = true;
    this.targetCamX = x * 0.5;
    this.targetCamY = -y * 0.5;
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];

    this.particles.geometry.dispose();
    (this.particles.material as THREE.Material).dispose();
    this.rings.forEach((r) => {
      r.geometry.dispose();
      (r.material as THREE.Material).dispose();
    });
    if (this.coreMesh) {
      this.coreMesh.geometry.dispose();
      (this.coreMesh.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
