// Section 2: prevalence (James; plates prev-define, prev-overall, prev-bands, prev-signif; 06_video/plates.md).
// The dot crowd carries on from section 1: first a grid of 100 large dots for a percentage (the definition,
// then 2013 against 2023), then the 2023 population aged 60+ as three blocks (1 dot ≈ 1,000 people) whose
// share living with dementia turns teal, then the overall change and the three scenario lines.
// One sheet, four regions: A (0,0) the definition; B (1920,0) 2013 vs 2023; C (1920,1080) the age groups;
// D (0,1080) significance and the scenarios. The camera pans A → B → C → D in the pauses between plates.
// The definition grid rides with the first pan so it holds still on screen and becomes the 2023 grid.
import { POP, PREV } from '../data';
import { C, TYPE, col, cue, cueEnd, hair, measureText, text } from './_kit';
import { Camera, StoryScene, TEAL, clamp, ease, label, prog, sectionHead, sourceLine, typeText } from './_story';
import { hash } from '../engine/util';

type XY = { x: number; y: number };
const pct = (s: string) => parseFloat(s); // '8.8%' → 8.8
const P13 = pct(PREV.overall[2013]), P23 = pct(PREV.overall[2023]);

// 100-dot grids: 10 × 10, dot radius 7.5 on a 29 px pitch; teal fills from the bottom row, left to right
const GR = 7.5, GP = 29, GSIZE = 9 * GP + 2 * GR; // 276 px
const TEAL23 = Math.round(P23); // 8.8% ≈ 9 in 100
const TEAL13 = Math.round(P13); // 10.0% = 10 in 100
const tealRank = (i: number) => (9 - Math.floor(i / 10)) * 10 + (i % 10);
// grid positions (screen coordinates of their region): the definition grid in A sits where the 2023 grid sits in B
const G13X = 470, G23X = 1174, GY = 410;

// region C: the 2023 population aged 60+, 1 dot ≈ 1,000 people (POP.byBand[2023] / 1,000: 790, 209, 72),
// 12 rows deep on a 9 px pitch, filled column by column (section 1's blocks)
const DP = 9, DROWS = 12, DR = 3.1;
const BX = 1920 + 400, blockY = [1080 + 360, 1080 + 520, 1080 + 680];
const NDOT = POP.byBand[2023].map((v) => Math.round(v / 1000));
// dots living with dementia at the 2023 WiSE rate: 3.0% of 790, 18.2% of 209, 48.6% of 72 → 24, 38, 35 (97 in all)
const NTEAL = NDOT.map((n, g) => Math.round((n * PREV.y2023[g]!) / 100));
const RX = 1920 + 1050; // rates column

// region D: prevalence among people aged 85+, 2013 to 2050, y axis from 0% to 60%. The model's scenarios act on
// age-specific rates, so the chart shows one age group (85+, the one section 3 picks up), not overall
// prevalence (which rises under every scenario as the population ages).
const DX0 = 230, DX1 = 1430, DY = (p: number) => 1080 + 860 - p * 7.4;
const DXY = (y: number) => DX0 + ((y - 2013) / (2050 - 2013)) * (DX1 - DX0);
const Q13 = PREV.y2013[2]!, Q23 = PREV.y2023[2]!; // 56.2%, 48.6%
// scenario prevalence p(y) = p2023 × (1 + f × r)^(y − 2023), r = (p2023 / p2013)^(1/10) − 1 (the model's formula)
const R85 = Math.pow(Q23 / Q13, 1 / 10) - 1;
const scen = (f: number, y: number) => Q23 * Math.pow(1 + f * R85, y - 2023);
const SCEN = [
  { key: 'constant', name: 'rates constant', f: 0, dash: [] as number[] },
  { key: 'decline', name: 'decline continues', f: 1, dash: [2, 7] },
  { key: 'half', name: 'half-pace decline', f: 0.5, dash: [14, 9] },
];
const STUB_END = 2035; // the "cannot assume" extension stops short here

interface Dot { g: number; i: number; seed: number }
interface DrawDot { x: number; y: number; r: number; teal: boolean; a: number }

export default class Prevalence extends StoryScene {
  crowd: Dot[] = [];
  carryT0 = 0; carryT1 = 0;

