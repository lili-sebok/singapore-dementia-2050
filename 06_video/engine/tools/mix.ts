#!/usr/bin/env bun
// Sound mix: lays the music and sound effects under a rendered video's narration.
//   bun tools/mix.ts <in.mp4> <out.mp4> [--from 0]
// --from is the timeline time the video starts at (the render's --from), so partial renders mix correctly.
// Cues come from data/sfx.json (cd app && bun scripts/render.ts events): the timeline and every pen stroke.
//   music:  audio/music_bed.mp3 under the data story, audio/music_ai.mp3 under the AI comparison (from the
//           'open' plate to the closing), both looped, MUSIC_DB below the voice and ducked while it speaks.
//   sfx:    audio/sfx_page_turn.mp3 at each page turn, audio/sfx_pen_tick.mp3 at each pen stroke.
// Env: MUSIC_DB (default -17), TURN_DB (+10), TICK_DB (+0) gain on the raw files.
import path from 'node:path';
import { $ } from 'bun';

const ROOT = path.resolve(import.meta.dir, '..');
const argv = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1]! : d; };
const [inp, out] = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
if (!inp || !out) { console.error('usage: bun tools/mix.ts <in.mp4> <out.mp4> [--from 0]'); process.exit(1); }
const FROM = +opt('from', '0');
const MUSIC_DB = +(process.env.MUSIC_DB ?? -17), TURN_DB = +(process.env.TURN_DB ?? 10), TICK_DB = +(process.env.TICK_DB ?? 0);

// entries that come in with a page turn (mirrors `turn: true` in app/src/timeline.ts)
const TURNS = new Set(['opening', 'demographics', 'prevalence', 'projection', 'activity', 'closing']);

const ev: { duration: number; timeline: { id: string; start: number; end: number }[]; pen: number[] } =
  await Bun.file(path.join(ROOT, 'data/sfx.json')).json();
const dur = +(await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${inp}`.text()).trim();
const T0 = FROM, T1 = FROM + dur;

const aiStart = ev.timeline.find((e) => e.id === 'open')?.start ?? Infinity;
const closing = ev.timeline.find((e) => e.id === 'closing');
const aiEnd = closing ? closing.start : Infinity;

// sfx times, in video time; pen strokes closer than 0.15 s share one tick
const turns = ev.timeline.filter((e, i) => i > 0 && TURNS.has(e.id)).map((e) => e.start);
const ticks: number[] = [];
for (const t of ev.pen) if (!ticks.length || t - ticks[ticks.length - 1]! > 0.15) ticks.push(t);
const inWin = (t: number) => t >= T0 && t < T1 - 0.2;
const turnsV = turns.filter(inWin).map((t) => t - T0), ticksV = ticks.filter(inWin).map((t) => t - T0);

// music segments in video time: [start, end, file, fade-in, fade-out]
type Seg = [number, number, string, number, number];
const segs: Seg[] = [];
const add = (a: number, b: number, f: string, fi: number, fo: number) => {
  const s = Math.max(a, T0), e = Math.min(b, T1);
  if (e - s > 0.1) segs.push([s - T0, e - T0, f, s === a ? fi : 0, e === b ? fo : 0]);
};
add(0, aiStart, 'music_bed.mp3', 2.0, 0.4);
add(aiStart, aiEnd, 'music_ai.mp3', 0.4, 1.2);
if (closing) add(aiEnd, ev.duration, 'music_bed.mp3', 1.2, 4.0);
// the video's own ends fade too (partial renders)
if (segs.length) { segs[0]![3] ||= 1.5; segs[segs.length - 1]![4] ||= 3.0; }

const inputs: string[] = ['-i', inp];
const f: string[] = [];
let n = 1;
const mus: string[] = [];
segs.forEach(([s, e, file, fi, fo], k) => {
  inputs.push('-stream_loop', '-1', '-i', path.join(ROOT, 'audio', file));
  const L = e - s;
  let c = `[${n}:a]atrim=0:${L.toFixed(3)},asetpts=PTS-STARTPTS,volume=${MUSIC_DB}dB`;
  if (fi) c += `,afade=t=in:d=${fi}`;
  if (fo) c += `,afade=t=out:st=${(L - fo).toFixed(3)}:d=${fo}`;
  c += `,adelay=${Math.round(s * 1000)}:all=1[m${k}]`;
  f.push(c); mus.push(`[m${k}]`); n++;
});
f.push(`[0:a]asplit=2[voice][sc]`);
if (mus.length) {
  f.push(`${mus.join('')}amix=inputs=${mus.length}:normalize=0:duration=longest[mraw]`);
  f.push(`[mraw][sc]sidechaincompress=threshold=0.03:ratio=4:attack=80:release=600[music]`);
}
const sfx = (file: string, times: number[], db: number, tag: string) => {
  if (!times.length) return null;
  inputs.push('-i', path.join(ROOT, 'audio', file));
  const outs = times.map((_, i) => `[${tag}${i}]`);
  f.push(`[${n}:a]volume=${db}dB,asplit=${times.length}${outs.join('')}`);
  times.forEach((t, i) => f.push(`[${tag}${i}]adelay=${Math.round(t * 1000)}:all=1[${tag}d${i}]`));
  f.push(`${times.map((_, i) => `[${tag}d${i}]`).join('')}amix=inputs=${times.length}:normalize=0:duration=longest[${tag}]`);
  n++;
  return `[${tag}]`;
};
const parts = ['[voice]', mus.length ? '[music]' : null, sfx('sfx_page_turn.mp3', turnsV, TURN_DB, 'pt'), sfx('sfx_pen_tick.mp3', ticksV, TICK_DB, 'tk')].filter(Boolean);
f.push(`${parts.join('')}amix=inputs=${parts.length}:normalize=0:duration=first,alimiter=limit=0.95[a]`);

await $`ffmpeg -hide_banner -loglevel error -y ${inputs} -filter_complex ${f.join(';')} -map 0:v -map [a] -c:v copy -c:a aac -b:a 320k ${out}`;
console.log(`wrote ${out}: ${segs.length} music segments, ${turnsV.length} page turns, ${ticksV.length} pen ticks`);
