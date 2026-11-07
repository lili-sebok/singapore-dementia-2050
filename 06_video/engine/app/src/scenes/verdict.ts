// Plate: verdict. The system scores (A solid, B hatched; values written by the pen) with the
// scoring caveat, then blank paper and three closing lines, one per sentence; on the last
// sentence the pen draws a long tick in the margin and writes "checked". Hold, then fade to black
// (docs/TREATMENT.md, "verdict").
import * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { clamp, ease, prog } from '../engine/util';
import { CAND, SYSTEM } from '../data';
import { C, Paper, Pen, TYPE, candidate, col, cue, cueEnd, hair, hatchRect, measureText, span, text } from './_kit';

const X0 = col(0), X1 = col(11) + span(1);
const BAR_X = X0, BAR_W = X1 - X0 - 260; // leave room on the right for the written score
const BAR_H = 54;
const ROWS = { A: 384, B: 512 }; // bar top
const AXIS_Y = 610;
const CAVEAT = 'One scorer so far. Few runs per task, so gaps of a few points are noise. Scores drafted with Claude Code, an Anthropic model, and checked by hand; a blind second scorer is pending.';
const CLOSING = ['Reliable at arithmetic.', 'Unreliable at judgement and recall.', 'The confident errors did the most damage.'];
const LINE_X = col(2), LINE_Y0 = 404, LINE_DY = 128;
const LINE_MAX_PX = 88;
const SCORE_PX = 62;

function wrap(s: string, fontStr: string, w: number) {
  const out: string[] = [];
  let cur = '';
  for (const word of s.split(' ')) {
    const tryS = cur ? `${cur} ${word}` : word;
    if (cur && measureText(tryS, fontStr) > w) { out.push(cur); cur = word; } else cur = tryS;
  }
  if (cur) out.push(cur);
  return out;
}

