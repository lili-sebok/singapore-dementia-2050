// Section: opening (plates op-count, op-question; 06_video/plates.md). 74,000 people with dementia in
// 2023, MOH's 152,000 for 2030, the question, and the five parts of the video. First scene: no page turn.
import { MOH, POP } from '../data';
import { C, TYPE, col, cue, cueEnd, hair, measureText, span, text } from './_kit';
import { StoryScene, TEAL, clamp, ease, label, prog, sourceLine, typeText } from './_story';

const PARTS = ['Population', 'Prevalence', 'Projection', 'Physical activity', 'AI comparison'];

export default class Opening extends StoryScene {
  override init() {
    const ly = this.ctx.lyrics;
    const L1 = 'In 2023, about 74,000', L2 = 'The Ministry of Health expects', L3 = 'And the number of older', L4 = 'So how many people', L5 = 'We built our own';
    this.t = {
      y2023: cue(ly, L1, '2023'), n74: cue(ly, L1, '74,000'),
      moh: cue(ly, L2, 'Ministry'), n152: cue(ly, L2, '152,000'), y2030: cue(ly, L2, '2030'),
      older: cue(ly, L3, 'older'), rising: cue(ly, L3, 'rising'),
      q: cue(ly, L4, 'how'),
      built: cue(ly, L5, 'built'), official: cue(ly, L5, 'official'), tested: cue(ly, L5, 'tested'), asked: cue(ly, L5, 'asked'), compared: cue(ly, L5, 'compared'),
      end: cueEnd(ly, L5),
    };
  }

  draw(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const x0 = col(0);

    // --- op-count: the two figures (they move up and shrink when the question arrives)
    const up = prog(t, T.older! - 0.1, T.older! + 0.9, ease.inOutCubic);
    const fade = 1 - prog(t, T.q! - 0.4, T.q! + 0.2);
    c.save();
    // anchor the move at the top-left of the figure block
    const sc = 1 - 0.45 * up;
    c.translate(x0, 330 - 150 * up);
    c.scale(sc, sc);
    c.translate(-x0, -330);
    c.globalAlpha = 1 - 0.65 * up;

    label(c, 'SINGAPORE · PEOPLE LIVING WITH DEMENTIA', x0, 150, C.graphite, prog(t, 0.2, 0.8) * fade);
    // 2023
    const a23 = prog(t, T.y2023! - 0.25, T.y2023! + 0.1);
    text(c, '2023', x0, 330, TYPE.display(40, 100, 700), C.graphite, { alpha: a23 });
    const f74 = TYPE.display(132, 87.5, 800), f152 = TYPE.display(160, 87.5, 800);
    typeText(c, MOH.y2023Label, x0 - 6, 470, f74, C.ink, t, T.n74! - 0.05, 22, { ls: -2 });
    // the line to 2030 (the 2030 figure is right-aligned to the grid)
    const s152 = MOH.y2030.toLocaleString('en-US');
    const xb = col(11) + span(1) - measureText(s152, f152, -3);
    const xa = x0 + measureText(MOH.y2023Label, f74, -2) + 40;
    const lp = prog(t, T.moh! - 0.1, T.moh! + 0.8, ease.outCubic);
    if (lp > 0) {
      hair(c, xa, 420, xa + (xb - 40 - xa) * lp, 420, C.ink, 2);
      if (lp > 0.98) { c.save(); c.fillStyle = C.ink; c.beginPath(); c.moveTo(xb - 30, 412); c.lineTo(xb - 14, 420); c.lineTo(xb - 30, 428); c.closePath(); c.fill(); c.restore(); }
    }
    const a30 = prog(t, T.y2030! - 0.3, T.y2030!);
    text(c, '2030', xb, 330, TYPE.display(40, 100, 700), C.graphite, { alpha: Math.max(a30, prog(t, T.n152! - 0.3, T.n152!)) });
    const a152 = prog(t, T.n152! - 0.15, T.n152! + 0.35, ease.outCubic);
    if (a152 > 0) {
      c.save();
      c.globalAlpha *= a152;
      c.translate(0, (1 - a152) * 14);
      text(c, s152, xb - 8, 478, f152, TEAL, { ls: -3 });
      c.restore();
    }
    sourceLine(c, 'Source: ' + MOH.source, x0, 640, prog(t, T.n152! + 0.2, T.n152! + 0.7) * fade);
    c.restore();

    // --- op-question: a rising line, the question, the five parts
    const rp = prog(t, T.older! + 0.2, T.rising! + 1.2, ease.inOutCubic);
    if (rp > 0) {
      c.save();
      c.globalAlpha = 1 - prog(t, T.q! - 0.3, T.q! + 0.3) * 0.7;
      c.strokeStyle = C.ink;
      c.lineWidth = 2;
      c.beginPath();
      const N = 60;
      for (let i = 0; i <= N * rp; i++) {
        const u = i / N;
        const x = col(0) + u * (col(11) + span(1) - col(0));
        // people aged 60+ (UN WPP 2024): straight segments 2023 → 2030 → 2050 on an axis from 0 at y 900
        const yr = 2023 + 27 * u, P = POP.total60;
        const v = yr <= 2030 ? P[2023] + (P[2030] - P[2023]) * ((yr - 2023) / 7) : P[2030] + (P[2050] - P[2030]) * ((yr - 2030) / 20);
        const y = 900 - 520 * (v / P[2050]);
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
      text(c, '2023', col(0), 940, TYPE.mono(20), C.graphite, { alpha: prog(t, T.older!, T.older! + 0.4) });
      text(c, '2050', col(11) + span(1), 940, TYPE.mono(20), C.graphite, { alpha: prog(t, T.rising!, T.rising! + 0.4), align: 'right' });
      c.restore();
    }

    const qy = 560;
    const qf = TYPE.display(64, 87.5, 800);
    typeText(c, 'How many people in Singapore will have dementia', 960, qy, qf, C.ink, t, T.q!, 38, { align: 'center', ls: -0.5 });
    const q2s = T.q! + 'How many people in Singapore will have dementia'.length / 38;
    typeText(c, 'in 2030 and 2050?', 960, qy + 84, qf, C.ink, t, q2s, 38, { align: 'center', ls: -0.5 });

    // five parts: Population, Prevalence, Projection on "built ... official data"; then asked, compared
    const tp = [T.built!, T.built! + (T.official! - T.built!) * 0.5, T.official!, T.asked!, T.compared!];
    const pf = TYPE.body(30, 600);
    const gap = 64;
    const widths = PARTS.map((s) => measureText(s, pf));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (PARTS.length - 1);
    let x = 960 - total / 2;
    const toTeal = prog(t, T.end! - 0.7, T.end! - 0.3);
    PARTS.forEach((s, i) => {
      const a = prog(t, tp[i]! - 0.1, tp[i]! + 0.3, ease.outCubic);
      if (a > 0) {
        const isPop = i === 0;
        const alpha = a * (isPop ? 1 : 1 - 0.75 * toTeal);
        c.save();
        c.globalAlpha *= alpha;
        c.translate(0, (1 - a) * 10);
        text(c, s, x, 790, pf, isPop && toTeal > 0.5 ? TEAL : C.ink);
        hair(c, x, 812, x + widths[i]! * clamp(a), 812, isPop && toTeal > 0.5 ? TEAL : C.rule, isPop && toTeal > 0.5 ? 2.5 : 1.25);
        c.restore();
      }
      x += widths[i]! + gap;
    });
  }
}
