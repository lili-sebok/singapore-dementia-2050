// Section 3: projection (Lili; plates proj-method, proj-scenarios, proj-2030, proj-2050, proj-moh, proj-close;
// 06_video/plates.md). The dot thread: the 2030 ledger turns each age group's cases into teal dots (1 dot ≈
// 1,000 people with dementia), which gather into one block of 137. Then one chart carries the rest: a
// prevalence chart for the 85+ (three scenario lines), which retracts and relabels into a cases chart
// (2023 → 2030, then rescaled to 2050), checked against MOH's 152,000 and WiSE's published 73,918.
// One sheet, two regions: A (0,0) the ledger; B (1920,0) the chart. The camera pans A → B, pushes in on the
// 2023–2030 corner for the MOH comparison, and pulls back out for the close.
import { MOH, POP, PREV, PROJ, Q2 } from '../data';
import { C, TYPE, col, cue, cueEnd, hair, measureText, text } from './_kit';
import { Camera, StoryScene, TEAL, clamp, ease, label, prog, sectionHead, sourceLine } from './_story';
import { hash } from '../engine/util';

const fmt = (n: number) => n.toLocaleString('en-US');

// ---------------------------------------------------------------- colour
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const INK_RGB = rgb(C.ink), TEAL_RGB = rgb(TEAL);
/** Ink → teal by k (0..1). */
const inkTeal = (k: number) => {
  if (k <= 0) return C.ink;
  if (k >= 1) return TEAL;
  const m = INK_RGB.map((a, i) => Math.round(a + (TEAL_RGB[i]! - a) * k));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
};

// ---------------------------------------------------------------- scenarios
type Key = 'constant' | 'half' | 'decline';
const DASH: Record<Key, number[]> = { constant: [], half: [14, 9], decline: [2, 7] };
const NAME: Record<Key, string> = { constant: 'rates constant', half: 'half-pace decline', decline: 'decline continues' };
const F: Record<Key, number> = { constant: 0, half: 0.5, decline: 1 };
const SC = Object.fromEntries(PROJ.scenarios.map((s) => [s.key, s])) as Record<Key, (typeof PROJ.scenarios)[number]>;
const ORDER: Key[] = ['constant', 'half', 'decline']; // top to bottom on the chart

// 85+ prevalence by scenario (STORY_BRIEF formula): p(y) = p2023 × (1 + f·r)^(y − 2023), r = (p2023/p2013)^(1/10) − 1
const P23 = PREV.y2023[2]!, P13 = PREV.y2013[2]!;
const R85 = Math.pow(P23 / P13, 1 / 10) - 1;
const prev85 = (k: Key, y: number) => P23 * Math.pow(1 + F[k] * R85, y - 2023);
// cases: straight segments through PROJ's values (no population for other years)
const casesAt = (k: Key, y: number) => {
  const s = SC[k];
  if (y <= 2030) return PROJ.base2023 + (s.y2030 - PROJ.base2023) * ((y - 2023) / 7);
  return s.y2030 + (s.y2050 - s.y2030) * ((y - 2030) / 20);
};
const SPREAD_2050 = SC.constant.y2050 - SC.decline.y2050; // 295,653 − 196,615 = 99,038
const SPREAD_LABEL = '≈ ' + fmt(Math.round(SPREAD_2050 / 1000) * 1000) + ' apart';

// ---------------------------------------------------------------- region A: the ledger
const X_POP = 700, X_TIMES = 728, X_RATE = 960, X_EQ = 990, X_CASES = 1290, DX = 1370;
const ROW_Y = [452, 547, 642];
const RULE_Y = 690, TOTAL_Y = 778, BLOCK_Y = 712;
const DP = 9, DROWS = 12, STRIP = 3;
// dots per age group: 2030 cases at 2023 rates / 1,000, rounded: 27, 61, 49 (137 in all = 137,087 / 1,000)
const NDOT = Q2.y2030.cases.map((v) => Math.round(v / 1000));

// ---------------------------------------------------------------- region B: the chart (sheet coordinates)
const OX = 1920;
const PL = OX + 300, PR = OX + 1340, PT = 300, PB = 840;
const PREV_MAX = 60; // % (prevalence mode)
const CAM_MOH = { x: OX + 450, y: 700, z: 1.6 };

