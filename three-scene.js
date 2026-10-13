/* A small, custom Three.js purifier scene. The CSS artwork remains as a fallback. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#purifier-canvas');
const frame = canvas?.parentElement;
if (canvas && frame && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.2, 8.1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    scene.add(new THREE.HemisphereLight(0xe8ffff, 0x7695a3, 2.15));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-3, 5, 6);
    scene.add(key);
    const edge = new THREE.PointLight(0x53cce4, 30, 11);
    edge.position.set(3, 1, 2);
    scene.add(edge);

    const purifier = new THREE.Group();
    scene.add(purifier);
    const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xf2fbfb, roughness: 0.2, metalness: 0.04, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    const trim = new THREE.MeshStandardMaterial({ color: 0x98c7ce, roughness: 0.25, metalness: 0.35 });
    const blue = new THREE.MeshPhysicalMaterial({ color: 0x139cbd, roughness: 0.24, metalness: 0.18, clearcoat: 0.7 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xc4f5f5, roughness: 0.13, metalness: 0.12, transparent: true, opacity: 0.84, clearcoat: 1 });

    const shell = new THREE.Mesh(new THREE.BoxGeometry(2.05, 3.65, 1.02, 5, 8, 2), porcelain);
    shell.position.y = 0.05;
    purifier.add(shell);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.98, 0.25, 48), porcelain);
    cap.position.y = 1.91;
    purifier.add(cap);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.77, 0.82, 0.24, 48), trim);
    foot.position.y = -1.91;
    purifier.add(foot);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.82, 0.075, 3, 4, 1), glass);
    panel.position.set(0, 0.45, 0.54);
    purifier.add(panel);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.78, 0.09, 4, 4, 2), new THREE.MeshPhysicalMaterial({ color: 0xd7ffff, emissive: 0x48cada, emissiveIntensity: 0.22, roughness: 0.14, clearcoat: 1 }));
    screen.position.set(0, 0.55, 0.61);
    purifier.add(screen);
    const droplet = new THREE.Mesh(new THREE.IcosahedronGeometry(0.21, 3), new THREE.MeshPhysicalMaterial({ color: 0x22aaca, emissive: 0x08728f, emissiveIntensity: 0.18, roughness: 0.12, metalness: 0.2, clearcoat: 1 }));
    droplet.position.set(0, 0.59, 0.69);
    droplet.scale.set(0.73, 1.2, 0.46);
    purifier.add(droplet);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.09, 0.04), blue);
    badge.position.set(0, -0.47, 0.59);
    purifier.add(badge);
    const tapStem = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.34, 20), trim);
    tapStem.position.set(0.12, -0.83, 0.77);
    purifier.add(tapStem);
    const tapArm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 20), trim);
    tapArm.rotation.z = Math.PI / 2;
    tapArm.position.set(0.3, -0.95, 0.87);
    purifier.add(tapArm);
    const nozzleDrop = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 16), blue);
    nozzleDrop.position.set(0.48, -1.05, 0.88);
    purifier.add(nozzleDrop);
    const glint = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.2, 0.025), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
    glint.position.set(-0.72, 0.18, 0.54);
    purifier.add(glint);

    const particles = [];
    const particleMaterial = new THREE.MeshPhysicalMaterial({ color: 0x73e5eb, roughness: 0.08, metalness: 0.12, clearcoat: 1, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 13; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 3) * 0.014, 14, 12), particleMaterial);
      bead.userData = { angle: i * 2.4, radius: 1.65 + (i % 4) * 0.2, speed: 0.25 + (i % 3) * 0.08, lift: (i % 5) * 0.36 - 0.7 };
      scene.add(bead);
      particles.push(bead);
    }

    const fallingDrops = [];
    const fallingMaterial = new THREE.MeshPhysicalMaterial({ color: 0x91f3f1, emissive: 0x13869b, emissiveIntensity: 0.28, roughness: 0.08, metalness: 0.12, transparent: true, opacity: 0.7, clearcoat: 1 });
    for (let i = 0; i < 24; i++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.045 + (i % 3) * 0.012, 12, 10), fallingMaterial);
      drop.scale.set(0.72, 1.8, 0.72);
      drop.userData = { x: -2.05 + ((i * 37) % 41) / 40 * 4.1, offset: i * 0.23, speed: 0.42 + (i % 5) * 0.11 };
      scene.add(drop);
      fallingDrops.push(drop);
    }

    function resize() {
      const w = frame.clientWidth, h = frame.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 600 ? 9.1 : 8.1;
      camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    resize();
    const pointer = { x: 0, y: 0 };
    frame.addEventListener('pointermove', e => {
      const rect = frame.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.15;
    }, { passive: true });
    frame.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
    const clock = new THREE.Clock();
    function animate() {
      if (!canvas.isConnected) { observer.disconnect(); renderer.dispose(); return; }
      const t = clock.getElapsedTime();
      purifier.rotation.y += (pointer.x - purifier.rotation.y) * 0.025;
      purifier.rotation.x += (-pointer.y - purifier.rotation.x) * 0.025;
      purifier.position.y = Math.sin(t * 0.8) * 0.055;
      droplet.scale.y = 1.2 + Math.sin(t * 2) * 0.05;
      particles.forEach(bead => {
        const p = bead.userData, a = p.angle + t * p.speed;
        bead.position.set(Math.cos(a) * p.radius, Math.sin(a * 1.4) * 0.58 + p.lift, Math.sin(a) * 0.65 - 0.1);
        bead.scale.setScalar(0.72 + (Math.sin(t * 1.7 + p.angle) + 1) * 0.22);
      });
      fallingDrops.forEach(drop => {
        const p = drop.userData;
        const fall = (t * p.speed + p.offset) % 5.2;
        drop.position.set(p.x + Math.sin(t * 1.5 + p.offset) * 0.035, 2.55 - fall, -0.65 + Math.sin(p.offset) * 0.28);
      });
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    frame.classList.add('has-three-scene');
    animate();
  } catch (error) {
    console.warn('3D purifier illustration unavailable; showing the CSS artwork.', error);
  }
}
