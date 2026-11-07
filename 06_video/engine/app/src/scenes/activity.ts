// Section 4: physical activity (Zoe; plates pa-risk, pa-paf, pa-pif, pa-cases, pa-caveat; 06_video/plates.md).
// Dots instead of walking figures. One sheet, four regions: A (0,0) the question and the meta-analysis;
// B (1920,0) 20 of 100 dots inactive and the PAF; C (1920,1080) the three PIF scenarios as ruled rows that
// grow into a grouped bar chart, then the 2050 cases as a dot crowd with the few avoided ones lifting out;
// D (3840,1080) the caveat. The camera pans right, down, right, in the pauses between plates. The section
// ends on a hard cut into the AI comparison's dark screen, so region D is the last, complete frame.
import { PA, PROJ } from '../data';
import { C, TYPE, col, cue, cueEnd, hair, measureText, span, text } from './_kit';
import { Camera, StoryScene, TEAL, clamp, countUp, ease, label, prog, sectionHead, sourceLine, typeText } from './_story';
import { hash } from '../engine/util';

const fmt = (n: number) => n.toLocaleString('en-US');
type XY = { x: number; y: number };

// region origins on the sheet
const A = { x: 0, y: 0 }, B = { x: 1920, y: 0 }, RC = { x: 1920, y: 1080 }, D = { x: 3840, y: 1080 };

// B: 10×10 grid, 1 dot = 1 in 100 adults aged 60–74
const GX = 120, GY = 330, GP = 34, GR = 8;
const N_INACTIVE = Math.round(PA.inactive); // 19.7% of 100 ≈ 20 dots

// C: scenario rows and bars
const ROW_Y = [452, 572, 692]; // baselines of the row labels
const BX0 = 790, BMAX = 860; // bar origin and the length of the largest value (6,939)
const VMAX = Math.max(...PA.scenarios.map((s) => s.y2050));
const BASES = ['inspired by the National Steps Challenge', 'WHO global target', PA.scenarios[2]!.basis.toLowerCase()];

// C: the 2050 crowd, 1 dot ≈ 1,000 people with dementia, 12 rows deep, filled column by column
const DP = 9, DROWS = 12, CRX = 120, CRY = 820;
const N_CASES = Math.round(PROJ.scenarios[0]!.y2050 / 1000); // 295,653 / 1,000 ≈ 296 dots
const N_AVOID = Math.round(PA.scenarios[2]!.y2050 / 1000); // 6,939 / 1,000 ≈ 7 dots

/** Greedy word wrap to width w. */
function wrap(s: string, f: string, w: number) {
  const out: string[] = [];
  let line = '';
  for (const word of s.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && measureText(next, f) > w) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
}

export default class Activity extends StoryScene {
  override init() {
    const ly = this.ctx.lyrics;
    const R1 = 'Physical inactivity is', P1 = 'To assess its potential', P2 = 'We calculated the Population', F1 = 'To estimate how many',
      F2 = 'The 5% reduction', K1 = 'Applied to our', K2 = 'These results suggest', V1 = 'However, these estimates';
    const s = this.ctx.start;
    this.t = {
      s, r1: cue(ly, R1, 0), review: cue(ly, R1, 'systematic'), pct20: cue(ly, R1, '20'),
      p1: cue(ly, P1, 0), used: cue(ly, P1, 'used'), natl: cue(ly, P1, 'National'), v197: cue(ly, P1, '19.7'),
      p2: cue(ly, P2, 0), paf: cue(ly, P2, 'Population'), v47: cue(ly, P2, '4.7'), p2end: cueEnd(ly, P2),
      f1: cue(ly, F1, 0), three: cue(ly, F1, 'three'), pif: cue(ly, F1, 'Potential'),
      f2: cue(ly, F2, 0), c5: cue(ly, F2, '5'), c15: cue(ly, F2, '15'), c50: cue(ly, F2, '50'),
      k1: cue(ly, K1, 0), rc: cue(ly, K1, 'rates'),
      v322: cue(ly, K1, '322'), v694: cue(ly, K1, '694'), v965: cue(ly, K1, '965'), v2082: cue(ly, K1, '2,082'), v3217: cue(ly, K1, '3,217'), v6939: cue(ly, K1, '6,939'),
      k2: cue(ly, K2, 0), higher: cue(ly, K2, 'higher'), highlights: cue(ly, K2, 'highlights'), greater: cue(ly, K2, 'greater'), lowering: cue(ly, K2, 'lowering'), importance: cue(ly, K2, 'importance'), k2end: cueEnd(ly, K2),
      v1: cue(ly, V1, 0), assume: cue(ly, V1, 'assume'), causal: cue(ly, V1, 'causal'), that: cue(ly, V1, 'that'), rather: cue(ly, V1, 'rather'),
    };
    const T = this.t;
    this.cam = new Camera([
      { t: s, x: A.x + 960, y: A.y + 540 },
      { t: T.p1! - 0.05, x: B.x + 960, y: B.y + 540, dur: 1.1 },
      { t: T.f1! - 0.05, x: RC.x + 960, y: RC.y + 540, dur: 1.1 },
      { t: T.v1! - 0.05, x: D.x + 960, y: D.y + 540, dur: 1.1 },
    ]);
  }