interface Dot { g: number; k: number; o: number; seed: number }
type XY = { x: number; y: number };

export default class Projection extends StoryScene {
  dots: Dot[] = [];

  override init() {
    const ly = this.ctx.lyrics;
    const A1 = 'Now that we understand', A2 = 'Our calculation was',
      B1 = 'However, because future', B2 = 'In the first scenario', B3 = 'In the second, decline', B4 = 'In the third, half-pace',
      C1 = 'All three scenarios begin', C2 = 'By 2030, rates constant', C3 = 'Despite declining prevalence',
      D1 = 'By 2050, the differences', D2 = 'Rates constant reaches',
      E1 = 'To assess our projections', E2 = 'All three projections fall', E3 = 'However, our 2023 starting',
      F1 = 'Our results are therefore', F2 = 'Next, we examine';
    const s = this.ctx.start;
    this.t = {
      s, a1: cue(ly, A1, 0), combine: cue(ly, A1, 'combine'),
      mult: cue(ly, A2, 'multiplied'), added: cue(ly, A2, 'added'), a2end: cueEnd(ly, A2),
      b1: cue(ly, B1, 0), uncertain: cue(ly, B1, 'uncertain'), three: cue(ly, B1, 'three'),
      first: cue(ly, B2, 'first'), second: cue(ly, B3, 'second'), third: cue(ly, B4, 'third'), b4end: cueEnd(ly, B4),
      c1: cue(ly, C1, 0), n96: cue(ly, C1, '96,694'),
      by2030: cue(ly, C2, 'By'), rc30: cue(ly, C2, 'rates'), v137: cue(ly, C2, '137,087'),
      dc30: cue(ly, C2, 'decline'), v123: cue(ly, C2, '123,177'), hp30: cue(ly, C2, 'half'), v130: cue(ly, C2, '129,970'),
      despite: cue(ly, C3, 0), still: cue(ly, C3, 'still'),
      by2050: cue(ly, D1, 'By'),
      rc50: cue(ly, D2, 'Rates'), v296: cue(ly, D2, '295,653'), dc50: cue(ly, D2, 'decline'), v197: cue(ly, D2, '196,615'), v197end: cueEnd(ly, D2, '196,615'),
      hp50: cue(ly, D2, 'half'), v241: cue(ly, D2, '241,237'),
      e1: cue(ly, E1, 0), n152: cue(ly, E1, '152,000'), below: cue(ly, E2, 'below'), closest: cue(ly, E2, 'closest'),
      e3: cue(ly, E3, 0), startPt: cue(ly, E3, 'starting'), formal: cue(ly, E3, 'formal'),
      f1: cue(ly, F1, 0), scen: cue(ly, F1, 'scenarios'), physical: cue(ly, F2, 'physical'),
    };
    const T = this.t;
    let o = 0;
    NDOT.forEach((n, g) => { for (let k = 0; k < n; k++) this.dots.push({ g, k, o: o++, seed: hash(g * 131 + k * 7.31) }); });
    this.cam = new Camera([
      { t: s, x: 960, y: 540 },
      { t: T.b1! - 0.05, x: OX + 960, y: 540, dur: 1.0 },
      { t: T.e1! - 0.05, ...CAM_MOH, dur: 1.1 },
      { t: T.f1! - 0.05, x: OX + 960, y: 540, z: 1, dur: 1.1 },
    ]);
  }

  // ------------------------------------------------------------------ row timing (region A)
  private rowT(g: number) { return this.t.mult! + g * 0.6; }

