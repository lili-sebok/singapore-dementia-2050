// Plate: recall (screen -> paper). Question 1, from memory. Gemini's answer types on the screen;
// on "Gemini gave" it is printed onto the paper and marked: 2050 circled, "2030 figure" in the
// margin, and a small timeline moving MOH's 2030 figure to 2050. Then Sonnet's answer: 80,000
// struck, MOH's figure set above it. Marks out of 100 to finish.
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { ease, prog } from '../engine/util';
import { CAND, MOH_2030, Q1, fmt } from '../data';
import {
  C, Paper, Pen, TYPE, col, cue, drawTranscript, hair, measureText, ruleOn, ruledBox, span, text,
  transcriptBottom, transcriptWord, typeOn, type TranscriptLayout,
} from './_kit';
import { MarkSlot, boxSpan, layoutScript, noteWidth, typeLines, typed, wordInLines, wrap } from './recall-kit';

// Task 1 prompt, first sentence, verbatim from 05_ai_comparison/prompts/task1_cold_recall.txt.
const PROMPT = 'How many people in Singapore will have dementia in 2050?';
const LABEL = 'QUESTION 1 · FROM MEMORY';
const header = (k: 'A' | 'B') => `CANDIDATE ${k} · ${CAND[k].name.toUpperCase()}`;

