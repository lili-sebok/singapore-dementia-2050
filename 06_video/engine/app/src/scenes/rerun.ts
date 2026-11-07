// Plate: rerun. The same V2 question set again eight days later. Four transcript sheets lie flat on
// the desk, each set at the height of its score, so stability reads as a measured drawing: B's two
// sheets slide into one line (no change), A's stay apart, and hairline dimension lines measure the
// 19.5-point swing against the 5.1-point gap between the systems (docs/TREATMENT.md, "rerun").
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { clamp, ease, hash, prog } from '../engine/util';
import { CAND, Q2 } from '../data';
import { C, Paper, Pen, TYPE, candidate, col, cue, hair, measureText, span, text } from './_kit';
import { dimV } from './rerun-dim';

type Who = 'A' | 'B';
interface Sheet { who: Who; run: 0 | 1; x: number; y: number; jx: number; jy: number; rot: number; greek: number[] }

const W = 240, H = 280; // sheet size
const K = 11; // px per score point
const TOP = 330; // top edge of the highest-scoring sheet
const SHEET_FILL = '#F3EFE7'; // the same paper, a touch brighter: a separate sheet, not a card

export default class Rerun extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  t: Record<string, number> = {};
  sheets: Sheet[] = [];
  scoreEnd: number[] = [];
  scoreW: number[] = [];

  override init() {
    const ly = this.ctx.lyrics;
    const L1 = 'Eight days later', L2 = "Gemini's answer came back", L3 = "score moved nineteen", L4 = 'One run proves';
    this.t = {
      s: this.ctx.start,
      run1: cue(ly, L1, 'Eight'),
      run2: cue(ly, L1, 'same'),
      gem: cue(ly, L2, 0),
      bAlign: cue(ly, L2, 'almost'),
      bDiff: cue(ly, L2, 'word'),
      son: cue(ly, L3, 0),
      swing: cue(ly, L3, 'nineteen'),
      gap: cue(ly, L3, 'gap'),
      one: cue(ly, L4, 'One'),
      proves: cue(ly, L4, 'proves'),
    };
    const T = this.t;
    const runs = Q2.runs;
    const top = Math.max(...runs.A, ...runs.B);
    const yOf = (s: number) => TOP + (top - s) * K;

    // mirrored order so the two first runs meet in the middle: B 14 OCT, B 6 OCT | A 6 OCT, A 14 OCT
    const gapW = (span(12) - 4 * W) / 3;
    const xs = [0, 1, 2, 3].map((i) => col(0) + i * (W + gapW));
    const order: [Who, 0 | 1][] = [['B', 1], ['B', 0], ['A', 0], ['A', 1]];
    // greeked text lines: B's two transcripts are the same apart from one line; A's differ throughout
    const greek = (seed: number, swap = -1) => Array.from({ length: 6 }, (_, i) => (i === 5 ? 0.35 : 0.62) + hash(seed + (i === swap ? 99 : i) * 7.1) * (i === 5 ? 0.3 : 0.38));
    this.sheets = order.map(([who, run], i) => ({
      who, run, x: xs[i]!, y: yOf(runs[who][run]),
      jx: (hash(i * 3.1 + 1) - 0.5) * 34, jy: who === 'B' ? (run ? 34 : -28) : (hash(i * 5.3 + 2) - 0.5) * 50,
      rot: (hash(i * 7.7 + 3) - 0.5) * 0.045,
      greek: who === 'B' ? greek(11, run ? 3 : -1) : greek(23 + run * 40),
    }));

    // scores, written once each sheet has settled: B's pair, then A's pair
    const bSettled = T.bAlign! + 0.65, aSettled = T.son! + 0.6;
    const writeOrder = [1, 0, 2, 3]; // B 6 OCT, B 14 OCT, A 6 OCT, A 14 OCT
    let tw = bSettled + 0.05;
    this.scoreEnd = [0, 0, 0, 0];
    for (const i of writeOrder) {
      const sh = this.sheets[i]!;
      if (sh.who === 'A') tw = Math.max(tw, aSettled);
      const r = this.pen.score(runs[sh.who][sh.run], sh.x + 20, sh.y + 132, 56, tw);
      this.scoreEnd[i] = r.end - 0.27;
      this.scoreW[i] = r.width;
      tw = r.end + 0.06;
    }
    // the closing sentence is underlined as it is spoken
    const w = measureText(CLOSE, TYPE.body(30, 500));
    this.pen.underline(col(0), col(0) + w, 948, T.proves!, { dur: 0.7 });
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();

    const x0 = col(0), x1 = col(11) + span(1);
    // header
    const ha = 1; // the header is on the page from the cut
    text(c, 'QUESTION 2b · SAME QUESTION, EIGHT DAYS LATER', x0, 150, TYPE.label(16), C.graphite, { ls: 3, alpha: ha });
    text(c, 'V2 PROMPT · RUN 1 AND RUN 2', x1, 150, TYPE.label(16), C.graphite, { ls: 3, align: 'right', alpha: ha });
    text(c, 'The same paper, set again', x0, 214, TYPE.display(54, 87.5, 800), C.ink, { ls: -0.5, alpha: ha });
    text(c, 'Each script is set at the height of its score out of 100.', x0, 262, TYPE.mono(20), C.graphite, { alpha: prog(t, T.run1! + 0.3, T.run1! + 0.6) });

    // sheets
    const bSettle = ease.inOutCubic(prog(t, T.bAlign!, T.bAlign! + 0.65));
    const aSettle = ease.inOutCubic(prog(t, T.son!, T.son! + 0.6));
    this.sheets.forEach((sh, i) => {
      const tin = sh.run === 0 ? T.run1! + (sh.who === 'A' ? 0.12 : 0) : T.run2! + (sh.who === 'A' ? 0.12 : 0);
      const a = prog(t, tin, tin + 0.35, ease.outCubic);
      if (a <= 0) return;
      const s = sh.who === 'B' ? bSettle : aSettle;
      const dx = sh.jx * (1 - s), dy = sh.jy * (1 - s) + (1 - a) * 18, rot = sh.rot * (1 - s);
      c.save();
      c.globalAlpha = a;
      c.translate(sh.x + W / 2 + dx, sh.y + H / 2 + dy);
      c.rotate(rot);
      c.translate(-W / 2, -H / 2);
      this.drawSheet(c, sh, t, this.scoreEnd[i]!, this.scoreW[i]!);
      c.restore();
    });

    // B: the two sheets meet one line, and the diff is printed above it
    const b14 = this.sheets[0]!, b6 = this.sheets[1]!;
    const lp = prog(t, T.bDiff! - 0.1, T.bDiff! + 0.3, ease.outCubic);
    if (lp > 0) {
      const xa = b14.x + W + 5, xb = b6.x - 5, y = b6.y;
      const mid = (xa + xb) / 2, half = ((xb - xa) / 2) * lp;
      hair(c, mid - half, y, mid + half, y, C.ink, 1);
    }
    text(c, 'diff: no change in score', (b14.x + W + b6.x) / 2, b6.y - 28, TYPE.mono(17), C.graphite, { align: 'center', alpha: prog(t, T.bDiff!, T.bDiff! + 0.3) });

    // A: the swing between A's two runs, and the much smaller gap between the systems in run 1
    const a6 = this.sheets[2]!, a14 = this.sheets[3]!;
    dimV(c, t, T.swing!, {
      x: (a6.x + W + a14.x) / 2, ya: a14.y, yb: a6.y,
      extA: [a14.x - 5, (a6.x + W + a14.x) / 2 - 14], extB: [a6.x + W + 5, (a6.x + W + a14.x) / 2 + 14],
      label: Q2.swingA.toFixed(1), caption: 'A · RUN 1 TO RUN 2',
    });
    dimV(c, t, T.gap!, {
      x: (b6.x + W + a6.x) / 2, ya: a6.y, yb: b6.y,
      extA: [a6.x - 5, (b6.x + W + a6.x) / 2 - 14], extB: [b6.x + W + 5, (b6.x + W + a6.x) / 2 + 14],
      label: Q2.run1Gap.toFixed(1), caption: 'A AGAINST B · RUN 1',
    });

    // closing line
    text(c, CLOSE, x0, 940, TYPE.body(30, 500), C.ink, { alpha: prog(t, T.one!, T.one! + 0.3) });

    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }

  private drawSheet(c: CanvasRenderingContext2D, sh: Sheet, t: number, scoreDone: number, scoreW: number) {
    c.fillStyle = SHEET_FILL;
    c.fillRect(0, 0, W, H);
    c.strokeStyle = C.graphite;
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, W - 1, H - 1);
    candidate(c, sh.who, CAND[sh.who].name, 18, 38, 15);
    text(c, sh.run === 0 ? 'RUN 1 · 6 OCT 2026' : 'RUN 2 · 14 OCT 2026', 18, 62, TYPE.label(12), C.graphite, { ls: 1.8 });
    hair(c, 18, 76, W - 18, 76, C.rule, 1);
    // the printed /100 beside the pen's score (the pen writes in page space at the settled position)
    if (t >= scoreDone) text(c, '/100', 20 + scoreW + 16, 132, TYPE.label(15), C.graphite, { ls: 1, alpha: prog(t, scoreDone, scoreDone + 0.15) });
    c.fillStyle = C.graphite;
    c.globalAlpha *= 0.32;
    sh.greek.forEach((g, i) => c.fillRect(18, 166 + i * 16, (W - 36) * clamp(g, 0, 1), 2));
  }
}

const CLOSE = 'Single-run differences between systems are not reported as real.';