  draw(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.p1! + 0.2) this.at(c, A, () => this.regionA(c, t));
    if (t > T.p1! - 1.4 && t < T.f1! + 0.2) this.at(c, B, () => this.regionB(c, t));
    if (t > T.f1! - 1.4 && t < T.v1! + 0.2) this.at(c, RC, () => this.regionC(c, t));
    if (t > T.v1! - 1.4) this.at(c, D, () => this.regionD(c, t));
  }

  private at(c: CanvasRenderingContext2D, o: XY, fn: () => void) {
    c.save(); c.translate(o.x, o.y); fn(); c.restore();
  }

  /** Staggered, slightly arcing flight from a to b (copied from demographics.ts). */
  private flight(seed: number, a: XY, b: XY, t: number, t0: number, spread: number, dur: number) {
    const u = ease.inOutCubic(clamp((t - t0 - seed * spread) / dur));
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const lift = Math.sin(Math.PI * u) * (40 + 80 * hash(seed * 7.1)) * (hash(seed * 3.3) < 0.5 ? -1 : 1) * Math.min(1, L / 600);
    return { x: a.x + dx * u + (-dy / L) * lift, y: a.y + dy * u + (dx / L) * lift, u };
  }

  // ------------------------------------------------------------------ A: the question and the evidence
  private regionA(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    sectionHead(c, '4 · PHYSICAL ACTIVITY', 'Could more activity reduce cases?', col(0));

    // citation card (pa-risk, "systematic review")
    const a = prog(t, T.review! - 0.15, T.review! + 0.35, ease.outCubic);
    const x = col(0), w = span(9), y = 300;
    const tf = TYPE.body(34, 500);
    const lines = wrap(PA.paperTitle, tf, w - 64);
    const h = 64 + lines.length * 46 + 96;
    if (a > 0) {
      c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 12);
      c.strokeStyle = C.ink; c.lineWidth = 1.5;
      c.strokeRect(x, y, w, h);
      label(c, 'SYSTEMATIC REVIEW AND META-ANALYSIS', x + 32, y + 46);
      lines.forEach((l, i) => text(c, l, x + 32, y + 100 + i * 46, tf, C.ink));
      const yb = y + 100 + (lines.length - 1) * 46;
      hair(c, x + 32, yb + 30, x + w - 32, yb + 30, C.rule);
      text(c, PA.paperAuthors, x + 32, yb + 68, TYPE.body(24, 600), C.ink);
      text(c, PA.paperCite, x + w - 32, yb + 68, TYPE.mono(20), C.graphite, { align: 'right' });
      c.restore();
    }

    // the finding ("20 per cent")
    const f = prog(t, T.pct20! - 0.15, T.pct20! + 0.35, ease.outCubic);
    if (f > 0) {
      const yf = y + h + 130;
      c.save(); c.globalAlpha = f; c.translate(0, (1 - f) * 12);
      text(c, PA.lowerRiskLabel, x - 3, yf, TYPE.display(76, 87.5, 800), TEAL, { ls: -1 });
      text(c, 'of dementia with higher physical activity', x, yf + 46, TYPE.body(28, 500), C.ink);
      text(c, 'pooled relative risk ' + PA.rrProtective, x, yf + 84, TYPE.mono(20), C.graphite);
      c.restore();
    }
    sourceLine(c, 'Source: Iso-Markku et al. 2022, ' + PA.paperCite, col(0), 990, a);
  }

  // ------------------------------------------------------------------ B: 20 in 100, and the PAF
  private regionB(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const la = prog(t, T.p1! - 0.2, T.p1! + 0.3);
    label(c, 'ADULTS AGED 60–74 · 1 DOT = 1 IN 100', GX, GY - 50, C.graphite, la);
    // the grid: builds row by row on "used", the top two rows (20 dots) turn teal on "19.7"
    const ink: number[] = [], teal: number[] = [];
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10), k = i % 10, seed = hash(i * 13.7 + 3);
      const bt = T.used! + 0.1 + r * 0.09 + seed * 0.35;
      const e = prog(t, bt, bt + 0.5, ease.outCubic);
      if (e <= 0) continue;
      const x = GX + k * GP + GR, y = GY + r * GP + GR - (1 - e) * 16;
      const isTeal = i < N_INACTIVE && t >= T.v197! + 0.05 + k * 0.05 + r * 0.12;
      if (e < 0.999) {
        c.globalAlpha = e; c.fillStyle = C.ink;
        c.beginPath(); c.arc(x, y, GR, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      } else (isTeal ? teal : ink).push(x, y);
    }
    const batch = (arr: number[], color: string) => {
      c.fillStyle = color; c.beginPath();
      for (let i = 0; i < arr.length; i += 2) { c.moveTo(arr[i]! + GR, arr[i + 1]!); c.arc(arr[i]!, arr[i + 1]!, GR, 0, Math.PI * 2); }
      c.fill();
    };
    batch(ink, C.ink); batch(teal, TEAL);

    // the label under the grid ("19.7")
    const v = prog(t, T.v197! - 0.1, T.v197! + 0.4, ease.outCubic);
    const toInk = prog(t, T.v47! - 0.3, T.v47!); // the teal passes to the PAF
    if (v > 0) {
      c.save(); c.globalAlpha = v; c.translate(0, (1 - v) * 10);
      const y = GY + 10 * GP + 108;
      text(c, PA.inactive + '%', GX - 3, y, TYPE.display(84, 87.5, 800), toInk > 0.5 ? C.ink : TEAL, { ls: -1 });
      text(c, 'of adults aged 60–74', GX, y + 46, TYPE.body(28, 500), C.ink);
      text(c, 'insufficiently active · NPHS 2024', GX, y + 82, TYPE.body(28, 500), C.ink);
      c.restore();
    }

    // the PAF ("Population Attributable Fraction"): formula typed, then P and RR under it
    const fx = col(6);
    const pa = prog(t, T.paf! - 0.3, T.paf! + 0.1);
    if (pa > 0) {
      label(c, 'POPULATION ATTRIBUTABLE FRACTION', fx, 330, C.graphite, pa);
      const ff = TYPE.mono(34, 500);
      typeText(c, PA.pafFormula, fx, 400, ff, C.ink, t, T.paf! + 0.1, 45);
      const done = T.paf! + 0.1 + PA.pafFormula.length / 45;
      const pv = prog(t, done + 0.05, done + 0.45, ease.outCubic);
      if (pv > 0) {
        c.save(); c.globalAlpha = pv;
        hair(c, fx, 432, fx + measureText(PA.pafFormula, ff), 432, C.rule);
        text(c, 'P = ' + PA.inactive + '%', fx, 480, TYPE.mono(26), C.ink);
        text(c, 'insufficiently active', fx + 200, 480, TYPE.mono(20), C.graphite);
        text(c, 'RR = ' + PA.rr, fx, 524, TYPE.mono(26), C.ink);
        text(c, 'relative risk if inactive (1 / ' + PA.rrProtective + ')', fx + 200, 524, TYPE.mono(20), C.graphite);
        c.restore();
      }
    }
    // the result ("4.7 per cent")
    const r = prog(t, T.v47! - 0.15, T.v47! + 0.35, ease.outCubic);
    if (r > 0) {
      c.save(); c.globalAlpha = r; c.translate(0, (1 - r) * 12);
      text(c, PA.paf, fx - 6, 740, TYPE.display(168, 87.5, 800), TEAL, { ls: -3 });
      text(c, 'of dementia cases attributable', fx, 794, TYPE.body(28, 500), C.ink);
      text(c, 'to physical inactivity', fx, 830, TYPE.body(28, 500), C.ink);
      c.restore();
    }
    sourceLine(c, 'Sources: National Population Health Survey 2024; relative risk from Iso-Markku et al. 2022', col(0), 990, la);
  }

  // ------------------------------------------------------------------ C: PIF scenarios → bars → the crowd
  private regionC(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    // the PIF formula ("Potential Impact Fraction")
    const pa = prog(t, T.pif! - 0.3, T.pif! + 0.1);
    if (pa > 0) {
      label(c, 'POTENTIAL IMPACT FRACTION', col(0), 170, C.graphite, pa);
      typeText(c, PA.pifFormula, col(0), 236, TYPE.mono(34, 500), C.ink, t, T.pif! + 0.1, 50);
    }

    // three ruled rows ("three"), each teal while its basis is spoken
    const cueOf = [T.c5!, T.c15!, T.c50!];
    const endOf = [T.c15!, T.c50!, T.k1! - 0.4];
    // the empty ruled table draws as the camera arrives; the rows fill it on "three"
    ROW_Y.forEach((y, i) => {
      const rl = prog(t, T.f1! - 0.3 + i * 0.12, T.f1! + 0.5 + i * 0.12, ease.outCubic);
      if (rl > 0) hair(c, col(0), y + 66, col(0) + (1800 - col(0)) * rl, y + 66, C.rule);
    });
    PA.scenarios.forEach((sc, i) => {
      const y = ROW_Y[i]!;
      const a = prog(t, T.three! - 0.1 + i * 0.18, T.three! + 0.35 + i * 0.18, ease.outCubic);
      if (a <= 0) return;
      const hi = t >= cueOf[i]! - 0.1 && t < endOf[i]! - 0.1;
      const ink = hi ? TEAL : C.ink;
      c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 10);
      const wCut = text(c, sc.cut, col(0) - 2, y, TYPE.display(60, 87.5, 800), ink, { ls: -1 });
      text(c, 'less inactivity', col(0) + Math.max(wCut, 118) + 18, y, TYPE.body(30, 600), ink);
      c.restore();
      const b = prog(t, cueOf[i]! - 0.15, cueOf[i]! + 0.3, ease.outCubic);
      if (b > 0) text(c, BASES[i]!, col(0) + 136, y + 36, TYPE.mono(19), hi ? TEAL : C.graphite, { alpha: b });
      // rule under the row
    });

    // the bar chart (pa-cases): legend and note, then bars as the values are spoken
    const la = prog(t, T.k1! - 0.2, T.k1! + 0.3);
    if (la > 0) {
      c.save(); c.globalAlpha = la;
      label(c, 'CASES AVOIDED', BX0, 330);
      // legend, right-aligned
      const lf = TYPE.mono(19);
      let lx = 1800 - measureText('2050', lf);
      text(c, '2050', lx, 332, lf, C.ink);
      lx -= 30; c.fillStyle = C.ink; c.fillRect(lx, 316, 20, 18);
      lx -= 34 + measureText('2030', lf);
      text(c, '2030', lx, 332, lf, C.ink);
      lx -= 30; c.strokeStyle = C.ink; c.lineWidth = 1.5; c.strokeRect(lx + 0.75, 316.75, 18.5, 16.5);
      c.restore();
    }
    const na = prog(t, T.rc! - 0.15, T.rc! + 0.3, ease.outCubic);
    if (na > 0) text(c, 'applied to the rates-constant projection', BX0, 364, TYPE.mono(19), C.graphite, { alpha: na });

    const vc = [[T.v322!, T.v694!], [T.v965!, T.v2082!], [T.v3217!, T.v6939!]];
    const tealBars = prog(t, T.higher! - 0.1, T.higher! + 0.3) * (1 - prog(t, T.highlights! - 0.1, T.highlights! + 0.3));
    PA.scenarios.forEach((sc, i) => {
      const y = ROW_Y[i]!;
      ([[sc.y2030, 0], [sc.y2050, 1]] as const).forEach(([v, k]) => {
        const t0 = vc[i]![k]! - 0.12;
        const g = prog(t, t0, t0 + 0.6, ease.outCubic);
        if (g <= 0) return;
        const by = y - 50 + k * 30, bh = 24, bw = (v / VMAX) * BMAX * g;
        const color = k === 1 && tealBars > 0.5 ? TEAL : C.ink;
        if (k === 0) { c.strokeStyle = color; c.lineWidth = 1.5; c.strokeRect(BX0 + 0.75, by + 0.75, Math.max(0, bw - 1.5), bh - 1.5); }
        else { c.fillStyle = color; c.fillRect(BX0, by, bw, bh); }
        text(c, countUp(v, t, t0, t0 + 0.6), BX0 + bw + 12, by + 19, TYPE.mono(20, k === 1 ? 600 : 400), color);
      });
    });
    hair(c, BX0, ROW_Y[0]! - 66, BX0, ROW_Y[2]! + 66, C.ink, 1.25 * la);

    this.crowd(c, t);

    sourceLine(c, 'Sources: NPHS 2024 · Iso-Markku et al. 2022 · WHO Global Action Plan on Physical Activity 2018–2030', col(0), 990, prog(t, T.three!, T.three! + 0.5));
  }

  /** The 2050 rates-constant cases as a teal crowd; the dots the 50% scenario would avoid lift out and turn ink. */
  private crowd(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const t0 = T.greater! - 0.2; // on "a greater reduction in physical inactivity"
    if (t < t0) return;
    const cols = Math.ceil(N_CASES / DROWS);
    label(c, 'PEOPLE WITH DEMENTIA IN 2050, RATES CONSTANT · 1 DOT ≈ 1,000', CRX, CRY - 26, C.graphite, prog(t, t0, t0 + 0.4));
    const tLift = T.lowering!; // "could contribute to lowering ... burden"
    const xr = CRX + cols * DP;
    const teal: number[] = [];
    for (let o = 0; o < N_CASES; o++) {
      const ci = Math.floor(o / DROWS), r = o % DROWS, seed = hash(o * 7.3 + 1);
      const bt = t0 + ci * 0.03 + seed * 0.25;
      const e = prog(t, bt, bt + 0.45, ease.outCubic);
      if (e <= 0) continue;
      const home = { x: CRX + ci * DP + DP / 2, y: CRY + r * DP + DP / 2 };
      const avoided = o >= N_CASES - N_AVOID;
      if (avoided && t > tLift) {
        // lift out to a short row beside the crowd, teal → ink
        const k = o - (N_CASES - N_AVOID);
        const dest = { x: xr + 52 + k * 16, y: CRY + 6 * DP };
        const f = this.flight(seed, home, dest, t, tLift, 0.3, 0.8);
        const m = prog(t, tLift + 0.5, tLift + 1.3);
        c.fillStyle = m > 0.5 ? C.ink : TEAL;
        c.globalAlpha = m > 0 && m < 1 ? 1 - Math.sin(Math.PI * m) * 0.5 : 1;
        c.beginPath(); c.arc(f.x, f.y, 3.1 + f.u * 0.6, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 1;
        continue;
      }
      if (e < 0.999) {
        c.globalAlpha = e; c.fillStyle = TEAL;
        c.beginPath(); c.arc(home.x, home.y - (1 - e) * 14, 3.1, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      } else teal.push(home.x, home.y);
    }
    c.fillStyle = TEAL; c.beginPath();
    for (let i = 0; i < teal.length; i += 2) { c.moveTo(teal[i]! + 3.1, teal[i + 1]!); c.arc(teal[i]!, teal[i + 1]!, 3.1, 0, Math.PI * 2); }
    c.fill();
    const ca = prog(t, tLift + 0.9, tLift + 1.3, ease.outCubic);
    if (ca > 0) {
      const x = xr + 52 + N_AVOID * 16 + 24;
      text(c, `50% less inactivity: about ${N_AVOID} of ${N_CASES}`, x, CRY + 6 * DP + 10, TYPE.body(28, 600), C.ink, { alpha: ca });
    }
  }

  // ------------------------------------------------------------------ D: the caveat (last frame)
  private regionD(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    // ink caution sign: a hairline triangle drawn on "assume", then a thin exclamation mark
    const cx = 380, top = 370, base = 730, half = 208;
    const d = prog(t, T.assume! - 0.2, T.assume! + 0.7, ease.inOutCubic);
    if (d > 0) {
      const pts: XY[] = [{ x: cx, y: top }, { x: cx + half, y: base }, { x: cx - half, y: base }, { x: cx, y: top }];
      const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i]!.x, p.y - pts[i]!.y));
      const total = segs.reduce((a, b) => a + b, 0);
      let left = total * d;
      c.save(); c.strokeStyle = C.ink; c.lineWidth = 2.5; c.lineJoin = 'miter';
      c.beginPath(); c.moveTo(pts[0]!.x, pts[0]!.y);
      for (let i = 0; i < segs.length && left > 0; i++) {
        const u = Math.min(1, left / segs[i]!);
        c.lineTo(pts[i]!.x + (pts[i + 1]!.x - pts[i]!.x) * u, pts[i]!.y + (pts[i + 1]!.y - pts[i]!.y) * u);
        left -= segs[i]!;
      }
      c.stroke();
      const ex = prog(t, T.assume! + 0.55, T.assume! + 0.95, ease.outCubic);
      if (ex > 0) {
        hair(c, cx, 490, cx, 490 + 140 * ex, C.ink, 4);
        if (ex > 0.95) { c.fillStyle = C.ink; c.beginPath(); c.arc(cx, 676, 5, 0, Math.PI * 2); c.fill(); }
      }
      c.restore();
    }

    // the two assumptions, as a ruled list
    const lx = col(5) + 40;
    const la = prog(t, T.assume! - 0.1, T.assume! + 0.3);
    label(c, 'THESE ESTIMATES ASSUME', lx, 350, C.graphite, la);
    hair(c, lx, 378, lx + (1800 - lx) * la, 378, C.ink, 1.5);
    const items: [string, number][] = [['inactivity causes dementia', T.causal!], ['the 60–74 rate applies to everyone over 60', T.that!]];
    items.forEach(([s, tc], i) => {
      const a = prog(t, tc - 0.1, tc + 0.35, ease.outCubic);
      if (a <= 0) return;
      const y = 470 + i * 120;
      c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 10);
      text(c, String(i + 1), lx, y, TYPE.mono(24), C.graphite);
      text(c, s, lx + 48, y, TYPE.body(40, 600), C.ink);
      c.restore();
      const rl = prog(t, tc, tc + 0.6, ease.outCubic);
      if (rl > 0) hair(c, lx, y + 46, lx + (1800 - lx) * rl, y + 46, C.rule);
    });

    // the caption ("rather than")
    const ca = prog(t, T.rather! - 0.15, T.rather! + 0.35, ease.outCubic);
    if (ca > 0) {
      c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 12);
      text(c, 'Potential, not predicted.', lx - 4, 836, TYPE.display(84, 87.5, 800), TEAL, { ls: -1 });
      c.restore();
    }
    sourceLine(c, 'Sources: NPHS 2024 · Iso-Markku et al. 2022 · WHO Global Action Plan on Physical Activity 2018–2030', col(0), 990, la);
  }
}