export default class Recall extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  t: Record<string, number> = {};
  LA!: TranscriptLayout;
  LB!: TranscriptLayout;
  slotA!: MarkSlot;
  slotB!: MarkSlot;
  screenLines: { s: string; start: number }[] = [];
  mohNote = { x: 0, y: 0, w: 0 };
  tl = { y: 700, xL: 0, xR: 0 };

  override init() {
    const ly = this.ctx.lyrics;
    const s = this.ctx.start;
    const LG = 'Gemini gave the Ministry', LS = 'Sonnet credited the Ministry';
    this.t = {
      label: s,
      quote: s + 0.3,
      cut: cue(ly, LG, 'Gemini'),
      circle: cue(ly, LG, 'gave'),
      axis: cue(ly, LG, 'Ministry'),
      arrow: cue(ly, LG, 'Health'),
      note: cue(ly, LG, '2030'),
      arc: cue(ly, LG, 'answer'),
      arcEnd: cue(ly, LG, '2050'),
      a: cue(ly, LS, 'Sonnet'),
      strike: cue(ly, LS, 'eighty'),
      moh: cue(ly, LS, 'by'),
      predate: cue(ly, LS, "didn't"),
      scoreA: cue(ly, LS, 'know'),
      scoreB: cue(ly, LS, 'survey'),
    };
    const T = this.t;

    this.screenLines = wrap(Q1.quoteB, TYPE.mono(44), span(12));

    // transcripts: A in the left half, B in the right half
    const top = 330;
    this.LA = layoutScript(Q1.quoteA, header('A'), col(0), top, span(6) - 40);
    this.LB = layoutScript(Q1.quoteB, header('B'), col(6), top, span(6));

    // B: circle 2050, arrow out, "2030 figure"
    const w = transcriptWord(this.LB, '2050');
    const cy = w.y - w.px * 0.33;
    this.pen.circle((w.x0 + w.x1) / 2, cy, (w.x1 - w.x0) / 2 + 14, w.px * 0.72, T.circle!, { dur: 0.5 });
    const ax = w.x1 + 26, nx = w.x1 + 150;
    this.pen.arrow({ x: ax, y: cy }, { x: nx - 22, y: cy - 6 }, T.arrow!, { bend: -0.12, dur: 0.35 });
    this.pen.note('2030 figure', nx, w.y + 6, 54, T.note!, { cps: 13 });

    // A: strike 80,000, write "MOH" above it (the official figure follows as a ruled box)
    const v = transcriptWord(this.LA, '80,000');
    this.pen.strike(v.x0, v.x1, v.y - v.px * 0.32, T.strike!, { dur: 0.3 });
    const mx = v.x0 - 6, my = v.y - v.px * 1.25;
    const mn = this.pen.note('MOH', mx, my, 40, T.moh!, { cps: 9 });
    this.mohNote = { x: mx, y: my, w: noteWidth('MOH', 40) };
    this.t.box = mn.end;

    // timeline geometry (right half, under B)
    this.tl = { y: 720, xL: col(6) + 30, xR: col(11) + span(1) - 40 };

    // marks
    this.slotA = new MarkSlot(this.pen, Q1.score.A, col(0) + 28, 905, T.scoreA!, T.scoreA!);
    this.slotB = new MarkSlot(this.pen, Q1.score.B, col(6) + 28, 905, T.scoreB!, T.scoreB!);
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
    text(c, LABEL, x0, 150, TYPE.label(16), C.graphite, { ls: 3 });
    text(c, PROMPT, x0, 208, TYPE.mono(30), C.ink);
    hair(c, x0, 236, x1, 236, C.rule);

    // B, printed in full at the cut
    drawTranscript(c, this.LB, t, T.cut! - 10);
    const wb = transcriptWord(this.LB, fmt(MOH_2030));
    boxSpan(c, wb.x0, wb.x1, wb.y, wb.px);
    // A, typed in on "Sonnet credited"
    drawTranscript(c, this.LA, t, T.a!, { cps: 80 });

    // official figure set above A's struck 80,000
    if (t >= T.box!) {
      const m = this.mohNote;
      const a = prog(t, T.box!, T.box! + 0.2);
      ruledBox(c, fmt(MOH_2030), m.x + m.w + 16, m.y, TYPE.display(26, 100, 600), C.ink, 8, a);
    }
    // printed remark under A
    const by = transcriptBottom(this.LA) + 58;
    typeOn(c, 'knowledge appears to predate the 2023 survey', x0 + 28, by, TYPE.mono(20), C.graphite, t, T.predate!, 70);

    this.drawTimeline(c, t);

    this.slotA.draw(c, t);
    this.slotB.draw(c, t);
    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }

  private drawScreen(c: CanvasRenderingContext2D, t: number) {
    const T = this.t, x0 = col(0);
    typeOn(c, LABEL, x0, 150, TYPE.label(16), C.screenDim, t, T.label!, 90, { ls: 3 });
    typeOn(c, header('B'), x0, 330, TYPE.label(16), C.screenDim, t, T.label! + 0.15, 90, { ls: 3 });
    typeLines(c, this.screenLines, x0, 420, 72, TYPE.mono(44), C.screenText, t, T.quote!, 85, { cursor: true });
    const w = wordInLines(this.screenLines, fmt(MOH_2030), x0, 420, 72, TYPE.mono(44));
    if (typed(t, T.quote!, 85, 1e9) >= w.end) boxSpan(c, w.x0, w.x1, w.y, 44, C.screenText, 1, 8);
  }

  /** 2023, 2030, 2050 on a hairline; the ruled-box 152,000 at 2030, a dashed arc carrying it to 2050. */
  private drawTimeline(c: CanvasRenderingContext2D, t: number) {
    const T = this.t, { y, xL, xR } = this.tl;
    const X = (yr: number) => xL + ((yr - 2023) / (2050 - 2023)) * (xR - xL);
    const a0 = T.axis!;
    ruleOn(c, xL - 20, xR + 20, y, t, a0, a0 + 0.5, C.ink, 1.25);
    [2023, 2030, 2050].forEach((yr, i) => {
      const a = prog(t, a0 + 0.1 + i * 0.12, a0 + 0.3 + i * 0.12);
      if (a <= 0) return;
      hair(c, X(yr), y, X(yr), y + 12, C.ink, 1.25);
      text(c, String(yr), X(yr), y + 42, TYPE.mono(20), C.graphite, { align: 'center', alpha: a });
    });

    // MOH's figure, at 2030
    const bf = TYPE.display(34, 100, 600);
    const bw = measureText(fmt(MOH_2030), bf) + 20;
    const bx = X(2030) - bw / 2, base = y - 52;
    const ba = prog(t, T.arrow!, T.arrow! + 0.25);
    if (ba > 0) {
      text(c, 'MOH, FOR 2030', X(2030), base - 52, TYPE.label(13), C.graphite, { ls: 2.2, align: 'center', alpha: ba });
      ruledBox(c, fmt(MOH_2030), bx, base, bf, C.ink, 10, ba);
      hair(c, X(2030), base + 16, X(2030), y, C.ink, 1);
    }

    // the dashed arc: where Gemini put it
    const u = prog(t, T.arc!, T.arcEnd!, ease.inOutCubic);
    if (u > 0) {
      const p0 = { x: bx + bw + 10, y: base - 18 }, p2 = { x: X(2050), y: y - 10 };
      const p1 = { x: (p0.x + p2.x) / 2 + 40, y: base - 120 };
      const q = (k: number) => ({
        x: (1 - k) ** 2 * p0.x + 2 * (1 - k) * k * p1.x + k * k * p2.x,
        y: (1 - k) ** 2 * p0.y + 2 * (1 - k) * k * p1.y + k * k * p2.y,
      });
      c.save();
      c.strokeStyle = C.ink;
      c.lineWidth = 1.5;
      c.setLineDash([7, 6]);
      c.beginPath();
      const n = 48;
      for (let i = 0; i <= n * u; i++) { const p = q(i / n); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }
      const e = q(u);
      c.lineTo(e.x, e.y);
      c.stroke();
      c.setLineDash([]);
      if (u >= 1) {
        const d = q(0.94), ang = Math.atan2(p2.y - d.y, p2.x - d.x), hl = 14;
        c.beginPath();
        c.moveTo(p2.x - Math.cos(ang - 0.45) * hl, p2.y - Math.sin(ang - 0.45) * hl);
        c.lineTo(p2.x, p2.y);
        c.lineTo(p2.x - Math.cos(ang + 0.45) * hl, p2.y - Math.sin(ang + 0.45) * hl);
        c.stroke();
      }
      c.restore();
      text(c, "B's answer", X(2050), y + 70, TYPE.mono(18), C.graphite, { align: 'center', alpha: prog(t, T.arcEnd!, T.arcEnd! + 0.25) });
    }
  }
}
