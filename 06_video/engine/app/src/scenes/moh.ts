// Plate: moh (screen -> paper). Question 3: what would produce MOH's 152,000 for 2030? The screen
// states the target; on "Ageing alone" the paper shows two ruler readings from the same zero
// (x1.42 from ageing alone, x2.06 needed) with the gap hatched; then Sonnet's verdict (ticked) and
// Gemini's "decline" (struck, "rise" written above). Marks out of 100 to finish.
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { ease, prog } from '../engine/util';
import { CAND, MOH_2030, Q3, fmt } from '../data';
import {
  C, Paper, Pen, TYPE, col, cue, drawTranscript, hair, hatchRect, measureText, ruledBox, span, text,
  transcriptWord, type TranscriptLayout,
} from './_kit';
import { MarkSlot, blockCursor, boxSpan, layoutScript, noteWidth, transcriptWordAt, typed } from './recall-kit';

const LABEL1 = 'QUESTION 3', LABEL2 = ' · WHAT WOULD PRODUCE THIS?';
const header = (k: 'A' | 'B') => `CANDIDATE ${k} · ${CAND[k].name.toUpperCase()}`;
const CPS = 80; // transcript typing speed

// ruler geometry: zero at col(3), scaled so the x2.06 reading leaves room for its value
const RX0 = col(3);
const RU = (col(11) + span(1) - 170 - RX0) / Q3.growthNeeded;
const RX = (v: number) => RX0 + v * RU;
const AXIS_Y = 322, BAR1 = 366, BAR2 = 446, BAR_H = 42;

