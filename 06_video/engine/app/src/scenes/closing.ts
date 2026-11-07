// Closing (plates cl-range, cl-moh, cl-end, then credits; 06_video/plates.md "Closing"). The section 3
// chart returns as the page turns: three scenario lines 2023 → 2030 → 2050 through PROJ's values, y axis
// from 0. cl-range brackets the 2030 and 2050 ranges and follows the dotted line to ×2; cl-moh sets MOH's
// 152,000 above the 2030 points and marks the cases avoidable at the 2050 rates-constant point; cl-end
// clears to paper for "Scenarios, not forecasts." and the one red-pen callback to the AI section (a long
// tick in the margin). Credits after the last word, then a fade to black. One sheet, static camera.
import type * as THREE from 'three';
import type { Frame } from '../engine/scene';
import { CLOSE, CREDITS, MOH, PA, PROJ } from '../data';
import { C, Pen, TYPE, col, cue, cueEnd, hair, measureText, span, text } from './_kit';
import { StoryScene, TEAL, clamp, ease, label, prog, sourceLine } from './_story';

const fmt = (n: number) => n.toLocaleString('en-US');
const DASH: Record<string, number[]> = { constant: [], half: [14, 9], decline: [2, 7] };
const NAME: Record<string, string> = { constant: 'rates constant', half: 'half-pace decline', decline: 'decline continues' };

// chart geometry (screen = sheet; the camera does not move)
const GX0 = col(1) + 20, GX1 = col(8) + span(1); // 2023 and 2050
const BASE = 860, YMAX = 320000, TOP = 300;
const X = (yr: number) => GX0 + ((yr - 2023) / 27) * (GX1 - GX0);
const Y = (v: number) => BASE - (v / YMAX) * (BASE - TOP);
const RX = GX1 + 26; // right-hand annotation column (2050 bracket)

const S = Object.fromEntries(PROJ.scenarios.map((s) => [s.key, s])) as Record<string, (typeof PROJ.scenarios)[number]>;
const lo2030 = Math.min(...PROJ.scenarios.map((s) => s.y2030)), hi2030 = Math.max(...PROJ.scenarios.map((s) => s.y2030));
const lo2050 = Math.min(...PROJ.scenarios.map((s) => s.y2050)), hi2050 = Math.max(...PROJ.scenarios.map((s) => s.y2050));
// computed: decline-continues cases 2050 / 2023 = 196,615 / 96,694 = 2.03, shown as ×2
const RATIO = S.decline!.y2050 / PROJ.base2023;
// largest avoidable figure, 2050, rates constant, 50% less inactivity (6,939): drawn to the chart's scale
const AVOID_ROW = PA.scenarios.reduce((a, b) => (b.y2050 > a.y2050 ? b : a));
const AVOID = AVOID_ROW.y2050, AVOID_CUT = AVOID_ROW.cut;

// cl-end
const EX = col(2); // text column; the tick goes in the margin to its left, as in verdict.ts
const TICK_X = col(0) + 98, TICK_SIZE = 236;
const QUAL = ['built on survey rates', 'and a decline that was not statistically significant'];
const CHECKED = 'every number checked against its original source';

export default class Closing extends StoryScene {
  pen = new Pen();

  override init() {
    const ly = this.ctx.lyrics;
    const R1 = 'So by 2030, we project', R2 = 'Even if prevalence keeps', M1 = 'All three scenarios fall below', M2 = 'Cutting inactivity could',
      E1 = 'These are scenarios, not', E2 = 'And every number in this video';
    this.t = {
      s: this.ctx.start, end: this.ctx.end,
      y2030: cue(ly, R1, '2030'), y2050: cue(ly, R1, '2050'),
      keeps: cue(ly, R2, 'keeps'), doubles: cue(ly, R2, 'doubles'), r2end: cueEnd(ly, R2),
      m1: cue(ly, M1, 0), n152: cue(ly, M1, '152,000'), ageing: cue(ly, M1, 'ageing'),
      cutting: cue(ly, M2, 'Cutting'), n7000: cue(ly, M2, '7,000'), m2end: cueEnd(ly, M2),
      e1: cue(ly, E1, 0), scen: cue(ly, E1, 'scenarios'), built: cue(ly, E1, 'built'), and: cue(ly, E1, 'and'),
      every: cue(ly, E2, 'every'), checked: cue(ly, E2, 'checked'), e2end: cueEnd(ly, E2),
    };
    const T = this.t;
    // the one red mark in the data story: a long tick in the margin beside the closing lines
    this.pen.tick(TICK_X, 668, TICK_SIZE, T.checked!, { dur: 0.7, width: 4.2 });
  }

