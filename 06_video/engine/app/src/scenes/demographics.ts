// Section 1: population (Hong Ming; plates dem-data, dem-growth, dem-bands, dem-caveat; 06_video/plates.md).
// The data story's character: a crowd of dots, one dot for about 1,000 people aged 60+ (the people the rest
// of the video is about). The pyramid's under-60 rows are plain grey bars; its 60+ rows are made of dots.
// One sheet, three regions: A (0,0) the pyramid; B (1920,0) the three age groups; C (1920,1080) UN vs
// SingStat. The camera holds on A, zooms into the pyramid's top for the 85+, pans to B as the dots fly into
// three blocks, down to C for the caveat (the 2023 crowd), and back up to B.
import { POP } from '../data';
import { C, TYPE, col, cue, cueEnd, hair, measureText, span, text } from './_kit';
import { Camera, StoryScene, TEAL, clamp, ease, label, prog, sectionHead, sourceLine } from './_story';
import { hash } from '../engine/util';

const fmt = (n: number) => n.toLocaleString('en-US');
const N = POP.pyramidAges.length; // 21 five-year bands
const OLD0 = 12; // index of 60–64
const ROWS = N - OLD0; // 9 rows aged 60+
const GROUP_OF = (row: number) => (row < 3 ? 0 : row < 5 ? 1 : 2); // 60–74, 75–84, 85+
// dots per 60+ row: the row's population in thousands, rounded
const D23 = POP.pyramid[2023].slice(OLD0).map((v) => Math.round(v / 1000));
const D50 = POP.pyramid[2050].slice(OLD0).map((v) => Math.round(v / 1000));
const GREY = '#BDB6A9';

// region A: pyramid geometry
const PC = 560, BASE = 872, PITCH = 28.5, BH = 23, GAP = 58;
const KX = 360 / 300595; // half-width px per person (largest band, 2023 25–29, is 601,190)
const barY = (i: number) => BASE - (i + 1) * PITCH;
const halfW = (v: number) => (v / 2) * KX;

// region B: three blocks of dots, 12 rows deep
const BX = 1920 + 430, DP = 9, DROWS = 12;
const blockY = [360, 520, 680];
// region C: the 2023 crowd
const CX = 1920 + 300, CY = 1080 + 420;

interface Dot { row: number; k: number; seed: number; g: number; o50: number; o23: number }
type XY = { x: number; y: number };

export default class Demographics extends StoryScene {
  dots: Dot[] = [];
  n23 = 0;
  gap = 0; // dots in the UN count but not SingStat's (2023)

