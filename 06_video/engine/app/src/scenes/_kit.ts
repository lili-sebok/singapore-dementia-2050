// Shared kit for the marking-session plates (docs/TREATMENT.md): paper and screen grounds,
// the red pen (ticks, strikes, circles, arrows, handwritten notes, with a nib that travels between
// marks), typeset text helpers, transcript blocks, hatching and narration cues.
// Everything is a pure function of time: marks are declared once (in init) with their times,
// and draw(t) renders the state at t.
import * as THREE from 'three';
import { FSPass } from '../engine/gl';
import { F, font } from '../engine/type';
import { strokeText, drawStrokeText, type StrokeText, type StrokeFontName } from '../engine/stroke';
import { HEX } from '../engine/palette';
import { clamp, ease, hash, noise1, polylineLengths, pointAtLength, prog, type V2 } from '../engine/util';
import type { Lyrics } from '../engine/lyrics';

export type P = V2;
export const C = HEX;

// ---------------------------------------------------------------- grid
/** 12-column grid on 1920x1080: 120 px margins, 24 px gutters. col(i) = left edge of column i (0..11). */
export const GRID = { margin: 120, gutter: 24, cols: 12, top: 110, bottom: 970 };
const COLW = (1920 - 2 * GRID.margin - 11 * GRID.gutter) / 12;
export const col = (i: number) => GRID.margin + i * (COLW + GRID.gutter);
export const span = (n: number) => n * COLW + (n - 1) * GRID.gutter;

// ---------------------------------------------------------------- type presets
export const TYPE = {
  display: (px: number, width = 100, weight = 700) => font(F.archivo(width, weight), px),
  label: (px: number) => font(F.archivo(100, 700), px),
  body: (px: number, weight = 500) => font(F.archivo(100, weight), px),
  mono: (px: number, weight = 400) => font(F.mono(weight), px),
  serifItalic: (px: number) => font(F.serif(400, true), px),
};

const scratch = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d')! : (null as any);
/** Width of `text` in a CSS font string (with the font's kerning). */
export function measureText(text: string, fontStr: string, letterSpacing = 0) {
  scratch.font = fontStr;
  (scratch as any).letterSpacing = `${letterSpacing}px`;
  return scratch.measureText(text).width;
}
/** Horizontal span [x0, x1] of the first occurrence of `word` in `text` drawn at x. */
export function wordSpan(text: string, word: string, fontStr: string, x = 0, letterSpacing = 0, nth = 0): [number, number] {
  let i = -1;
  for (let k = 0; k <= nth; k++) i = text.indexOf(word, i + 1);
  if (i < 0) throw new Error(`wordSpan: '${word}' not in '${text}'`);
  const a = x + measureText(text.slice(0, i), fontStr, letterSpacing);
  return [a, a + measureText(word, fontStr, letterSpacing)];
}

/** Draw text with options. Returns the width drawn. */
export function text(c: CanvasRenderingContext2D, s: string, x: number, y: number, fontStr: string, color: string = C.ink, o: { align?: CanvasTextAlign; ls?: number; alpha?: number } = {}) {
  c.save();
  c.font = fontStr;
  c.fillStyle = color;
  c.textAlign = o.align ?? 'left';
  c.textBaseline = 'alphabetic';
  (c as any).letterSpacing = `${o.ls ?? 0}px`;
  c.globalAlpha *= o.alpha ?? 1;
  c.fillText(s, x, y);
  const w = c.measureText(s).width;
  c.restore();
  return w;
}

/** Typewriter reveal: the first n chars of `s`, n advancing at `cps` from t0. Returns chars shown. */
export function typeOn(c: CanvasRenderingContext2D, s: string, x: number, y: number, fontStr: string, color: string, t: number, t0: number, cps = 60, o: { ls?: number; cursor?: boolean; cursorColor?: string } = {}) {
  const n = clamp(Math.floor((t - t0) * cps), 0, s.length);
  if (t < t0) return 0;
  const shown = s.slice(0, n);
  const w = text(c, shown, x, y, fontStr, color, { ls: o.ls });
  if (o.cursor && (n < s.length || Math.floor(t * 2.2) % 2 === 0)) {
    const px = parseFloat(fontStr);
    c.fillStyle = o.cursorColor ?? color;
    c.fillRect(x + w + 2, y - px * 0.78, px * 0.55, px * 0.95);
  }
  return n;
}

/** A 1 px (logical) hairline. */
export function hair(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string = C.rule, w = 1.25) {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = w;
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.stroke();
  c.restore();
}

