// Plate: judge. Did the method reproduce the published 2023 count? Gemini never checked; Sonnet did,
// blamed non-residents and rescaled. Then the real cause: the survey's own base, an engraved two-bar
// chart with a dimension for the gap (docs/TREATMENT.md, "judge").
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { ease, hash, prog } from '../engine/util';
import { CAND, Q2, WISE_PUBLISHED_2023, fmt } from '../data';
import {
  C, GRID, Paper, Pen, TYPE, candidate, col, cue, cueEnd, drawTranscript, hair, hatchRect, layoutTranscript, measureText, ruleOn, ruledBox, span, text,
  transcriptWord, wordSpan, type P, type TranscriptLayout,
} from './_kit';

const TR_PX = 24;
const TR_CPS = 110;

/** Right-aligned text revealed left to right. */
function plotR(c: CanvasRenderingContext2D, s: string, xr: number, y: number, f: string, color: string, t: number, t0: number, cps = 52) {
  if (t < t0) return;
  const n = Math.min(s.length, Math.floor((t - t0) * cps) + 1);
  text(c, s.slice(0, n), xr - measureText(s, f), y, f, color);
}

/** A hand-drawn square (the check box), as a closed pen path that overshoots its start a little. */
function boxPath(x: number, y: number, s: number, seed: number): P[] {
  const j = (k: number) => (hash(seed + k) - 0.5) * 2.2;
  return [
    { x: x + j(1), y: y + j(2) }, { x: x + s + j(3), y: y + j(4) }, { x: x + s + j(5), y: y + s + j(6) },
    { x: x + j(7), y: y + s + j(8) }, { x: x + j(9), y: y - 3 },
  ];
}

/** Engineering dimension: extension lines, a dimension line with arrowheads at both ends. */
function dimension(c: CanvasRenderingContext2D, xa: number, xb: number, y: number, extA: [number, number], extB: [number, number], p: number, color: string = C.ink) {
  if (p <= 0) return;
  const pe = Math.min(1, p * 2), pd = Math.max(0, p * 2 - 1);
  hair(c, xa, extA[0], xa, extA[0] + (extA[1] - extA[0]) * ease.outCubic(pe), color, 1);
  hair(c, xb, extB[0], xb, extB[0] + (extB[1] - extB[0]) * ease.outCubic(pe), color, 1);
  if (pd <= 0) return;
  const mid = (xa + xb) / 2, half = ((xb - xa) / 2) * ease.outCubic(pd);
  hair(c, mid - half, y, mid + half, y, color, 1.25);
  if (pd >= 0.98) {
    c.save();
    c.fillStyle = color;
    const head = (x: number, dir: number) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + dir * 14, y - 4.5); c.lineTo(x + dir * 14, y + 4.5); c.closePath(); c.fill(); };
    head(xa, 1);
    head(xb, -1);
    c.restore();
  }
}

