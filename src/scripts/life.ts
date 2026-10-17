// Conway's Game of Life on a wrap-around grid, with fading trails for cells that just died.
export class Life {
  w: number;
  h: number;
  grid: Uint8Array;
  next: Uint8Array;
  age: Float32Array;
  gen = 0;
  pop = 0;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.grid = new Uint8Array(w * h);
    this.next = new Uint8Array(w * h);
    this.age = new Float32Array(w * h);
  }

  index(x: number, y: number) {
    const { w, h } = this;
    return (((y % h) + h) % h) * w + (((x % w) + w) % w);
  }

  set(x: number, y: number) {
    const i = this.index(x, y);
    if (!this.grid[i]) this.pop++;
    this.grid[i] = 1;
    this.age[i] = 1;
  }

  toggle(x: number, y: number) {
    const i = this.index(x, y);
    if (this.grid[i]) {
      this.grid[i] = 0;
      this.pop--;
    } else {
      this.set(x, y);
    }
  }

  glider(cx: number, cy: number, rnd: () => number) {
    const dirs = [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];
    const [dx, dy] = dirs[Math.floor(rnd() * 4)];
    for (const [px, py] of [
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ]) {
      this.set(cx + (px - 1) * dx, cy + (py - 1) * dy);
    }
  }

  step() {
    const { w, h, grid: g, next: n, age } = this;
    let pop = 0;
    for (let y = 0; y < h; y++) {
      const ym = ((y - 1 + h) % h) * w;
      const y0 = y * w;
      const yp = ((y + 1) % h) * w;
      for (let x = 0; x < w; x++) {
        const xm = (x - 1 + w) % w;
        const xp = (x + 1) % w;
        const c =
          g[ym + xm] + g[ym + x] + g[ym + xp] + g[y0 + xm] + g[y0 + xp] + g[yp + xm] + g[yp + x] + g[yp + xp];
        const alive = g[y0 + x] ? c === 2 || c === 3 : c === 3;
        n[y0 + x] = alive ? 1 : 0;
        if (alive) {
          pop++;
          age[y0 + x] = 1;
        }
      }
    }
    this.grid = n;
    this.next = g;
    this.gen++;
    this.pop = pop;
  }

  fade(amount: number) {
    const { grid, age } = this;
    for (let i = 0; i < age.length; i++) {
      if (!grid[i] && age[i] > 0) age[i] = Math.max(0, age[i] - amount);
    }
  }

  // Copies live cells into a resized grid so a window resize doesn't wipe the board.
  resize(w: number, h: number) {
    if (w === this.w && h === this.h) return;
    const old = this.grid;
    const ow = this.w;
    const oh = this.h;
    this.w = w;
    this.h = h;
    this.grid = new Uint8Array(w * h);
    this.next = new Uint8Array(w * h);
    this.age = new Float32Array(w * h);
    let pop = 0;
    for (let y = 0; y < Math.min(h, oh); y++) {
      for (let x = 0; x < Math.min(w, ow); x++) {
        if (old[y * ow + x]) {
          this.grid[y * w + x] = 1;
          this.age[y * w + x] = 1;
          pop++;
        }
      }
    }
    this.pop = pop;
  }
}

export function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sizes a canvas backing store to its CSS box at device pixel ratio and returns a 2D context in CSS pixels.
export function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}