  // ------------------------------------------------------------------ dots
  private strip(d: Dot): XY {
    return { x: DX + Math.floor(d.k / STRIP) * DP + DP / 2, y: ROW_Y[d.g]! - 32 + (d.k % STRIP) * DP + DP / 2 };
  }
  private block(d: Dot): XY {
    return { x: DX + Math.floor(d.o / DROWS) * DP + DP / 2, y: BLOCK_Y + (d.o % DROWS) * DP + DP / 2 };
  }
  /** Staggered, slightly arcing flight from a to b (as in demographics.ts). */
  private flight(d: Dot, a: XY, b: XY, t: number, t0: number, spread: number, dur: number) {
    const u = ease.inOutCubic(clamp((t - t0 - d.seed * spread) / dur));
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const lift = Math.sin(Math.PI * u) * (20 + 40 * hash(d.seed * 7.1)) * (hash(d.seed * 3.3) < 0.5 ? -1 : 1) * Math.min(1, L / 300);
    return { x: a.x + dx * u + (-dy / L) * lift, y: a.y + dy * u + (dx / L) * lift, u };
  }
  private dotAt(d: Dot, t: number): { x: number; y: number; a: number } | null {
    const T = this.t;
    const n = NDOT[d.g]!;
    const t0 = this.rowT(d.g) + 0.45 + (d.k / n) * 0.55 + d.seed * 0.08;
    const e = prog(t, t0, t0 + 0.35, ease.outCubic);
    if (e <= 0) return null;
    const a = this.strip(d);
    if (t < T.added! - 0.1) return { x: a.x, y: a.y - (1 - e) * 12, a: e };
    const f = this.flight(d, a, this.block(d), t, T.added! - 0.1, 0.35, 0.65);
    return { x: f.x, y: f.y, a: 1 };
  }

  draw(c: CanvasRenderingContext2D, t: number) {
    this.regionA(c, t);
    this.regionB(c, t);
    this.overlay(c, t);
  }

