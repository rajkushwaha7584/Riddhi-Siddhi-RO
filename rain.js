(() => {
  const canvas = document.querySelector('#page-rain');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  let width = 0;
  let height = 0;
  let pageHeight = 0;
  let frame = 0;
  let lastTime = 0;
  let drops = [];
  let productPhotoZones = [];
  const randomPool = new Uint32Array(1024);
  let randomIndex = randomPool.length;
  function random(min, max) {
    if (randomIndex >= randomPool.length) {
      window.crypto.getRandomValues(randomPool);
      randomIndex = 0;
    }
    const unit = randomPool[randomIndex++] / 0x100000000;
    return min + unit * (max - min);
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const perScreen = Math.max(34, Math.min(125, Math.round(width / 13)));
    const count = Math.max(perScreen, Math.min(800, Math.ceil(perScreen * pageHeight / height)));
    drops = Array.from({ length: count }, () => makeDrop(true));
    updateProductPhotoZones();
  }

  function updateProductPhotoZones() {
    productPhotoZones = [...document.querySelectorAll('.product-card')].map(card => {
      const rect = card.getBoundingClientRect();
      return { left: rect.right - 165, right: rect.right - 14, top: rect.top + 22, bottom: rect.top + 174 };
    });
  }

  function isOverProductPhoto(x, y) {
    return productPhotoZones.some(zone => x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom);
  }

  function makeDrop(initial = false) {
    const size = random(1.05, 2.35);
    return {
      x: random(0, width),
      y: initial ? random(-height, pageHeight) : random(-height, -12),
      length: random(14, 31) * size,
      speed: random(150, 360) * size,
      width: random(0.7, 1.25) * size,
      drift: random(-13, 17),
      phase: random(0, Math.PI * 2),
      glow: random(0.24, 0.48)
    };
  }

  function draw(time) {
    if (document.hidden) { frame = 0; return; }
    const delta = Math.min((time - (lastTime || time)) / 1000, 0.04);
    lastTime = time;
    context.clearRect(0, 0, width, height);

    drops.forEach(drop => {
      drop.y += drop.speed * delta;
      drop.x += (drop.drift + Math.sin(time * 0.00055 + drop.phase) * 8) * delta;
      if (drop.y - drop.length > pageHeight || drop.x < -20 || drop.x > width + 20) Object.assign(drop, makeDrop());
      const screenY = drop.y - window.scrollY;
      if (screenY < -drop.length - 4 || screenY > height + 4) return;
      // Keep the falling-water layer off the product photos so the machines stay clear.
      if (isOverProductPhoto(drop.x, screenY)) return;

      const trail = context.createLinearGradient(drop.x, screenY - drop.length, drop.x, screenY + 2);
      trail.addColorStop(0, 'rgba(83, 210, 230, 0)');
      trail.addColorStop(0.62, `rgba(91, 213, 231, ${drop.glow * 0.35})`);
      trail.addColorStop(1, `rgba(193, 250, 250, ${drop.glow})`);
      context.beginPath();
      context.strokeStyle = trail;
      context.lineWidth = drop.width;
      context.lineCap = 'round';
      context.moveTo(drop.x, screenY - drop.length);
      context.lineTo(drop.x - drop.drift * 0.018, screenY);
      context.stroke();

      context.beginPath();
      context.fillStyle = `rgba(173, 246, 247, ${drop.glow * 0.55})`;
      context.ellipse(drop.x - drop.drift * 0.018, screenY, drop.width * 0.68, drop.width * 1.05, 0, 0, Math.PI * 2);
      context.fill();
    });
    frame = requestAnimationFrame(draw);
  }

  function start() {
    if (!frame && !document.hidden) {
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updateProductPhotoZones, { passive: true });
  document.addEventListener('visibilitychange', start);
  new ResizeObserver(resize).observe(document.documentElement);
  resize();
  start();
})();
