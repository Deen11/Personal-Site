// A flock of simulated agents drawn behind the page. Each section with a data-form
// attribute names a formation (a word, or "flock"), and scrolling scrubs the morph
// between one section's formation and the next.

type Point = [number, number];
type Box = { x: number; y: number; w: number; h: number };
type Boid = { x: number; y: number; vx: number; vy: number; z: number; d: number; k: number; ph: number };
type Scrub = { i: number; t: number };

const BG = '#050609';
const CELL = 34;
const BINS = 6;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function startSwarm(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = [...document.querySelectorAll<HTMLElement>('[data-form]')];
  // Pages without formations (project pages) get a quiet free flock
  const ambient = sections.length === 0;
  const hud = {
    n: document.getElementById('hud-n'),
    f: document.getElementById('hud-f'),
    t: document.getElementById('hud-t'),
    fps: document.getElementById('hud-fps'),
  };
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];

  let W = 0;
  let H = 0;
  let mobile = false;
  let boids: Boid[] = [];
  let forms: (Point[] | null)[] = [];
  let regions: Box[] = [];
  let tops: number[] = [];
  let heights: number[] = [];
  const mouse = { x: -9999, y: -9999 };
  let kick = 0;
  let lastY = scrollY;
  let time = 0;

  const regionFor = (word: string): Box => {
    if (ambient) return { x: 0, y: 0, w: W, h: H };
    if (mobile) return word === 'DEEN' ? { x: W * 0.05, y: H * 0.11, w: W * 0.9, h: H * 0.22 } : { x: W * 0.06, y: H * 0.1, w: W * 0.88, h: H * 0.3 };
    if (word === 'DEEN') return { x: W * 0.04, y: H * 0.1, w: W * 0.92, h: H * 0.46 };
    return { x: W * 0.5, y: H * 0.14, w: W * 0.46, h: H * 0.72 };
  };

  // Turn a word into target points by drawing it offscreen and sampling the pixels
  const off = document.createElement('canvas');
  const octx = off.getContext('2d', { willReadFrequently: true })!;
  const sample = (word: string, box: Box, n: number): Point[] => {
    off.width = Math.max(1, Math.ceil(box.w));
    off.height = Math.max(1, Math.ceil(box.h));
    octx.clearRect(0, 0, off.width, off.height);
    const font = (s: number) => `900 ${s}px Archivo, 'Arial Black', sans-serif`;
    let size = box.h * 1.05;
    octx.font = font(size);
    if ('fontStretch' in octx) (octx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'expanded';
    const m = octx.measureText(word).width;
    if (m > box.w * 0.98) {
      size *= (box.w * 0.98) / m;
      octx.font = font(size);
    }
    octx.fillStyle = '#fff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(word, off.width / 2, off.height / 2 + size * 0.05);
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    let filled = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled++;
    const step = Math.max(2.5, Math.sqrt((filled * 4) / n) * 0.92);
    const pts: Point[] = [];
    for (let y = step / 2; y < off.height; y += step) {
      for (let x = step / 2; x < off.width; x += step) {
        const jx = x + (Math.random() - 0.5) * step * 0.5;
        const jy = y + (Math.random() - 0.5) * step * 0.5;
        const px = Math.round(jx);
        const py = Math.round(jy);
        if (px < 0 || py < 0 || px >= off.width || py >= off.height) continue;
        if (data[(py * off.width + px) * 4 + 3] > 128) pts.push([box.x + jx, box.y + jy]);
      }
    }
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    return pts;
  };

  const layout = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth;
    H = innerHeight;
    mobile = W < 860;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    const n = ambient ? (mobile ? 220 : 420) : mobile ? 520 : clamp(Math.round((W * H) / 1100), 700, 1400);
    while (boids.length < n) {
      boids.push({
        x: ambient ? Math.random() * W : W / 2,
        y: ambient ? Math.random() * H : H * 0.3,
        vx: (Math.random() - 0.5) * (ambient ? 3 : 18),
        vy: (Math.random() - 0.5) * (ambient ? 3 : 18),
        z: 0.55 + Math.random() * 0.75,
        d: Math.random(),
        k: (Math.random() * 1e6) | 0,
        ph: Math.random() * 6.28,
      });
    }
    boids.length = n;
    if (hud.n) hud.n.textContent = String(n);
    if (ambient) {
      regions = [regionFor('flock')];
      forms = [null];
      tops = [0];
      heights = [document.documentElement.scrollHeight];
      return;
    }
    regions = sections.map((s) => regionFor(s.dataset.form!));
    forms = sections.map((s, i) => (s.dataset.form === 'flock' ? null : sample(s.dataset.form!, regions[i], n)));
    tops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
    heights = sections.map((s) => s.offsetHeight);
  };

  // Which two formations the reading line sits between, and how far along
  const scrub = (): Scrub => {
    if (ambient) return { i: 0, t: 0 };
    const mid = scrollY + H * 0.5;
    let i = 0;
    for (let j = 0; j < tops.length; j++) if (tops[j] <= mid) i = j;
    const end = tops[i] + heights[i];
    const zone = Math.min(H * 0.7, heights[i] * 0.55);
    const t = i < tops.length - 1 ? clamp((mid - (end - zone)) / zone) : 0;
    return { i, t };
  };

  const grid = new Map<number, Boid[]>();
  const step = (s: Scrub) => {
    grid.clear();
    for (const b of boids) {
      const key = ((b.x / CELL) | 0) * 4096 + ((b.y / CELL) | 0);
      let c = grid.get(key);
      if (!c) grid.set(key, (c = []));
      c.push(b);
    }
    const A = forms[s.i];
    const B = forms[s.i + 1];
    const RA = regions[s.i];
    const RB = regions[s.i + 1] || RA;
    const k0 = kick;
    kick *= 0.92;
    for (const b of boids) {
      const tb = smooth(clamp(s.t * 1.6 - b.d * 0.6));
      let tx = 0;
      let ty = 0;
      let w = 0;
      const pa = A && A.length ? A[b.k % A.length] : null;
      const pb = B && B.length ? B[b.k % B.length] : null;
      if (pa && pb) {
        tx = pa[0] + (pb[0] - pa[0]) * tb;
        ty = pa[1] + (pb[1] - pa[1]) * tb;
        w = 1;
      } else if (pa) {
        [tx, ty] = pa;
        w = 1 - tb;
      } else if (pb) {
        [tx, ty] = pb;
        w = tb;
      }

      let ax = 0;
      let ay = 0;
      let n = 0;
      let sx = 0;
      let sy = 0;
      let avx = 0;
      let avy = 0;
      let px = 0;
      let py = 0;
      const cx = (b.x / CELL) | 0;
      const cy = (b.y / CELL) | 0;
      for (let gx = -1; gx <= 1; gx++) {
        for (let gy = -1; gy <= 1; gy++) {
          const c = grid.get((cx + gx) * 4096 + cy + gy);
          if (!c) continue;
          for (const o of c) {
            if (o === b) continue;
            const dx = b.x - o.x;
            const dy = b.y - o.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 1100) continue;
            n++;
            avx += o.vx;
            avy += o.vy;
            px += o.x;
            py += o.y;
            if (d2 < 90) {
              sx += dx / (d2 + 0.5);
              sy += dy / (d2 + 0.5);
            }
          }
        }
      }
      if (w > 0) {
        // Shimmer around the target so a finished formation never looks frozen
        const gx = tx + Math.sin(time * 1.3 + b.ph) * 1.6;
        const gy = ty + Math.cos(time * 1.1 + b.ph) * 1.6;
        const dx = gx - b.x;
        const dy = gy - b.y;
        const dist = Math.hypot(dx, dy) + 0.001;
        const want = Math.min(11, dist * 0.09);
        ax += ((dx / dist) * want - b.vx) * 0.16 * w;
        ay += ((dy / dist) * want - b.vy) * 0.16 * w;
      }
      const fw = 1 - w;
      if (fw > 0) {
        if (n) {
          ax += ((avx / n - b.vx) * 0.06 + (px / n - b.x) * 0.0016) * fw;
          ay += ((avy / n - b.vy) * 0.06 + (py / n - b.y) * 0.0016) * fw;
        }
        // Keep the free flock inside its part of the screen
        const R = s.t > 0.5 ? RB : RA;
        const m = 40;
        if (b.x < R.x + m) ax += 0.22 * fw;
        if (b.x > R.x + R.w - m) ax -= 0.22 * fw;
        if (b.y < R.y + m) ay += 0.22 * fw;
        if (b.y > R.y + R.h - m) ay -= 0.22 * fw;
      }
      ax += sx * (w > 0.5 ? 0.5 : 1.3);
      ay += sy * (w > 0.5 ? 0.5 : 1.3);

      // The cursor pushes agents away; fast scrolling shakes them loose
      const mx = b.x - mouse.x;
      const my = b.y - mouse.y;
      const md = mx * mx + my * my;
      if (md < 16000) {
        const f = ((1 - md / 16000) * 3) / Math.sqrt(md + 1);
        ax += mx * f;
        ay += my * f;
      }
      if (k0 > 0.15) {
        ax += (Math.random() - 0.5) * k0;
        ay += (Math.random() - 0.5) * k0;
      }

      b.vx += ax;
      b.vy += ay;
      const sp = Math.hypot(b.vx, b.vy);
      const max = w > 0.5 ? 14 : ambient ? 2.6 : 4.2;
      const min = fw > 0.5 ? (ambient ? 1 : 1.6) : 0;
      if (sp > max) {
        b.vx *= max / sp;
        b.vy *= max / sp;
      }
      if (min && sp < min) {
        b.vx *= min / (sp + 0.001);
        b.vy *= min / (sp + 0.001);
      }
      b.x += b.vx;
      b.y += b.vy;
    }
  };

  // Draw agents as short glowing streaks that warm from white to amber with speed
  const bins: Boid[][] = Array.from({ length: BINS }, () => []);
  const colors = Array.from({ length: BINS }, (_, i) => {
    const t = i / (BINS - 1);
    return `rgb(${Math.round(242 + 13 * t)},${Math.round(240 - 59 * t)},${Math.round(234 - 163 * t)})`;
  });
  const draw = (alpha: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5,6,9,0.3)';
    ctx.fillRect(0, 0, W, H);
    bins.forEach((b) => (b.length = 0));
    for (const b of boids) bins[Math.min(BINS - 1, ((Math.hypot(b.vx, b.vy) / 9) * BINS) | 0)].push(b);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < BINS; i++) {
      const list = bins[i];
      if (!list.length) continue;
      ctx.strokeStyle = colors[i];
      ctx.globalAlpha = alpha * (0.55 + i * 0.08);
      for (const near of [false, true]) {
        ctx.lineWidth = near ? 2.2 : 1.3;
        ctx.beginPath();
        for (const b of list) {
          if (b.z > 1 !== near) continue;
          const sp = Math.hypot(b.vx, b.vy) + 0.001;
          const len = 1.4 + Math.min(10, sp * 1.1) * b.z;
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - (b.vx / sp) * len, b.y - (b.vy / sp) * len);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const still = (s: Scrub) => {
    const A = forms[s.i];
    const R = regions[s.i];
    for (const b of boids) {
      const p = A && A.length ? A[b.k % A.length] : null;
      b.x = p ? p[0] : R.x + Math.random() * R.w;
      b.y = p ? p[1] : R.y + Math.random() * R.h;
      b.vx = 0.4;
      b.vy = 0;
    }
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    draw(ambient ? 0.35 : mobile ? 0.5 : 1);
  };

  const name = (f?: string) => (f === 'flock' ? 'free flock' : f || '');
  let lastLabel = '';
  const label = (s: Scrub) => {
    if (ambient) return;
    const a = sections[s.i].dataset.form;
    const b = sections[s.i + 1]?.dataset.form;
    const moving = s.t > 0.02 && b;
    const text = moving ? `${name(a)} → ${name(b)}` : name(a);
    if (text !== lastLabel && hud.f) hud.f.textContent = text;
    lastLabel = text;
    hud.t?.style.setProperty('--t', (moving ? s.t : 1).toFixed(2));
    const id = sections[s.t > 0.5 && b ? s.i + 1 : s.i].id;
    navLinks.forEach((l) => l.classList.toggle('on', l.dataset.nav === id));
  };

  let last = performance.now();
  let frames = 0;
  let fpsT = last;
  const loop = (now: number) => {
    time += Math.min(50, now - last) / 1000;
    last = now;
    const s = scrub();
    step(s);
    // On phones the swarm fades behind the text once you leave the hero
    const away = clamp(scrollY / (H * 0.6));
    draw(ambient ? 0.35 : mobile ? 1 - away * 0.55 : 1);
    label(s);
    frames++;
    if (now - fpsT > 500) {
      if (hud.fps) hud.fps.textContent = String(Math.round((frames * 1000) / (now - fpsT)));
      frames = 0;
      fpsT = now;
    }
    requestAnimationFrame(loop);
  };

  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      kick = Math.min(2.4, kick + Math.abs(y - lastY) * 0.006);
      lastY = y;
      if (reduce) {
        const s = scrub();
        label(s);
        still(s);
      }
    },
    { passive: true },
  );
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -9999;
  });
  // Clicking empty space scatters nearby agents
  addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('a, button, input, video')) return;
    for (const b of boids) {
      const dx = b.x - e.clientX;
      const dy = b.y - e.clientY;
      const d = Math.hypot(dx, dy) + 1;
      if (d < 260) {
        const f = (1 - d / 260) * 22;
        b.vx += (dx / d) * f;
        b.vy += (dy / d) * f;
      }
    }
  });
  addEventListener('resize', () => {
    layout();
    if (reduce) still(scrub());
  });

  const start = () => {
    layout();
    const s = scrub();
    label(s);
    if (reduce) still(s);
    else requestAnimationFrame(loop);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
}