  draw(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    // the chart clears to paper in the pause before cl-end
    const chartA = 1 - prog(t, T.m2end! + 0.25, T.e1! - 0.15, ease.inOutCubic);
    if (chartA > 0) { c.save(); c.globalAlpha = chartA; this.chart(c, t); c.restore(); }
    this.ending(c, t);
    this.credits(c, t);
  }

  // verdict.ts (written when it ended the video) returns a post fade to black over its last 0.6 s; post
  // overrides merge across overlapping scenes, so that fade would black out the page turn. Setting fade
  // here wins the merge: 0 during the turn, then the closing's own fade to black over the final 1.2 s.
  override render(f: Frame, out: THREE.WebGLRenderTarget) {
    const T = this.t;
    return { ...super.render(f, out), fade: prog(f.t, T.end! - 1.2, T.end! - 1 / 60, ease.inOutCubic) };
  }

  // ------------------------------------------------------------------ cl-range, cl-moh: the chart
  private chart(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    label(c, 'WHAT WE FOUND', col(0), 150, TEAL);
    text(c, 'Projected cases, aged 60+', col(0), 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5 });

    // highlight states (one teal thing at a time)
    const h30 = prog(t, T.y2030! - 0.15, T.y2030! + 0.25) * (1 - prog(t, T.y2050! - 0.15, T.y2050! + 0.25));
    const h50 = prog(t, T.y2050! - 0.15, T.y2050! + 0.25) * (1 - prog(t, T.keeps! - 0.15, T.keeps! + 0.25));
    const hDec = prog(t, T.keeps! - 0.15, T.keeps! + 0.25) * (1 - prog(t, T.r2end! + 0.2, T.m1! - 0.1));
    // cl-range's marks leave in the pause before cl-moh
    const rangeA = 1 - prog(t, T.r2end! + 0.2, T.m1! - 0.1, ease.inOutCubic);

    // legend, top right
    const lx = col(9) - 30;
    PROJ.scenarios.forEach((sc, i) => {
      const y = 138 + i * 34;
      const teal = sc.key === 'decline' && hDec > 0.5;
      c.save();
      c.strokeStyle = teal ? TEAL : C.ink; c.lineWidth = 2.5; c.lineCap = 'round';
      c.setLineDash(DASH[sc.key]!);
      c.beginPath(); c.moveTo(lx, y - 6); c.lineTo(lx + 56, y - 6); c.stroke();
      c.restore();
      text(c, NAME[sc.key]!, lx + 76, y, TYPE.mono(18), teal ? TEAL : C.ink);
    });

    // axes: gridlines at 100,000s, y labels, year columns
    for (let v = 0; v <= 300000; v += 100000) {
      const y = Y(v);
      if (v > 0) hair(c, GX0, y, GX1, y, C.rule, 1);
      text(c, fmt(v), GX0 - 18, y + 6, TYPE.mono(16), C.graphite, { align: 'right' });
    }
    hair(c, GX0, BASE, GX1, BASE, C.graphite, 1.4);
    for (const yr of [2023, 2030, 2050]) {
      const x = X(yr);
      if (yr !== 2023) hair(c, x, TOP - 10, x, BASE, C.rule, 1);
      hair(c, x, BASE, x, BASE + 10, C.graphite, 1.4);
      text(c, String(yr), x, BASE + 38, TYPE.mono(18), C.ink, { align: 'center' });
    }
    text(c, 'people with dementia', GX0 - 18, TOP - 24, TYPE.mono(16), C.graphite, { align: 'left' });

    // the three lines, then their points (the highlighted one last, in teal)
    const order = ['constant', 'half', 'decline'];
    for (const k of order) {
      const sc = S[k]!;
      const teal = k === 'decline' ? hDec : 0;
      const pts: [number, number][] = [[X(2023), Y(PROJ.base2023)], [X(2030), Y(sc.y2030)], [X(2050), Y(sc.y2050)]];
      c.save();
      c.strokeStyle = teal > 0.5 ? TEAL : C.ink; c.lineWidth = teal > 0.5 ? 3.2 : 2.5; c.lineCap = 'round'; c.lineJoin = 'round';
      c.setLineDash(DASH[k]!);
      c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      c.restore();
      c.fillStyle = teal > 0.5 ? TEAL : C.ink;
      for (const [x, y] of pts.slice(1)) { c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill(); }
    }
    c.fillStyle = hDec > 0.5 ? TEAL : C.ink;
    c.beginPath(); c.arc(X(2023), Y(PROJ.base2023), 5, 0, Math.PI * 2); c.fill();