  override init() {
    const ly = this.ctx.lyrics;
    const A1 = 'Now that we\'ve seen how Singapore', A2 = 'To investigate this, we used', A3 = 'These studies measured',
      O1 = 'Interestingly, overall dementia', O2 = 'But does this decline',
      B1 = 'Among those aged 60 to 74', B2 = 'For those aged 75 to 84', B3 = 'And among those aged 85', B4 = 'Although prevalence decreased',
      S1 = 'Importantly, the overall decline', S2 = 'Therefore, we cannot assume', S3 = 'To account for this uncertainty';
    const s = this.ctx.start;
    this.t = {
      s, a1: cue(ly, A1, 0),
      well: cue(ly, A2, 'Well'), wise: cue(ly, A2, 'WiSE'), w13: cue(ly, A2, '2013'), w23: cue(ly, A2, '2023'),
      prev: cue(ly, A3, 'prevalence'), refers: cue(ly, A3, 'refers'), percentage: cue(ly, A3, 'percentage'), living: cue(ly, A3, 'living'),
      o1: cue(ly, O1, 0), overall: cue(ly, O1, 'overall'), ten: cue(ly, O1, '10%'), e88: cue(ly, O1, '8.8%'),
      all: cue(ly, O2, 'all'), o2end: cueEnd(ly, O2),
      b1: cue(ly, B1, 0), g0: cue(ly, B1, '60'), a0: cue(ly, B1, '3.4%'), c0: cue(ly, B1, '3.0%'),
      g1: cue(ly, B2, '75'), a1r: cue(ly, B2, '21.6%'), c1: cue(ly, B2, '18.2%'),
      g2: cue(ly, B3, '85'), a2r: cue(ly, B3, '56.2%'), c2: cue(ly, B3, '48.6%'),
      every: cue(ly, B4, 'every'), sharply: cue(ly, B4, 'sharply'),
      s1: cue(ly, S1, 0), sOverall: cue(ly, S1, 'overall'), not: cue(ly, S1, 'not'), pval: cue(ly, S1, 'p-value'),
      assume: cue(ly, S2, 'assume'), continue: cue(ly, S2, 'continue'),
      three: cue(ly, S3, 'three'), rc: cue(ly, S3, 'rates'), dc: cue(ly, S3, 'continues'), hp: cue(ly, S3, 'half'), s3end: cueEnd(ly, S3),
    };
    const T = this.t;
    // camera: A; right to B (the definition grid rides along); down to C; left to D
    const toB = T.o1! - 0.05, dB = 1.2;
    this.carryT0 = toB - dB; this.carryT1 = toB;
    this.cam = new Camera([
      { t: s, x: 960, y: 540 },
      { t: toB, x: 2880, y: 540, dur: dB },
      { t: T.b1! - 0.1, x: 2880, y: 1620, dur: 1.15 },
      { t: T.s1! - 0.05, x: 960, y: 1620, dur: 1.1 },
    ]);
    for (let g = 0; g < 3; g++) for (let i = 0; i < NDOT[g]!; i++) this.crowd.push({ g, i, seed: hash(g * 811 + i * 7.31) });
  }

  // ------------------------------------------------------------------ dots
  private gridPos(x0: number, y0: number, i: number): XY {
    return { x: x0 + GR + (i % 10) * GP, y: y0 + GR + Math.floor(i / 10) * GP };
  }
  /** A 100-dot grid: builds row by row from tb, k dots turn teal from tt (bottom row first). */
  private grid(out: DrawDot[], x0: number, y0: number, t: number, tb: number, k: number, tt: number) {
    for (let i = 0; i < 100; i++) {
      const row = Math.floor(i / 10);
      const bt = tb + (9 - row) * 0.05 + hash(i * 3.7 + x0) * 0.25;
      const e = prog(t, bt, bt + 0.45, ease.outCubic);
      if (e <= 0) continue;
      const rk = tealRank(i);
      const teal = rk < k && t >= tt + rk * 0.07;
      const p = this.gridPos(x0, y0, i);
      out.push({ x: p.x, y: p.y - (1 - e) * 14, r: GR, teal, a: e });
    }
  }
  private crowdPos(d: Dot): XY {
    return { x: BX + Math.floor(d.i / DROWS) * DP + DP / 2, y: blockY[d.g]! + (d.i % DROWS) * DP + DP / 2 };
  }

