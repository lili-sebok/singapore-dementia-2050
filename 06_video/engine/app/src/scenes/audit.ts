// Plate: audit. Question 4, the citation audit, as a ruled table: five figures by candidate.
// "I don't know" cells are stamped; given values are ticked by the pen; a second table of
// volunteered detail has its two errors struck and corrected in the margin hand
// (docs/TREATMENT.md, "audit").
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { ease, hash, prog } from '../engine/util';
import { AUDIT, CAND } from '../data';
import { C, Paper, Pen, TYPE, candidate, col, cue, cueEnd, hair, measureText, span, text, typeOn } from './_kit';
import { drawStamp, makeStamp, type Stamp } from './audit-stamp';

const X0 = col(0), X1 = col(11) + span(1);
const CA = col(4), CB = col(8); // left edges of the A and B columns
const ROW0 = 392, DY = 62; // baseline of the first row, row pitch
const EX_TOP = 714, EX_ROW0 = 776, EX_DY = 62; // volunteered-detail table
const EX_X1 = col(8) + span(2);
// Which audit row each volunteered extra belongs to (results.md, citation audit extras table):
// the table number was given with the residents figure, the interval with the relative risk.
const EX_ROW = [3, 4];

const STAMP_LABEL = "I DON'T KNOW";
const VAL_PX = 26, SRC_PX = 19;

/** Split 'about 1.4 (Lancet Commission 2020)' into value and source. */
function split(s: string): [string, string] {
  const m = s.match(/^(.*?) \((.*)\)$/);
  return m ? [m[1]!, m[2]!] : [s, ''];
}

export default class Audit extends Scene {
  paper = new Paper();
  layer = new Layer2D();
  pen = new Pen();
  stamps: Stamp[] = [];
  t: Record<string, number> = {};
  /** per cell: [col 0|1][row] = time the cell fills */
  cellT: number[][] = [[], []];

  override init() {
    const ly = this.ctx.lyrics;
    const L1 = 'Asked to cite their figures', L2 = 'The mistakes were in the extra detail';
    this.t = {
      s: this.ctx.start,
      end: this.ctx.end,
      cite: cue(ly, L1, 'cite'),
      didnt: cue(ly, L1, "didn't"),
      which: cue(ly, L1, 'which'),
      honest: cue(ly, L1, 'honest'),
      extra: cue(ly, L2, 'extra'),
      table: cue(ly, L2, 'table'),
      number: cue(ly, L2, 'number'),
      conf: cue(ly, L2, 'confidence'),
      interval: cue(ly, L2, 'interval'),
      arent: cue(ly, L2, "aren't"),
      l2end: cueEnd(ly, L2),
    };
    const T = this.t;

    // stamps: row by row, A then B, a quick run across "didn't know"
    let k = 0;
    const given: [number, number][] = [];
    for (let r = 0; r < AUDIT.rows.length; r++) {
      (['A', 'B'] as const).forEach((who, ci) => {
        if (AUDIT[who][r] === 'idk') this.cellT[ci]![r] = T.didnt! + 0.07 * k++;
        else given.push([ci, r]);
      });
    }
    // given values type in on "which is honest", then the pen ticks each in turn (A's column first)
    given.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    given.forEach(([ci, r], i) => {
      const tv = T.which! - 0.15 + i * 0.12;
      this.cellT[ci]![r] = tv;
      this.pen.tick((ci ? CB : CA) + 20, ROW0 + r * DY - 2, 30, T.which! + 0.12 + i * 0.32, { dur: 0.24 });
    });

    // volunteered detail: strike each claim on its word, then write the correction beside it
    const claimX = CA + 56;
    const fixT = [T.table!, T.conf!];
    AUDIT.extras.forEach((e, i) => {
      const y = EX_ROW0 + i * EX_DY;
      const w = measureText(e.claim, TYPE.mono(VAL_PX));
      this.pen.strike(claimX, claimX + w, y - 9, fixT[i]!, { dur: 0.28 });
      // the script T reads as a J in the Hershey hand: write the table reference in EMS Allure
      this.pen.note(e.fix, claimX + w + 40, y + 2, 46, fixT[i]! + 0.36, { cps: 12, font: i === 0 ? 'script' : 'hscript' });
    });
  }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.t;
    this.paper.render(renderer, out);
    const L = this.layer, c = L.ctx;
    L.clear();
    if (!this.stamps.length) for (let i = 0; i < 10; i++) this.stamps.push(makeStamp(STAMP_LABEL, 19, 31 + i * 17));