  // ------------------------------------------------------------------ A: the 2030 ledger and its dots
  private regionA(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t > T.b1! + 0.5) return;
    sectionHead(c, '3 · PROJECTION', 'From prevalence to people', col(0));
    // column heads, on "combine"
    const hA = prog(t, T.combine! - 0.1, T.combine! + 0.5, ease.outCubic);
    if (hA > 0) {
      c.save(); c.globalAlpha = hA;
      label(c, 'AGE GROUP', col(0), 352);
      label(c, 'POPULATION 2030', X_POP, 352, C.graphite, 1, 'right');
      label(c, 'WiSE 2023 RATE', X_RATE, 352, C.graphite, 1, 'right');
      label(c, 'CASES 2030', X_CASES, 352, C.graphite, 1, 'right');
      label(c, '1 DOT ≈ 1,000 CASES', DX, 352, TEAL);
      hair(c, col(0), 376, col(0) + (X_CASES - col(0)) * hA, 376, C.rule, 1.25);
      c.restore();
      // the age groups are on the ledger before the arithmetic
      Q2.bands.forEach((b, g) => {
        const a = prog(t, T.combine! + 0.2 + g * 0.15, T.combine! + 0.7 + g * 0.15, ease.outCubic);
        text(c, b, col(0), ROW_Y[g]!, TYPE.display(44, 87.5, 800), C.ink, { alpha: a });
      });
    }
    // the rows, one per age group, as said: population × rate = cases
    const mf = TYPE.mono(44), gf = TYPE.mono(40);
    Q2.bands.forEach((_, g) => {
      const r0 = this.rowT(g), y = ROW_Y[g]!;
      const piece = (k: number) => prog(t, r0 + k * 0.14, r0 + k * 0.14 + 0.35, ease.outCubic);
      const p1 = piece(0), p2 = piece(1), p3 = piece(2);
      if (p1 <= 0) return;
      text(c, fmt(Q2.y2030.pop[g]!), X_POP, y, mf, C.ink, { align: 'right', alpha: p1 });
      text(c, '×', X_TIMES, y, gf, C.graphite, { alpha: p2 });
      text(c, Q2.rates[g]!, X_RATE, y, mf, C.ink, { align: 'right', alpha: p2 });
      text(c, '=', X_EQ, y, gf, C.graphite, { alpha: p3 });
      text(c, fmt(Q2.y2030.cases[g]!), X_CASES, y, mf, C.ink, { align: 'right', alpha: p3 });
    });
    // total, on "added"
    const tr = prog(t, T.added! - 0.15, T.added! + 0.45, ease.outCubic);
    if (tr > 0) {
      hair(c, col(0), RULE_Y, col(0) + (X_CASES - col(0)) * tr, RULE_Y, C.ink, 2);
      label(c, 'TOTAL, 2030', col(0), TOTAL_Y - 8, C.graphite, tr);
      const k = prog(t, T.added!, T.added! + 0.9, ease.outCubic);
      text(c, fmt(Math.round(Q2.y2030.total * k)), X_CASES, TOTAL_Y, TYPE.display(72, 87.5, 800), TEAL, { align: 'right', alpha: tr, ls: -1 });
      text(c, 'totals from unrounded values', X_CASES, TOTAL_Y + 38, TYPE.mono(17), C.graphite, { align: 'right', alpha: prog(t, T.added! + 0.5, T.added! + 1.0) });
    }
    // the dots: solid ones batched, fading ones one by one
    const solid: number[] = [];
    c.fillStyle = TEAL;
    for (const d of this.dots) {
      const p = this.dotAt(d, t);
      if (!p) continue;
      if (p.a >= 0.999) { solid.push(p.x, p.y); continue; }
      c.globalAlpha = p.a;
      c.beginPath(); c.arc(p.x, p.y, 3.1, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    c.beginPath();
    for (let i = 0; i < solid.length; i += 2) { c.moveTo(solid[i]! + 3.1, solid[i + 1]!); c.arc(solid[i]!, solid[i + 1]!, 3.1, 0, Math.PI * 2); }
    c.fill();
    sourceLine(c, 'Sources: ' + POP.source + ' · WiSE 2023: ' + PREV.source2023, col(0), 990, prog(t, T.mult!, T.mult! + 0.5));
  }

  // ------------------------------------------------------------------ B: the chart
  /** Chart state at t: mode (0 prevalence → 1 cases), x domain end, cases y max. */
  private chart(t: number) {
    const T = this.t;
    const retract = prog(t, T.b4end! + 0.05, T.b4end! + 0.65, ease.inOutCubic);
    const mode = prog(t, T.b4end! + 0.35, T.c1! - 0.05, ease.inOutCubic);
    const ext = prog(t, T.by2050! - 0.1, T.by2050! + 1.0, ease.inOutCubic);
    const xMax = mode < 1 ? 2050 - 20 * mode : 2030 + 20 * ext;
    const yMax = 160000 + 160000 * ext;
    const X = (yr: number) => PL + ((yr - 2023) / (xMax - 2023)) * (PR - PL);
    const Yc = (v: number) => PB - (v / yMax) * (PB - PT);
    const Yp = (p: number) => PB - (p / PREV_MAX) * (PB - PT);
    return { retract, mode, ext, xMax, yMax, X, Yc, Yp };
  }

  /** How teal a scenario's line is at t (the one being spoken). */
  private tealOf(k: Key, t: number) {
    const T = this.t;
    const win = (a: number, b: number) => prog(t, a - 0.15, a + 0.15) * (1 - prog(t, b - 0.15, b + 0.15));
    const w: Record<Key, number> = {
      constant: win(T.first! - 0.1, T.second! - 0.1) + win(T.rc30! - 0.1, T.dc30! - 0.1) + win(T.rc50! - 0.1, T.dc50! - 0.1),
      decline: win(T.second! - 0.1, T.third! - 0.1) + win(T.dc30! - 0.1, T.hp30! - 0.1) + win(T.dc50! - 0.1, T.v197end! + 0.1),
      half: win(T.third! - 0.1, T.b4end! + 0.2) + win(T.hp30! - 0.1, T.despite!),
    };
    return clamp(w[k]);
  }

  private regionB(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.b1! - 1.2) return;
    const ch = this.chart(t);
    const { mode, ext, X, Yc, Yp, yMax, xMax } = ch;
    const close = prog(t, T.scen! - 0.1, T.scen! + 0.5, ease.outCubic); // reference marks clear
    const cmp = prog(t, T.startPt! - 0.2, T.startPt! + 0.4, ease.outCubic) * (1 - close); // 2023 comparison

    // chart titles (crossfade at the transform)
    label(c, 'PREVALENCE OF DEMENTIA AMONG PEOPLE AGED 85+ · BY SCENARIO', OX + col(0), 150, C.graphite, 1 - mode);
    label(c, 'PEOPLE AGED 60+ WITH DEMENTIA · BY SCENARIO', OX + col(0), 150, C.graphite, mode);

    // y gridlines and tick labels
    const tickA = 1 - cmp;
    const gridIn = prog(t, T.b1! - 0.6, T.b1! + 0.2, ease.outCubic);
    if (mode < 1) for (let p = 0; p <= PREV_MAX; p += 20) {
      const y = Yp(p), a = (1 - mode) * gridIn;
      if (p > 0) hair(c, PL, y, PR, y, C.rule, 1.1);
      text(c, p + '%', PL - 16, y + 6, TYPE.mono(18), C.graphite, { align: 'right', alpha: a });
    }
    if (mode > 0) for (let v = 50000; v <= 300000; v += 50000) {
      const inR = clamp((yMax * 1.03 - v) / (yMax * 0.08));
      if (inR <= 0) continue;
      const y = Yc(v);
      c.save(); c.globalAlpha = mode * inR;
      hair(c, PL, y, PR, y, C.rule, 1.1);
      c.restore();
      text(c, fmt(v), PL - 16, y + 6, TYPE.mono(18), C.graphite, { align: 'right', alpha: mode * inR * tickA });
    }
    if (mode > 0) text(c, '0', PL - 16, PB + 6, TYPE.mono(18), C.graphite, { align: 'right', alpha: mode * tickA });
    // x axis
    hair(c, PL, PB, PL + (PR - PL) * gridIn, PB, C.ink, 1.6);
    for (const yr of [2023, 2030, 2050]) {
      const x = X(yr);
      const inR = clamp((xMax + 1.5 - yr) / 1.5);
      if (inR <= 0) continue;
      const a = inR * gridIn;
      c.save(); c.globalAlpha = a;
      hair(c, x, PB, x, PB + 9, C.ink, 1.6);
      c.restore();
      text(c, String(yr), x, PB + 38, TYPE.mono(20), C.ink, { align: 'center', alpha: a });
    }
    // year guides at 2030 and 2050, as said
    const g30 = prog(t, T.by2030! - 0.1, T.by2030! + 0.4) * (1 - close);
    if (g30 > 0) { c.save(); c.globalAlpha = g30; hair(c, X(2030), PT - 10, X(2030), PB, C.rule, 1.25); c.restore(); }
    const g50 = prog(t, T.by2050! + 0.6, T.by2050! + 1.1) * (1 - close);
    if (g50 > 0) { c.save(); c.globalAlpha = g50; hair(c, X(2050), PT - 10, X(2050), PB, C.rule, 1.25); c.restore(); }

    // ---- prevalence mode: three 85+ lines, drawn as spoken, then retracting into the start
    const start = { x: X(2023), y: Yp(P23) + (Yc(PROJ.base2023) - Yp(P23)) * mode };
    if (ch.retract < 1) {
      const drawP: Record<Key, number> = {
        constant: prog(t, T.first! - 0.1, T.first! + 1.2, ease.inOutCubic),
        decline: prog(t, T.second! - 0.1, T.second! + 1.2, ease.inOutCubic),
        half: prog(t, T.third! - 0.1, T.third! + 1.2, ease.inOutCubic),
      };
      for (const k of ORDER) {
        const f = drawP[k] * (1 - ch.retract);
        if (f <= 0) continue;
        const yEnd = 2023 + 27 * f;
        const col_ = inkTeal(this.tealOf(k, t));
        this.stroke(c, k, col_, Array.from({ length: 61 }, (_, i) => 2023 + (yEnd - 2023) * (i / 60)), (y) => ({ x: X(y), y: Yp(prev85(k, y)) + (start.y - Yp(P23)) }));
        // name at the line's end
        const na = prog(t, (k === 'constant' ? T.first! : k === 'decline' ? T.second! : T.third!) + 0.6, (k === 'constant' ? T.first! : k === 'decline' ? T.second! : T.third!) + 1.1) * (1 - prog(t, T.b4end!, T.b4end! + 0.3));
        if (na > 0) text(c, NAME[k], X(2050) + 20, Yp(prev85(k, 2050)) + 9, TYPE.body(28, 600), col_, { alpha: na });
      }
    }
    // start point label (prevalence)
    const sp = prog(t, T.b1! + 0.1, T.b1! + 0.6, ease.outCubic) * (1 - prog(t, T.b4end!, T.b4end! + 0.3));
    if (sp > 0) {
      text(c, PREV.y2023[2] + '%', start.x + 18, start.y - 22, TYPE.body(30, 700), C.ink, { alpha: sp });
      text(c, 'in 2023', start.x + 18 + measureText(PREV.y2023[2] + '%', TYPE.body(30, 700)) + 10, start.y - 22, TYPE.mono(18), C.graphite, { alpha: sp });
    }

    // ---- cases mode: lines 2023 → 2030 (proj-2030), then → 2050 (proj-2050)
    const d30: Record<Key, number> = {
      constant: prog(t, T.rc30! - 0.1, T.rc30! + 0.8, ease.inOutCubic),
      decline: prog(t, T.dc30! - 0.1, T.dc30! + 0.8, ease.inOutCubic),
      half: prog(t, T.hp30! - 0.1, T.hp30! + 0.8, ease.inOutCubic),
    };
    const d50: Record<Key, number> = {
      constant: prog(t, T.rc50! - 0.1, T.rc50! + 0.9, ease.inOutCubic),
      decline: prog(t, T.dc50! - 0.1, T.dc50! + 0.9, ease.inOutCubic),
      half: prog(t, T.hp50! - 0.1, T.hp50! + 0.9, ease.inOutCubic),
    };
    const endTeal = prog(t, T.physical! - 0.2, T.physical! + 0.3);
    if (mode >= 1) {
      for (const k of ORDER) {
        if (d30[k] <= 0) continue;
        const yEnd = 2023 + 7 * d30[k] + 20 * d50[k];
        const col_ = inkTeal(this.tealOf(k, t));
        this.stroke(c, k, col_, yEnd > 2030 ? [2023, 2030, yEnd] : [2023, yEnd], (y) => ({ x: X(y), y: Yc(casesAt(k, y)) }));
        // data points at 2030 and 2050
        if (d30[k] >= 1) this.dot(c, X(2030), Yc(SC[k].y2030), 5.5, col_);
        if (d50[k] >= 1) this.dot(c, X(2050), Yc(SC[k].y2050), 5.5, k === 'constant' ? inkTeal(Math.max(this.tealOf(k, t), endTeal)) : col_);
      }
    }
    // the shared start point
    if (t > T.b1! - 0.6) this.dot(c, start.x, start.y, 6, C.ink, gridIn);

    if (mode >= 1) {
      // start label: 2023 · 96,694 modelled
      const sl = prog(t, T.n96! - 0.15, T.n96! + 0.35, ease.outCubic) * (1 - cmp);
      if (sl > 0) {
        c.save(); c.globalAlpha = sl; c.translate(0, (1 - sl) * 8);
        text(c, fmt(PROJ.base2023), start.x + 18, start.y + 40, TYPE.body(30, 700), C.ink);
        text(c, '2023 · modelled', start.x + 18, start.y + 66, TYPE.mono(18), C.graphite);
        c.restore();
      }
      // 2030 values: a stack beside the 2030 points (2030 view), below them once the chart extends
      const v30: Record<Key, number> = { constant: T.v137!, decline: T.v123!, half: T.v130! };
      const ys = ORDER.map((k) => Yc(SC[k].y2030));
      const yc = (ys[0]! + ys[2]!) / 2;
      const sx = X(2030) + 24;
      const stackA = 1 - close;
      ORDER.forEach((k, i) => {
        const a = prog(t, v30[k] - 0.15, v30[k] + 0.3, ease.outCubic) * stackA;
        if (a <= 0) return;
        const yA = yc + (i - 1) * 36 + 9, yB = ys[2]! + 64 + i * 34;
        const y = yA + (yB - yA) * ext;
        const col_ = inkTeal(this.tealOf(k, t));
        c.save(); c.globalAlpha = a;
        c.strokeStyle = col_; c.lineWidth = 3; c.lineCap = 'round'; c.setLineDash(DASH[k]);
        c.beginPath(); c.moveTo(sx, y - 9); c.lineTo(sx + 34, y - 9); c.stroke(); c.setLineDash([]);
        const w = text(c, fmt(SC[k].y2030), sx + 46, y, TYPE.body(28, 700), col_);
        text(c, NAME[k], sx + 46 + w + 12, y, TYPE.mono(17), C.graphite);
        c.restore();
      });
      // 2050 values at the line ends
      const v50: Record<Key, number> = { constant: T.v296!, decline: T.v197!, half: T.v241! };
      for (const k of ORDER) {
        const a = prog(t, v50[k] - 0.15, v50[k] + 0.3, ease.outCubic);
        if (a <= 0) continue;
        const y = Yc(SC[k].y2050);
        const col_ = k === 'constant' ? inkTeal(Math.max(this.tealOf(k, t), endTeal)) : inkTeal(this.tealOf(k, t));
        c.save(); c.globalAlpha = a; c.translate((1 - a) * -8, 0);
        text(c, fmt(SC[k].y2050), X(2050) + 20, y + 6, TYPE.body(30, 700), col_);
        text(c, NAME[k], X(2050) + 20, y + 30, TYPE.mono(17), C.graphite);
        c.restore();
      }
      // proj-close: the rates-constant end, the point section 4 starts from
      if (endTeal > 0) {
        c.save(); c.globalAlpha = endTeal; c.strokeStyle = TEAL; c.lineWidth = 2;
        c.beginPath(); c.arc(X(2050), Yc(SC.constant.y2050), 5.5 + 8 * endTeal, 0, Math.PI * 2); c.stroke();
        c.restore();
      }
      // bracket: highest to lowest in 2050
      const br = prog(t, T.v197end! + 0.05, T.v197end! + 0.55, ease.outCubic) * (1 - prog(t, T.e1! - 1.15, T.e1! - 0.75)); // off-screen during the MOH push-in; not back after it
      if (br > 0) {
        const y0 = Yc(SC.constant.y2050), y1 = Yc(SC.decline.y2050), bx = X(2050) + 222;
        const m = (y0 + y1) / 2, h = (y1 - y0) / 2 * br;
        c.save(); c.globalAlpha = br;
        hair(c, bx, m - h, bx, m + h, TEAL, 2.5);
        hair(c, bx - 10, m - h, bx, m - h, TEAL, 2.5);
        hair(c, bx - 10, m + h, bx, m + h, TEAL, 2.5);
        const [n1, n2] = [SPREAD_LABEL.replace(/ apart$/, ''), 'apart'];
        text(c, n1, bx + 18, m + 6, TYPE.display(44, 87.5, 800), TEAL, { ls: -0.5 });
        text(c, n2, bx + 20, m + 40, TYPE.body(26, 600), TEAL);
        c.restore();
      }
      this.mohMarks(c, t, ch, close, cmp, start);
    }

    // source line (screen space while the camera is over the chart)
    const onB = clamp((this.cam.at(t).x - 960) / 1920);
    if (onB > 0) {
      c.save(); this.screen(c);
      sourceLine(c, 'Scenarios from WiSE 2013 and 2023 rates by age: ' + PREV.source2013 + ' · ' + PREV.source2023, col(0), 990, onB * (1 - mode));
      sourceLine(c, 'Our model: UN WPP 2024 × WiSE 2023 · MOH, 4 Nov 2025 · WiSE published 2023: Subramaniam et al. 2025', col(0), 990, onB * mode);
      c.restore();
    }
  }