/** Draw a hairline growing from x0 to x1 over [t0, t1]. */
export function ruleOn(c: CanvasRenderingContext2D, x0: number, x1: number, y: number, t: number, t0: number, t1: number, color: string = C.rule, w = 1.25) {
  const p = prog(t, t0, t1, ease.outCubic);
  if (p <= 0) return;
  hair(c, x0, y, x0 + (x1 - x0) * p, y, color, w);
}

/** Engraving-style hatching inside a rect (Gemini's fill). */
export function hatchRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string = C.ink, spacing = 7, lw = 1.3, angle = Math.PI / 4) {
  if (w <= 0 || h <= 0) return;
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.beginPath();
  const d = Math.hypot(w, h);
  const cx = x + w / 2, cy = y + h / 2;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  for (let k = -d; k <= d; k += spacing) {
    const px = cx + -sa * k, py = cy + ca * k;
    c.moveTo(px - ca * d, py - sa * d);
    c.lineTo(px + ca * d, py + sa * d);
  }
  c.stroke();
  c.restore();
}

/** The official-figure device: text in a thin ruled box. Returns the box [x, y, w, h]. */
export function ruledBox(c: CanvasRenderingContext2D, s: string, x: number, y: number, fontStr: string, color: string = C.ink, pad = 10, alpha = 1) {
  const w = measureText(s, fontStr);
  const px = parseFloat(fontStr);
  c.save();
  c.globalAlpha *= alpha;
  text(c, s, x + pad, y, fontStr, color);
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  c.strokeRect(x, y - px * 0.82 - pad * 0.6, w + pad * 2, px * 0.82 + pad * 1.5);
  c.restore();
  return [x, y - px * 0.82 - pad * 0.6, w + pad * 2, px * 0.82 + pad * 1.5] as const;
}

/** Candidate label: a small boxed letter and the name. Returns the total width. */
export function candidate(c: CanvasRenderingContext2D, which: 'A' | 'B', name: string, x: number, y: number, px = 24, color: string = C.ink, alpha = 1) {
  c.save();
  c.globalAlpha *= alpha;
  const box = px * 1.3;
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  if (which === 'A') { c.fillStyle = color; c.fillRect(x, y - box * 0.8, box, box); }
  else { c.strokeRect(x, y - box * 0.8, box, box); hatchRect(c, x, y - box * 0.8, box, box, color, 5, 1.1); c.fillStyle = C.paper; c.fillRect(x + box * 0.22, y - box * 0.62, box * 0.56, box * 0.64); }
  text(c, which, x + box / 2, y - box * 0.8 + box * 0.73, TYPE.label(px * 0.78), which === 'A' ? C.paper : color, { align: 'center' });
  const w = text(c, name, x + box + px * 0.5, y, TYPE.label(px), color);
  c.restore();
  return box + px * 0.5 + w;
}

// ---------------------------------------------------------------- grounds
/** Paper ground: flat paper colour with faint fibre and mottling (print, not gloss). */
export class Paper {
  pass = new FSPass(/* glsl */ `
    uniform float seed;
    void main() {
      vec2 p = FRAG_PX;
      float fib = snoise(vec2(p.x * 0.9, p.y * 0.035) + seed) * 0.5 + snoise(vec2(p.x * 0.04, p.y * 1.1) - seed) * 0.5;
      float mott = fbm(p * 0.004 + seed * 0.1, 4);
      float grain = hash12(floor(p) + seed);
      vec3 c = C_PAPER * (1.0 + fib * 0.010 + mott * 0.030 + (grain - 0.5) * 0.012);
      fragColor = vec4(c, 1.0);
    }`, { seed: { value: 3.0 } });
  render(renderer: THREE.WebGLRenderer, out: THREE.WebGLRenderTarget) { this.pass.render(renderer, out); }
}

// ---------------------------------------------------------------- narration cues
/** Start time of a word in the narration line containing `line` (word by text match or index). */
export function cue(ly: Lyrics, line: string, word: string | number = 0, nth = 0): number {
  const l = ly.get(line, nth);
  if (typeof word === 'number') return l.words[Math.min(word, l.words.length - 1)]!.start;
  const q = word.toLowerCase().replace(/[^a-z0-9.,]/g, '');
  const w = l.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9.,]/g, '').startsWith(q));
  if (!w) throw new Error(`cue: '${word}' not in '${l.text}'`);
  return w.start;
}
/** End time of a narration line (or of a word in it). */
export function cueEnd(ly: Lyrics, line: string, word?: string | number, nth = 0): number {
  const l = ly.get(line, nth);
  if (word === undefined) return l.end;
  if (typeof word === 'number') return l.words[Math.min(word, l.words.length - 1)]!.end;
  const q = word.toLowerCase().replace(/[^a-z0-9.,]/g, '');
  const w = l.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9.,]/g, '').startsWith(q));
  if (!w) throw new Error(`cueEnd: '${word}' not in '${l.text}'`);
  return w.end;
}

