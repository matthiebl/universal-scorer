const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#20c997', '#f06595'];
const PARTICLE_COUNT = 120;
const DURATION = 3000;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

export function fireConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }

  const start = performance.now();

  function frame(now: number) {
    const elapsed = now - start;
    if (elapsed > DURATION) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gravity = 0.3;
    const drag = 0.99;

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      const fade = Math.max(0, 1 - elapsed / DURATION);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = fade;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