  draw(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    this.regionA(c, t);
    this.regionB(c, t);
    this.regionC(c, t);
    this.regionD(c, t);

    const dots: DrawDot[] = [];
    // A → B: the definition grid; it rides with the camera's first pan, so it holds still on screen
    if (t < T.s1!) {
      const carry = 1920 * ease.inOutCubic(clamp((t - this.carryT0) / (this.carryT1 - this.carryT0)));
      this.grid(dots, G23X + carry, GY, t, T.percentage! - 0.1, TEAL23, T.living!);
      // B: the 2013 grid builds on "overall", its 10 teal on "10%"
      this.grid(dots, 1920 + G13X, GY, t, T.overall!, TEAL13, T.ten! - 0.1);
    }
    // C: the 2023 crowd builds column by column as the camera arrives; each group's share turns teal on its 2023 rate
    if (t > T.all!) {
      const tc = [T.c0!, T.c1!, T.c2!];
      for (const d of this.crowd) {
        const colIdx = Math.floor(d.i / DROWS);
        const bt = T.all! + 0.55 + d.g * 0.18 + colIdx * 0.011 + d.seed * 0.25;
        const e = prog(t, bt, bt + 0.45, ease.outCubic);
        if (e <= 0) continue;
        const p = this.crowdPos(d);
        const teal = d.i < NTEAL[d.g]! && t >= tc[d.g]! - 0.1 + d.i * 0.018;
        dots.push({ x: p.x, y: p.y - (1 - e) * 16, r: DR, teal, a: e });
      }
    }
    // batch solid dots by colour; fading ones one by one
    const ink: DrawDot[] = [], teal: DrawDot[] = [], faint: DrawDot[] = [];
    for (const d of dots) (d.a < 0.999 ? faint : d.teal ? teal : ink).push(d);
    const batch = (arr: DrawDot[], color: string) => {
      c.fillStyle = color;
      c.beginPath();
      for (const d of arr) { c.moveTo(d.x + d.r, d.y); c.arc(d.x, d.y, d.r, 0, Math.PI * 2); }
      c.fill();
    };
    batch(ink, C.ink);
    batch(teal, TEAL);
    for (const d of faint) {
      c.globalAlpha = d.a;
      c.fillStyle = d.teal ? TEAL : C.ink;
      c.beginPath(); c.arc(d.x, d.y, d.r, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ A: WiSE and the definition
  private regionA(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t > T.b1!) return;
    const x0 = col(0);
    sectionHead(c, '2 · PREVALENCE', 'How common is dementia among older adults?', x0);

    // the study: its name types in on "Well-being", the acronym on "WiSE", the two waves on a small timeline
    const nf = TYPE.body(36, 600);
    const nameS = 'Well-being of the Singapore Elderly';
    typeText(c, nameS, x0, 352, nf, C.ink, t, T.well! - 0.05, 34);
    const wa = prog(t, T.wise! - 0.1, T.wise! + 0.3, ease.outCubic);
    if (wa > 0) text(c, '(WiSE)', x0 + measureText(nameS, nf) + 14, 352, nf, TEAL, { alpha: wa });
    const ty = 430, tx0 = x0, tx1 = x0 + 760;
    const tl = prog(t, T.wise! - 0.05, T.wise! + 0.7, ease.outCubic);
    if (tl > 0) {
      hair(c, tx0, ty, tx0 + (tx1 - tx0) * tl, ty, C.ink, 1.6);
      const mark = (u: number, s: string, tm: number, align: CanvasTextAlign) => {
        const a = prog(t, tm - 0.15, tm + 0.25, ease.outCubic);
        if (a <= 0) return;
        const x = tx0 + (tx1 - tx0) * u;
        c.save(); c.globalAlpha = a;
        hair(c, x, ty - 10, x, ty + 10, C.ink, 2);
        c.fillStyle = C.ink; c.beginPath(); c.arc(x, ty, 5, 0, Math.PI * 2); c.fill();
        text(c, s, x, ty + 44, TYPE.mono(22), C.ink, { align });
        c.restore();
      };
      mark(0, 'WiSE 2013', T.w13!, 'left');
      mark(1, 'WiSE 2023', T.w23!, 'right');
      const yrs = prog(t, T.w23!, T.w23! + 0.5);
      if (yrs > 0) text(c, 'ten years apart', (tx0 + tx1) / 2, ty - 18, TYPE.mono(17), C.graphite, { align: 'center', alpha: yrs });
    }

    // the definition, set like a dictionary entry
    const da = prog(t, T.prev! - 0.15, T.prev! + 0.3, ease.outCubic);
    if (da > 0) {
      c.save(); c.globalAlpha = da;
      hair(c, x0, 548, x0 + 760 * da, 548, C.rule, 1.25);
      text(c, 'prevalence', x0, 640, TYPE.display(72, 87.5, 800), C.ink, { ls: -0.5 });
      text(c, 'noun', x0 + measureText('prevalence', TYPE.display(72, 87.5, 800), -0.5) + 22, 640, TYPE.mono(20), C.graphite);
      c.restore();
    }
    const df = TYPE.body(34, 500);
    typeText(c, 'the share of people in a population', x0, 706, df, C.ink, t, T.refers! - 0.05, 30);
    typeText(c, 'living with dementia', x0, 752, df, C.ink, t, T.refers! - 0.05 + 'the share of people in a population'.length / 30, 30);

    // key under the definition grid (the grid itself is drawn with the dots)
    const ka = prog(t, T.percentage! + 0.3, T.percentage! + 0.8) * (1 - prog(t, this.carryT0, this.carryT0 + 0.3));
    if (ka > 0) {
      c.save(); c.globalAlpha = ka;
      const kx = G23X, ky = GY + GSIZE + 52;
      c.fillStyle = C.ink; c.beginPath(); c.arc(kx + 7, ky - 6, 6, 0, Math.PI * 2); c.fill();
      text(c, '= 1 in 100 people aged 60+', kx + 24, ky, TYPE.mono(18), C.ink);
      const kt = prog(t, T.living! - 0.1, T.living! + 0.3);
      if (kt > 0) {
        c.globalAlpha = ka * kt;
        c.fillStyle = TEAL; c.beginPath(); c.arc(kx + 7, ky + 30, 6, 0, Math.PI * 2); c.fill();
        text(c, '= living with dementia', kx + 24, ky + 36, TYPE.mono(18), TEAL);
      }
      c.restore();
    }
    sourceLine(c, 'Source: WiSE 2023: ' + PREV.source2023, x0, 990, prog(t, T.wise!, T.wise! + 0.5));
  }

  // ------------------------------------------------------------------ B: 2013 against 2023
  private regionB(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < this.carryT0 || t > T.s1!) return;
    const ox = 1920;
    label(c, 'SHARE OF PEOPLE AGED 60+ LIVING WITH DEMENTIA · 1 DOT = 1 IN 100', ox + G13X, 300, C.graphite, prog(t, this.carryT0 + 0.4, this.carryT1));
    // year labels above the grids
    const y13 = prog(t, T.overall! - 0.1, T.overall! + 0.3), y23 = prog(t, this.carryT0 + 0.4, this.carryT1);
    text(c, '2013', ox + G13X, GY - 26, TYPE.display(36, 100, 700), C.graphite, { alpha: y13 });
    text(c, '2023', ox + G23X, GY - 26, TYPE.display(36, 100, 700), C.graphite, { alpha: y23 });
    // the key carries over under the 2023 grid
    const ka = prog(t, this.carryT1 - 0.3, this.carryT1 + 0.2);
    if (ka > 0) {
      c.save(); c.globalAlpha = ka;
      const kx = ox + G13X, ky = 916;
      c.fillStyle = C.ink; c.beginPath(); c.arc(kx + 7, ky - 6, 6, 0, Math.PI * 2); c.fill();
      const w = text(c, '= 1 in 100 people aged 60+', kx + 24, ky, TYPE.mono(18), C.ink);
      c.fillStyle = TEAL; c.beginPath(); c.arc(kx + 24 + w + 40, ky - 6, 6, 0, Math.PI * 2); c.fill();
      text(c, '= living with dementia', kx + 24 + w + 57, ky, TYPE.mono(18), TEAL);
      c.restore();
    }
    // the two figures under the grids, and a thin downward arrow between them
    const big = TYPE.display(104, 87.5, 800), fy = GY + GSIZE + 128;
    const f13 = prog(t, T.ten! - 0.15, T.ten! + 0.3, ease.outCubic), f23 = prog(t, T.e88! - 0.15, T.e88! + 0.3, ease.outCubic);
    const cx13 = ox + G13X + GSIZE / 2, cx23 = ox + G23X + GSIZE / 2;
    if (f13 > 0) text(c, PREV.overall[2013], cx13, fy + (1 - f13) * 12, big, C.ink, { align: 'center', alpha: f13, ls: -2 });
    if (f23 > 0) text(c, PREV.overall[2023], cx23, fy + (1 - f23) * 12, big, TEAL, { align: 'center', alpha: f23, ls: -2 });
    const ar = prog(t, T.e88! + 0.1, T.e88! + 0.8, ease.outCubic);
    if (ar > 0) {
      const xa = cx13 + measureText(PREV.overall[2013], big, -2) / 2 + 40, xb = cx23 - measureText(PREV.overall[2023], big, -2) / 2 - 40;
      const ya = fy - 52, yb = fy - 30;
      const xe = xa + (xb - xa) * ar, ye = ya + (yb - ya) * ar;
      hair(c, xa, ya, xe, ye, C.ink, 1.6);
      if (ar > 0.95) {
        const ang = Math.atan2(yb - ya, xb - xa);
        c.save(); c.fillStyle = C.ink; c.beginPath();
        c.moveTo(xb, yb);
        c.lineTo(xb - Math.cos(ang - 0.4) * 16, yb - Math.sin(ang - 0.4) * 16);
        c.lineTo(xb - Math.cos(ang + 0.4) * 16, yb - Math.sin(ang + 0.4) * 16);
        c.closePath(); c.fill(); c.restore();
      }
    }
    sourceLine(c, 'Source: WiSE: ' + PREV.source2023 + ' (residents aged 60+)', ox + G13X, 990, prog(t, T.ten!, T.ten! + 0.5));
  }

  // ------------------------------------------------------------------ C: the three age groups in 2023
  private regionC(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.all! || t > T.s1! + 0.3) return;
    const tb = T.all! + 0.4;
    label(c, 'PEOPLE AGED 60+ IN 2023, BY AGE GROUP · 1 DOT ≈ 1,000 PEOPLE', BX, 1080 + 300, C.graphite, prog(t, tb, tb + 0.5));
    const tg = [T.g0!, T.g1!, T.g2!], ta = [T.a0!, T.a1r!, T.a2r!], tc = [T.c0!, T.c1!, T.c2!];
    // which group is being spoken (from its age to the next group's age); none after the last line
    const spoken = (g: number) => t >= tg[g]! - 0.3 && t < (g < 2 ? tg[g + 1]! - 0.3 : T.every! - 0.3);
    // column headers for the rates
    const ha = prog(t, T.a0! - 0.2, T.a0! + 0.3);
    label(c, 'WiSE 2013', RX, 1080 + 330, C.graphite, ha);
    label(c, 'WiSE 2023', RX + 170, 1080 + 330, C.graphite, prog(t, T.c0! - 0.2, T.c0! + 0.3));
    for (let g = 0; g < 3; g++) {
      const y = blockY[g]!, by = y + 66;
      const la = prog(t, tb + g * 0.18, tb + 0.5 + g * 0.18, ease.outCubic);
      const sp = spoken(g);
      text(c, PREV.bands[g]!, BX - 30, by, TYPE.display(44, 87.5, 800), C.ink, { align: 'right', alpha: la });
      // the spoken group: a short teal rule under its label
      const em = prog(t, tg[g]! - 0.3, tg[g]!, ease.outCubic) * (sp ? 1 : 1 - prog(t, (g < 2 ? tg[g + 1]! : T.every!) - 0.3, (g < 2 ? tg[g + 1]! : T.every!)));
      if (em > 0) {
        const w = measureText(PREV.bands[g]!, TYPE.display(44, 87.5, 800));
        hair(c, BX - 30 - w * em, by + 14, BX - 30, by + 14, TEAL, 3);
      }
      // rates: 2013 on its figure, 2023 on its figure (teal while spoken)
      const a13 = prog(t, ta[g]! - 0.15, ta[g]! + 0.25, ease.outCubic);
      if (a13 > 0) text(c, PREV.y2013[g]!.toFixed(1) + '%', RX, by + (1 - a13) * 8, TYPE.body(34, 500), C.graphite, { alpha: a13 });
      const a23 = prog(t, tc[g]! - 0.15, tc[g]! + 0.25, ease.outCubic);
      if (a23 > 0) {
        text(c, '→', RX + 118, by, TYPE.body(30, 500), C.graphite, { alpha: a23 });
        text(c, PREV.y2023[g]!.toFixed(1) + '%', RX + 170, by + (1 - a23) * 8, TYPE.display(44, 87.5, 800), sp ? TEAL : C.ink, { alpha: a23 });
      }
    }
    // key for the teal dots
    const ka = prog(t, T.c0! + 0.2, T.c0! + 0.7);
    if (ka > 0) {
      c.save(); c.globalAlpha = ka;
      const kx = BX, ky = 1080 + 850;
      c.fillStyle = TEAL; c.beginPath(); c.arc(kx + 4, ky - 6, DR + 0.5, 0, Math.PI * 2); c.fill();
      text(c, '= living with dementia, at the 2023 rate', kx + 18, ky, TYPE.mono(18), TEAL);
      c.restore();
    }

    // "sharply with age": the three 2023 rates as columns rising left to right; 48.6% in teal
    const ch = prog(t, T.sharply! - 0.5, T.sharply! - 0.1);
    if (ch > 0) {
      const cx0 = 1920 + 1440, base = blockY[2]! + DROWS * DP, k = 7.2, bw = 58, gap = 34;
      c.save(); c.globalAlpha = ch;
      label(c, 'LIVING WITH DEMENTIA, 2023', cx0, 1080 + 330, C.graphite);
      hair(c, cx0 - 8, base, cx0 + 3 * bw + 2 * gap + 8, base, C.ink, 1.4);
      c.restore();
      for (let g = 0; g < 3; g++) {
        const gp = prog(t, T.sharply! - 0.3 + g * 0.22, T.sharply! + 0.4 + g * 0.22, ease.outCubic);
        if (gp <= 0) continue;
        const x = cx0 + g * (bw + gap), h = PREV.y2023[g]! * k * gp;
        c.fillStyle = g === 2 ? TEAL : C.ink;
        c.fillRect(x, base - h, bw, h);
        text(c, PREV.y2023[g]!.toFixed(1) + '%', x + bw / 2, base - h - 12, TYPE.body(22, 700), g === 2 ? TEAL : C.ink, { align: 'center', alpha: gp });
        text(c, PREV.bands[g]!, x + bw / 2, base + 28, TYPE.mono(16), C.graphite, { align: 'center', alpha: gp });
      }
    }
    sourceLine(c, 'Sources: WiSE 2023: Subramaniam et al. 2025 · WiSE 2013 by age: ' + PREV.source2013 + ' · ' + POP.source, BX - 230, 1080 + 990, prog(t, T.a0!, T.a0! + 0.5));
  }