    const s = T.s!;
    // heading: on the page from the cut
    text(c, 'QUESTION 4', X0, 150, TYPE.label(16), C.graphite, { ls: 3 });
    text(c, 'Citation audit', X0, 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5 });
    text(c, 'FIVE FIGURES, EACH WITH ITS SOURCE', X1, 150, TYPE.label(16), C.graphite, { ls: 3, align: 'right' });

    // ---- main table, ruled on the first words
    const hy = 300;
    const ha = prog(t, s, s + 0.3);
    text(c, 'FIGURE', X0, hy, TYPE.label(14), C.graphite, { ls: 2.5, alpha: ha });
    c.save();
    c.globalAlpha = prog(t, s + 0.05, s + 0.35);
    candidate(c, 'A', CAND.A.name, CA, hy + 4, 22);
    candidate(c, 'B', CAND.B.name, CB, hy + 4, 22);
    c.restore();
    const rulep = prog(t, s, s + 0.45, ease.outCubic);
    hair(c, X0, hy + 22, X0 + (X1 - X0) * rulep, hy + 22, C.ink, 1.25);
    const nRows = AUDIT.rows.length;
    const tableBottom = ROW0 + (nRows - 1) * DY + 24;
    // column rules, drawn down from the header
    const vp = prog(t, s + 0.15, s + 0.6, ease.outCubic);
    for (const x of [CA - 24, CB - 24]) hair(c, x, hy - 30, x, hy - 30 + (tableBottom - hy + 30) * vp, C.rule);

    AUDIT.rows.forEach((label, r) => {
      const y = ROW0 + r * DY;
      const tr = s + 0.12 + r * 0.09;
      const a = prog(t, tr, tr + 0.25);
      text(c, label, X0, y, TYPE.body(28, 500), C.ink, { alpha: a });
      hair(c, X0, y + 24, X0 + (X1 - X0) * prog(t, tr, tr + 0.4, ease.outCubic), y + 24, C.rule);

      (['A', 'B'] as const).forEach((who, ci) => {
        const v = AUDIT[who][r]!;
        const tc = this.cellT[ci]![r]!;
        const x = ci ? CB : CA;
        if (v === 'idk') {
          const st = this.stamps[(r * 2 + ci) % this.stamps.length]!;
          const rot = (hash(r, ci, 5) - 0.5) * 0.07 - 0.012;
          drawStamp(c, st, x + 50 + (hash(r, ci, 9) - 0.5) * 10, y - 9 + (hash(r, ci, 3) - 0.5) * 3, rot, t, tc);
        } else {
          const [val, src] = split(v);
          const n = typeOn(c, val, x + 56, y, TYPE.mono(VAL_PX, 500), C.ink, t, tc, 90);
          if (src && n >= val.length) {
            const vw = measureText(val, TYPE.mono(VAL_PX, 500));
            typeOn(c, src, x + 56 + vw + 18, y - 1, TYPE.mono(SRC_PX), C.graphite, t, tc + val.length / 90, 110);
          }
        }
      });
    });

    // ---- volunteered detail: a narrower table that slides in on "extra detail"
    const ea = prog(t, T.extra! - 0.25, T.extra! + 0.2);
    if (ea > 0) {
      const dy = (1 - ease.outExpo(ea)) * 26;
      c.save();
      c.globalAlpha = ea;
      c.translate(0, dy);
      text(c, 'VOLUNTEERED DETAIL', X0, EX_TOP, TYPE.label(14), C.graphite, { ls: 2.5 });
      text(c, 'NOT SCORED', CA, EX_TOP, TYPE.label(14), C.graphite, { ls: 2.5 });
      hair(c, X0, EX_TOP + 20, EX_X1, EX_TOP + 20, C.ink, 1.25);
      hair(c, CA - 24, EX_TOP - 26, CA - 24, EX_ROW0 + (AUDIT.extras.length - 1) * EX_DY + 24, C.rule);
      AUDIT.extras.forEach((e, i) => {
        const y = EX_ROW0 + i * EX_DY;
        text(c, AUDIT.rows[EX_ROW[i]!]!, X0, y, TYPE.body(26, 500), C.ink);
        candidate(c, e.who as 'B', '', CA, y + 1, 20);
        text(c, e.claim, CA + 56, y, TYPE.mono(VAL_PX, 500), C.ink);
        hair(c, X0, y + 24, EX_X1, y + 24, C.rule);
      });
      c.restore();
    }

    // ---- footnote: the strongest model got it wrong too
    const fa = prog(t, T.arent! - 0.1, T.arent! + 0.4);
    if (fa > 0) {
      hair(c, X0, 902, X0 + (X1 - X0) * prog(t, T.arent! - 0.1, T.arent! + 0.4, ease.outCubic), 902, C.rule);
      text(c, AUDIT.mythos, X0, 940, TYPE.mono(18), C.graphite, { alpha: fa });
    }

    this.pen.draw(c, t);
    comp.draw(renderer, L.upload(), out);
    return {};
  }
}
