// Plate: prompt. Three prompt versions as plain ruled cards across the top (their columns are the
// chart's x positions), then a slope chart drawn as a pen plotter would: axes, ticks, A (solid line,
// filled points, V2 as a two-run range bar), B (dashed line, open points). A's rescaled 2030 answer
// is tagged identically beside each of its points and the pen rings all three tags in one loop
// (docs/TREATMENT.md, "prompt").
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { clamp, ease, hash, noise1, polylineLengths, pointAtLength, prog } from '../engine/util';
import { CAND, Q2 } from '../data';
import { C, Paper, Pen, TYPE, candidate, col, cue, hair, measureText, span, text, typeOn, type P } from './_kit';

type V = 'V1' | 'V2' | 'V3';
const VS: V[] = ['V1', 'V2', 'V3'];

// chart frame
const AX = 176; // y axis x
const Y0 = 830, LO = 40, HI = 90, KY = 6.8; // y(LO) = Y0, px per point
const yOf = (s: number) => Y0 - (s - LO) * KY;
const CARD_Y = 172, CARD_H = 276;
const xOf = (i: number) => col(i * 4) + span(4) / 2; // the chart's x positions are the card centres

const TAG = Q2.rescaledA.y2030;
const TAG_F = TYPE.mono(18, 500);
const TAG_DX = -16, TAG_DY = -48; // tag's right edge and baseline, relative to its point

