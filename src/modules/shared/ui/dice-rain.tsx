'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { readBackgroundAnimation, subscribeBackgroundAnimation } from '../motion';
import { DICE, type Vec3, type Wireframe } from '../dice-geometry';

interface Die {
  layer: number;
  shape: Wireframe;
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rot: [number, number, number];
  spin: [number, number, number];
  alpha: number;
  line: number;
}

const FOCAL = 3.2;

function rotate([x, y, z]: Vec3, [ax, ay, az]: readonly [number, number, number]): Vec3 {
  const [sx, cx, sy, cy, sz, cz] = [
    Math.sin(ax),
    Math.cos(ax),
    Math.sin(ay),
    Math.cos(ay),
    Math.sin(az),
    Math.cos(az),
  ];
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
}

/** Camadas de paralaxe, do fundo para a frente: quanto mais perto, maior, mais rápido e mais nítido. */
const LAYERS = [
  { share: 0.5, size: [8, 15], speed: [14, 24], spin: 0.5, alpha: 0.13, line: 0.8 },
  { share: 0.32, size: [18, 30], speed: [34, 48], spin: 0.8, alpha: 0.22, line: 1.1 },
  { share: 0.18, size: [36, 58], speed: [68, 92], spin: 1.1, alpha: 0.32, line: 1.5 },
] as const;

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

function spawn(layer: number, width: number, height: number, anywhere: boolean): Die {
  const { size: sizes, speed, spin, alpha, line } = LAYERS[layer]!;
  const size = between(sizes);
  const turn = () => (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.7) * spin;
  return {
    layer,
    shape: DICE[Math.floor(Math.random() * DICE.length)]!,
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -size * 2,
    size,
    speed: between(speed),
    drift: (Math.random() - 0.5) * 8 * spin,
    rot: [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28],
    spin: [turn(), turn(), turn()],
    alpha,
    line,
  };
}

function draw(ctx: CanvasRenderingContext2D, die: Die) {
  const points = die.shape.vertices.map((v) => {
    const [x, y, z] = rotate(v, die.rot);
    const scale = FOCAL / (FOCAL - z);
    return { x: die.x + x * die.size * scale, y: die.y + y * die.size * scale, z };
  });
  ctx.lineWidth = die.line;
  for (const [a, b] of die.shape.edges) {
    const [p, q] = [points[a]!, points[b]!];
    const depth = (p.z + q.z) / 2; // -1 (longe) a 1 (perto)
    ctx.globalAlpha = die.alpha * (0.45 + 0.55 * ((depth + 1) / 2));
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  }
}

/** Fundo decorativo: dados em arame (sem preenchimento) caindo e girando em 3D. */
export function DiceRain() {
  const enabled = useSyncExternalStore(
    subscribeBackgroundAnimation,
    readBackgroundAnimation,
    () => true,
  );
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let dice: Die[] = [];
    let color = '#9cdef2';
    let frame = 0;
    let last = 0;
    let raf = 0;

    const readColor = () => {
      color = getComputedStyle(document.body).color || color;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(48, Math.max(16, Math.round(width / 40)));
      dice = LAYERS.flatMap((layer, index) =>
        Array.from({ length: Math.round(count * layer.share) }, () =>
          spawn(index, width, height, true),
        ),
      );
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineJoin = 'round';
      for (const die of dice) draw(ctx, die);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (frame++ % 120 === 0) readColor();
      for (let i = 0; i < dice.length; i++) {
        const die = dice[i]!;
        die.y += die.speed * dt;
        die.x += die.drift * dt;
        for (let k = 0; k < 3; k++) die.rot[k]! += die.spin[k]! * dt;
        if (die.y - die.size * 2 > height) dice[i] = spawn(die.layer, width, height, false);
      }
      paint();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      readColor();
      if (reduced.matches) paint();
      else {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    start();
    window.addEventListener('resize', resize);
    reduced.addEventListener('change', start);
    const theme = new MutationObserver(() => {
      readColor();
      if (reduced.matches) paint();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      reduced.removeEventListener('change', start);
      theme.disconnect();
    };
  }, [enabled]);

  return enabled ? <canvas ref={ref} className="dice-rain" aria-hidden="true" /> : null;
}
