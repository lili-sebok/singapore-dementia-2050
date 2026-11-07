// Shared kit for the data-story sections (06_video/plates.md, "Two registers"): the teal accent, a
// base class for a section scene (paper ground, one Canvas2D layer, an in-section camera, and the page
// turn that brings the section in), and small chart helpers. No red pen here: that belongs to the AI
// comparison. A section is one timeline entry spanning all its plates; its plates are regions of one
// large sheet, and the camera glides between them in the pauses between plates.
import * as THREE from 'three';
import { Scene, type Frame } from '../engine/scene';
import { FSPass, Layer2D, makeRT, W, H } from '../engine/gl';
import { clamp, ease, prog } from '../engine/util';
import { C, Paper, TYPE, text, measureText } from './_kit';

export const TEAL = '#1F6F6B';
export const TEAL_SOFT = 'rgba(31,111,107,0.16)';

// ---------------------------------------------------------------- camera
/** A camera key: the sheet point (x, y) shown at screen centre, at zoom z, from time t. */
export interface CamKey { t: number; x: number; y: number; z?: number; dur?: number }

/**
 * Camera over a section's sheet. Keys hold until the next key's time; each move takes `dur`
 * (default 0.9 s) and ends at the key's time, eased in and out.
 */
export class Camera {
  constructor(public keys: CamKey[]) { this.keys.sort((a, b) => a.t - b.t); }
  at(t: number) {
    const ks = this.keys;
    let cur = { x: ks[0]!.x, y: ks[0]!.y, z: ks[0]!.z ?? 1 };
    for (let i = 1; i < ks.length; i++) {
      const k = ks[i]!, d = k.dur ?? 0.9;
      const u = ease.inOutCubic(clamp((t - (k.t - d)) / d));
      if (u <= 0) break;
      const z = k.z ?? 1;
      cur = { x: cur.x + (k.x - cur.x) * u, y: cur.y + (k.y - cur.y) * u, z: cur.z + (z - cur.z) * u };
    }
    return cur;
  }
  apply(c: CanvasRenderingContext2D, t: number) {
    const { x, y, z } = this.at(t);
    c.setTransform(z, 0, 0, z, W / 2 - x * z, H / 2 - y * z);
  }
}

// ---------------------------------------------------------------- page turn
/**
 * The outgoing page lifts from the bottom-right corner and curls over towards the top left (a cylinder
 * of radius R rolling across the page), revealing the incoming page. The back of the turning page is
 * plain paper with a faint mirrored show-through; the curl casts a soft shadow on the page beneath.
 */
const PAGE_TURN = /* glsl */ `
  uniform sampler2D from; uniform sampler2D to; uniform float prog; uniform vec2 res;
  const float R = 110.0;
  vec4 fromAt(vec2 q) { return texture(from, q / res); }
  bool inside(vec2 q) { return q.x >= 0.0 && q.y >= 0.0 && q.x <= res.x && q.y <= res.y; }
  void main() {
    vec2 p = vUv * res;
    vec2 corner = vec2(res.x, 0.0);
    vec2 dir = normalize(vec2(-1.0, 0.62));
    float smax = dot(vec2(0.0, res.y) - corner, dir);
    float pos = mix(-2.0, smax + R * 1.2, prog);
    float s = dot(p - corner, dir);
    vec3 back = C_PAPER * 0.94;
    vec4 col;
    bool done = false;
    // the flap: the part already turned over, lying flat on top beyond the fold
    if (s >= pos) {
      float u = 3.14159265 * R + (s - pos);
      vec2 q = p + dir * ((pos - u) - s);
      if (inside(q)) {
        vec3 thru = fromAt(q).rgb;
        float edge = clamp((s - pos) / 60.0, 0.0, 1.0);
        col = vec4(mix(back, thru, 0.05) * mix(0.9, 1.0, edge), 1.0);
        done = true;
      }
    }
    // the curl: back half (upper) first, then the front half
    if (!done && s > pos - R && s < pos) {
      float k = (pos - s) / R;
      float aB = 3.14159265 - asin(k);
      vec2 qB = p + dir * ((pos - R * aB) - s);
      if (inside(qB)) {
        col = vec4(mix(back, fromAt(qB).rgb, 0.05) * (0.80 + 0.14 * sin(aB)), 1.0);
        done = true;
      } else {
        float aF = asin(k);
        vec2 qF = p + dir * ((pos - R * aF) - s);
        if (inside(qF)) {
          col = vec4(fromAt(qF).rgb * (1.0 - 0.22 * sin(aF)), 1.0);
          done = true;
        }
      }
    }
    if (!done) {
      if (s >= pos) col = fromAt(p);
      else {
        // the incoming page, shadowed near the curl
        float d = (pos - R) - s;
        float sh = 1.0 - 0.30 * exp(-max(d, 0.0) / 55.0) * step(0.0, pos);
        col = vec4(texture(to, vUv).rgb * sh, 1.0);
      }
    }
    fragColor = col;
  }`;