  // ------------------------------------------------------------------ D: not significant; three possibilities
  private regionD(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.s1! - 1.2) return;
    const x0 = col(0), oy = 1080;
    label(c, 'OVERALL PREVALENCE · PEOPLE AGED 60+', x0, oy + 150, C.graphite);
    // the overall change returns at the top, with the significance test in a ruled box
    const big = TYPE.display(84, 87.5, 800);
    const ov = PREV.overall[2013] + ' → ' + PREV.overall[2023];
    const ow = text(c, ov, x0 - 4, oy + 250, big, C.ink, { ls: -1.5 });
    const bx = x0 + ow + 56, bw = measureText('not statistically significant', TYPE.body(30, 600)) + 52;
    const ba = prog(t, T.not! - 0.15, T.not! + 0.35, ease.outCubic);
    if (ba > 0) {
      c.save(); c.globalAlpha = ba;
      c.strokeStyle = C.ink; c.lineWidth = 1.5;
      c.strokeRect(bx, oy + 160, bw, 112);
      text(c, 'not statistically significant', bx + 26, oy + 250, TYPE.body(30, 600), C.ink);
      c.restore();
    }
    const pa = prog(t, T.pval! - 0.1, T.pval! + 0.3, ease.outCubic);
    if (pa > 0) text(c, 'p = ' + PREV.pValue, bx + 26, oy + 206, TYPE.mono(28, 500), TEAL, { alpha: pa });

