// Plate: arith. The worked calculation as a typeset ledger: population x prevalence = cases per age
// band, 2030 first, then 2050 beside it; the candidates' stated totals in a narrow table on the right,
// ticked by the pen (docs/TREATMENT.md, "arith").
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { ease, prog } from '../engine/util';
import { Q2, fmt } from '../data';
import { C, GRID, Paper, Pen, TYPE, candidate, col, cue, cueEnd, hair, measureText, ruleOn, span, text } from './_kit';

const MONO = 28;
const CPS = 52; // plotter speed, chars per second

/** Right-aligned text revealed left to right (plotter): returns the time the last char lands. */
function plotR(c: CanvasRenderingContext2D, s: string, xr: number, y: number, f: string, color: string, t: number, t0: number, cps = CPS, alpha = 1) {
  if (t < t0) return;
  const n = Math.min(s.length, Math.floor((t - t0) * cps) + 1);
  const x = xr - measureText(s, f);
  c.save();
  c.globalAlpha *= alpha;
  text(c, s.slice(0, n), x, y, f, color);
  c.restore();
}

interface Cell { s: string; xr: number; color: string; t0: number }

export default class Arith extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  t: Record<string, number> = {};
  // layout (x positions relative to a block's left edge, filled on first render once fonts are in)
  geo: { pop: number; times: number; rate: number; eq: number; cases: number; w: number } | null = null;

  // vertical layout
  Y = { group: 350, sub: 404, rows: [494, 574, 654], dbl: 690, total: 756, foot: 796 };
  // block positions: 2030 sits centred over the ledger until 2050 arrives, then slides left
  B30 = 240; LEDGER_R = 1266; GAP = 84;
  PANEL = { rule: 1306, year: 1336, a: 1560, b: 1744 };

  override init() {
    const ly = this.ctx.lyrics;
    const s = this.ctx.start;
    this.t = {
      head: s - 0.45, // the title block is in place as the plate cuts in
      build: s,
      both: cue(ly, 'Both did the arithmetic', 'Both'),
      perfectly: cue(ly, 'Both did the arithmetic', 'perfectly'),
      tot30: cue(ly, 'Both did the arithmetic', '137,087'),
      people: cue(ly, 'Both did the arithmetic', 'people'),
      and: cue(ly, 'Both did the arithmetic', 'and'),
      tot50: cue(ly, 'Both did the arithmetic', '295,653'),
      y2050: cue(ly, 'Both did the arithmetic', '2050'),
      exactly: cue(ly, 'Exactly our figures', 'Exactly'),
      end: cueEnd(ly, 'Exactly our figures'),
    };
    const T = this.t, P = this.PANEL, Y = this.Y;
    // "Exactly our figures": the pen ticks both candidates' figures, twice each
    const tickAt = [T.exactly!, T.exactly! + 0.28, T.exactly! + 0.56, T.exactly! + 0.84];
    const spots: [number, number][] = [[P.a + 18, Y.rows[0]!], [P.b + 18, Y.rows[0]!], [P.a + 18, Y.rows[1]!], [P.b + 18, Y.rows[1]!]];
    spots.forEach(([x, y], i) => this.pen.tick(x + 8, y - 2, 30, tickAt[i]!, { dur: 0.22 }));
  }

  private layout() {
    if (this.geo) return this.geo;
    const f = TYPE.mono(MONO);
    const wPop = measureText('1,244,081', f), wRate = measureText('48.6%', f), wCases = measureText('159,793', f), wSym = measureText('×', f);
    const g = 18;
    const pop = wPop;
    const times = pop + g + wSym / 2;
    const rate = times + wSym / 2 + g + wRate;
    const eq = rate + g + wSym / 2;
    const cases = eq + wSym / 2 + g + wCases;
    this.geo = { pop, times, rate, eq, cases, w: cases };
    return this.geo;
  }

  /** Cells of one row with their start times (written left to right, one after another). */
  private rowCells(bx: number, pop: number, rate: string, cases: number, t0: number): Cell[] {
    const g = this.layout();
    const parts: [string, number, string][] = [[fmt(pop), bx + g.pop, C.ink], ['×', bx + g.times, C.graphite], [rate, bx + g.rate, C.ink], ['=', bx + g.eq, C.graphite], [fmt(cases), bx + g.cases, C.ink]];
    let tt = t0;
    return parts.map(([s, x, color]) => {
      const cell = { s, xr: s.length === 1 ? x + measureText(s, TYPE.mono(MONO)) / 2 : x, color, t0: tt };
      tt += s.length / CPS + 0.04;
      return cell;
    });
  }

  private block(c: CanvasRenderingContext2D, t: number, bx: number, year: string, data: { pop: number[]; cases: number[]; total: number }, t0: number, rowDt: number, tTotal: number, foot: boolean) {
    const g = this.layout(), Y = this.Y;
    const mono = TYPE.mono(MONO);
    const a = prog(t, t0 - 0.3, t0);
    // group header with an ink rule, sub-headers right-aligned over their columns
    text(c, year, bx, Y.group, TYPE.display(30, 100, 800), C.ink, { alpha: a });
    ruleOn(c, bx, bx + g.w, Y.group + 16, t, t0 - 0.3, t0 + 0.1, C.ink, 1.25);
    const sub = TYPE.label(13);
    text(c, 'POPULATION', bx + g.pop, Y.sub, sub, C.graphite, { ls: 2, align: 'right', alpha: a });
    text(c, 'PREVALENCE', bx + g.rate, Y.sub, sub, C.graphite, { ls: 2, align: 'right', alpha: a });
    text(c, 'CASES', bx + g.cases, Y.sub, sub, C.graphite, { ls: 2, align: 'right', alpha: a });
    // rows
    data.pop.forEach((p, i) => {
      for (const cell of this.rowCells(bx, p, Q2.rates[i]!, data.cases[i]!, t0 + i * rowDt)) plotR(c, cell.s, cell.xr, Y.rows[i]!, mono, cell.color, t, cell.t0);
    });
    // double rule above the total, then the total
    const td = tTotal - 0.45;
    ruleOn(c, bx + g.eq - 10, bx + g.cases, Y.dbl, t, td, td + 0.3, C.ink, 1.25);
    ruleOn(c, bx + g.eq - 10, bx + g.cases, Y.dbl + 6, t, td + 0.08, td + 0.38, C.ink, 1.25);
    plotR(c, fmt(data.total), bx + g.cases, Y.total, TYPE.mono(MONO, 600), C.ink, t, tTotal - 0.12);
    if (foot) text(c, 'totals from unrounded values', bx + g.cases, Y.foot, TYPE.mono(17), C.graphite, { align: 'right', alpha: prog(t, tTotal + 0.5, tTotal + 0.9) });
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t, Y = this.Y, P = this.PANEL;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();
    const g = this.layout();

    const x0 = col(0), x1 = col(11) + span(1);
    // head
    const ha = prog(t, T.head!, T.head! + 0.3);
    text(c, 'QUESTION 2 · WITH OUR DATA', x0, 150, TYPE.label(16), C.graphite, { ls: 3, alpha: ha });
    text(c, 'CASES = POPULATION × PREVALENCE', x1, 150, TYPE.label(16), C.graphite, { ls: 3, align: 'right', alpha: ha });
    c.save();
    c.globalAlpha = prog(t, T.head! + 0.1, T.head! + 0.45);
    c.translate(0, (1 - ease.outCubic(c.globalAlpha)) * 8);
    text(c, 'The projection, band by band', x0, 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5 });
    c.restore();
    ruleOn(c, x0, x1, 256, t, T.head! + 0.2, T.head! + 0.8, C.rule);

    // band column
    const ba = prog(t, T.build!, T.build! + 0.4);
    text(c, 'AGE', x0, Y.sub, TYPE.label(13), C.graphite, { ls: 2, alpha: ba });
    ruleOn(c, x0, this.LEDGER_R, Y.sub + 18, t, T.build!, T.build! + 0.6, C.rule);
    Q2.bands.forEach((b, i) => {
      const a = prog(t, T.build! + 0.2 + i * 0.12, T.build! + 0.5 + i * 0.12);
      text(c, b, x0, Y.rows[i]!, TYPE.body(30, 600), C.ink, { alpha: a });
      if (i < 2) ruleOn(c, x0, this.LEDGER_R, Y.rows[i]! + 28, t, T.build! + 0.3 + i * 0.1, T.build! + 0.8 + i * 0.1, C.rule);
    });
    text(c, 'TOTAL', x0, Y.total, TYPE.label(15), C.graphite, { ls: 2.5, alpha: prog(t, T.tot30! - 0.5, T.tot30! - 0.2) });

    // 2030 block: centred until 2050 arrives, then a decisive move left
    const slide = prog(t, T.and!, T.and! + 0.55, ease.inOutCubic);
    const start30 = (this.B30 + this.LEDGER_R - g.w) / 2, b50 = this.B30 + g.w + this.GAP;
    const b30 = start30 + (this.B30 - start30) * slide;
    const r0 = T.both! + 0.3;
    const rowDt30 = Math.max(0.6, (T.perfectly! + 0.6 - r0) / 2);
    this.block(c, t, b30, '2030', Q2.y2030, r0, rowDt30, T.tot30!, true);
    // 2050 block fills on "295,653"
    const r50 = Math.max(T.tot50! - 0.1, T.and! + 0.8);
    if (t >= r50 - 0.3) this.block(c, t, b50, '2050', Q2.y2050, r50, 0.36, Math.max(r50 + 1.25, T.y2050! - 0.35), false);

    // candidates' stated totals
    const pa = prog(t, T.both!, T.both! + 0.35);
    hair(c, P.rule, Y.group - 30, P.rule, Y.group - 30 + (Y.total + 40 - Y.group + 30) * prog(t, T.both!, T.both! + 0.5, ease.outCubic), C.rule);
    text(c, 'STATED', P.year, Y.group, TYPE.label(15), C.graphite, { ls: 2.5, alpha: pa });
    c.save();
    c.globalAlpha = pa;
    const cs = 20, box = cs * 1.3;
    candidate(c, 'A', '', P.a - box, Y.sub + 4, cs);
    candidate(c, 'B', '', P.b - box, Y.sub + 4, cs);
    c.restore();
    ruleOn(c, P.year, x1, Y.sub + 18, t, T.both!, T.both! + 0.5, C.rule);
    const years = ['2030', '2050'];
    years.forEach((y, i) => {
      text(c, y, P.year, Y.rows[i]!, TYPE.mono(22, 500), C.graphite, { alpha: pa });
      ruleOn(c, P.year, x1, Y.rows[i]! + 28, t, T.both! + 0.1 * i, T.both! + 0.5 + 0.1 * i, C.rule);
    });
    const tv = [T.people!, Math.max(T.y2050! + 0.1, T.tot50! + 1.6)];
    [Q2.y2030.total, Q2.y2050.total].forEach((v, i) => {
      plotR(c, fmt(v), P.a, Y.rows[i]!, TYPE.mono(MONO), C.ink, t, tv[i]!);
      plotR(c, fmt(v), P.b, Y.rows[i]!, TYPE.mono(MONO), C.ink, t, tv[i]! + 0.18);
    });

    // footer: sources
    const fa = prog(t, T.build! + 0.4, T.build! + 0.9);
    hair(c, x0, GRID.bottom - 50, x1, GRID.bottom - 50, C.rule);
    text(c, 'Population: UN World Population Prospects 2024. Prevalence: WiSE 2023, by age band.', x0, GRID.bottom - 16, TYPE.mono(20), C.graphite, { alpha: fa });

    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }
}