// ---------------------------------------------------------------- the red pen
interface PathMark { kind: 'path'; pts: P[]; L: Float32Array; t0: number; t1: number; w: number; easeFn: (x: number) => number }
interface NoteMark { kind: 'note'; st: StrokeText; x: number; y: number; t0: number; t1: number; w: number }
type Mark = PathMark | NoteMark;

/** Hand wobble: perpendicular jitter along a polyline (deterministic). */
function wobble(pts: P[], amp: number, seed: number, step = 6): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!, b = pts[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.ceil(len / step));
    const nx = -(b.y - a.y) / (len || 1), ny = (b.x - a.x) / (len || 1);
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const s = (i + u) * 0.7;
      const j = noise1(s * 1.7 + seed * 13.1, seed) * amp;
      out.push({ x: a.x + (b.x - a.x) * u + nx * j, y: a.y + (b.y - a.y) * u + ny * j });
    }
  }
  out.push(pts[pts.length - 1]!);
  return out;
}

export interface PenOpts { width?: number; dur?: number; seed?: number }

/**
 * The checker's red pen. Declare marks with their start time (and duration); draw(c, t) renders
 * every mark written so far plus the nib, which travels (lifted) between consecutive marks,
 * enters before the first and leaves after the last.
 */
export class Pen {
  marks: Mark[] = [];
  color: string = C.pen;
  width = 3.4;
  /** Seconds the nib takes to travel to the next mark; gaps longer than `park` send it off-frame. */
  travel = 0.38;
  park = 2.6;
  home: P = { x: 2080, y: 1240 };