  // ------------------------------------------------------------------ proj-moh: 152,000 and 73,918
  private mohMarks(c: CanvasRenderingContext2D, t: number, ch: ReturnType<Projection['chart']>, close: number, cmp: number, start: XY) {
    const T = this.t;
    const { X, Yc } = ch;
    const ml = prog(t, T.n152! - 0.15, T.n152! + 0.7, ease.inOutCubic) * (1 - close);
    if (ml <= 0) return;
    const x30 = X(2030), yM = Yc(MOH.y2030), y137 = Yc(SC.constant.y2030);
    const xa = x30 - 110, xb = x30 + 110;
    c.save(); c.globalAlpha = 1 - close;
    // the reference line and its label
    hair(c, xa, yM, xa + (xb - xa) * ml, yM, C.ink, 2);
    const la = prog(t, T.n152! + 0.1, T.n152! + 0.5, ease.outCubic);
    text(c, 'MOH estimate, 2030', xa, yM - 34, TYPE.mono(16), C.graphite, { alpha: la });
    text(c, fmt(MOH.y2030), xa, yM - 10, TYPE.body(24, 700), C.ink, { alpha: la });
    // the gap from 137,087 up to the line (teal until the 2023 comparison takes the accent)
    const gp = prog(t, T.below! - 0.1, T.below! + 0.4, ease.outCubic);
    if (gp > 0) {
      c.fillStyle = cmp > 0.5 ? 'rgba(107,103,96,0.22)' : 'rgba(31,111,107,0.6)';
      c.fillRect(x30 - 10, y137 - (y137 - yM) * gp, 20, (y137 - yM) * gp);
    }
    // closest: the rates-constant 2030 point
    const cl = prog(t, T.closest! - 0.1, T.closest! + 0.3, ease.outCubic) * (1 - cmp);
    if (cl > 0) {
      this.dot(c, x30, y137, 5.5, TEAL, cl);
      c.strokeStyle = TEAL; c.lineWidth = 2; c.globalAlpha = cl * (1 - close);
      c.beginPath(); c.arc(x30, y137, 5.5 + 7 * cl, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
    // 2023: our model vs WiSE published
    if (cmp > 0) {
      const yW = Yc(PROJ.wisePublished2023), yO = start.y;
      c.save(); c.globalAlpha = cmp;
      c.strokeStyle = C.graphite; c.lineWidth = 2;
      c.beginPath(); c.arc(start.x, yW, 5.5, 0, Math.PI * 2); c.stroke();
      const f = TYPE.mono(17);
      const lx = start.x - 26;
      text(c, 'our model ' + fmt(PROJ.base2023), lx, yO + 6, f, C.ink, { align: 'right' });
      text(c, 'WiSE published ' + fmt(PROJ.wisePublished2023), lx, yW + 6, f, C.graphite, { align: 'right' });
      // the gap, teal
      const bx = start.x - 13, h = (yW - yO) * prog(t, T.startPt! + 0.1, T.startPt! + 0.6, ease.outCubic);
      hair(c, bx, yO, bx, yO + h, TEAL, 3);
      hair(c, bx, yO, bx + 6, yO, TEAL, 2);
      if (h >= (yW - yO) * 0.99) hair(c, bx, yW, bx + 6, yW, TEAL, 2);
      text(c, 'already higher', start.x + 18, (yO + yW) / 2 + 12, TYPE.body(20, 600), TEAL, { alpha: prog(t, T.startPt! + 0.4, T.startPt! + 0.8) });
      c.restore();
    }
  }

  // ------------------------------------------------------------------ drawing helpers
  /** A scenario line through the given years (in order), in the scenario's dash style. */
  private stroke(c: CanvasRenderingContext2D, k: Key, color: string, years: number[], at: (y: number) => XY) {
    c.save();
    c.beginPath();
    c.rect(PL - 10, PT - 60, PR - PL + 20, PB - PT + 70);
    c.clip();
    c.strokeStyle = color; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round';
    c.setLineDash(DASH[k]);
    c.beginPath();
    years.forEach((y, i) => { const p = at(y); if (i === 0) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); });
    c.stroke();
    c.restore();
  }
  private dot(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 1) {
    if (a <= 0) return;
    c.save(); c.globalAlpha *= a; c.fillStyle = color;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.restore();
  }

  // ------------------------------------------------------------------ captions (screen space, over the chart)
  private overlay(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    this.screen(c);
    const cap = (s: string, t0: number, t1: number) => {
      const a = prog(t, t0 - 0.1, t0 + 0.4, ease.outCubic) * (1 - prog(t, t1 - 0.3, t1 + 0.1));
      if (a <= 0) return;
      c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 10);
      text(c, s, col(0), 230, TYPE.display(46, 87.5, 700), C.ink, { ls: -0.3 });
      c.restore();
    };
    cap('Even with falling rates, cases rise.', T.still!, T.by2050!);
    cap('So this is a comparison, not a validation.', T.formal!, T.scen!);
    cap('Different assumptions, different projections.', T.scen! + 0.2, 1e9);
  }
}