export class PageTurn {
  pass = new FSPass(PAGE_TURN, { from: { value: null }, to: { value: null }, prog: { value: 0 }, res: { value: new THREE.Vector2(W, H) } });
  render(renderer: THREE.WebGLRenderer, from: THREE.Texture, to: THREE.Texture, p: number, out: THREE.WebGLRenderTarget) {
    this.pass.u.from!.value = from;
    this.pass.u.to!.value = to;
    this.pass.u.prog!.value = p;
    this.pass.render(renderer, out);
  }
}

/** Seconds of overlap a page turn takes (timeline.ts starts the incoming section this much early). */
export const PAGE_TURN_DUR = 1.2;

// ---------------------------------------------------------------- section scene
/**
 * Base for a data-story section. Subclasses set up timings in `setup()` and draw the sheet in
 * `draw(c, t)` (in sheet coordinates; the camera transform is already applied, call `screen(c)` to
 * draw in screen coordinates). While the previous scene overlaps (f.under), the section comes in with
 * a page turn.
 */
export abstract class StoryScene extends Scene {
  override handlesTransition = true;
  paper = new Paper();
  layer = new Layer2D();
  turn = new PageTurn();
  rt = makeRT();
  cam: Camera = new Camera([{ t: 0, x: W / 2, y: H / 2 }]);
  t: Record<string, number> = {};

  abstract draw(c: CanvasRenderingContext2D, t: number): void;

  screen(c: CanvasRenderingContext2D) { c.setTransform(1, 0, 0, 1, 0, 0); }

  render(f: Frame, out: THREE.WebGLRenderTarget) {
    const { renderer, comp } = this.ctx;
    const turning = !!f.under && f.tin < 1;
    const target = turning ? this.rt : out;
    this.paper.render(renderer, target);
    const L = this.layer, c = L.ctx;
    L.clear();
    this.cam.apply(c, f.t);
    this.draw(c, f.t);
    comp.draw(renderer, L.upload(), target);
    if (turning) this.turn.render(renderer, f.under!, this.rt.texture, ease.inOutCubic(f.tin), out);
    // no chromatic aberration: it fringes small dots red and blue, worst when the camera zooms in
    return { ca: 0 };
  }
}

// ---------------------------------------------------------------- helpers
/** Small spaced-capitals label. */
export function label(c: CanvasRenderingContext2D, s: string, x: number, y: number, color: string = C.graphite, alpha = 1, align: CanvasTextAlign = 'left') {
  return text(c, s, x, y, TYPE.label(16), color, { ls: 3, alpha, align });
}

/** Section label + heading block used at the top of each section's first plate. */
export function sectionHead(c: CanvasRenderingContext2D, lab: string, heading: string, x: number, alpha = 1) {
  label(c, lab, x, 150, TEAL, alpha);
  text(c, heading, x, 214, TYPE.display(58, 87.5, 800), C.ink, { ls: -0.5, alpha });
}

/** Source line at the foot of a region (y = baseline). */
export function sourceLine(c: CanvasRenderingContext2D, s: string, x: number, y: number, alpha = 1) {
  text(c, s, x, y, TYPE.mono(17), C.graphite, { alpha });
}

/** A number that counts up from 0 to `v` over [t0, t1] (formatted with thousands separators). */
export function countUp(v: number, t: number, t0: number, t1: number) {
  const k = prog(t, t0, t1, ease.outCubic);
  return Math.round(v * k).toLocaleString('en-US');
}

/** Text revealed character by character from t0. */
export function typeText(c: CanvasRenderingContext2D, s: string, x: number, y: number, fontStr: string, color: string, t: number, t0: number, cps = 40, o: { align?: CanvasTextAlign; ls?: number } = {}) {
  if (t < t0) return 0;
  const n = clamp(Math.floor((t - t0) * cps), 0, s.length);
  if (o.align === 'center') {
    // keep the final line centred while typing
    const full = measureText(s, fontStr, o.ls ?? 0);
    return text(c, s.slice(0, n), x - full / 2, y, fontStr, color, { ls: o.ls });
  }
  return text(c, s.slice(0, n), x, y, fontStr, color, { ls: o.ls, align: o.align });
}

export { clamp, ease, prog };