export default class Prompt extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  t: Record<string, number> = {};
  aPts: P[] = [];
  bPts: P[] = [];
  aBar = { x: 0, y0: 0, y1: 0 };
  tagAt: number[] = [];

  override init() {
    const ly = this.ctx.lyrics;
    const L1 = 'A more detailed prompt', L2 = 'But under every prompt', L3 = 'The checklist got them', L4 = "It didn't get them";
    this.t = {
      s: this.ctx.start,
      v2: cue(ly, L1, 'more'),
      v3: cue(ly, L1, 'detailed'),
      axes: cue(ly, L1, 'prompt'),
      a: cue(ly, L1, 'raised'),
      b: cue(ly, L1, 'both'),
      same: cue(ly, L2, 'same'),
      resc: cue(ly, L2, 'rescaled'),
      check: cue(ly, L3, 'checklist'),
      not: cue(ly, L4, "didn't"),
    };
    const T = this.t;
    const pa = Q2.prompts.A, pb = Q2.prompts.B;
    const aMid = (pa.V2[0] + pa.V2[1]) / 2; // where A's line meets its range bar (a position, not a reported score)
    this.aPts = [{ x: xOf(0), y: yOf(pa.V1) }, { x: xOf(1), y: yOf(aMid) }, { x: xOf(2), y: yOf(pa.V3) }];
    this.aBar = { x: xOf(1), y0: yOf(Math.max(...pa.V2)), y1: yOf(Math.min(...pa.V2)) };
    this.bPts = [{ x: xOf(0), y: yOf(pb.V1) }, { x: xOf(1), y: yOf(pb.V2[0]) }, { x: xOf(2), y: yOf(pb.V3) }];
    this.tagAt = [0, 1, 2].map((i) => T.same! + i * 0.12);

    // one continuous loop around the three tags, through hand-picked points on their padded boxes
    const tw = measureText(TAG, TAG_F);
    const box = (p: P) => ({ x0: p.x + TAG_DX - tw - 18, x1: p.x + TAG_DX + 14, y0: p.y + TAG_DY - 13 - 14, y1: p.y + TAG_DY + 5 + 12 });
    const [b1, b2, b3] = this.aPts.map(box) as [ReturnType<typeof box>, ReturnType<typeof box>, ReturnType<typeof box>];
    const ctrl: P[] = [
      { x: b1.x0 + 34, y: b1.y0 - 2 },
      { x: b1.x0 + 80, y: b1.y0 - 10 },
      { x: (b1.x1 + b2.x0) / 2, y: (b1.y0 + b2.y0) / 2 - 22 },
      { x: b2.x0 + 60, y: b2.y0 - 6 },
      { x: (b2.x1 + b3.x0) / 2, y: (b2.y0 + b3.y0) / 2 - 18 },
      { x: b3.x0 + 70, y: b3.y0 - 4 },
      { x: b3.x1 - 6, y: b3.y0 + 2 },
      { x: b3.x1 + 8, y: (b3.y0 + b3.y1) / 2 },
      { x: b3.x1 - 10, y: b3.y1 + 2 },
      { x: (b2.x1 + b3.x0) / 2 + 40, y: (b2.y1 + b3.y1) / 2 + 2 },
      { x: b2.x1 - 8, y: b2.y1 + 3 },
      { x: (b1.x1 + b2.x0) / 2, y: (b1.y1 + b2.y1) / 2 + 4 },
      { x: b1.x1 - 4, y: b1.y1 + 2 },
      { x: b1.x0 + 20, y: b1.y1 + 4 },
      { x: b1.x0 - 6, y: (b1.y0 + b1.y1) / 2 + 2 },
      { x: b1.x0 + 10, y: b1.y0 + 2 },
      { x: b1.x0 + 46, y: b1.y0 - 10 },
      { x: b1.x0 + 120, y: b1.y0 - 24 }, // overshoot past the start
    ];
    this.pen.path(wobbly(catmull(ctrl, 14), 1.6, 7.3), T.resc!, 1.35, { easeFn: inOutSine });
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();

    const x0 = col(0), x1 = col(11) + span(1);
    const ha = 1; // the header is on the page from the cut
    text(c, 'QUESTION 2c · THREE PROMPT VERSIONS', x0, 140, TYPE.label(16), C.graphite, { ls: 3, alpha: ha });
    text(c, 'SCORE OUT OF 100', x1, 140, TYPE.label(16), C.graphite, { ls: 3, align: 'right', alpha: ha });

    this.drawCards(c, t);
    this.drawChart(c, t);

    // closing line, in two halves with the two sentences
    const cy = 930;
    const fA = TYPE.display(40, 100, 500), fI = TYPE.serifItalic(50);
    const s1 = 'The checklist fixed coverage, ', s2 = 'not ', s3 = 'judgement', s4 = '.';
    const a1 = prog(t, T.check!, T.check! + 0.3), a2 = prog(t, T.not!, T.not! + 0.3);
    let x = x0;
    x += text(c, s1, x, cy, fA, C.ink, { alpha: a1, ls: -0.3 });
    x += text(c, s2, x, cy, fA, C.ink, { alpha: a2, ls: -0.3 });
    x += text(c, s3, x, cy, fI, C.ink, { alpha: a2 });
    text(c, s4, x, cy, fA, C.ink, { alpha: a2 });

    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }

  // ------------------------------------------------------------ prompt cards
  private drawCards(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const t0s = [T.s! + 0.05, T.v2!, T.v3!];
    const names = ['MINIMAL', 'STANDARD', 'GUIDED'];
    const pa = Q2.prompts.A, pb = Q2.prompts.B;
    VS.forEach((v, i) => {
      const t0 = t0s[i]!;
      if (t < t0) return;
      const x = col(i * 4), w = span(4), y = CARD_Y, h = CARD_H;
      // the box draws as a ruled rectangle: top and bottom rules, then the sides
      const p = prog(t, t0, t0 + 0.35, ease.outCubic);
      hair(c, x, y, x + w * p, y, C.ink, 1);
      hair(c, x, y + h, x + w * p, y + h, C.ink, 1);
      const ps = prog(t, t0 + 0.15, t0 + 0.4, ease.outCubic);
      hair(c, x, y, x, y + h * ps, C.ink, 1);
      hair(c, x + w, y, x + w, y + h * ps, C.ink, 1);
      const a = prog(t, t0 + 0.05, t0 + 0.25);
      text(c, v, x + 20, y + 36, TYPE.label(22), C.ink, { alpha: a });
      text(c, names[i]!, x + 66, y + 35, TYPE.label(13), C.graphite, { ls: 2.4, alpha: a });
      hair(c, x + 20, y + 52, x + 20 + (w - 40) * p, y + 52, C.rule, 1);
      const tb = t0 + 0.2;
      const mf = TYPE.mono(17);
      if (v === 'V1') typeOn(c, 'the question and the data', x + 20, y + 84, mf, C.ink, t, tb, 110);
      if (v === 'V2') wrapLines(Q2.v2Text, mf, w - 40).forEach((ln, k, all) => {
        const before = all.slice(0, k).join(' ').length + (k ? 1 : 0);
        typeOn(c, ln, x + 20, y + 84 + k * 24, mf, C.ink, t, tb + before / 110, 110);
      });
      if (v === 'V3') {
        typeOn(c, Q2.v3Role, x + 20, y + 84, mf, C.ink, t, tb, 110);
        const lf = TYPE.mono(14);
        Q2.v3Checklist.forEach((item, k) => {
          const tk = tb + 0.2 + k * 0.06;
          const yy = y + 108 + k * 17.5;
          const ia = prog(t, tk, tk + 0.12);
          if (ia <= 0) return;
          c.save();
          c.globalAlpha = ia;
          c.strokeStyle = C.graphite;
          c.lineWidth = 1;
          c.strokeRect(x + 20.5, yy - 9.5, 9, 9);
          c.restore();
          typeOn(c, item, x + 40, yy, lf, C.ink, t, tk, 140);
        });
      }
      // score row: typeset, the chart below plots the same numbers
      const sa = prog(t, (i === 0 ? T.a! : T.a! + 0.35 * i), (i === 0 ? T.a! : T.a! + 0.35 * i) + 0.25);
      const ry = y + h - 20;
      hair(c, x + 20, ry - 30, x + w - 20, ry - 30, C.rule, 1);
      const av = Array.isArray(pa[v]) ? `${(pa[v] as number[])[0]!.toFixed(1)}–${(pa[v] as number[])[1]!.toFixed(1)}` : (pa[v] as number).toFixed(1);
      const bvRaw = pb[v];
      const bv = Array.isArray(bvRaw) ? (bvRaw[0] === bvRaw[1] ? bvRaw[0]!.toFixed(1) : `${bvRaw[0]!.toFixed(1)}–${bvRaw[1]!.toFixed(1)}`) : (bvRaw as number).toFixed(1);
      const wa = candidate(c, 'A', av, x + 20, ry, 18, C.ink, sa);
      candidate(c, 'B', bv, x + 20 + Math.max(wa, 90) + 34, ry, 18, C.ink, sa);
      if (v === 'V2') text(c, 'TWO RUNS EACH', x + w - 20, ry, TYPE.label(12), C.graphite, { align: 'right', ls: 1.8, alpha: sa });
    });
  }

  // ------------------------------------------------------------ the plotted chart
  private drawChart(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const ta = T.axes!;
    const xEnd = xOf(2) + 40;
    // axes
    const pa = prog(t, ta, ta + 0.35, ease.outCubic);
    if (pa > 0) {
      hair(c, AX, Y0, AX, Y0 - (Y0 - yOf(HI)) * pa, C.ink, 1.2);
      hair(c, AX, Y0, AX + (xEnd - AX) * pa, Y0, C.ink, 1.2);
    }
    // y ticks, gridlines and labels, plotted bottom to top
    for (let s = LO, k = 0; s <= HI; s += 10, k++) {
      const tk = ta + 0.2 + k * 0.05;
      const p = prog(t, tk, tk + 0.3, ease.outCubic);
      if (p <= 0) continue;
      const y = yOf(s);
      hair(c, AX - 8, y, AX, y, C.ink, 1.2);
      if (s > LO) hair(c, AX + 1, y, AX + 1 + (xEnd - AX) * p, y, C.rule, 1);
      text(c, String(s), AX - 16, y + 5, TYPE.mono(15), C.graphite, { align: 'right', alpha: p });
    }
    VS.forEach((v, i) => {
      const tk = ta + 0.3 + i * 0.06;
      const p = prog(t, tk, tk + 0.2);
      if (p <= 0) return;
      const x = xOf(i);
      hair(c, x, Y0, x, Y0 + 8, C.ink, 1.2);
      text(c, v, x, Y0 + 34, TYPE.label(17), C.ink, { align: 'center', alpha: p, ls: 1 });
    });

    // B: dashed line, open points
    const dB = 1.0, dA = 1.0;
    const pb = prog(t, T.b!, T.b! + dB, inOutSine);
    this.plotLine(c, this.bPts, pb, [10, 7]);
    // A: solid line, filled points, V2 as a range bar with end caps
    const pA = prog(t, T.a!, T.a! + dA, inOutSine);
    this.plotLine(c, this.aPts, pA, []);
    const LA = polylineLengths(this.aPts), LB = polylineLengths(this.bPts);
    const reachA = (i: number) => T.a! + dA * invEase(LA[i]! / LA[LA.length - 1]!);
    const reachB = (i: number) => T.b! + dB * invEase(LB[i]! / LB[LB.length - 1]!);
    // range bar grows from the junction to both caps
    const rb = prog(t, reachA(1) - 0.05, reachA(1) + 0.25, ease.outCubic);
    if (rb > 0) {
      const { x, y0, y1 } = this.aBar, ym = this.aPts[1]!.y;
      c.save();
      c.strokeStyle = C.ink;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x, ym - (ym - y0) * rb); c.lineTo(x, ym + (y1 - ym) * rb);
      c.stroke();
      const cp = prog(rb, 0.8, 1);
      if (cp > 0) {
        c.beginPath();
        c.moveTo(x - 10 * cp, y0); c.lineTo(x + 10 * cp, y0);
        c.moveTo(x - 10 * cp, y1); c.lineTo(x + 10 * cp, y1);
        c.stroke();
      }
      c.restore();
    }
    this.bPts.forEach((p, i) => plotPoint(c, p, t, reachB(i), false));
    this.aPts.forEach((p, i) => { if (i !== 1) plotPoint(c, p, t, reachA(i), true); });

    // legend, lower right
    const lx = xOf(1) + 130, ly = Y0 - 26, lxA = lx;
    const la = prog(t, T.a!, T.a! + 0.3), lb = prog(t, T.b!, T.b! + 0.3);
    const sample = (y: number, dash: number[], filled: boolean, a: number, lx = lxA) => {
      if (a <= 0) return;
      c.save();
      c.globalAlpha = a;
      c.strokeStyle = C.ink;
      c.lineWidth = 2;
      c.setLineDash(dash);
      c.beginPath(); c.moveTo(lx, y); c.lineTo(lx + 44, y); c.stroke();
      c.setLineDash([]);
      c.beginPath(); c.arc(lx + 22, y, 5.5, 0, Math.PI * 2);
      c.fillStyle = filled ? C.ink : C.paper; c.fill();
      c.lineWidth = 1.8; c.stroke();
      c.restore();
    };
    sample(ly - 6, [], true, la);
    candidate(c, 'A', CAND.A.name, lx + 60, ly, 16, C.ink, la);
    sample(ly - 6, [10, 7], false, lb, lx + 300);
    candidate(c, 'B', CAND.B.name, lx + 360, ly, 16, C.ink, lb);

    // A's rescaled answer: the same tag in the same place beside each of A's points
    const tw = measureText(TAG, TAG_F);
    this.aPts.forEach((p, i) => {
      const t0 = this.tagAt[i]!;
      if (t < t0) return;
      const lp = prog(t, t0, t0 + 0.15, ease.outCubic);
      // a short leader from the tag to its point
      hair(c, p.x - 9, p.y - 9, p.x - 9 - 16 * lp, p.y - 9 - 16 * lp, C.ink, 1);
      typeOn(c, TAG, p.x + TAG_DX - tw, p.y + TAG_DY, TAG_F, C.ink, t, t0 + 0.08, 90);
    });
    const ca = prog(t, T.resc! + 0.6, T.resc! + 0.9);
    const nx = xEnd + 22, ny = this.aPts[2]!.y + 74;
    [`"${TAG}":`, 'A’s 2030 answer,', 'rescaled to the', 'published 2023 count'].forEach((s, k) =>
      text(c, s, nx, ny + k * 21, TYPE.mono(15), C.graphite, { alpha: ca }));
  }

  private plotLine(c: CanvasRenderingContext2D, pts: P[], p: number, dash: number[]) {
    if (p <= 0) return;
    const Ls = polylineLengths(pts);
    const len = p * Ls[Ls.length - 1]!;
    c.save();
    c.strokeStyle = C.ink;
    c.lineWidth = 2;
    c.lineJoin = 'round';
    c.setLineDash(dash);
    c.beginPath();
    c.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) {
      if (Ls[i]! <= len) c.lineTo(pts[i]!.x, pts[i]!.y);
      else { const h = pointAtLength(pts, Ls, len); c.lineTo(h.x, h.y); break; }
    }
    c.stroke();
    c.restore();
  }
}

