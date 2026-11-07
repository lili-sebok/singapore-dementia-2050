// Builds the narration timing data the engine reads, from 06_video/narration.txt.
//   bun tools/narration.ts            scratch track: macOS `say` per line, word timing proportional to length
// Writes audio/narration.mp3, data/lyrics.json (lines with word timings) and data/audio.json
// (a silent 100 BPM beat grid plus one section per plate, so the engine's beat helpers still work).
// Replacing the scratch track with a real recording: align it with Whisper (word timestamps) and write
// the same data/lyrics.json shape; the timeline anchors to line text, so scenes follow automatically.
import { $ } from 'bun';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const VOICE = process.env.VOICE ?? 'Daniel';
const RATE = Number(process.env.RATE ?? 172); // words per minute for `say`
const LEAD = 0.6, LINE_GAP = 0.32, PLATE_GAP = 0.85, TAIL = 1.6;
const tmp = path.join(ROOT, 'audio/.work');
mkdirSync(tmp, { recursive: true });

const plates: { name: string; lines: string[] }[] = [];
for (const raw of readFileSync(path.join(ROOT, '../narration.txt'), 'utf8').split('\n')) {
  const l = raw.trim();
  if (!l) continue;
  if (l.startsWith('#')) plates.push({ name: l.slice(1).trim(), lines: [] });
  else plates.at(-1)!.lines.push(l);
}

async function dur(f: string) {
  return Number((await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${f}`.text()).trim());
}
// trim leading/trailing silence so word timing starts at the first sound
async function sayLine(text: string, i: number) {
  const aiff = path.join(tmp, `l${i}.aiff`), wav = path.join(tmp, `l${i}.wav`);
  await $`say -v ${VOICE} -r ${RATE} -o ${aiff} ${text}`.quiet();
  await $`ffmpeg -loglevel error -y -i ${aiff} -af silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse -ar 48000 -ac 1 ${wav}`;
  return { wav, d: await dur(wav) };
}

const lines: any[] = [], sections: any[] = [], parts: { wav?: string; silence?: number }[] = [];
let t = LEAD, li = 0;
parts.push({ silence: LEAD });
for (const [pi, p] of plates.entries()) {
  const ps = t;
  for (const [k, text] of p.lines.entries()) {
    const { wav, d } = await sayLine(text, li);
    const toks = text.split(/\s+/);
    const weight = toks.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + 1.5 + (/[,:;]$/.test(w) ? 2.5 : 0));
    const sum = weight.reduce((a, b) => a + b, 0);
    let x = t;
    const words = toks.map((w, j) => {
      const len = (weight[j]! / sum) * d;
      const o = { w, start: +x.toFixed(3), end: +(x + len * 0.92).toFixed(3) };
      x += len;
      return o;
    });
    lines.push({ i: li, plate: p.name, text, start: +t.toFixed(3), end: +(t + d).toFixed(3), words });
    parts.push({ wav });
    t += d;
    li++;
    const gap = k < p.lines.length - 1 ? LINE_GAP : pi < plates.length - 1 ? PLATE_GAP : TAIL;
    parts.push({ silence: gap });
    t += gap;
  }
  sections.push({ name: p.name, start: +ps.toFixed(3), end: +t.toFixed(3) });
}
const duration = +t.toFixed(3);

// concatenate with ffmpeg (silences generated as anullsrc segments)
const list: string[] = [];
for (const [i, part] of parts.entries()) {
  if (part.wav) list.push(`file '${part.wav}'`);
  else {
    const s = path.join(tmp, `s${i}.wav`);
    await $`ffmpeg -loglevel error -y -f lavfi -i anullsrc=r=48000:cl=mono -t ${part.silence} ${s}`;
    list.push(`file '${s}'`);
  }
}
writeFileSync(path.join(tmp, 'list.txt'), list.join('\n'));
await $`ffmpeg -loglevel error -y -f concat -safe 0 -i ${path.join(tmp, 'list.txt')} -c:a libmp3lame -b:a 192k ${path.join(ROOT, 'audio/narration.mp3')}`;

const bpm = 100, period = 60 / bpm;
const beats: number[] = [];
for (let b = 0; b * period < duration; b++) beats.push(+(b * period).toFixed(3));
writeFileSync(path.join(ROOT, 'data/lyrics.json'), JSON.stringify({ lines, notes: `scratch track: say -v ${VOICE} -r ${RATE}; proportional word timing` }, null, 1));
writeFileSync(path.join(ROOT, 'data/audio.json'), JSON.stringify({
  duration, bpm, beat_period: period, time_signature: 4, beats, downbeats: beats.filter((_, i) => i % 4 === 0),
  sections, fps: 100, rms: [], low: [], mid: [], high: [], vocal: [], drums: [], bass: [], other: [], onsets: {},
  notes: 'synthetic: silent beat grid for the engine helpers; sections = plates',
}, null, 1));
console.log(`duration ${duration.toFixed(1)} s, ${lines.length} lines`);
for (const s of sections) console.log(`${s.name.padEnd(8)} ${s.start.toFixed(1).padStart(6)} → ${s.end.toFixed(1).padStart(6)}  (${(s.end - s.start).toFixed(1)} s)`);
