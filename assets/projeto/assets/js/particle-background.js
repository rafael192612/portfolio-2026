(() => {
  const canvas = document.querySelector(".site__particles");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: 0, y: 0, active: false };
  let particles = [];
  let width = 1;
  let height = 1;
  let frameId = 0;
  let lightFrameId = 0;
  let resizeFrameId = 0;
  let previousTime = 0;
  let pendingPointerX = 0;
  let pendingPointerY = 0;
  let pointerDistances = [];

  function particleCount() {
    if (width <= 480) return 22;
    if (width <= 768) return 34;
    if (width <= 1100) return 48;
    return width >= 1600 ? 68 : 60;
  }

  function makeParticle(index) {
    let x = Math.random() * width;
    if (x < width * 0.48 && Math.random() < 0.62) {
      x = width * (0.48 + Math.random() * 0.52);
    }

    const depth = 0.55 + Math.random() * 0.75;
    const speed = reducedMotion.matches ? 0 : (0.018 + Math.random() * 0.026) * depth;
    const angle = Math.random() * Math.PI * 2;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    return {
      x,
      y: Math.random() * height,
      vx,
      vy,
      baseVx: vx,
      baseVy: vy,
      size: (0.55 + Math.random() * 0.8) * depth * 1.69,
      depth,
      accent: index % 11 === 0,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    width = Math.max(window.innerWidth, 1);
    height = Math.max(window.innerHeight, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: particleCount() }, (_, index) => makeParticle(index));
    pointerDistances = [];
  }

  function interactionRadius() {
    return Math.min(Math.max(width * 0.105, 104), 160);
  }

  function updatePointer(event) {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pendingPointerX = event.clientX;
    pendingPointerY = event.clientY;

    if (lightFrameId) return;
    lightFrameId = requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--mouse-x", `${pendingPointerX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${pendingPointerY}px`);
      document.documentElement.style.setProperty("--cursor-light-opacity", "1");
      lightFrameId = 0;
    });
  }

  function moveParticles(delta) {
    const radius = interactionRadius();
    const movementFactor = pointer.active ? 0.72 : 1;

    particles.forEach((particle, index) => {
      particle.phase += 0.00012 * delta * particle.depth;
      particle.vx += Math.cos(particle.phase) * 0.000012 * delta;
      particle.vy += Math.sin(particle.phase) * 0.000012 * delta;

      if (pointer.active) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0 && distance < radius) {
          const influence = 1 - distance / radius;
          const direction = index % 3 === 0 ? -1 : 1;
          const force = influence * 0.00104 * direction * delta;
          particle.vx += (dx / distance) * force + (-dy / distance) * influence * 0.00028 * delta;
          particle.vy += (dy / distance) * force + (dx / distance) * influence * 0.00028 * delta;
        }
      }

      const speed = Math.hypot(particle.vx, particle.vy);
      const maximumSpeed = 0.12 * particle.depth;
      if (speed > maximumSpeed) {
        particle.vx = (particle.vx / speed) * maximumSpeed;
        particle.vy = (particle.vy / speed) * maximumSpeed;
      }

      particle.vx += (particle.baseVx - particle.vx) * 0.0025 * delta;
      particle.vy += (particle.baseVy - particle.vy) * 0.0025 * delta;
      particle.x += particle.vx * delta * movementFactor;
      particle.y += particle.vy * delta * movementFactor;

      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;
      if (particle.y < -8) particle.y = height + 8;
      if (particle.y > height + 8) particle.y = -8;
    });
  }

  function drawConnections() {
    const baseDistance = Math.min(Math.max(width * 0.085, 88), 136);
    const radius = interactionRadius();

    for (let first = 0; first < particles.length; first += 1) {
      for (let second = first + 1; second < particles.length; second += 1) {
        const a = particles[first];
        const b = particles[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const aPointerDistance = pointerDistances[first];
        const bPointerDistance = pointerDistances[second];
        const aNear = aPointerDistance < radius;
        const bNear = bPointerDistance < radius;
        const interactive = aNear && bNear;
        const limit = interactive ? baseDistance * 1.35 : baseDistance;
        if (distance >= limit) continue;

        const aInfluence = Math.max(1 - aPointerDistance / radius, 0);
        const bInfluence = Math.max(1 - bPointerDistance / radius, 0);
        const rawInfluence = interactive ? (aInfluence + bInfluence) * 0.5 : 0;
        const lightInfluence = rawInfluence * rawInfluence * (3 - 2 * rawInfluence);
        const distanceOpacity = 1 - distance / limit;
        const opacity = distanceOpacity * (0.14 + lightInfluence * 0.31);
        const lineRed = Math.round(206 + (247 - 206) * lightInfluence);
        const lineGreen = Math.round(205 + (246 - 205) * lightInfluence);
        const lineBlue = Math.round(203 + (244 - 203) * lightInfluence);

        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = `rgb(${lineRed} ${lineGreen} ${lineBlue} / ${opacity})`;
        context.lineWidth = interactive ? 0.7 : 0.45;
        context.stroke();
      }
    }
  }

  function drawParticles(time) {
    const radius = interactionRadius();

    particles.forEach((particle, particleIndex) => {
      const distance = pointerDistances[particleIndex];
      const rawInfluence = Math.max(1 - distance / radius, 0);
      const influence = rawInfluence * rawInfluence * (3 - 2 * rawInfluence);
      const pulse = 0.82 + Math.sin(time * 0.00045 + particle.phase) * 0.18;
      const opacity = (0.34 + influence * 0.576) * pulse * particle.depth;
      const particleRed = Math.round(206 + (249 - 206) * influence);
      const particleGreen = Math.round(205 + (249 - 205) * influence);
      const particleBlue = Math.round(203 + (247 - 203) * influence);

      if (influence > 0.04) {
        const haloRadius = particle.size * (2.4 + influence * 2.6);
        const halo = context.createRadialGradient(
          particle.x,
          particle.y,
          particle.size * 0.35,
          particle.x,
          particle.y,
          haloRadius,
        );
        halo.addColorStop(0, `rgb(${particleRed} ${particleGreen} ${particleBlue} / ${influence * 0.2})`);
        halo.addColorStop(1, `rgb(${particleRed} ${particleGreen} ${particleBlue} / 0)`);
        context.beginPath();
        context.arc(particle.x, particle.y, haloRadius, 0, Math.PI * 2);
        context.fillStyle = halo;
        context.fill();
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size + influence * 0.5, 0, Math.PI * 2);
      context.fillStyle = `rgb(${particleRed} ${particleGreen} ${particleBlue} / ${opacity})`;
      context.fill();
    });
  }

  function draw(time) {
    pointerDistances = particles.map((particle) => (
      pointer.active ? Math.hypot(pointer.x - particle.x, pointer.y - particle.y) : Infinity
    ));
    context.clearRect(0, 0, width, height);
    drawConnections();
    drawParticles(time);
  }

  function animate(time) {
    if (document.hidden) {
      frameId = 0;
      return;
    }
    const delta = Math.min(time - previousTime || 16.67, 32);
    previousTime = time;
    moveParticles(delta);
    draw(time);
    frameId = requestAnimationFrame(animate);
  }

  function start() {
    cancelAnimationFrame(frameId);
    previousTime = 0;
    if (document.hidden || reducedMotion.matches) {
      draw(0);
      return;
    }
    frameId = requestAnimationFrame(animate);
  }

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      pointer.active = false;
      document.documentElement.style.setProperty("--cursor-light-opacity", "0");
    }
  });
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrameId);
    resizeFrameId = requestAnimationFrame(() => {
      resize();
      start();
    });
  }, { passive: true });
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener("change", () => {
    resize();
    start();
  });

  resize();
  start();
})();