/** A plotted point: the outline is drawn round, then (for A) filled. */
function plotPoint(c: CanvasRenderingContext2D, p: P, t: number, t0: number, filled: boolean) {
  const q = prog(t, t0 - 0.02, t0 + 0.16);
  if (q <= 0) return;
  const r = 6;
  c.save();
  c.strokeStyle = C.ink;
  c.lineWidth = 1.8;
  if (!filled) { c.fillStyle = C.paper; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill(); }
  c.beginPath();
  c.arc(p.x, p.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * q);
  c.stroke();
  if (filled && q >= 1) { c.fillStyle = C.ink; c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill(); }
  c.restore();
}

/** Inverse of inOutSine on [0, 1]: when a line drawn with that ease reaches fraction u. */
function invEase(u: number) { return Math.acos(1 - 2 * clamp(u)) / Math.PI; }

/** Greedy word wrap for a mono line. */
function wrapLines(s: string, f: string, w: number) {
  const out: string[] = [];
  let cur = '';
  for (const word of s.split(' ')) {
    const tryS = cur ? `${cur} ${word}` : word;
    if (measureText(tryS, f) > w && cur) { out.push(cur); cur = word; } else cur = tryS;
  }
  if (cur) out.push(cur);
  return out;
}

/** Centripetal-ish Catmull-Rom through control points (open curve), n samples per segment. */
function catmull(ps: P[], n: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < ps.length - 1; i++) {
    const p0 = ps[Math.max(0, i - 1)]!, p1 = ps[i]!, p2 = ps[i + 1]!, p3 = ps[Math.min(ps.length - 1, i + 2)]!;
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
      });
    }
  }
  out.push(ps[ps.length - 1]!);
  return out;
}

/** Hand wobble: deterministic perpendicular jitter along a polyline. */
function wobbly(pts: P[], amp: number, seed: number): P[] {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]!, b = pts[Math.min(pts.length - 1, i + 1)]!;
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    const j = noise1(i * 0.09 + seed, seed) * amp + (hash(seed + i) - 0.5) * 0.4;
    return { x: p.x - (dy / l) * j, y: p.y + (dx / l) * j };
  });
}

/** Sine in-out: a plotter head that accelerates and settles gently. */
function inOutSine(u: number) { return 0.5 - 0.5 * Math.cos(Math.PI * clamp(u)); }
