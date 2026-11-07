// Plate: setup. The exam cover sheet: candidates, conditions (ticked by the pen as they are spoken),
// the list of questions. Reference scene for the kit (docs/TREATMENT.md, "setup").
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { clamp, ease, prog } from '../engine/util';
import { CAND } from '../data';
import { C, GRID, Paper, Pen, TYPE, candidate, col, cue, cueEnd, hair, ruleOn, span, text, typeOn } from './_kit';

export const SHEET_RULE_Y = 236; // the open plate's last underline lands here

export default class Setup extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  t: Record<string, number> = {};

  override init() {
    const ly = this.ctx.lyrics;
    const s = this.ctx.start;
    this.t = {
      head: s,
      candidates: cue(ly, 'The candidates', 'candidates'),
      a: cue(ly, 'The candidates', 'Claude'),
      b: cue(ly, 'The candidates', 'Gemini'),
      tier: cue(ly, 'The candidates', 'each'),
      cond: cue(ly, 'Same conditions', 'Same'),
      c1: cue(ly, 'Same conditions', 'new'),
      c2: cue(ly, 'Same conditions', 'identical'),
      c3: cue(ly, 'Same conditions', 'web'),
      c4: cue(ly, 'Same conditions', 'sight'),
      end: cueEnd(ly, 'Same conditions'),
    };
    const T = this.t;
    const y0 = 600, dy = 66;
    [T.c1, T.c2, T.c3, T.c4].forEach((tc, i) => this.pen.tick(col(0) + 22, y0 + i * dy - 4, 34, tc! + 0.05));
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();

    const x0 = col(0), x1 = col(11) + span(1);
    // title block (already on the page as the plate opens: it continues the open plate's last mark)
    text(c, 'PAPER', x0, 150, TYPE.label(16), C.graphite, { ls: 3 });
    text(c, 'Singapore dementia, 2030 and 2050', x0, 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5 });
    text(c, 'HS1502 · AI COMPARISON', x1, 150, TYPE.label(16), C.graphite, { ls: 3, align: 'right' });
    // the red underline carried over from the open plate
    hair(c, x0 - 4, SHEET_RULE_Y + 2, x1 + 6, SHEET_RULE_Y - 3, C.pen, 3.4);

    // candidates table
    const ty = 316;
    ruleOn(c, x0, x1, ty, t, T.candidates! - 0.3, T.candidates! + 0.3, C.rule);
    text(c, 'CANDIDATE', x0, ty - 14, TYPE.label(14), C.graphite, { ls: 2.5, alpha: prog(t, T.candidates! - 0.3, T.candidates!) });
    text(c, 'MAKER', col(5), ty - 14, TYPE.label(14), C.graphite, { ls: 2.5, alpha: prog(t, T.candidates! - 0.3, T.candidates!) });
    text(c, 'SETTING', col(8), ty - 14, TYPE.label(14), C.graphite, { ls: 2.5, alpha: prog(t, T.candidates! - 0.3, T.candidates!) });
    const rows: ['A' | 'B', number][] = [['A', T.a!], ['B', T.b!]];
    rows.forEach(([k, tr], i) => {
      const y = ty + 62 + i * 70;
      const a = prog(t, tr - 0.15, tr + 0.15);
      if (a <= 0) return;
      const cand = CAND[k];
      c.save();
      c.globalAlpha = a;
      c.translate(0, (1 - ease.outCubic(a)) * 8);
      candidate(c, k, cand.name, x0, y, 30);
      text(c, cand.maker, col(5), y, TYPE.body(30, 500), C.ink);
      c.restore();
      typeOn(c, cand.tier, col(8), y, TYPE.mono(24), C.ink, t, T.tier! + i * 0.25, 70);
      hair(c, x0, y + 24, x0 + (x1 - x0) * prog(t, tr, tr + 0.4, ease.outCubic), y + 24, C.rule);
    });

    // conditions (left)
    const cy = 540, y0 = 600, dy = 66;
    const ca = prog(t, T.cond! - 0.2, T.cond! + 0.2);
    text(c, 'CONDITIONS', x0, cy, TYPE.label(16), C.graphite, { ls: 3, alpha: ca });
    const conds = ['New chat for every run', 'Identical prompt, pasted verbatim', 'No web search', 'Never shown our answer'];
    const tc = [T.c1!, T.c2!, T.c3!, T.c4!];
    conds.forEach((s, i) => {
      const a = prog(t, T.cond! + i * 0.08, T.cond! + i * 0.08 + 0.3);
      // each condition darkens from graphite to ink when it is spoken
      const spoken = prog(t, tc[i]!, tc[i]! + 0.2);
      text(c, s, x0 + 70, y0 + i * dy, TYPE.body(34, 500), spoken > 0.5 ? C.ink : C.graphite, { alpha: a });
      hair(c, x0, y0 + i * dy + 22, x0 + span(6) * a, y0 + i * dy + 22, C.rule);
    });

    // questions (right)
    const qx = col(7) + 40;
    const qa = prog(t, T.cond! + 0.3, T.cond! + 0.7);
    text(c, 'QUESTIONS', qx, cy, TYPE.label(16), C.graphite, { ls: 3, alpha: qa });
    const qs: [string, string][] = [['1', 'Cold recall'], ['2', 'Build the projection'], ['2b', 'Same question, eight days later'], ['2c', 'Three prompt versions'], ['3', 'Reverse-engineer 152,000'], ['4', 'Citation audit']];
    qs.forEach(([n, s], i) => {
      const a = prog(t, T.cond! + 0.45 + i * 0.07, T.cond! + 0.75 + i * 0.07);
      const y = 594 + i * 44;
      text(c, n, qx, y, TYPE.mono(22, 500), C.graphite, { alpha: a });
      text(c, s, qx + 56, y, TYPE.mono(22), C.ink, { alpha: a });
    });

    // footer
    const fa = clamp(prog(t, T.end! - 1.2, T.end! - 0.6));
    hair(c, x0, GRID.bottom - 50, x1, GRID.bottom - 50, C.rule);
    text(c, 'Marked on a written rubric: modelling decisions, arithmetic, recalled facts.', x0, GRID.bottom - 16, TYPE.mono(20), C.graphite, { alpha: fa });

    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }
}