  override init() {
    const ly = this.ctx.lyrics;
    const D1 = 'To understand how dementia might affect', D2 = 'For our analysis, we collected', D3 = 'According to these projections',
      D4 = 'But the most striking change', D5 = 'This matters because dementia', D6 = 'However, an important limitation', D7 = 'Ultimately, our demographic';
    const s = this.ctx.start;
    this.t = {
      s, d1: cue(ly, D1, 0),
      singstat: cue(ly, D2, 'SingStat'), un: cue(ly, D2, 'United'), selected: cue(ly, D2, 'selected'), extend: cue(ly, D2, 'extend'), d2end: cueEnd(ly, D2),
      d3: cue(ly, D3, 0), m107: cue(ly, D3, '1.07'), m211: cue(ly, D3, '2.11'), doubling: cue(ly, D3, 'doubling'),
      d4: cue(ly, D4, 0), o85: cue(ly, D4, '85'), k72: cue(ly, D4, '72,000'), k329: cue(ly, D4, '329,000'), quad: cue(ly, D4, 'quadrupling'),
      d5: cue(ly, D5, 0), three: cue(ly, D5, 'three'), wise: cue(ly, D5, 'WiSE'),
      d6: cue(ly, D6, 0), unw: cue(ly, D6, 'UN'), nonres: cue(ly, D6, 'non'), sgres: cue(ly, D6, 'Singapore'), recog: cue(ly, D6, 'Recognising'),
      d7: cue(ly, D7, 0), alone: cue(ly, D7, 'alone'), declines: cue(ly, D7, 'declines'),
    };
    const T = this.t;
    // the dots: one per ~1,000 people aged 60+ in 2050; the first D23[row] of each row also exist in 2023
    const o50 = [0, 0, 0];
    let o23 = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let k = 0; k < D50[row]!; k++) {
        const g = GROUP_OF(row);
        this.dots.push({ row, k, seed: hash(row * 997 + k * 13.7), g, o50: o50[g]!++, o23: k < D23[row]! ? o23++ : -1 });
      }
    }
    this.n23 = o23;
    this.gap = Math.round((POP.total60[2023] - POP.singstatResidents60_2023) / 1000); // 58,799 → 59 dots, matching 'about 59,000'
    // camera: hold on A; zoom into the pyramid's top for the 85+; pan to B; down to C; back to B
    this.cam = new Camera([
      { t: s, x: 960, y: 540 },
      { t: T.o85! + 0.1, x: 700, y: 482, z: 1.9, dur: 1.1 },
      { t: T.d5! - 0.05, x: 2880, y: 540, z: 1, dur: 1.3 },
      { t: T.d6! - 0.05, x: 2880, y: 1620, dur: 1.0 },
      { t: T.d7! - 0.05, x: 2880, y: 540, dur: 1.0 },
    ]);
  }

  // ------------------------------------------------------------------ dot formations
  private pyr(d: Dot, year: 2023 | 2050): XY | null {
    const n = (year === 2023 ? D23 : D50)[d.row]!;
    if (d.k >= n) return null;
    const v = POP.pyramid[year][OLD0 + d.row]!;
    const side = d.k % 2, j = Math.floor(d.k / 2);
    const nSide = side === 0 ? Math.ceil(n / 2) : Math.floor(n / 2);
    const cols = Math.max(1, Math.ceil(nSide / 3));
    const p = halfW(v) / cols;
    const ci = Math.floor(j / 3), r = j % 3;
    const x = side === 0 ? PC - GAP / 2 - (ci + 0.5) * p : PC + GAP / 2 + (ci + 0.5) * p;
    return { x, y: barY(OLD0 + d.row) + (r + 0.5) * (BH / 3) };
  }
  private block(d: Dot): XY {
    return { x: BX + Math.floor(d.o50 / DROWS) * DP + DP / 2, y: blockY[d.g]! + (d.o50 % DROWS) * DP + DP / 2 };
  }
  private crowd(d: Dot): XY | null {
    if (d.o23 < 0) return null;
    return { x: CX + Math.floor(d.o23 / DROWS) * DP + DP / 2, y: CY + (d.o23 % DROWS) * DP + DP / 2 };
  }
  /** Staggered, slightly arcing flight from a to b, starting between t0 and t0 + spread, lasting dur. */
  private flight(d: Dot, a: XY, b: XY, t: number, t0: number, spread: number, dur: number) {
    const u = ease.inOutCubic(clamp((t - t0 - d.seed * spread) / dur));
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const lift = Math.sin(Math.PI * u) * (40 + 80 * hash(d.seed * 7.1)) * (hash(d.seed * 3.3) < 0.5 ? -1 : 1) * Math.min(1, L / 600);
    return { x: a.x + dx * u + (-dy / L) * lift, y: a.y + dy * u + (dx / L) * lift, u };
  }

  /** Position, radius, colour and opacity of a dot at t (null when not on the sheet). */
  private dotAt(d: Dot, t: number): { x: number; y: number; r: number; teal: boolean; a: number } | null {
    const T = this.t;
    const teal85 = d.g === 2 && t >= T.o85! + 0.2 + d.seed * 0.5;
    const p23 = this.pyr(d, 2023), p50 = this.pyr(d, 2050)!;
    const tGrow = T.m211! - 0.2, tBlock = T.d5! - 1.3, tCrowd = T.d6! - 1.0, tBack = T.d7! - 1.0;
    // 1. the 2023 pyramid, building bottom row first
    if (t < tGrow) {
      if (!p23) return null;
      const bt = T.d1! + 0.35 + (OLD0 + d.row) * 0.07 + d.seed * 0.5;
      const e = prog(t, bt, bt + 0.5, ease.outCubic);
      if (e <= 0) return null;
      return { x: p23.x, y: p23.y - (1 - e) * 18, r: 1.55, teal: false, a: e };
    }
    // 2. 2050: the 2023 dots spread to their 2050 places; the new ones fall in from above
    if (t < tBlock) {
      if (p23) { const f = this.flight(d, p23, p50, t, tGrow, 0.6, 0.7); return { x: f.x, y: f.y, r: 1.55, teal: teal85, a: 1 }; }
      const from = { x: p50.x + (hash(d.seed * 5) - 0.5) * 300, y: -60 - hash(d.seed * 9) * 200 };
      const f = this.flight(d, from, p50, t, tGrow + 0.1, 1.6, 0.9);
      if (f.u <= 0) return null;
      return { x: f.x, y: f.y, r: 1.55, teal: teal85, a: Math.min(1, f.u * 3) };
    }
    // 3. into three blocks (region B)
    const b = this.block(d);
    const toB = this.flight(d, p50, b, t, tBlock, 0.5, 0.8);
    if (t < tCrowd) return { x: toB.x, y: toB.y, r: 1.55 + 1.55 * toB.u, teal: teal85, a: 1 };
    // 4. down to the 2023 crowd (region C); dots that are not in 2023 fade out in place, and back in later
    const c = this.crowd(d);
    if (!c) {
      const al = Math.max(1 - prog(t, tCrowd, tCrowd + 0.4), prog(t, tBack + 0.4, tBack + 1.0));
      return al > 0 ? { x: b.x, y: b.y, r: 3.1, teal: d.g === 2, a: al } : null;
    }
    if (t < tBack) {
      const inGap = d.o23 >= this.n23 - this.gap;
      const f = this.flight(d, b, c, t, tCrowd, 0.4, 0.7);
      const lift = inGap ? prog(t, T.recog! - 0.2, T.recog! + 0.5, ease.outCubic) : 0;
      return { x: f.x + lift * 36, y: f.y - lift * 30, r: 3.1, teal: inGap && t >= T.nonres!, a: 1 };
    }
    // 5. back up to the blocks
    const f = this.flight(d, c, b, t, tBack, 0.4, 0.7);
    return { x: f.x, y: f.y, r: 3.1, teal: d.g === 2, a: 1 };
  }

  draw(c: CanvasRenderingContext2D, t: number) {
    this.regionA(c, t);
    this.regionB(c, t);
    this.regionC(c, t);
    // the dots, over all regions: solid ones batched by colour, fading ones one by one
    const ink: number[] = [], teal: number[] = [], faint: number[] = [];
    for (const d of this.dots) {
      const p = this.dotAt(d, t);
      if (!p) continue;
      (p.a < 0.999 ? faint : p.teal ? teal : ink).push(p.x, p.y, p.r, p.a, p.teal ? 1 : 0);
    }
    const batch = (arr: number[], color: string) => {
      c.fillStyle = color;
      c.beginPath();
      for (let i = 0; i < arr.length; i += 5) { c.moveTo(arr[i]! + arr[i + 2]!, arr[i + 1]!); c.arc(arr[i]!, arr[i + 1]!, arr[i + 2]!, 0, Math.PI * 2); }
      c.fill();
    };
    batch(ink, C.ink);
    batch(teal, TEAL);
    for (let i = 0; i < faint.length; i += 5) {
      c.globalAlpha = faint[i + 3]!;
      c.fillStyle = faint[i + 4] ? TEAL : C.ink;
      c.beginPath(); c.arc(faint[i]!, faint[i + 1]!, faint[i + 2]!, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    this.overlay(c, t);
  }

  // ------------------------------------------------------------------ A: pyramid, sources, growth
  private regionA(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t > T.d6!) return;
    // the heading steps out of the way while the camera is zoomed in on the 85+
    const zoomed = clamp((this.cam.at(t).z - 1) / 0.3);
    sectionHead(c, '1 · POPULATION', 'How is Singapore ageing?', col(0), 1 - zoomed);
    const p23 = POP.pyramid[2023], p50 = POP.pyramid[2050];
    const build = (i: number) => prog(t, T.d1! + 0.1 + i * 0.07, T.d1! + 0.75 + i * 0.07, ease.outCubic);
    const grow = prog(t, T.m211! - 0.2, T.m211! + 0.8, ease.inOutCubic);

    // age labels in the centre gap (every other band)
    for (let i = 0; i < N; i += 2) text(c, POP.pyramidAges[i]!, PC, barY(i) + BH - 6, TYPE.mono(13), C.graphite, { align: 'center', alpha: build(i) });
    text(c, POP.pyramidAges[N - 1]!, PC, barY(N - 1) + BH - 6, TYPE.mono(13), C.graphite, { align: 'center', alpha: build(N - 1) });
    // under-60 rows: grey bars, growing from their 2023 to their 2050 width; 2023 kept as an outline
    for (let i = 0; i < OLD0; i++) {
      const b = build(i);
      if (b <= 0) continue;
      const w23 = halfW(p23[i]!) * b, w = w23 + (halfW(p50[i]!) - halfW(p23[i]!)) * grow;
      c.fillStyle = GREY;
      c.fillRect(PC - GAP / 2 - w, barY(i), w, BH);
      c.fillRect(PC + GAP / 2, barY(i), w, BH);
      if (grow > 0) {
        c.save(); c.globalAlpha = grow; c.strokeStyle = C.graphite; c.lineWidth = 1.3;
        c.strokeRect(PC - GAP / 2 - w23 + 0.6, barY(i) + 0.6, w23 - 1.2, BH - 1.2);
        c.strokeRect(PC + GAP / 2 + 0.6, barY(i) + 0.6, w23 - 1.2, BH - 1.2);
        c.restore();
      }
    }
    // 60+ bracket and the dot key
    const ka = prog(t, T.d1! + 1.6, T.d1! + 2.2) * (1 - zoomed);
    if (ka > 0) {
      const bx = PC + GAP / 2 + halfW(p23[OLD0]!) + 22 + (halfW(p50[OLD0]!) - halfW(p23[OLD0]!)) * grow;
      const y0 = barY(N - 1), y1 = barY(OLD0) + BH;
      c.save(); c.globalAlpha = ka;
      hair(c, bx, y0, bx, y1, C.ink, 1.6); hair(c, bx - 8, y0, bx, y0, C.ink, 1.6); hair(c, bx - 8, y1, bx, y1, C.ink, 1.6);
      text(c, '60+', bx + 12, (y0 + y1) / 2 + 8, TYPE.label(20), C.ink);
      c.fillStyle = C.ink; c.beginPath(); c.arc(PC - 170, 906, 3.1, 0, Math.PI * 2); c.fill();
      text(c, '= about 1,000 people aged 60+', PC - 158, 912, TYPE.mono(17), C.ink);
      c.restore();
    }
    text(c, grow > 0.5 ? '2050 (outline: 2023)' : '2023', PC, 948, TYPE.mono(17), C.graphite, { align: 'center', alpha: build(0) });

    // source cards (dem-data), cleared before dem-growth
    const cx = col(7), cw = span(5);
    const clear = 1 - prog(t, T.d2end! + 0.15, T.d2end! + 0.6);
    const card = (y: number, l: string, a1: string, a2: string, a: number, hi: number, dim: number) => {
      if (a <= 0 || clear <= 0) return;
      c.save();
      c.globalAlpha = a * clear * (1 - 0.55 * dim);
      c.translate(0, (1 - a) * 12);
      c.strokeStyle = hi > 0.5 ? TEAL : C.ink;
      c.lineWidth = 1.5 + 1.5 * hi;
      c.strokeRect(cx, y, cw, 118);
      label(c, l, cx + 24, y + 38, hi > 0.5 ? TEAL : C.graphite);
      text(c, a1, cx + 24, y + 78, TYPE.body(30, 600), C.ink);
      text(c, a2, cx + 24, y + 104, TYPE.mono(18), C.graphite);
      c.restore();
    };
    const hiUN = prog(t, T.selected! - 0.1, T.selected! + 0.3);
    card(380, 'SINGSTAT', 'Resident population', 'history', prog(t, T.singstat! - 0.15, T.singstat! + 0.3, ease.outCubic), 0, hiUN);
    card(530, 'UNITED NATIONS · WORLD POPULATION PROSPECTS 2024', 'Medium variant', 'projections by age, to 2050', prog(t, T.un! - 0.15, T.un! + 0.3, ease.outCubic), hiUN, 0);
    const tl = prog(t, T.extend! - 0.1, T.extend! + 0.7, ease.outCubic);
    if (tl > 0 && clear > 0) {
      c.save(); c.globalAlpha = clear;
      const y = 720, xa = cx, xb = cx + cw;
      hair(c, xa, y, xa + (xb - xa) * tl, y, C.ink, 1.6);
      ([[2023, 0], [2030, 7 / 27], [2050, 1]] as const).forEach(([yr, u]) => {
        const x = xa + (xb - xa) * u;
        if (tl >= u - 0.01) { hair(c, x, y - 8, x, y + 8, C.ink, 1.6); text(c, String(yr), x, y + 36, TYPE.mono(18), C.ink, { align: u === 0 ? 'left' : u === 1 ? 'right' : 'center' }); }
      });
      c.restore();
    }

    // 60+ count (dem-growth): one big number counting with the dots
    const ga = prog(t, T.m107! - 0.4, T.m107!, ease.outCubic) * (1 - prog(t, T.o85! - 0.4, T.o85!));
    if (ga > 0) {
      c.save(); c.globalAlpha = ga;
      label(c, 'PEOPLE AGED 60+', cx, 420);
      const k = prog(t, T.m211! - 0.1, T.m211! + 2.2, ease.inOutCubic);
      const v = Math.round(POP.total60[2023] + (POP.total60[2050] - POP.total60[2023]) * k);
      text(c, k >= 1 ? '2050' : k > 0 ? '2023 → 2050' : '2023', cx, 470, TYPE.mono(22), C.graphite);
      text(c, fmt(v), cx - 4, 580, TYPE.display(120, 87.5, 800), C.ink, { ls: -2 });
      text(c, k >= 1 ? POP.total60Label[2050] : POP.total60Label[2023], cx, 630, TYPE.body(30, 600), C.graphite, { alpha: k <= 0 || k >= 1 ? 1 : 0 });
      const dbl = prog(t, T.doubling! - 0.1, T.doubling! + 0.3, ease.outCubic);
      if (dbl > 0) text(c, '≈ ×2', cx, 720, TYPE.display(64, 100, 800), TEAL, { alpha: dbl });
      c.restore();
    }
    sourceLine(c, 'Source: ' + POP.source + ' (persons, both sexes)', col(0), 990, prog(t, T.d1! + 0.5, T.d1! + 1.0));
  }

  // ------------------------------------------------------------------ B: three blocks (2050)
  private regionB(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.d5! - 1.3) return;
    label(c, 'PEOPLE AGED 60+ IN 2050, BY AGE GROUP · 1 DOT ≈ 1,000 PEOPLE', BX, 300, C.graphite, prog(t, T.d5! - 0.3, T.d5! + 0.2));
    const counts = [0, 0, 0];
    for (let row = 0; row < ROWS; row++) counts[GROUP_OF(row)]! += D50[row]!;
    POP.bands.forEach((n, g) => {
      const a = prog(t, T.three! - 0.1 + g * 0.25, T.three! + 0.3 + g * 0.25, ease.outCubic);
      if (a <= 0) return;
      const y = blockY[g]!, cols = Math.ceil(counts[g]! / DROWS);
      text(c, n, BX - 30, y + 66, TYPE.display(44, 87.5, 800), g === 2 ? TEAL : C.ink, { align: 'right', alpha: a });
      text(c, fmt(POP.byBand[2050][g]!), BX + cols * DP + 20, y + 64, TYPE.body(32, 700), g === 2 ? TEAL : C.ink, { alpha: a });
      const w = prog(t, T.wise! - 0.1 + g * 0.15, T.wise! + 0.3 + g * 0.15, ease.outCubic);
      if (w > 0) {
        c.save(); c.globalAlpha = w;
        const s = 'WiSE AGE GROUP', f = TYPE.label(13);
        const tw = measureText(s, f, 2);
        c.strokeStyle = C.graphite; c.lineWidth = 1.2;
        c.strokeRect(BX - 30 - tw - 16, y + 80, tw + 16, 24);
        text(c, s, BX - 30 - 8, y + 97, f, C.graphite, { ls: 2, align: 'right' });
        c.restore();
      }
    });
    const na = prog(t, T.alone! - 0.2, T.alone! + 0.3, ease.outCubic);
    if (na > 0) {
      c.save(); c.globalAlpha = na; c.translate(0, (1 - na) * 10);
      const f = TYPE.body(36, 600);
      const w1 = text(c, 'More older people → more cases, ', BX - 230, 892, f, C.ink);
      const tealOn = prog(t, T.declines! - 0.6, T.declines! - 0.2);
      text(c, 'even if rates fall', BX - 230 + w1, 892, f, tealOn > 0.5 ? TEAL : C.ink);
      if (tealOn > 0) hair(c, BX - 230 + w1, 905, BX - 230 + w1 + measureText('even if rates fall', f) * tealOn, 905, TEAL, 2.5);
      c.restore();
    }
    sourceLine(c, 'Source: ' + POP.source + '; age groups as in the WiSE studies', BX - 230, 990, prog(t, T.three!, T.three! + 0.5));
  }

  // ------------------------------------------------------------------ C: the 2023 crowd, UN vs SingStat
  private regionC(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.d6! - 1.2 || t > T.d7! + 0.5) return;
    label(c, 'PEOPLE AGED 60+ IN 2023 · 1 DOT ≈ 1,000 PEOPLE', CX, 1080 + 330, C.graphite);
    const cols = Math.ceil(this.n23 / DROWS), xr = CX + cols * DP;
    const a1 = prog(t, T.unw! - 0.2, T.unw! + 0.4);
    text(c, 'UN count  ' + fmt(POP.total60[2023]), xr + 24, CY + 60, TYPE.body(30, 700), C.ink, { alpha: a1 });
    const a2 = prog(t, T.sgres! - 0.2, T.sgres! + 0.4);
    text(c, 'SingStat residents  ' + fmt(POP.singstatResidents60_2023), CX, CY + DROWS * DP + 60, TYPE.body(30, 700), C.ink, { alpha: a2 });
    const g = prog(t, T.recog! - 0.1, T.recog! + 0.5, ease.outCubic);
    if (g > 0) {
      c.save(); c.globalAlpha = g;
      text(c, 'about 59,000 more in the UN count:', xr - 200, CY - 90, TYPE.body(28, 600), TEAL);
      text(c, 'it includes non-residents', xr - 200, CY - 54, TYPE.body(28, 600), TEAL);
      c.restore();
    }
    sourceLine(c, 'Sources: ' + POP.source + '; SingStat, residents aged 60+, 2023', CX, 1080 + 990, a1);
  }

  // ------------------------------------------------------------------ screen-space overlay: the 85+ zoom
  private overlay(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const a = prog(t, T.o85! + 0.3, T.o85! + 0.8, ease.outCubic) * (1 - prog(t, T.d5! - 1.3, T.d5! - 0.9));
    if (a <= 0) return;
    this.screen(c);
    c.save(); c.globalAlpha = a;
    const x = 1340;
    label(c, 'AGED 85+', x, 330, TEAL);
    const v1 = prog(t, T.k72! - 0.2, T.k72! + 0.2), v2 = prog(t, T.k329! - 0.2, T.k329! + 0.2);
    text(c, fmt(POP.byBand[2023][2]), x, 430, TYPE.display(84, 87.5, 800), C.ink, { alpha: Math.max(0.25, v1) });
    text(c, 'in 2023', x, 470, TYPE.mono(20), C.graphite, { alpha: Math.max(0.25, v1) });
    text(c, fmt(POP.byBand[2050][2]), x, 590, TYPE.display(84, 87.5, 800), TEAL, { alpha: v2 });
    text(c, 'in 2050', x, 630, TYPE.mono(20), C.graphite, { alpha: v2 });
    const q = prog(t, T.quad! - 0.1, T.quad! + 0.3, ease.outCubic);
    if (q > 0) text(c, '×4.6', x, 760, TYPE.display(96, 100, 800), TEAL, { alpha: q });
    c.restore();
  }
}