export default class Judge extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen(); // marks on the candidates table (cleared with it)
  pen2 = new Pen(); // marks on the chart
  t: Record<string, number> = {};
  tr1: TranscriptLayout | null = null;
  tr2: TranscriptLayout | null = null;

  // layout
  Y = { figLabel: 312, fig: 378, head: 452, rowB: 518, rowA: 612 };
  BOX = { x: 492, s: 30 };
  TX = col(4); // "what it did" column
  CH = { x: col(0), len: 1380, y1: 520, y2: 676, h: 62, dimY: 800 }; // chart

  override init() {
    const ly = this.ctx.lyrics;
    const s = this.ctx.start;
    this.t = {
      head: s - 0.45, // the question is in place as the plate cuts in
      figs: s,
      gemini: cue(ly, 'Gemini never checked', 'Gemini'),
      never: cue(ly, 'Gemini never checked', 'never'),
      checked: cue(ly, 'Gemini never checked', 'checked'),
      sonnet: cue(ly, 'Sonnet did check, but blamed', 'Sonnet'),
      did: cue(ly, 'Sonnet did check, but blamed', 'did'),
      nonres: cue(ly, 'Sonnet did check, but blamed', 'non-residents'),
      cut: cue(ly, 'Sonnet did check, but blamed', 'cut'),
      by: cue(ly, 'Sonnet did check, but blamed', 'by'),
      quarter: cue(ly, 'Sonnet did check, but blamed', 'quarter'),
      real: cue(ly, 'The real cause', 'The'),
      survey: cue(ly, 'The real cause', 'survey'),
      about: cue(ly, 'The real cause', 'about'),
      seventeen: cue(ly, 'The real cause', 'seventeen'),
      end: cueEnd(ly, 'The real cause'),
    };
    const T = this.t, Y = this.Y, B = this.BOX;
    T.tr1 = T.sonnet! + 0.15;
    // B: an empty box, drawn and left empty
    this.pen.path(boxPath(B.x, Y.rowB - B.s + 4, B.s, 11), T.never!, 0.5);
    // A: the box, then the tick in it
    this.pen.path(boxPath(B.x, Y.rowA - B.s + 4, B.s, 23), T.sonnet!, 0.38);
    this.pen.tick(B.x + B.s * 0.42, Y.rowA - 2, B.s * 1.25, Math.max(T.did!, T.sonnet! + 0.45));
  }

  /** Transcript layouts and the marks that depend on text metrics (built once fonts are in). */
  private ensureLayout() {
    if (this.tr1) return;
    const T = this.t, Y = this.Y;
    const w = col(10) - this.TX - 24;
    const header = `CANDIDATE A · ${CAND.A.name.toUpperCase()} · 6 OCT 2026`;
    this.tr1 = layoutTranscript(Q2.quoteA1, header, this.TX, Y.rowA, w, TR_PX);
    const last = this.tr1.lines[this.tr1.lines.length - 1]!.y;
    const first2 = last + TR_PX * 1.5 * 1.45;
    this.tr2 = layoutTranscript(Q2.quoteA2, '', this.TX, first2 - TR_PX * 1.9, w, TR_PX);
    T.tr2 = T.tr1! + 0.25 + Q2.quoteA1.length / TR_CPS + 0.08;
    // strike "non-residents" once it is typed and spoken
    const wd = transcriptWord(this.tr2, 'non-residents');
    const typed = T.tr2 + 0.25 + (Q2.quoteA2.indexOf('non-residents') + 13) / TR_CPS;
    const ts = Math.max(typed + 0.05, T.nonres! + 0.1);
    this.pen.strike(wd.x0, wd.x1, wd.y - wd.px * 0.32, ts, { dur: 0.3 });
    // the note goes below the struck word (the line under it is short), with a short arrow down to it
    const mid = (wd.x0 + wd.x1) / 2;
    this.pen.arrow({ x: mid, y: wd.y + 10 }, { x: mid + 34, y: wd.y + 62 }, ts + 0.36, { dur: 0.28, bend: -0.12 });
    this.pen.note('wrong cause', mid + 48, wd.y + 88, 40, ts + 0.7, { cps: 14 });
    // chart: the pen underlines "17%" in the dimension label
    const lf = TYPE.display(34, 100, 700);
    const lw = measureText(Q2.baseGapLabel, lf);
    const { xa, xb } = this.chartX();
    const lx = (xa + xb) / 2 - lw / 2;
    const [u0, u1] = wordSpan(Q2.baseGapLabel, '17%', lf, lx);
    this.labelX = lx;
    this.pen2.underline(u0, u1, this.CH.dimY + 56, T.seventeen! + 0.05, { dur: 0.3 });
  }
  labelX = 0;

  private chartX() {
    const CH = this.CH;
    return { xa: CH.x + CH.len * (Q2.wiseBase / Q2.singstatResidents60), xb: CH.x + CH.len };
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t, Y = this.Y, B = this.BOX, CH = this.CH;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();
    this.ensureLayout();

    const x0 = col(0), x1 = col(11) + span(1);
    // head: the question
    const ha = prog(t, T.head!, T.head! + 0.3);
    text(c, 'QUESTION 2 · THE CHECK', x0, 150, TYPE.label(16), C.graphite, { ls: 3, alpha: ha });
    text(c, 'JUDGEMENT', x1, 150, TYPE.label(16), C.graphite, { ls: 3, align: 'right', alpha: ha });
    text(c, 'Does the method reproduce the published 2023 count?', x0, 214, TYPE.display(54, 87.5, 800), C.ink, { ls: -0.5, alpha: prog(t, T.head! + 0.1, T.head! + 0.45) });
    ruleOn(c, x0, x1, 256, t, T.head! + 0.2, T.head! + 0.8, C.rule);

    // the two 2023 figures
    const fa1 = prog(t, T.figs! + 0.05, T.figs! + 0.35), fa2 = prog(t, T.figs! + 0.45, T.figs! + 0.75);
    text(c, 'PUBLISHED, WISE 2023', x0, Y.figLabel, TYPE.label(14), C.graphite, { ls: 2.5, alpha: fa1 });
    ruledBox(c, fmt(WISE_PUBLISHED_2023), x0, Y.fig, TYPE.display(46, 100, 700), C.ink, 12, fa1);
    const mx = col(4);
    text(c, 'THIS METHOD ON THE UN 2023 POPULATION', mx, Y.figLabel, TYPE.label(14), C.graphite, { ls: 2.5, alpha: fa2 });
    plotR(c, fmt(Q2.method2023), mx + measureText(fmt(Q2.method2023), TYPE.mono(46, 500)), Y.fig, TYPE.mono(46, 500), C.ink, t, T.figs! + 0.45);
    const higher = Math.round((Q2.method2023 / WISE_PUBLISHED_2023 - 1) * 100);
    text(c, `${higher}% higher`, mx + measureText(fmt(Q2.method2023), TYPE.mono(46, 500)) + 26, Y.fig, TYPE.mono(22), C.graphite, { alpha: prog(t, T.figs! + 0.9, T.figs! + 1.2) });

    // ---------------- the candidates table (cleared before the chart)
    const clear = prog(t, T.real! - 0.25, T.real! + 0.15, ease.inCubic);
    if (clear < 1) {
      c.save();
      c.globalAlpha = 1 - clear;
      c.translate(0, -24 * clear);
      const ta = prog(t, T.gemini! - 0.15, T.gemini! + 0.2);
      const hy = Y.head;
      text(c, 'CANDIDATE', x0, hy, TYPE.label(14), C.graphite, { ls: 2.5, alpha: ta });
      text(c, 'CHECKED', B.x, hy, TYPE.label(14), C.graphite, { ls: 2.5, alpha: ta });
      text(c, 'WHAT IT DID', this.TX, hy, TYPE.label(14), C.graphite, { ls: 2.5, alpha: ta });
      ruleOn(c, x0, x1, hy + 16, t, T.gemini! - 0.15, T.gemini! + 0.35, C.rule);

      // B row
      const bA = prog(t, T.gemini!, T.gemini! + 0.25);
      candidate(c, 'B', CAND.B.name, x0, Y.rowB, 26, C.ink, bA);
      const noteB = `never checked; headline kept at ${fmt(Q2.y2030.total)}`;
      plotR(c, noteB, this.TX + measureText(noteB, TYPE.mono(24)), Y.rowB, TYPE.mono(24), C.ink, t, T.checked! + 0.1, 46);
      ruleOn(c, x0, x1, Y.rowB + 34, t, T.gemini! + 0.1, T.gemini! + 0.5, C.rule);

      // A row
      const aA = prog(t, T.sonnet! - 0.1, T.sonnet! + 0.15);
      candidate(c, 'A', CAND.A.name, x0, Y.rowA, 26, C.ink, aA);
      drawTranscript(c, this.tr1!, t, T.tr1!, { cps: TR_CPS });
      drawTranscript(c, this.tr2!, t, T.tr2!, { cps: TR_CPS });
      // Sonnet's rescale, set as a sum under its label
      const sx = x0 + 300, mono = TYPE.mono(30), monoB = TYPE.mono(30, 600);
      const r0 = T.cut!;
      plotR(c, fmt(Q2.y2030.total), sx, Y.rowA + 84, mono, C.ink, t, r0);
      plotR(c, `× ${Q2.factorA}`, sx, Y.rowA + 126, mono, C.ink, t, r0 + 0.3);
      ruleOn(c, sx - measureText(Q2.rescaledA.y2030, mono), sx, Y.rowA + 146, t, r0 + 0.55, r0 + 0.8, C.ink, 1.25);
      plotR(c, Q2.rescaledA.y2030, sx, Y.rowA + 188, monoB, C.ink, t, Math.max(r0 + 0.8, T.by! - 0.1));
      text(c, `2050: ${Q2.rescaledA.y2050}`, sx, Y.rowA + 226, TYPE.mono(20), C.graphite, { align: 'right', alpha: prog(t, T.quarter! - 0.2, T.quarter! + 0.1) });
      text(c, '2030', sx - measureText(Q2.rescaledA.y2030, mono), Y.rowA + 84, TYPE.mono(20), C.graphite, { alpha: prog(t, r0, r0 + 0.2) });

      this.pen.draw(c, t);
      c.restore();
    }

    // ---------------- the real cause: survey base against the resident population
    const { xa, xb } = this.chartX();
    const g1 = prog(t, T.real! + 0.1, T.real! + 0.8, ease.outExpo);
    const g2 = prog(t, T.survey!, T.survey! + 0.7, ease.outExpo);
    const la1 = prog(t, T.real!, T.real! + 0.3), la2 = prog(t, T.survey! - 0.1, T.survey! + 0.2);
    if (la1 > 0) {
      text(c, 'Resident population aged 60+, 2023 (SingStat)', CH.x, CH.y1 - 18, TYPE.body(28, 600), C.ink, { alpha: la1 });
      c.fillStyle = C.ink;
      c.fillRect(CH.x, CH.y1, CH.len * g1, CH.h);
      text(c, fmt(Q2.singstatResidents60), xb + 22, CH.y1 + CH.h / 2 + 11, TYPE.mono(30, 500), C.ink, { alpha: prog(t, T.real! + 0.6, T.real! + 0.9) });
    }
    if (la2 > 0) {
      text(c, 'WiSE survey-weighted base', CH.x, CH.y2 - 18, TYPE.body(28, 600), C.ink, { alpha: la2 });
      const w2 = (xa - CH.x) * g2;
      hatchRect(c, CH.x, CH.y2, w2, CH.h, C.ink, 7, 1.3);
      c.save();
      c.strokeStyle = C.ink;
      c.lineWidth = 1.5;
      if (w2 > 1) c.strokeRect(CH.x, CH.y2, w2, CH.h);
      c.restore();
      text(c, fmt(Q2.wiseBase), xa + 22, CH.y2 + CH.h / 2 + 11, TYPE.mono(30, 500), C.ink, { alpha: prog(t, T.survey! + 0.5, T.survey! + 0.8) });
    }
    if (la1 > 0) hair(c, CH.x, CH.y1 - 8, CH.x, CH.y2 + CH.h + 8, C.ink, 1.5); // zero line
    // dimension for the gap, then its label
    dimension(c, xa, xb, CH.dimY, [CH.y2 + CH.h + 10, CH.dimY + 14], [CH.y1 + CH.h + 10, CH.dimY + 14], prog(t, T.about! - 0.3, T.about! + 0.2));
    text(c, Q2.baseGapLabel, this.labelX, CH.dimY + 46, TYPE.display(34, 100, 700), C.ink, { alpha: prog(t, T.about!, T.about! + 0.25) });
    this.pen2.draw(c, t);

    // footer
    const fa = prog(t, T.real! + 0.3, T.real! + 0.8);
    ruleOn(c, x0, x1, GRID.bottom - 50, t, T.real! + 0.3, T.real! + 0.9, C.rule);
    text(c, 'The same rates on a smaller base give a smaller count.', x0, GRID.bottom - 16, TYPE.mono(20), C.graphite, { alpha: fa });

    comp.draw(renderer, L.upload(), out);
    return {};
  }
}
