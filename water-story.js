/* A small 3D story scene: purifier, person lifting a glass, and a water-quality cue. */
const gallery = document.querySelector('.image-river');
if (gallery) {
  gallery.insertAdjacentHTML('beforebegin', `
    <section class="water-story" id="water-journey" aria-labelledby="water-story-title">
      <div class="section-wrap water-story-inner">
        <div class="water-story-heading">
          <div><div class="section-kicker">FROM PURIFIER TO FIRST SIP</div><h2 id="water-story-title">A little more care<br><span>in every glass.</span></h2><p>Watch the water journey: purification, a quality check, and a refreshing sip.</p></div>
          <a class="text-link" href="#contact">Ask about your water <span>↗</span></a>
        </div>
        <div class="water-story-grid">
          <div class="water-story-steps">
            <article><span class="story-step-icon">01</span><div><h3>Purify</h3><p>RO + UV purification selected for the source water and the people using it.</p></div></article>
            <article><span class="story-step-icon">02</span><div><h3>Check</h3><p>Test water quality. The pH display is an example, not a live reading.</p></div></article>
            <article><span class="story-step-icon">03</span><div><h3>Enjoy</h3><p>See a person lift a glass for a drink and bring the clean-water story to life.</p></div></article>
            <div class="story-ph-card"><span>EXAMPLE pH</span><strong>7.0 <small>NEUTRAL</small></strong><div class="ph-scale"><b></b></div><div class="ph-range"><span>0 acidic</span><span>7 neutral</span><span>14 alkaline</span></div></div>
            <p class="ph-note">Illustration only—not a live measurement. pH alone does not confirm drinking-water safety; water needs proper testing. <a href="https://www.who.int/publications/m/item/chemical-fact-sheets--ph" target="_blank" rel="noreferrer">WHO pH facts ↗</a></p>
          </div>
          <div class="water-story-stage" aria-label="Animated three-dimensional illustration of a person drinking water from a purifier">
            <canvas id="water-story-canvas" aria-hidden="true"></canvas>
            <div class="story-stage-label"><span class="story-live-dot"></span> THE WATER JOURNEY</div>
            <div class="story-scene-caption">Purify <span>→</span> Test <span>→</span> Drink</div>
            <div class="story-scene-fallback" aria-hidden="true"><span>💧</span><b>Pure water, one glass at a time.</b></div>
          </div>
        </div>
      </div>
    </section>`);

  const canvas = document.querySelector('#water-story-canvas');
  const stage = canvas?.parentElement;
  if (canvas && stage && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-3, 3, 2.2, -2.2, 0.1, 30);
      camera.position.set(0, 0.2, 9);
      camera.lookAt(0, 0, 0);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      scene.add(new THREE.HemisphereLight(0xeaffff, 0x4b6877, 2.1));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
      keyLight.position.set(-3, 5, 6);
      scene.add(keyLight);
      const waterLight = new THREE.PointLight(0x4dd5e2, 15, 8);
      waterLight.position.set(-1.2, 1.3, 2.5);
      scene.add(waterLight);

      const materials = {
        shell: new THREE.MeshPhysicalMaterial({ color: 0xe9f5f4, roughness: 0.23, metalness: 0.04, clearcoat: 0.8 }),
        panel: new THREE.MeshPhysicalMaterial({ color: 0x9edce0, roughness: 0.18, metalness: 0.14, clearcoat: 1 }),
        skin: new THREE.MeshStandardMaterial({ color: 0xc98259, roughness: 0.72 }),
        hair: new THREE.MeshStandardMaterial({ color: 0x293541, roughness: 0.9 }),
        shirt: new THREE.MeshPhysicalMaterial({ color: 0x148da2, roughness: 0.48, clearcoat: 0.22 }),
        pants: new THREE.MeshStandardMaterial({ color: 0x263d55, roughness: 0.72 }),
        glass: new THREE.MeshPhysicalMaterial({ color: 0xa7edf0, transparent: true, opacity: 0.38, roughness: 0.08, metalness: 0.04, clearcoat: 1, side: THREE.DoubleSide }),
        water: new THREE.MeshPhysicalMaterial({ color: 0x39bcd0, transparent: true, opacity: 0.8, roughness: 0.1, clearcoat: 1 }),
        background: new THREE.MeshStandardMaterial({ color: 0x103347, roughness: 0.9 })
      };
      function box(parent, size, material, position) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
        mesh.position.set(...position);
        parent.add(mesh);
        return mesh;
      }
      function capsule(parent, radius, length, material, position) {
        const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 5, 10), material);
        mesh.position.set(...position);
        parent.add(mesh);
        return mesh;
      }
      function sphere(parent, size, material, position, scale = [1, 1, 1]) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 18), material);
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        parent.add(mesh);
        return mesh;
      }

      // A quiet floor and a few soft bubbles make the scene read as water, not a medical diagram.
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.9), materials.background);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -1.9, -0.15);
      scene.add(floor);
      const purifier = new THREE.Group();
      purifier.position.set(-1.85, -0.05, 0);
      scene.add(purifier);
      box(purifier, [0.9, 1.85, 0.66], materials.shell, [0, -0.02, 0]);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.47, 0.15, 32), materials.shell);
      lid.position.y = 0.96;
      purifier.add(lid);
      box(purifier, [0.62, 0.82, 0.035], materials.panel, [0, 0.28, 0.35]);
      const badge = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: 0x21a9bf }));
      badge.position.set(0, 0.48, 0.39);
      purifier.add(badge);
      box(purifier, [0.24, 0.08, 0.05], materials.panel, [0.29, -0.55, 0.39]);
      capsule(purifier, 0.045, 0.22, materials.panel, [0.3, -0.68, 0.42]);
      box(purifier, [0.28, 0.055, 0.06], materials.panel, [0.42, -0.8, 0.47]);
      const nozzle = sphere(purifier, 0.055, materials.water, [0.55, -0.86, 0.48], [0.7, 1.2, 0.7]);

      const person = new THREE.Group();
      person.position.set(0.72, -0.05, 0.05);
      scene.add(person);
      // Seated pose keeps the face, glass, and purifier tap in one readable frame.
      sphere(person, 0.57, materials.shirt, [0, -0.12, 0], [0.95, 1.15, 0.7]);
      box(person, [0.9, 0.2, 0.72], materials.pants, [0, -0.92, 0]);
      capsule(person, 0.18, 0.67, materials.pants, [-0.29, -1.38, 0]);
      capsule(person, 0.18, 0.67, materials.pants, [0.29, -1.38, 0]);
      sphere(person, 0.19, materials.skin, [-0.29, -1.78, 0.07], [1.45, 0.45, 1.9]);
      sphere(person, 0.19, materials.skin, [0.29, -1.78, 0.07], [1.45, 0.45, 1.9]);
      capsule(person, 0.13, 0.28, materials.skin, [0, 0.66, 0]);

      const head = new THREE.Group();
      head.position.set(0.03, 1.05, 0.02);
      person.add(head);
      sphere(head, 0.39, materials.skin, [0, 0, 0], [0.88, 1.08, 0.84]);
      sphere(head, 0.34, materials.hair, [-0.025, 0.21, -0.02], [0.94, 0.68, 0.9]);
      // Forehead-facing fringe leaves the face visible from the camera.
      sphere(head, 0.17, materials.skin, [0, -0.13, 0.27], [1.0, 0.55, 0.44]);
      sphere(head, 0.035, materials.hair, [-0.12, -0.03, 0.322], [0.7, 0.8, 0.6]);
      sphere(head, 0.035, materials.hair, [0.12, -0.03, 0.322], [0.7, 0.8, 0.6]);
      sphere(head, 0.035, materials.skin, [0.28, -0.07, 0.04], [0.7, 1, 0.8]);

      // Shoulder and elbow pivots animate the glass from a resting pose to the mouth.
      const shoulder = new THREE.Group();
      shoulder.position.set(-0.35, 0.62, 0.3);
      person.add(shoulder);
      capsule(shoulder, 0.13, 0.36, materials.shirt, [0, -0.2, 0]);
      const elbow = new THREE.Group();
      elbow.position.y = -0.42;
      shoulder.add(elbow);
      capsule(elbow, 0.105, 0.35, materials.skin, [0, -0.19, 0]);
      sphere(elbow, 0.115, materials.skin, [0, -0.4, 0]);
      const hand = new THREE.Group();
      hand.position.set(0.02, -0.42, 0.02);
      elbow.add(hand);
      sphere(hand, 0.09, materials.skin, [0, -0.04, 0], [1, 0.75, 0.8]);

      const cup = new THREE.Group();
      cup.position.set(0.08, -0.13, 0.04);
      hand.add(cup);
      const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.105, 0.34, 32, 1, true), materials.glass);
      cupBody.position.y = 0.08;
      cup.add(cupBody);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 8, 32), materials.glass);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.25;
      cup.add(rim);
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.18, 24), materials.water);
      water.position.y = 0.04;
      cup.add(water);
      const bubbles = [0, 1, 2].map(i => sphere(cup, 0.018 + i * 0.003, materials.glass, [Math.sin(i * 2) * 0.05, 0.09 + i * 0.045, 0.02]));

      const resize = () => {
        const width = stage.clientWidth || 640;
        const height = stage.clientHeight || 420;
        const viewHeight = 4.45;
        const aspect = width / height;
        camera.left = -viewHeight * aspect / 2;
        camera.right = viewHeight * aspect / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      resize();

      function setTheme() {
        const lightMode = document.documentElement.dataset.theme === 'light';
        materials.background.color.set(lightMode ? 0xc6e8e5 : 0x103347);
        materials.shell.color.set(lightMode ? 0xf9ffff : 0xe9f5f4);
        materials.panel.color.set(lightMode ? 0x8ed6dc : 0x9edce0);
        materials.shirt.color.set(lightMode ? 0x167f94 : 0x148da2);
        waterLight.color.set(lightMode ? 0x168da5 : 0x4dd5e2);
      }
      setTheme();
      const themeObserver = new MutationObserver(setTheme);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      const clock = new THREE.Clock();
      let raf = 0;
      let visible = false;
      function render() {
        raf = 0;
        if (!visible) return;
        const time = clock.getElapsedTime();
        const cycle = (time % 8.5) / 8.5;
        const raise = cycle < 0.28 ? 0 : cycle < 0.48 ? (cycle - 0.28) / 0.2 : cycle < 0.68 ? 1 : cycle < 0.88 ? 1 - (cycle - 0.68) / 0.2 : 0;
        const eased = raise * raise * (3 - 2 * raise);
        shoulder.rotation.z = eased * 2.05;
        elbow.rotation.z = eased * -0.42;
        cup.rotation.z = eased * 0.28;
        head.rotation.z = eased * 0.035;
        person.position.y = -0.05 + Math.sin(time * 0.8) * 0.018;
        water.scale.y = 1 - eased * 0.22;
        water.position.y = 0.04 - eased * 0.02;
        nozzle.scale.setScalar(0.9 + (Math.sin(time * 2) + 1) * 0.08);
        bubbles.forEach((bubble, i) => {
          bubble.position.y = 0.04 + ((time * 0.18 + i * 0.22) % 0.14);
          bubble.visible = cycle > 0.08 && cycle < 0.27;
        });
        renderer.render(scene, camera);
        raf = requestAnimationFrame(render);
      }
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) render();
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }, { rootMargin: '120px' });
      visibilityObserver.observe(stage);
      stage.classList.add('has-water-scene');
    } catch (error) {
      stage.classList.add('water-scene-failed');
      console.info('3D water story unavailable; showing the static fallback.', error);
    }
  } else if (canvas && stage) {
    stage.classList.add('water-scene-failed');
  }
}
