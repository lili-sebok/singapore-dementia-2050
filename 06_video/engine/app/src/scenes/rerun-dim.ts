// Engineering-drawing dimension line (vertical) for the rerun plate: thin extension lines from the
// two features, a hairline dimension line with small filled arrowheads, and the value set in Archivo
// centred in a gap in the line. When the span is too short for that, the arrows go outside the
// extension lines and point inwards (the drafting convention for small dimensions).
// Candidate for the kit (with a horizontal variant).
import { ease, prog } from '../engine/util';
import { C, TYPE, hair, measureText, text } from './_kit';

export interface DimV {
  x: number; // x of the dimension line
  ya: number; // upper feature y
  yb: number; // lower feature y
  extA: [number, number]; // extension line at ya, drawn from extA[0] to extA[1]
  extB: [number, number]; // extension line at yb
  label: string;
  caption?: string;
}

const LW = 1; // hairline
const AL = 12, AW = 3.6; // arrowhead length and half-width

function arrow(c: CanvasRenderingContext2D, x: number, tipY: number, dir: 1 | -1, a: number) {
  if (a <= 0) return;
  c.save();
  c.globalAlpha *= a;
  c.fillStyle = C.ink;
  c.beginPath();
  c.moveTo(x, tipY);
  c.lineTo(x - AW, tipY - dir * AL);
  c.lineTo(x + AW, tipY - dir * AL);
  c.closePath();
  c.fill();
  c.restore();
}

/** Draw the dimension at time t, building from t0: extension lines, then the dimension line, then the value. */
export function dimV(c: CanvasRenderingContext2D, t: number, t0: number, d: DimV) {
  if (t < t0) return;
  const pe = prog(t, t0, t0 + 0.3, ease.outCubic);
  const grow = (x0: number, x1: number, y: number) => hair(c, x0, y, x0 + (x1 - x0) * pe, y, C.ink, LW);
  grow(d.extA[0], d.extA[1], d.ya);
  grow(d.extB[0], d.extB[1], d.yb);

  const valF = TYPE.display(30, 100, 600), capF = TYPE.label(11);
  const cap = 30 * 0.72; // cap height of the value
  const capH = d.caption ? 22 : 0;
  const h = d.yb - d.ya, mid = (d.ya + d.yb) / 2;
  const pl = prog(t, t0 + 0.22, t0 + 0.7, ease.outCubic);
  const ta = prog(t, t0 + 0.5, t0 + 0.8);
  const gapH = cap + 18 + capH;
  if (h >= gapH + 2 * AL + 24) {
    // value inside: the line grows outwards from the gap to both arrows
    const g0 = mid - (cap + 18) / 2 - capH / 2, g1 = g0 + gapH;
    hair(c, d.x, g0, d.x, g0 - (g0 - d.ya) * pl, C.ink, LW);
    hair(c, d.x, g1, d.x, g1 + (d.yb - g1) * pl, C.ink, LW);
    const aa = prog(pl, 0.85, 1);
    arrow(c, d.x, d.ya, -1, aa);
    arrow(c, d.x, d.yb, 1, aa);
    text(c, d.label, d.x, g0 + 9 + cap, valF, C.ink, { align: 'center', alpha: ta });
    if (d.caption) text(c, d.caption, d.x, g0 + 9 + cap + 22, capF, C.graphite, { align: 'center', ls: 1.6, alpha: ta });
  } else {
    // value between short extension lines: arrows outside, pointing in, on short leaders
    const lead = 30;
    hair(c, d.x, d.ya - AL - lead * pl, d.x, d.ya - AL * Math.min(1, pl * 3), C.ink, LW);
    hair(c, d.x, d.yb + AL + lead * pl, d.x, d.yb + AL * Math.min(1, pl * 3), C.ink, LW);
    const aa = prog(pl, 0, 0.25);
    arrow(c, d.x, d.ya, 1, aa);
    arrow(c, d.x, d.yb, -1, aa);
    // value to the side when it would not fit between the extension lines with clearance
    const fits = h >= cap + 14;
    const w = measureText(d.label, valF);
    if (fits) text(c, d.label, d.x, mid + cap / 2, valF, C.ink, { align: 'center', alpha: ta });
    else text(c, d.label, d.x + 12, mid + cap / 2, valF, C.ink, { alpha: ta });
    void w;
    if (d.caption) text(c, d.caption, d.x, d.yb + AL + lead + 22, capF, C.graphite, { align: 'center', ls: 1.6, alpha: ta });
  }
}