export default class Moh extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  t: Record<string, number> = {};
  LA!: TranscriptLayout;
  LB!: TranscriptLayout;
  slotA!: MarkSlot;
  slotB!: MarkSlot;

  override init() {
    const ly = this.ctx.lyrics;
    const s = this.ctx.start;
    const LQ = 'Question three: what would', LG1 = 'Ageing alone gives', LN = 'needs 2.06', LS = 'Sonnet concluded', LGF = 'Gemini found the right';
    this.t = {
      label: s,
      label2: cue(ly, LQ, 'what'),
      fig: cue(ly, LQ, 'official'),
      cut: cue(ly, LG1, 'Ageing'),
      bar1: cue(ly, LG1, 'gives'),
      v1: cue(ly, LG1, '1.42'),
      bar2: cue(ly, LN, 'needs'),
      v2: cue(ly, LN, '2.06'),
      a: cue(ly, LS, 'Sonnet'),
      tick: cue(ly, LS, 'reproduced'),
      scoreA: cue(ly, LS, 'data'),
      b: cue(ly, LGF, 'Gemini'),
      strike: cue(ly, LGF, 'described'),
      rise: cue(ly, LGF, 'rise'),
      scoreB: cue(ly, LGF, 'decline'),
    };
    const T = this.t;

    const top = 606;
    this.LA = layoutScript(Q3.quoteA, header('A'), col(0), top, span(6) - 40, 28, 1.8, 26);
    this.LB = layoutScript(Q3.quoteB, header('B'), col(6), top, span(6), 28, 1.8, 26);

    // A: a tick after the last word
    const lastA = this.LA.lines[this.LA.lines.length - 1]!;
    const endA = lastA.x + measureText(lastA.s, TYPE.mono(this.LA.px));
    this.pen.tick(endA + 44, lastA.y + 2, 40, T.tick!);

    // B: strike "decline", write "rise" above it, a small upward arrow
    const d = transcriptWord(this.LB, 'decline');
    this.pen.strike(d.x0, d.x1, d.y - d.px * 0.32, T.strike!, { dur: 0.3 });
    const rx = d.x0 + 4, ry = d.y - d.px * 1.3;
    const r = this.pen.note('rise', rx, ry, 44, T.rise!, { cps: 11 });
    const ax = rx + noteWidth('rise', 44) + 18;
    this.pen.arrow({ x: ax, y: ry + 4 }, { x: ax + 2, y: ry - 34 }, r.end + 0.05, { bend: 0, dur: 0.22 });

    // marks
    this.slotA = new MarkSlot(this.pen, Q3.score.A, col(0) + 28, 932, T.scoreA!, T.scoreA!);
    this.slotB = new MarkSlot(this.pen, Q3.score.B, col(6) + 28, 932, Math.max(T.scoreB!, r.end + 0.35), Math.max(T.scoreB!, r.end + 0.35));
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;

    if (t < T.cut!) {
      L.clear(C.screen);
      this.drawScreen(c, t);
      comp.draw(renderer, L.upload(), out);
      return {};
    }
    L.clear();

    const x0 = col(0), x1 = col(11) + span(1);
    text(c, LABEL1 + LABEL2, x0, 150, TYPE.label(16), C.graphite, { ls: 3 });
    // title: the question, with the official figure in its ruled box
    const tf = TYPE.display(46, 87.5, 800);
    let x = x0;
    x += text(c, 'What would it take to reach', x, 212, tf, C.ink, { ls: -0.4 }) + 16;
    const bx = ruledBox(c, fmt(MOH_2030), x, 212, tf, C.ink, 10);
    x += bx[2] + 16;
    text(c, 'for 2030?', x, 212, tf, C.ink, { ls: -0.4 });
    hair(c, x0, 252, x1, 252, C.rule);

    this.drawRuler(c, t);

    // transcripts
    drawTranscript(c, this.LA, t, T.a!, { cps: CPS });
    const wa = transcriptWord(this.LA, fmt(MOH_2030));
    if (t >= transcriptWordAt(this.LA, fmt(MOH_2030), T.a!, CPS)) boxSpan(c, wa.x0, wa.x1, wa.y, wa.px);
    drawTranscript(c, this.LB, t, T.b!, { cps: CPS });

    this.slotA.draw(c, t);
    this.slotB.draw(c, t);
    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }

  private drawScreen(c: CanvasRenderingContext2D, t: number) {
    const T = this.t, x0 = col(0);
    const lf = TYPE.label(16);
    const n1 = typed(t, T.label!, 90, LABEL1.length), n2 = typed(t, T.label2!, 90, LABEL2.length);
    text(c, LABEL1.slice(0, n1) + LABEL2.slice(0, n2), x0, 150, lf, C.screenDim, { ls: 3 });

    // the target, typed in mono, then boxed
    const s = `${fmt(MOH_2030)} (2030)`, ff = TYPE.mono(88), y = 560, pad = 22;
    if (t < T.fig!) { blockCursor(c, x0 + pad, y, 88, t); return; }
    const n = typed(t, T.fig!, 30, s.length);
    const w = text(c, s.slice(0, n), x0 + pad, y, ff, C.screenText);
    if (n >= s.length) {
      const full = measureText(s, ff);
      c.save();
      c.strokeStyle = C.screenText;
      c.lineWidth = 1.5;
      c.strokeRect(x0, y - 88 * 0.82 - pad * 0.6, full + pad * 2, 88 * 0.82 + pad * 1.5);
      c.restore();
      blockCursor(c, x0, y + 150, 44, t, C.screenText);
    } else blockCursor(c, x0 + pad + w + 6, y, 88, t, C.screenText, true);
  }

  /** Two ruler readings from the same zero: x1.42 (ageing alone, solid) and x2.06 (needed, outline). */
  private drawRuler(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const a0 = prog(t, T.cut!, T.cut! + 0.3);
    const x0 = col(0);

    // left label column
    text(c, 'CASES, 2030 OVER 2023', x0, AXIS_Y + 6, TYPE.label(14), C.graphite, { ls: 2.5, alpha: a0 });
    const lf = TYPE.body(30, 500);
    text(c, 'Ageing alone', x0, BAR1 + BAR_H / 2 + 11, lf, C.ink, { alpha: prog(t, T.cut!, T.cut! + 0.3) });
    const a2 = prog(t, T.bar2! - 0.3, T.bar2!);
    if (a2 > 0) {
      let x = x0;
      const yb = BAR2 + BAR_H / 2 + 11;
      x += text(c, 'What', x, yb, lf, C.ink, { alpha: a2 }) + 10;
      const b = ruledBox(c, fmt(MOH_2030), x, yb, lf, C.ink, 7, a2);
      text(c, 'needs', x + b[2] + 10, yb, lf, C.ink, { alpha: a2 });
    }

    // the scale: a hairline with ticks every 0.1, labelled at whole multiples
    const pa = prog(t, T.cut!, T.cut! + 0.5, ease.outCubic);
    const xEnd = RX(2.1);
    hair(c, RX0, AXIS_Y, RX0 + (xEnd - RX0) * pa, AXIS_Y, C.ink, 1.25);
    for (let k = 0; k <= 21; k++) {
      const xx = RX(k / 10);
      if (xx > RX0 + (xEnd - RX0) * pa) break;
      const h = k % 10 === 0 ? 16 : k % 5 === 0 ? 10 : 6;
      hair(c, xx, AXIS_Y, xx, AXIS_Y + h, C.ink, 1);
      if (k % 10 === 0) text(c, `×${k / 10}`, xx, AXIS_Y - 14, TYPE.mono(18), C.graphite, { align: 'center' });
    }
    // the 2023 level (x1), a faint reference through both rows
    const ra = prog(t, T.cut! + 0.3, T.cut! + 0.6);
    if (ra > 0) {
      c.save(); c.globalAlpha = ra;
      hair(c, RX(1), AXIS_Y + 16, RX(1), BAR2 + BAR_H + 14, C.rule, 1.25);
      c.restore();
      text(c, '2023 count', RX(1) + 10, AXIS_Y + 34, TYPE.mono(16), C.graphite, { alpha: ra });
    }

    // bar 1: solid, ageing alone
    const u1 = prog(t, T.bar1!, T.v1!, ease.inOutCubic);
    if (u1 > 0) {
      c.fillStyle = C.ink;
      c.fillRect(RX0, BAR1, (RX(Q3.growthAgeing) - RX0) * u1, BAR_H);
    }
    const vf = TYPE.display(34, 100, 700);
    text(c, `× ${Q3.growthAgeing.toFixed(2)}`, RX(Q3.growthAgeing) + 18, BAR1 + BAR_H / 2 + 12, vf, C.ink, { alpha: prog(t, T.v1!, T.v1! + 0.2) });

    // bar 2: outline only, what 152,000 needs
    const u2 = prog(t, T.bar2!, T.v2!, ease.inOutCubic);
    const w2 = (RX(Q3.growthNeeded) - RX0) * u2;
    if (u2 > 0) {
      c.save();
      c.strokeStyle = C.ink;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(RX0 + w2, BAR2); c.lineTo(RX0, BAR2); c.lineTo(RX0, BAR2 + BAR_H); c.lineTo(RX0 + w2, BAR2 + BAR_H);
      if (u2 >= 1) c.lineTo(RX0 + w2, BAR2);
      c.stroke();
      c.restore();
    }
    text(c, `× ${Q3.growthNeeded.toFixed(2)}`, RX(Q3.growthNeeded) + 18, BAR2 + BAR_H / 2 + 12, vf, C.ink, { alpha: prog(t, T.v2!, T.v2! + 0.2) });

    // the gap between the two readings: hatched, bracketed and named
    const g0 = RX(Q3.growthAgeing), g1 = RX(Q3.growthNeeded);
    const hp = prog(t, T.v2! + 0.15, T.v2! + 0.6, ease.outCubic);
    if (hp > 0) {
      // extension line from bar 1's end down through bar 2
      c.save();
      c.strokeStyle = C.ink;
      c.lineWidth = 1;
      c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(g0, BAR1 + BAR_H); c.lineTo(g0, BAR2 + BAR_H + 12); c.stroke();
      c.restore();
      hatchRect(c, g0, BAR2 + 1, (g1 - g0) * hp, BAR_H - 2, C.graphite, 7, 1.2);
    }
    const bp = prog(t, T.v2! + 0.5, T.v2! + 0.8);
    if (bp > 0) {
      const by = BAR2 + BAR_H + 22;
      c.save(); c.globalAlpha = bp;
      hair(c, g0, by, g1, by, C.ink, 1.25);
      hair(c, g0, by - 8, g0, by, C.ink, 1.25);
      hair(c, g1, by - 8, g1, by, C.ink, 1.25);
      hair(c, (g0 + g1) / 2, by, (g0 + g1) / 2, by + 8, C.ink, 1.25);
      c.restore();
      text(c, 'rising rates, or a different base', (g0 + g1) / 2, by + 38, TYPE.mono(20), C.ink, { align: 'center', alpha: bp });
    }
  }
}