  path(pts: P[], t0: number, dur = 0.4, o: PenOpts & { easeFn?: (x: number) => number } = {}) {
    const L = polylineLengths(pts);
    this.marks.push({ kind: 'path', pts, L, t0, t1: t0 + dur, w: o.width ?? this.width, easeFn: o.easeFn ?? ease.inOutQuad });
    // for the sound mix (tools/mix.ts): every pen stroke gets a felt-tip tick
    ((globalThis as any).__sfxPen ??= []).push(t0);
    this.marks.sort((a, b) => a.t0 - b.t0);
    return this;
  }
  /** A tick whose short stroke starts at (x, y) - size. (x, y) is the bottom of the V. */
  tick(x: number, y: number, size: number, t0: number, o: PenOpts = {}) {
    const s = size;
    const pts = [{ x: x - s * 0.42, y: y - s * 0.38 }, { x: x - s * 0.08, y }, { x: x + s * 0.55, y: y - s * 0.95 }];
    return this.path(wobble(pts, 1.2, o.seed ?? x * 0.13 + y), t0, o.dur ?? 0.3, { ...o, easeFn: ease.inOutQuad });
  }
  /** A slightly irregular strike-through from x0 to x1 at height y. */
  strike(x0: number, x1: number, y: number, t0: number, o: PenOpts = {}) {
    const sd = o.seed ?? x0 + y;
    const pts = [{ x: x0 - 8, y: y + 3 + (hash(sd) - 0.5) * 4 }, { x: x1 + 8, y: y - 3 + (hash(sd + 1) - 0.5) * 4 }];
    return this.path(wobble(pts, 1.6, sd), t0, o.dur ?? 0.32, o);
  }
  /** Underline with a slight upward drift. */
  underline(x0: number, x1: number, y: number, t0: number, o: PenOpts = {}) {
    const sd = o.seed ?? x0 * 0.7 + y;
    return this.path(wobble([{ x: x0 - 4, y: y + 2 }, { x: x1 + 6, y: y - 3 }], 1.4, sd), t0, o.dur ?? 0.35, o);
  }
  /** Hand-drawn ellipse that overshoots its start. */
  circle(cx: number, cy: number, rx: number, ry: number, t0: number, o: PenOpts = {}) {
    const sd = o.seed ?? cx + cy * 0.3;
    const a0 = -2.2 + hash(sd) * 0.4, turns = 1.12;
    const pts: P[] = [];
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * Math.PI * 2 * turns;
      const r = 1 + 0.06 * Math.sin(a * 2 + sd) + 0.03 * (i / n);
      pts.push({ x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r });
    }
    return this.path(wobble(pts, 1.0, sd, 8), t0, o.dur ?? 0.5, o);
  }
  /** Arrow from a to b, optionally bowed; head drawn as part of the same stroke. */
  arrow(a: P, b: P, t0: number, o: PenOpts & { bend?: number } = {}) {
    const bend = o.bend ?? 0.18;
    const mx = (a.x + b.x) / 2 + -(b.y - a.y) * bend, my = (a.y + b.y) / 2 + (b.x - a.x) * bend;
    const pts: P[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      pts.push({ x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * my + u * u * b.y });
    }
    const end = pts[pts.length - 1]!, prev = pts[pts.length - 4]!;
    const ang = Math.atan2(end.y - prev.y, end.x - prev.x);
    const hl = 18;
    pts.push({ x: end.x - Math.cos(ang - 0.45) * hl, y: end.y - Math.sin(ang - 0.45) * hl });
    pts.push(end);
    pts.push({ x: end.x - Math.cos(ang + 0.45) * hl, y: end.y - Math.sin(ang + 0.45) * hl });
    return this.path(wobble(pts, 0.8, o.seed ?? a.x + b.y), t0, o.dur ?? 0.45, o);
  }
  /** Handwritten note (single-stroke script), baseline-left at (x, y), em size px. */
  note(s: string, x: number, y: number, px: number, t0: number, o: PenOpts & { font?: StrokeFontName; cps?: number } = {}) {
    const st = strokeText(s, o.font ?? 'hscript', px);
    const dur = o.dur ?? Math.max(0.35, s.length / (o.cps ?? 11));
    this.marks.push({ kind: 'note', st, x, y, t0, t1: t0 + dur, w: o.width ?? Math.max(2.2, px * 0.045) });
    this.marks.sort((a, b) => a.t0 - b.t0);
    return { width: st.width, end: t0 + dur };
  }
  /** A score written in the margin: the number (the script font's wide '.' is replaced by a tight dot) and an underline. */
  score(value: number, x: number, y: number, px: number, t0: number) {
    const [ip, fp] = value.toFixed(1).split('.');
    const a = this.note(ip!, x, y, px, t0, { cps: 8 });
    const dx = x + a.width + px * 0.05, dy = y - px * 0.03, r = px * 0.035;
    const dot: P[] = [];
    for (let i = 0; i <= 10; i++) dot.push({ x: dx + Math.cos((i / 10) * Math.PI * 2) * r, y: dy + Math.sin((i / 10) * Math.PI * 2) * r });
    this.path(dot, a.end + 0.02, 0.08, { width: Math.max(2.6, px * 0.06) });
    const b = this.note(fp!, dx + r + px * 0.08, y, px, a.end + 0.12, { cps: 8 });
    const width = dx + r + px * 0.08 + b.width - x;
    this.underline(x - 4, x + width + 4, y + px * 0.18, b.end + 0.05, { dur: 0.22 });
    return { width, end: b.end + 0.3 };
  }

  private headOf(m: Mark, t: number): P | null {
    const p = clamp((t - m.t0) / Math.max(1e-3, m.t1 - m.t0));
    if (m.kind === 'path') {
      const total = m.L[m.L.length - 1]!;
      const h = pointAtLength(m.pts, m.L, m.easeFn(p) * total);
      return { x: h.x, y: h.y };
    }
    const c = { x: 0, y: 0 };
    let head: P | null = null;
    // find head by walking strokes (no drawing): reuse drawStrokeText's logic on a null context
    const len = p * m.st.total;
    for (let i = 0; i < m.st.strokes.length; i++) {
      const s0 = m.st.startLen[i]!;
      if (s0 > len) break;
      const pts = m.st.strokes[i]!, L = m.st.lens[i]!;
      const hp = pointAtLength(pts, L, Math.min(len - s0, L[L.length - 1]!));
      head = { x: m.x + hp.x, y: m.y + hp.y };
    }
    return head ?? { x: m.x + c.x, y: m.y };
  }
  private startOf(m: Mark): P { return m.kind === 'path' ? m.pts[0]! : { x: m.x + (m.st.strokes[0]?.[0]?.x ?? 0), y: m.y + (m.st.strokes[0]?.[0]?.y ?? 0) }; }
  private endOf(m: Mark): P { return this.headOf(m, m.t1)!; }

  /** Nib position at t and whether it is touching the paper. */
  nib(t: number): { p: P; down: boolean } | null {
    const ms = this.marks;
    if (!ms.length) return null;
    for (const m of ms) if (t >= m.t0 && t <= m.t1) return { p: this.headOf(m, t)!, down: true };
    // between marks
    let prev: Mark | null = null, next: Mark | null = null;
    for (const m of ms) { if (m.t1 < t) { if (!prev || m.t1 > prev.t1) prev = m; } else if (m.t0 > t && !next) next = m; }
    const from = prev ? this.endOf(prev) : this.home;
    const to = next ? this.startOf(next) : this.home;
    const gapStart = prev ? prev.t1 : -Infinity, gapEnd = next ? next.t0 : Infinity;
    const lerpP = (a: P, b: P, u: number) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
    if (gapEnd - gapStart > this.park) {
      // leave after prev, come back before next
      if (prev && t < gapStart + this.travel * 1.6) return { p: lerpP(from, this.home, ease.inCubic(clamp((t - gapStart) / (this.travel * 1.6)))), down: false };
      if (next && t > gapEnd - this.travel * 1.6) return { p: lerpP(this.home, to, ease.outCubic(clamp((t - (gapEnd - this.travel * 1.6)) / (this.travel * 1.6)))), down: false };
      return null;
    }
    const u = ease.inOutCubic(clamp((t - gapStart) / Math.max(1e-3, Math.min(this.travel, gapEnd - gapStart))));
    return { p: lerpP(from, to, u), down: false };
  }

  /** Draw all marks written by t, then the nib. */
  draw(c: CanvasRenderingContext2D, t: number, o: { nib?: boolean; alpha?: number } = {}) {
    c.save();
    c.globalAlpha *= o.alpha ?? 1;
    c.strokeStyle = this.color;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const m of this.marks) {
      if (t < m.t0) continue;
      const p = clamp((t - m.t0) / Math.max(1e-3, m.t1 - m.t0));
      c.lineWidth = m.w;
      if (m.kind === 'path') {
        const total = m.L[m.L.length - 1]!;
        const len = m.easeFn(p) * total;
        c.beginPath();
        c.moveTo(m.pts[0]!.x, m.pts[0]!.y);
        for (let i = 1; i < m.pts.length; i++) {
          if (m.L[i]! <= len) c.lineTo(m.pts[i]!.x, m.pts[i]!.y);
          else {
            const h = pointAtLength(m.pts, m.L, len);
            c.lineTo(h.x, h.y);
            break;
          }
        }
        c.stroke();
      } else {
        c.save();
        c.translate(m.x, m.y);
        drawStrokeText(c, m.st, p * m.st.total);
        c.restore();
      }
    }
    if (o.nib !== false) {
      const n = this.nib(t);
      if (n) drawNib(c, n.p.x, n.p.y, n.down);
    }
    c.restore();
  }
}