    // --- cl-range: the 2030 bracket (beside the points), its label below the lines
    const b30 = prog(t, T.y2030! - 0.1, T.y2030! + 0.5, ease.outCubic) * rangeA;
    if (b30 > 0) {
      const col30 = h30 > 0.5 ? TEAL : C.graphite;
      const bx = X(2030) + 20, y0 = Y(hi2030) - 4, y1 = Y(lo2030) + 4;
      c.save(); c.globalAlpha *= b30;
      this.bracket(c, bx, y0, y0 + (y1 - y0) * b30, col30, 3);
      hair(c, bx, y1, bx, 700, col30, 1.25);
      text(c, CLOSE.range2030, bx - 2, 734, TYPE.body(30, 600), col30 === TEAL ? TEAL : C.ink);
      text(c, 'in 2030', bx - 2, 766, TYPE.mono(18), C.graphite);
      c.restore();
    }
    // the 2050 bracket, label to its right
    const b50 = prog(t, T.y2050! - 0.1, T.y2050! + 0.5, ease.outCubic) * rangeA;
    if (b50 > 0) {
      const col50 = h50 > 0.5 ? TEAL : C.graphite;
      const y0 = Y(hi2050) - 4, y1 = Y(lo2050) + 4;
      c.save(); c.globalAlpha *= b50;
      this.bracket(c, RX, y0, y0 + (y1 - y0) * b50, col50, 3);
      const f = this.fit(CLOSE.range2050, 30, 1800 - (RX + 24));
      text(c, CLOSE.range2050, RX + 24, (y0 + y1) / 2 + 4, f, col50 === TEAL ? TEAL : C.ink);
      text(c, 'in 2050', RX + 24, (y0 + y1) / 2 + 36, TYPE.mono(18), C.graphite);
      c.restore();
    }
    // the dotted line's doubling, under its 2050 end
    const dA = prog(t, T.keeps! - 0.1, T.keeps! + 0.4, ease.outCubic) * rangeA;
    if (dA > 0) {
      const y = Y(lo2050) + 74;
      c.save(); c.globalAlpha *= dA; c.translate(0, (1 - dA) * 10);
      const fN = TYPE.mono(24, 500);
      text(c, `${fmt(PROJ.base2023)} → ${fmt(S.decline!.y2050)}`, RX + 24, y, fN, hDec > 0.5 ? TEAL : C.ink);
      const x2 = prog(t, T.doubles! - 0.1, T.doubles! + 0.3, ease.outCubic);
      if (x2 > 0) text(c, '×' + Math.round(RATIO), RX + 24, y + 78, TYPE.display(72, 100, 800), hDec > 0.5 ? TEAL : C.ink, { alpha: x2 });
      c.restore();
    }

    // --- cl-moh: MOH's 2030 estimate, above all three 2030 points
    const mA = prog(t, T.n152! - 0.15, T.n152! + 0.5, ease.outCubic);
    if (mA > 0) {
      const y = Y(MOH.y2030), x2030 = X(2030);
      c.save(); c.globalAlpha *= mA;
      hair(c, GX0, y, GX0 + (x2030 + 44 - GX0) * mA, y, C.ink, 2);
      // MOH's figure as an open ring (an estimate we did not make)
      c.fillStyle = C.paper; c.strokeStyle = C.ink; c.lineWidth = 2.2;
      c.beginPath(); c.arc(x2030, y, 7, 0, Math.PI * 2); c.fill(); c.stroke();
      text(c, `MOH estimate, 2030 · ${fmt(MOH.y2030)}`, GX0 + 4, y - 56, TYPE.body(28, 600), C.ink);
      c.restore();
      // "ageing alone cannot explain it": the note, teal until the avoidable bracket takes the accent
      const nA = prog(t, T.ageing! - 0.1, T.ageing! + 0.35, ease.outCubic);
      if (nA > 0) {
        const tealN = 1 - prog(t, T.cutting! - 0.15, T.cutting! + 0.2);
        text(c, 'ageing alone cannot explain it', GX0 + 4, y - 20, TYPE.body(24, 500), tealN > 0.5 ? TEAL : C.graphite, { alpha: nA * mA });
      }
    }
    // cases avoidable by 2050 at the rates-constant point, to the chart's scale
    const aA = prog(t, T.cutting! - 0.05, T.n7000! + 0.1, ease.outCubic);
    if (aA > 0) {
      const y0 = Y(S.constant!.y2050), y1 = Y(S.constant!.y2050 - AVOID);
      const bx = RX;
      c.save(); c.globalAlpha *= aA;
      // a short downward arrow onto the bracket, so the few-pixel span reads as "down from here"
      hair(c, bx, y0 - 46, bx, y0 - 8, TEAL, 2);
      c.fillStyle = TEAL; c.beginPath(); c.moveTo(bx - 6, y0 - 16); c.lineTo(bx, y0 - 5); c.lineTo(bx + 6, y0 - 16); c.closePath(); c.fill();
      this.bracket(c, bx, y0, y1, TEAL, 3);
      text(c, `${CLOSE.avoidable2050} avoidable`, bx + 24, y0 + 2, this.fit(`${CLOSE.avoidable2050} avoidable`, 28, 1800 - (bx + 24)), TEAL);
      text(c, `by 2050, with ${AVOID_CUT} less inactivity`, bx + 24, y0 + 32, TYPE.mono(16), C.graphite);
      c.restore();
    }

