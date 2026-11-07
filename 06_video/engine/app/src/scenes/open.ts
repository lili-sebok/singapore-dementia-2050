// Plate: open (screen -> paper). The same prompt is typed once and copied word for word into two
// answer slots; then the screen is pulled up like a page, revealing the cover sheet beneath, and
// the red pen underlines its title. The last frame is setup's first frame (header + red rule).
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { clamp, ease, prog } from '../engine/util';
import { C, GRID, Paper, TYPE, col, cue, drawNib, hair, ruleOn, span, text, typeOn } from './_kit';
import { SHEET_RULE_Y } from './setup';
import { blockCursor } from './recall-kit';

// Task 1 prompt, first sentence, verbatim from 05_ai_comparison/prompts/task1_cold_recall.txt
// (not in data.ts: it is the question, not a figure or an AI quote).
const PROMPT = '> How many people in Singapore will have dementia in 2050?';
const COPY = 'How many people in Singapore will have dementia in 2050?';

export default class Open extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  t: Record<string, number> = {};

  override init() {
    const ly = this.ctx.lyrics;
    const L1 = 'We put the same questions', L2 = 'Then we checked every answer';
    const words = ly.get(L1).words.filter((w) => w.w.toLowerCase().startsWith('word'));
    this.t = {
      type: cue(ly, L1, 'We'),
      slotA: cue(ly, L1, 'two'),
      slotB: cue(ly, L1, 'AI'),
      copyA: words[0]!.start,
      copyB: (words[1] ?? words[0]!).start,
      pull: cue(ly, L2, 'checked'),
      line: cue(ly, L2, 'against'),
    };
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();

    const x0 = col(0), x1 = col(11) + span(1);

    // ---- the paper beneath: setup's cover-sheet header, copied from setup.ts so the cut is invisible
    text(c, 'PAPER', x0, 150, TYPE.label(16), C.graphite, { ls: 3 });
    text(c, 'Singapore dementia, 2030 and 2050', x0, 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5 });
    text(c, 'HS1502 · AI COMPARISON', x1, 150, TYPE.label(16), C.graphite, { ls: 3, align: 'right' });
    hair(c, x0, GRID.bottom - 50, x1, GRID.bottom - 50, C.rule); // setup's footer rule (always drawn there)

    // the red underline: exactly setup's hair() once complete, written by the nib
    const ax = x0 - 4, ay = SHEET_RULE_Y + 2, bx = x1 + 6, by = SHEET_RULE_Y - 3;
    const dur = 0.8;
    const u = prog(t, T.line!, T.line! + dur, ease.inOutCubic);
    const hx = ax + (bx - ax) * u, hy = ay + (by - ay) * u;
    if (u > 0) hair(c, ax, ay, hx, hy, C.pen, 3.4);

    // ---- the screen field: a hard-edged rect pulled up and away
    const pullDur = 0.85;
    const pp = prog(t, T.pull!, T.pull! + pullDur, ease.inOutCubic);
    const dy = -1080 * pp;
    if (pp < 1) {
      c.save();
      c.fillStyle = C.screen;
      c.fillRect(0, dy, 1920, 1080);
      c.beginPath();
      c.rect(0, dy, 1920, 1080);
      c.clip();
      c.translate(0, dy);
      this.drawScreen(c, t);
      c.restore();
    }

    // ---- the nib: enters from the lower left, writes the rule, leaves to the lower right
    const enter = 0.5, leave = 0.55;
    let nib: { x: number; y: number; down: boolean } | null = null;
    if (t >= T.line! - enter && t < T.line!) {
      const v = ease.outCubic(clamp((t - (T.line! - enter)) / enter));
      nib = { x: -140 + (ax + 140) * v, y: 640 + (ay - 640) * v, down: false };
    } else if (t >= T.line! && t <= T.line! + dur) nib = { x: hx, y: hy, down: true };
    else if (t > T.line! + dur && t < T.line! + dur + leave) {
      const v = ease.inCubic(clamp((t - T.line! - dur) / leave));
      nib = { x: bx + (2120 - bx) * v, y: by + (720 - by) * v, down: false };
    }
    if (nib) drawNib(c, nib.x, nib.y, nib.down);

    comp.draw(renderer, L.upload(), out);
    return {};
  }

  /** Screen content in screen coordinates (translated with the field as it is pulled away). */
  private drawScreen(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const x0 = col(0), x1 = col(11) + span(1);
    const fp = TYPE.mono(40), px = 40;

    text(c, 'PROMPT', x0, 150, TYPE.label(16), C.screenDim, { ls: 3 });
    if (t < T.type!) blockCursor(c, x0, 236, px, t);
    else typeOn(c, PROMPT, x0, 236, fp, C.screenText, t, T.type!, 70, { cursor: t < T.slotA! });

    // two answer slots: label, a thin rule, a blinking cursor; the prompt is copied in, hard
    const slots: ['A' | 'B', number, number, number][] = [['A', 500, T.slotA!, T.copyA!], ['B', 770, T.slotB!, T.copyB!]];
    for (const [k, y, open, copy] of slots) {
      if (t < open) continue;
      const a = prog(t, open, open + 0.2);
      text(c, `CANDIDATE ${k}`, x0, y, TYPE.label(16), C.screenDim, { ls: 3, alpha: a });
      ruleOn(c, x0, x1, y + 110, t, open, open + 0.45, C.screenDim);
      const ty = y + 80;
      if (t >= copy) {
        const w = text(c, COPY, x0, ty, fp, C.screenText);
        blockCursor(c, x0 + w + 6, ty, px, t);
      } else if (t > open + 0.2) blockCursor(c, x0, ty, px, t);
    }
  }
}
