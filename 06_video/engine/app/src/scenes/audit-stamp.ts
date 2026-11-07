// The "I don't know" rubber stamp for the audit plate: mono caps in graphite inside a thin
// rounded-rect border, inked unevenly. The ink is a deterministic noise mask applied once to an
// offscreen canvas (no texture files); draw it rotated with a short press-in.
import { clamp, ease, fbm2, hash, noise2, prog } from '../engine/util';
import { C, TYPE, measureText } from './_kit';

const RES = 3; // offscreen px per logical px

export interface Stamp { canvas: HTMLCanvasElement; w: number; h: number }

/** Render a stamp once. `seed` varies the ink pattern. */
export function makeStamp(label: string, px: number, seed: number, color: string = C.graphite): Stamp {
  const f = TYPE.mono(px, 600);
  const ls = px * 0.08;
  const tw = measureText(label, f, ls);
  const padX = px * 0.6, padY = px * 0.42;
  const w = Math.ceil(tw + padX * 2 + 4), h = Math.ceil(px + padY * 2 + 4);
  const cv = document.createElement('canvas');
  cv.width = w * RES;
  cv.height = h * RES;
  const c = cv.getContext('2d')!;
  c.scale(RES, RES);
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 2;
  const r = px * 0.28;
  c.beginPath();
  c.roundRect(2, 2, w - 4, h - 4, r);
  c.stroke();
  c.font = f;
  (c as any).letterSpacing = `${ls}px`;
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  c.fillText(label, padX + 2, h / 2 + px * 0.04);

  // uneven ink: broad pressure variation, a mid-scale mottle, a pressure falloff toward one edge,
  // and sparse speckle dropouts where the stamp missed the paper
  const img = c.getImageData(0, 0, cv.width, cv.height);
  const d = img.data;
  const tilt = hash(seed, 7) * 2 - 1;
  for (let y = 0; y < cv.height; y++) {
    for (let x = 0; x < cv.width; x++) {
      const i = (y * cv.width + x) * 4 + 3;
      if (d[i] === 0) continue;
      const lx = x / RES, ly = y / RES;
      const broad = fbm2(lx * 0.035, ly * 0.06, 3, seed);
      const mott = noise2(lx * 0.45, ly * 0.45, seed + 11);
      const edge = 1 - 0.22 * clamp(0.5 + tilt * (lx / w - 0.5) * 1.6);
      let m = (0.9 + broad * 0.6 + mott * 0.16) * edge;
      if (hash(Math.floor(lx * 1.3), Math.floor(ly * 1.3), seed) < 0.07) m *= 0.3;
      d[i] = Math.round(d[i]! * clamp(m, 0.18, 1));
    }
  }
  c.putImageData(img, 0, 0);
  return { canvas: cv, w, h };
}

/** Draw a stamp centred-left at (x, cy), rotated `rot` rad, pressed at t0 (short scale-down settle). */
export function drawStamp(c: CanvasRenderingContext2D, s: Stamp, x: number, cy: number, rot: number, t: number, t0: number) {
  if (t < t0) return;
  const p = prog(t, t0, t0 + 0.12, ease.outCubic);
  const k = 1 + (1 - p) * 0.07;
  c.save();
  c.globalAlpha *= p;
  c.translate(x + s.w / 2, cy);
  c.rotate(rot);
  c.scale(k, k);
  c.drawImage(s.canvas, -s.w / 2, -s.h / 2, s.w, s.h);
  c.restore();
}