    // the chart: the 85+ group, 0% to 60%
    const ca = prog(t, T.sOverall! - 0.2, T.sOverall! + 0.4);
    if (ca <= 0) return;
    c.save(); c.globalAlpha = ca;
    label(c, 'PREVALENCE AMONG PEOPLE AGED 85+', DX0, DY(60) - 34, C.graphite);
    text(c, '0%', DX0 - 16, DY(0) + 6, TYPE.mono(16), C.graphite, { align: 'right' });
    for (const p of [20, 40, 60]) {
      hair(c, DX0, DY(p), DX1, DY(p), C.rule, 1);
      text(c, p + '%', DX0 - 16, DY(p) + 6, TYPE.mono(16), C.graphite, { align: 'right' });
    }
    hair(c, DX0, DY(0), DX1, DY(0), C.ink, 1.4);
    for (const y of [2013, 2023, 2030, 2050]) {
      hair(c, DXY(y), DY(0), DXY(y), DY(0) + 8, C.ink, 1.4);
      text(c, String(y), DXY(y), DY(0) + 34, TYPE.mono(18), C.ink, { align: 'center' });
    }
    c.restore();
    // the observed decline, drawn solid
    const sp = prog(t, T.sOverall! - 0.1, T.sOverall! + 0.6, ease.inOutCubic);
    const pA = { x: DXY(2013), y: DY(Q13) }, pB = { x: DXY(2023), y: DY(Q23) };
    if (sp > 0) {
      hair(c, pA.x, pA.y, pA.x + (pB.x - pA.x) * sp, pA.y + (pB.y - pA.y) * sp, C.ink, 3);
      c.fillStyle = C.ink;
      c.beginPath(); c.arc(pA.x, pA.y, 6, 0, Math.PI * 2); c.fill();
      if (sp >= 1) { c.beginPath(); c.arc(pB.x, pB.y, 6, 0, Math.PI * 2); c.fill(); }
    }
    // "cannot assume": the decline extended, dotted, stops short with a question mark
    const line = (f: number, y1: number) => {
      const pts: XY[] = [];
      for (let y = 2023; y <= y1 + 1e-6; y += 0.5) pts.push({ x: DXY(y), y: DY(scen(f, y)) });
      return pts;
    };
    const stroke = (pts: XY[], u: number, dash: number[], color: string, w = 2.4) => {
      if (u <= 0) return;
      const n = Math.max(1, Math.floor((pts.length - 1) * u));
      c.save();
      c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'round'; c.setLineDash(dash);
      c.beginPath();
      c.moveTo(pts[0]!.x, pts[0]!.y);
      for (let i = 1; i <= n; i++) c.lineTo(pts[i]!.x, pts[i]!.y);
      // partial last segment
      const fi = (pts.length - 1) * u;
      if (fi > n && n + 1 < pts.length) {
        const a = pts[n]!, b = pts[n + 1]!, r = fi - n;
        c.lineTo(a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r);
      }
      c.stroke();
      c.restore();
    };
    const fan = prog(t, T.three! - 0.1, T.three! + 1.2, ease.inOutCubic);
    const stubU = prog(t, T.assume! - 0.1, T.assume! + 1.0, ease.outCubic);
    const qa = prog(t, T.assume! + 0.8, T.assume! + 1.2) * (1 - prog(t, T.three! - 0.1, T.three! + 0.3));
    if (fan <= 0) stroke(line(1, STUB_END), stubU, [2, 7], C.ink);
    if (qa > 0) {
      const end = { x: DXY(STUB_END), y: DY(scen(1, STUB_END)) };
      text(c, '?', end.x + 22, end.y + 16, TYPE.display(52, 100, 800), C.ink, { alpha: qa });
    }
    // "three possibilities": three lines fan out from 2023 to 2050; each label as spoken (teal while spoken)
    if (fan > 0) {
      const tl = [T.rc!, T.dc!, T.hp!];
      SCEN.forEach((sc, k) => {
        const on = t >= tl[k]! - 0.15 && (k < 2 ? t < tl[k + 1]! - 0.15 : t < T.s3end! + 0.1);
        const pts = line(sc.f, 2050);
        stroke(pts, sc.f === 1 ? Math.max(fan, stubU * (STUB_END - 2023) / (2050 - 2023)) : fan, sc.dash, on ? TEAL : C.ink);
        const la = prog(t, tl[k]! - 0.15, tl[k]! + 0.25, ease.outCubic);
        if (la > 0) {
          const end = pts[pts.length - 1]!;
          text(c, sc.name, end.x + 24, end.y + 8 + (1 - la) * 8, TYPE.body(28, 600), on ? TEAL : C.ink, { alpha: la });
        }
      });
    }
    sourceLine(c, 'Sources: WiSE: ' + PREV.source2023 + ' · 85+ in 2013: ' + PREV.source2013 + ' · lines: our three scenarios for the 85+ group', x0, oy + 990, ca);
  }
}