export default class Verdict extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  scorePen = new Pen(); // marks on the score block (cleared with it)
  pen = new Pen(); // the final tick
  t: Record<string, number> = {};
  scoreW: Record<'A' | 'B', number> = { A: 0, B: 0 };
  scoreEnd: Record<'A' | 'B', number> = { A: 0, B: 0 };
  caveat: string[] = [];
  lineFont = '';

  override init() {
    const ly = this.ctx.lyrics;
    const L1 = 'Sonnet finished ahead overall';
    const L5 = 'Checking against the source caught';
    this.t = {
      s: this.ctx.start,
      end: this.ctx.end,
      sonnet: cue(ly, L1, 'Sonnet'),
      finished: cue(ly, L1, 'finished'),
      ahead: cue(ly, L1, 'ahead'),
      overall: cue(ly, L1, 'overall'),
      but: cue(ly, L1, 'but'),
      l1end: cueEnd(ly, L1),
      reliable: cue(ly, 'Reliable at arithmetic'),
      unreliable: cue(ly, 'Unreliable at judgement'),
      confident: cue(ly, 'the most damaging errors'),
      checking: cue(ly, L5, 'Checking'),
      source: cue(ly, L5, 'source'),
      l5end: cueEnd(ly, L5),
    };
    const T = this.t;
    // scores written at the bar ends: A on "ahead", B on "but"
    (['A', 'B'] as const).forEach((k, i) => {
      const x = BAR_X + (BAR_W * SYSTEM[k]) / 100 + 30;
      const y = ROWS[k] + BAR_H / 2 + SCORE_PX * 0.36;
      const s = this.scorePen.score(SYSTEM[k], x, y, SCORE_PX, i === 0 ? T.ahead! : T.but!);
      this.scoreW[k] = s.width;
      this.scoreEnd[k] = s.end;
    });
    // the final tick: long, in the left margin beside the three lines, then "checked" beneath it
    const tickBottom = LINE_Y0 + 2 * LINE_DY + 10;
    this.pen.tick(X0 + 98, tickBottom, 236, T.checking!, { dur: 0.7, width: 4.2 });
    this.pen.note('checked', X0 + 6, tickBottom + 96, 66, T.source! + 0.1, { cps: 9 });
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): PostOverrides {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();
    if (!this.caveat.length) {
      this.caveat = wrap(CAVEAT, TYPE.body(24, 500), span(8));
      // one size for all three lines, the largest that keeps the longest inside the grid
      const widest = Math.max(...CLOSING.map((l) => measureText(l, TYPE.display(LINE_MAX_PX, 87.5, 700), -0.5)));
      this.lineFont = TYPE.display(Math.floor(LINE_MAX_PX * Math.min(1, (X1 - LINE_X) / widest)), 87.5, 700);
    }

    // ---------------- score block (clears to blank paper before "Reliable")
    const blockA = 1 - prog(t, T.l1end! - 0.1, T.reliable! - 0.08, ease.inOutCubic);
    if (blockA > 0) {
      c.save();
      c.globalAlpha = blockA;
      const s = T.s!;
      text(c, 'MEAN OF FOUR TASKS, /100', X0, 150, TYPE.label(16), C.graphite, { ls: 3 });
      text(c, 'System score', X0, 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5 });

      // axis: 0 to 100 under both bars, gridlines in rule
      const ap = prog(t, s, s + 0.4, ease.outCubic);
      hair(c, BAR_X, AXIS_Y, BAR_X + BAR_W * ap, AXIS_Y, C.graphite);
      for (let v = 0; v <= 100; v += 25) {
        const x = BAR_X + (BAR_W * v) / 100;
        const a = prog(t, s + 0.1 + v * 0.002, s + 0.35 + v * 0.002);
        if (v > 0) hair(c, x, ROWS.A - 46, x, AXIS_Y, C.rule, 1);
        hair(c, x, AXIS_Y, x, AXIS_Y + 10, C.graphite);
        text(c, String(v), x, AXIS_Y + 38, TYPE.mono(18), C.graphite, { align: v === 0 ? 'left' : 'center', alpha: a });
      }

      (['A', 'B'] as const).forEach((k, i) => {
        const tb = i === 0 ? T.sonnet! : T.finished!;
        const top = ROWS[k];
        c.save();
        c.globalAlpha *= prog(t, tb - 0.25, tb);
        candidate(c, k, CAND[k].name, BAR_X, top - 16, 22);
        c.restore();
        const w = (BAR_W * SYSTEM[k]) / 100 * prog(t, tb, tb + 0.7, ease.outExpo);
        if (w > 0) {
          if (k === 'A') { c.fillStyle = C.ink; c.fillRect(BAR_X, top, w, BAR_H); }
          else {
            c.fillStyle = C.paper;
            c.fillRect(BAR_X, top, w, BAR_H);
            hatchRect(c, BAR_X, top, w, BAR_H, C.ink, 7, 1.3);
            c.strokeStyle = C.ink; c.lineWidth = 1.5;
            c.strokeRect(BAR_X + 0.75, top + 0.75, w - 1.5, BAR_H - 1.5);
          }
        }
        // printed /100 beside the written score
        const sx = BAR_X + (BAR_W * SYSTEM[k]) / 100 + 30 + this.scoreW[k] + 12;
        text(c, '/100', sx, top + BAR_H / 2 + SCORE_PX * 0.36, TYPE.mono(20), C.graphite, { alpha: prog(t, this.scoreEnd[k] - 0.2, this.scoreEnd[k] + 0.1) });
      });

      // caveat: small graphite type, ruled left
      const cy0 = 732;
      const ca = prog(t, T.overall! - 0.15, T.overall! + 0.25);
      const ch = (this.caveat.length - 1) * 36 + 30;
      hair(c, X0 + 1, cy0 - 26, X0 + 1, cy0 - 26 + ch * prog(t, T.overall! - 0.15, T.overall! + 0.3, ease.outCubic), C.graphite, 2);
      this.caveat.forEach((ln, i) => text(c, ln, X0 + 26, cy0 + i * 36, TYPE.body(24, 500), C.graphite, { alpha: ca }));

      this.scorePen.draw(c, t, { nib: t < T.l1end! });
      c.restore();
    }

    // ---------------- closing lines, one per sentence
    [T.reliable!, T.unreliable!, T.confident!].forEach((tl, i) => {
      const a = prog(t, tl - 0.04, tl + 0.3);
      if (a <= 0) return;
      const dy = (1 - ease.outExpo(clamp(a))) * 18;
      text(c, CLOSING[i]!, LINE_X, LINE_Y0 + i * LINE_DY + dy, this.lineFont, C.ink, { alpha: a, ls: -0.5 });
    });

    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    // hold on paper after the last word, then fade fully to black by the window's end
    return { fade: prog(t, T.end! - 0.6, T.end! - 1 / 30, ease.inOutCubic) };
  }
}