/** The pen seen from above: a tapered barrel reaching to the lower right, a dark tip, a red point. */
export function drawNib(c: CanvasRenderingContext2D, x: number, y: number, down: boolean) {
  const lift = down ? 0 : 7;
  const ang = 0.62; // barrel direction (radians, down-right)
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const nx = -sa, ny = ca;
  c.save();
  // contact shadow on the paper when lifted (soft, faint)
  if (!down) {
    c.fillStyle = 'rgba(22,22,26,0.10)';
    c.beginPath();
    c.ellipse(x + 3, y + 4, 5, 3, 0, 0, Math.PI * 2);
    c.fill();
  }
  const tx = x - lift * 0.4, ty = y - lift;
  const seg = (d: number, w: number) => ({ x: tx + ca * d + nx * w, y: ty + sa * d + ny * w });
  // cone
  c.fillStyle = '#2A2A30';
  c.beginPath();
  const a = seg(0, 0), b = seg(34, 6.5), d = seg(34, -6.5);
  c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(d.x, d.y); c.closePath(); c.fill();
  // barrel
  c.fillStyle = C.penDark;
  c.beginPath();
  const p1 = seg(34, 8), p2 = seg(240, 10), p3 = seg(240, -10), p4 = seg(34, -8);
  c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.lineTo(p3.x, p3.y); c.lineTo(p4.x, p4.y); c.closePath(); c.fill();
  // barrel highlight (a flat lighter band, no gradient)
  c.fillStyle = 'rgba(255,255,255,0.12)';
  c.beginPath();
  const h1 = seg(40, 3.5), h2 = seg(238, 4.5), h3 = seg(238, 1.5), h4 = seg(40, 1.2);
  c.moveTo(h1.x, h1.y); c.lineTo(h2.x, h2.y); c.lineTo(h3.x, h3.y); c.lineTo(h4.x, h4.y); c.closePath(); c.fill();
  // grip ring
  c.strokeStyle = 'rgba(0,0,0,0.35)';
  c.lineWidth = 1.5;
  const r1 = seg(62, 8.6), r2 = seg(62, -8.6);
  c.beginPath(); c.moveTo(r1.x, r1.y); c.lineTo(r2.x, r2.y); c.stroke();
  // point
  c.fillStyle = C.pen;
  c.beginPath();
  c.arc(tx, ty, 2.4, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

// ---------------------------------------------------------------- transcript blocks
export interface TranscriptLayout {
  x: number; y: number; w: number; px: number; lh: number;
  header: string; lines: { s: string; x: number; y: number; start: number }[]; text: string;
}
/** Wrap a quote into a transcript block (mono). y = baseline of the header line. */
export function layoutTranscript(textStr: string, header: string, x: number, y: number, w: number, px = 26, lh = 1.5): TranscriptLayout {
  const f = TYPE.mono(px);
  const words = textStr.split(' ');
  const lines: { s: string; x: number; y: number; start: number }[] = [];
  let cur = '', start = 0, idx = 0;
  const top = y + px * 1.9;
  for (const word of words) {
    const tryS = cur ? `${cur} ${word}` : word;
    if (measureText(tryS, f) > w - 28 && cur) {
      lines.push({ s: cur, x: x + 28, y: top + lines.length * px * lh, start });
      start = idx;
      cur = word;
    } else cur = tryS;
    idx += word.length + 1;
  }
  if (cur) lines.push({ s: cur, x: x + 28, y: top + lines.length * px * lh, start });
  return { x, y, w, px, lh, header, lines, text: textStr };
}
/** Bottom y of a transcript block. */
export const transcriptBottom = (L: TranscriptLayout) => L.lines[L.lines.length - 1]!.y + L.px * 0.6;
/** Span of a word inside a transcript: { x0, x1, y (baseline), px }. nth = which occurrence. */
export function transcriptWord(L: TranscriptLayout, word: string, nth = 0) {
  let k = 0;
  for (const ln of L.lines) {
    let i = -1;
    while ((i = ln.s.indexOf(word, i + 1)) >= 0) {
      if (k++ === nth) {
        const f = TYPE.mono(L.px);
        const x0 = ln.x + measureText(ln.s.slice(0, i), f);
        return { x0, x1: x0 + measureText(word, f), y: ln.y, px: L.px };
      }
    }
  }
  throw new Error(`transcriptWord: '${word}' not in transcript`);
}
/** Draw a transcript block, revealing chars at cps from t0 (header and rule appear first). */
export function drawTranscript(c: CanvasRenderingContext2D, L: TranscriptLayout, t: number, t0: number, o: { cps?: number; ink?: string; dim?: string; rule?: string; alpha?: number } = {}) {
  if (t < t0) return;
  const ink = o.ink ?? C.ink, dim = o.dim ?? C.graphite, rule = o.rule ?? C.ink;
  c.save();
  c.globalAlpha *= (o.alpha ?? 1) * prog(t, t0, t0 + 0.2);
  text(c, L.header, L.x, L.y, TYPE.label(15), dim, { ls: 2.2 });
  const bottom = transcriptBottom(L);
  const rp = prog(t, t0, t0 + 0.35, ease.outCubic);
  hair(c, L.x + 6, L.y + L.px * 0.75, L.x + 6, L.y + L.px * 0.75 + (bottom - L.y - L.px * 0.75) * rp, rule, 2);
  const n = Math.floor(Math.max(0, t - t0 - 0.25) * (o.cps ?? 90));
  for (const ln of L.lines) {
    const k = clamp(n - ln.start, 0, ln.s.length);
    if (k > 0) text(c, ln.s.slice(0, k), ln.x, ln.y, TYPE.mono(L.px), ink);
  }
  c.restore();
}
/** Time at which drawTranscript has revealed the whole text. */
export const transcriptDone = (L: TranscriptLayout, t0: number, cps = 90) => t0 + 0.25 + L.text.length / cps;
