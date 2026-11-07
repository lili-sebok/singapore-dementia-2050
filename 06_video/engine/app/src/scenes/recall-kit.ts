// Helpers shared by the screen-to-paper plates (open, recall, moh): typing on the dark screen,
// double-spaced transcript blocks (room between lines for the pen's corrections), and a printed
// mark slot ("MARK ... /100") that the pen fills in.
import { clamp } from '../engine/util';
import { strokeText } from '../engine/stroke';
import { C, Pen, TYPE, layoutTranscript, measureText, text, type TranscriptLayout } from './_kit';

/** Greedy word wrap of `s` into lines no wider than w. `start` = char index of each line in s. */
export function wrap(s: string, fontStr: string, w: number) {
  const out: { s: string; start: number }[] = [];
  let cur = '', start = 0, idx = 0;
  for (const word of s.split(' ')) {
    const tryS = cur ? `${cur} ${word}` : word;
    if (cur && measureText(tryS, fontStr) > w) { out.push({ s: cur, start }); start = idx; cur = word; }
    else cur = tryS;
    idx += word.length + 1;
  }
  if (cur) out.push({ s: cur, start });
  return out;
}

/** Characters typed by t at cps from t0. */
export const typed = (t: number, t0: number, cps: number, len: number) => clamp(Math.floor((t - t0) * cps), 0, len);

/** The screen's block cursor (blinks while idle). */
export function blockCursor(c: CanvasRenderingContext2D, x: number, y: number, px: number, t: number, color: string = C.screenText, solid = false) {
  if (!solid && Math.floor(t * 2.2) % 2 !== 0) return;
  c.fillStyle = color;
  c.fillRect(x, y - px * 0.78, px * 0.55, px * 0.95);
}

/** Type wrapped lines on the screen; a solid cursor follows the text, then blinks at the end. */
export function typeLines(c: CanvasRenderingContext2D, lines: { s: string; start: number }[], x: number, y: number, lh: number, fontStr: string, color: string, t: number, t0: number, cps: number, o: { cursor?: boolean } = {}) {
  if (t < t0) return;
  const total = lines.length ? lines[lines.length - 1]!.start + lines[lines.length - 1]!.s.length : 0;
  const n = typed(t, t0, cps, total);
  let cx = x, cy = y;
  lines.forEach((ln, i) => {
    const k = clamp(n - ln.start, 0, ln.s.length);
    if (k <= 0) return;
    const w = text(c, ln.s.slice(0, k), x, y + i * lh, fontStr, color);
    cx = x + w; cy = y + i * lh;
  });
  if (o.cursor) blockCursor(c, cx + 4, cy, parseFloat(fontStr), t, color, n < total);
}

/** A transcript block with double line spacing and an extra gap under the header, for corrections. */
export function layoutScript(s: string, header: string, x: number, y: number, w: number, px = 28, lh = 2.0, gap = 30): TranscriptLayout {
  const L = layoutTranscript(s, header, x, y, w, px, lh);
  for (const ln of L.lines) ln.y += gap;
  return L;
}

/**
 * A printed mark slot: small "MARK" label, the pen's handwritten score, and a printed "/100" after it.
 * Declares the pen marks in init; draw() prints the label and /100 (fading in from `printAt`).
 */
export class MarkSlot {
  width: number;
  end: number;
  constructor(public pen: Pen, public value: number, public x: number, public y: number, public t0: number, public printAt: number, public px = 64) {
    const r = pen.score(value, x, y, px, t0);
    this.width = r.width;
    this.end = r.end;
  }
  draw(c: CanvasRenderingContext2D, t: number) {
    const a = clamp((t - this.printAt) / 0.25);
    if (a <= 0) return;
    text(c, 'MARK', this.x, this.y - this.px * 0.95, TYPE.label(14), C.graphite, { ls: 2.5, alpha: a });
    text(c, '/100', this.x + this.width + 22, this.y, TYPE.label(24), C.graphite, { ls: 1, alpha: a });
  }
}

/** Width of a handwritten note before it is declared (for layout). */
export const noteWidth = (s: string, px: number) => strokeText(s, 'hscript', px).width;

/**
 * The official-figure device drawn around a word already set in running text (a transcript or the
 * screen): the same thin ruled box as ruledBox(), with a tighter pad so it sits inside the line.
 */
export function boxSpan(c: CanvasRenderingContext2D, x0: number, x1: number, y: number, px: number, color: string = C.ink, alpha = 1, pad = 6) {
  if (alpha <= 0) return;
  c.save();
  c.globalAlpha *= alpha;
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  c.strokeRect(x0 - pad, y - px * 0.82 - pad * 0.6, x1 - x0 + pad * 2, px * 0.82 + pad * 1.5);
  c.restore();
}

/** Span of `word` in wrapped lines drawn at (x, y + i*lh): { x0, x1, y, end } (end = char index after it). */
export function wordInLines(lines: { s: string; start: number }[], word: string, x: number, y: number, lh: number, fontStr: string) {
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]!, k = ln.s.indexOf(word);
    if (k < 0) continue;
    const x0 = x + measureText(ln.s.slice(0, k), fontStr);
    return { x0, x1: x0 + measureText(word, fontStr), y: y + i * lh, end: ln.start + k + word.length };
  }
  throw new Error(`wordInLines: '${word}' not found`);
}

/** Time at which drawTranscript (kit) has revealed `word` in L, typed from t0 at cps. */
export const transcriptWordAt = (L: TranscriptLayout, word: string, t0: number, cps = 90) => t0 + 0.25 + (L.text.indexOf(word) + word.length) / cps;
