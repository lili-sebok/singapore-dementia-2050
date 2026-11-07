// Title card (no narration): fades up from black, the title rises line by line, a rule draws, the three
// scenario lines from section 3 trace faintly across the lower right, then the page turns into the opening.
import { PROJ, CREDITS } from '../data';
import { C, TYPE, col, hair, span, text } from './_kit';
import { StoryScene, TEAL, clamp, ease, label, prog } from './_story';

const DASH: Record<string, number[]> = { constant: [], half: [14, 9], decline: [2, 7] };

export default class Title extends StoryScene {
  draw(c: CanvasRenderingContext2D, t: number) {
    const s = this.ctx.start;
    const x0 = col(0), x1 = col(11) + span(1);
    const lt = t - s;

    label(c, 'HS1502 · CONCEPTUAL INTRODUCTION TO MACHINE LEARNING', x0, 150, C.graphite, prog(lt, 0.5, 1.1));
    label(c, 'NUS · NOVEMBER 2026', x1, 150, C.graphite, prog(lt, 0.6, 1.2), 'right');

    // title lines rise into place behind a mask
    const rise = (str: string, y: number, px: number, color: string, t0: number) => {
      const e = prog(lt, t0, t0 + 0.9, ease.outExpo);
      if (e <= 0) return;
      c.save();
      c.beginPath();
      c.rect(x0 - 20, y - px * 0.95, x1 - x0 + 40, px * 1.2);
      c.clip();
      text(c, str, x0 - 6, y + (1 - e) * px * 1.1, TYPE.display(px, 87.5, 800), color, { ls: -3 });
      c.restore();
    };
    rise('Dementia in Singapore', 470, 150, C.ink, 0.55);
    rise('2030 and 2050', 630, 150, TEAL, 0.8);

    // rule
    const rp = prog(lt, 1.15, 1.9, ease.inOutCubic);
    if (rp > 0) hair(c, x0, 700, x0 + (span(7) + 24) * rp, 700, C.ink, 2);

    const sub = prog(lt, 1.5, 2.1, ease.outCubic);
    if (sub > 0) {
      c.save(); c.globalAlpha = sub; c.translate(0, (1 - sub) * 10);
      text(c, 'Projecting cases, checking them against the Ministry of Health,', x0, 762, TYPE.body(32, 500), C.ink);
      text(c, 'and testing how two AI systems handle the same task.', x0, 806, TYPE.body(32, 500), C.ink);
      c.restore();
    }
    text(c, CREDITS.team.join('  ·  '), x0, 930, TYPE.body(26, 600), C.graphite, { alpha: prog(lt, 1.9, 2.5) });

    // the three scenario lines, faint, lower right (2023 → 2030 → 2050, the shapes of section 3)
    const gx0 = col(8), gx1 = x1, gy0 = 900, gy1 = 560;
    const ymax = 300000, ymin = 0; // from zero, so the lines' growth is drawn to scale
    const X = (yr: number) => gx0 + ((yr - 2023) / 27) * (gx1 - gx0);
    const Y = (v: number) => gy0 - ((v - ymin) / (ymax - ymin)) * (gy0 - gy1);
    const lp = prog(lt, 1.3, 3.0, ease.inOutCubic);
    if (lp > 0) {
      c.save();
      c.globalAlpha = 0.55;
      c.strokeStyle = C.graphite;
      c.lineWidth = 2;
      c.lineCap = 'round';
      for (const sc of PROJ.scenarios) {
        const pts = [[2023, PROJ.base2023], [2030, sc.y2030], [2050, sc.y2050]] as const;
        c.setLineDash(DASH[sc.key] ?? []);
        c.beginPath();
        // draw up to the current year
        const yrNow = 2023 + 27 * lp;
        c.moveTo(X(2023), Y(PROJ.base2023));
        for (let i = 1; i < pts.length; i++) {
          const [ya, va] = pts[i - 1]!, [yb, vb] = pts[i]!;
          if (yrNow <= ya) break;
          const u = clamp((yrNow - ya) / (yb - ya));
          c.lineTo(X(ya + (yb - ya) * u), Y(va + (vb - va) * u));
        }
        c.stroke();
      }
      c.setLineDash([]);
      c.restore();
      text(c, '2023', gx0, gy0 + 34, TYPE.mono(16), C.graphite, { alpha: 0.7 * prog(lt, 1.3, 1.7) });
      text(c, '2050', gx1, gy0 + 34, TYPE.mono(16), C.graphite, { alpha: 0.7 * prog(lt, 2.6, 3.0), align: 'right' });
    }

    // fade up from black
    const fade = 1 - prog(lt, 0, 0.7, ease.outCubic);
    if (fade > 0) {
      this.screen(c);
      c.fillStyle = `rgba(0,0,0,${fade})`;
      c.fillRect(0, 0, 1920, 1080);
    }
  }
}