    sourceLine(c, 'Our model: UN WPP 2024 × WiSE 2023 · MOH 4 Nov 2025 · Avoidable cases: NPHS 2024, Iso-Markku et al. 2022, rates constant', col(0), 990);
  }

  /** A vertical bracket from y0 to y1 at x with short caps pointing left (towards the points). */
  private bracket(c: CanvasRenderingContext2D, x: number, y0: number, y1: number, color: string, w = 2.5) {
    c.save();
    c.strokeStyle = color; c.lineWidth = w; c.lineCap = 'butt';
    c.beginPath();
    c.moveTo(x - 9, y0); c.lineTo(x, y0); c.lineTo(x, y1); c.lineTo(x - 9, y1);
    c.stroke();
    c.restore();
  }

  /** body font at px (600), shrunk if needed to fit `w`. */
  private fit(s: string, px: number, w: number) {
    const f = TYPE.body(px, 600);
    const m = measureText(s, f);
    return m <= w ? f : TYPE.body(Math.floor((px * w) / m), 600);
  }

  // ------------------------------------------------------------------ cl-end
  private ending(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    if (t < T.e1! - 0.3) return;
    const out = 1 - prog(t, T.e2end! + 0.45, T.e2end! + 0.95, ease.inOutCubic);
    if (out <= 0) return;
    c.save(); c.globalAlpha = out;
    const rise = (t0: number) => { const a = prog(t, t0 - 0.05, t0 + 0.35); return { a, dy: (1 - ease.outExpo(clamp(a))) * 18 }; };
    const h = rise(T.scen!);
    if (h.a > 0) text(c, 'Scenarios, not forecasts.', EX - 6, 452 + h.dy, TYPE.display(112, 87.5, 800), C.ink, { ls: -2, alpha: h.a });
    [T.built!, T.and!].forEach((tq, i) => {
      const q = rise(tq);
      if (q.a > 0) text(c, QUAL[i]!, EX, 524 + i * 44 + q.dy, TYPE.body(34, 500), C.graphite, { alpha: q.a });
    });
    const k = rise(T.every!);
    if (k.a > 0) text(c, CHECKED, EX, 668 + k.dy, TYPE.body(40, 600), C.ink, { alpha: k.a });
    this.pen.draw(c, t);
    c.restore();
  }

  // ------------------------------------------------------------------ credits
  private credits(c: CanvasRenderingContext2D, t: number) {
    const T = this.t;
    const a0 = T.e2end! + 0.95;
    if (t < a0) return;
    const step = (i: number) => prog(t, a0 + i * 0.12, a0 + 0.5 + i * 0.12, ease.outCubic);
    const x1 = EX, x2 = col(6);
    const row = (s: string, x: number, y: number, f: string, color: string, i: number) => {
      const a = step(i);
      if (a > 0) text(c, s, x, y + (1 - a) * 8, f, color, { alpha: a });
    };
    c.save(); c.globalAlpha = step(0);
    label(c, 'TEAM', x1, 380, C.graphite);
    label(c, 'AI TOOLS USED', x2, 380, C.graphite);
    hair(c, x1, 400, x1 + span(3), 400, C.rule);
    hair(c, x2, 400, x2 + span(5), 400, C.rule);
    c.restore();
    CREDITS.team.forEach((n, i) => row(n, x1, 450 + i * 44, TYPE.body(30, 600), C.ink, i + 1));
    CREDITS.ai.forEach(([tool, what], i) => {
      const a = step(i + 1);
      if (a <= 0) return;
      const y = 450 + i * 44 + (1 - a) * 8;
      const w = text(c, tool!, x2, y, TYPE.body(30, 600), C.ink, { alpha: a });
      text(c, ' · ' + what, x2 + w, y, TYPE.body(30, 500), C.graphite, { alpha: a });
    });
    label(c, 'NUS · HS1502 CONCEPTUAL INTRODUCTION TO MACHINE LEARNING · NOVEMBER 2026', x1, 760, C.graphite, step(6));
  }
}
