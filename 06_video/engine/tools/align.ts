// Re-times the video to a real voice recording.
//   bun tools/align.ts <recording>      one take reading 06_video/narration.txt top to bottom (any format ffmpeg reads)
//   bun tools/align.ts <folder>         one file per plate, named after its header: open.m4a, setup.m4a, ...
// Whisper (faster-whisper, small.en, local) transcribes the recording with a time for every word. Those words are
// matched against the script, so each script word gets the time it was actually said; words Whisper heard
// differently (numbers, names) take their time from the matched words either side. Writes the same files as
// tools/narration.ts: audio/narration.mp3, data/lyrics.json, data/audio.json. Plate breaks shorter than
// HOLD + CUT_LEAD get silence added, so every plate holds HOLD seconds (default 1.2, env HOLD) after its last
// word. The first run keeps the scratch track as audio/narration.scratch.mp3.
import { $ } from 'bun';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const PLATE_GAP = 0.85, TAIL = Number(process.env.TAIL ?? 1.6), CUT_LEAD = 0.25; // TAIL: silence after the last word (room for the credits)
const tmp = path.join(ROOT, 'audio/.align');
mkdirSync(tmp, { recursive: true });

const src = process.argv[2];
if (!src || !existsSync(src)) throw new Error('usage: bun tools/align.ts <recording | folder of per-plate files>');

const plates: { name: string; lines: string[] }[] = [];
for (const raw of readFileSync(path.join(ROOT, '../narration.txt'), 'utf8').split('\n')) {
  const l = raw.trim();
  if (!l) continue;
  if (l.startsWith('#')) plates.push({ name: l.slice(1).trim(), lines: [] });
  else plates.at(-1)!.lines.push(l);
}

// 1. one clean 48 kHz mono take: high-pass, loudness-normalised, silence trimmed at both ends
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse';
const clean = (i: string, o: string) => $`ffmpeg -loglevel error -y -i ${i} -af highpass=f=70,${{ raw: TRIM }},apad=pad_dur=0.3 -ar 48000 -ac 1 ${o}`;
const full = path.join(tmp, 'full.wav');
if (statSync(src).isDirectory()) {
  const files = readdirSync(src);
  const list: string[] = [];
  const gap = path.join(tmp, 'gap.wav');
  await $`ffmpeg -loglevel error -y -f lavfi -i anullsrc=r=48000:cl=mono -t ${PLATE_GAP} ${gap}`;
  for (const [i, p] of plates.entries()) {
    const f = files.find((x) => path.parse(x).name === p.name);
    if (!f) throw new Error(`no recording for plate "${p.name}" in ${src}`);
    const o = path.join(tmp, `p${i}.wav`);
    await clean(path.join(src, f), o);
    list.push(`file '${o}'`, `file '${gap}'`);
  }
  writeFileSync(path.join(tmp, 'list.txt'), list.join('\n'));
  await $`ffmpeg -loglevel error -y -f concat -safe 0 -i ${path.join(tmp, 'list.txt')} ${path.join(tmp, 'joined.wav')}`;
  await $`ffmpeg -loglevel error -y -i ${path.join(tmp, 'joined.wav')} -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 ${full}`;
} else {
  await clean(src, path.join(tmp, 'joined.wav'));
  await $`ffmpeg -loglevel error -y -i ${path.join(tmp, 'joined.wav')} -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 ${full}`;
}
// silence before the first word (env LEAD, default 0.6 s; 5 s leaves room for the title card)
const LEAD = Number(process.env.LEAD ?? 0.6);
const final = path.join(tmp, 'final.wav');
await $`ffmpeg -loglevel error -y -i ${full} -af adelay=${LEAD * 1000},apad=pad_dur=${TAIL} ${final}`;
let duration = Number((await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${final}`.text()).trim());

// 2. Whisper word timestamps, transcribed in chunks (tools/whisper_words.py; the script supplies a vocabulary prompt)
const w16 = path.join(tmp, 'w16.wav'), wjson = path.join(tmp, 'words.json');
await $`ffmpeg -loglevel error -y -i ${final} -ar 16000 -ac 1 -c:a pcm_s16le ${w16}`;
const script = plates.flatMap((p) => p.lines).join(' ');
await $`uv run -q --with faster-whisper --with numpy python ${path.join(ROOT, 'tools/whisper_words.py')} ${w16} ${wjson} ${script}`;
const heard: { w: string; s: number; e: number }[] = [];
// Whisper splits figures into "152" ",000" and "2" ".06": join them back into one word
for (const h of JSON.parse(readFileSync(wjson, 'utf8')) as typeof heard) {
  const prev = heard.at(-1);
  if (prev && /^[,.]\d/.test(h.w) && /\d$/.test(prev.w)) { prev.w += h.w; prev.e = h.e; }
  else heard.push(h);
}

// Whisper tends to start the first word after a pause too early; move such starts to where sound begins
const sil: { s: number; e: number }[] = [];
const sd = await $`ffmpeg -hide_banner -i ${w16} -af silencedetect=n=-40dB:d=0.25 -f null -`.nothrow().quiet();
let open = 0;
for (const m of sd.stderr.toString().matchAll(/silence_(start|end): ([\d.]+)/g)) {
  if (m[1] === 'start') open = Number(m[2]);
  else sil.push({ s: open, e: Number(m[2]) });
}
for (const h of heard) {
  const z = sil.find((q) => h.s >= q.s - 0.05 && h.s < q.e && q.e < h.e);
  if (z) h.s = z.e;
}

// 3. match script words to heard words (edit-distance alignment on normalised tokens)
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
type SW = { w: string; line: number; s?: number; e?: number };
const sw: SW[] = [];
const lineMeta: { plate: string; text: string }[] = [];
for (const p of plates) for (const text of p.lines) {
  for (const w of text.split(/\s+/)) sw.push({ w, line: lineMeta.length });
  lineMeta.push({ plate: p.name, text });
}
const A = sw.map((x) => norm(x.w)), B = heard.map((x) => norm(x.w));
const n = A.length, m = B.length;
const cost = new Float64Array((n + 1) * (m + 1)), back = new Uint8Array((n + 1) * (m + 1));
const at = (i: number, j: number) => i * (m + 1) + j;
for (let i = 1; i <= n; i++) { cost[at(i, 0)] = i; back[at(i, 0)] = 1; }
for (let j = 1; j <= m; j++) { cost[at(0, j)] = j * 0.5; back[at(0, j)] = 2; }
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
  const sub = cost[at(i - 1, j - 1)]! + (A[i - 1] === B[j - 1] ? 0 : 1.2);
  const del = cost[at(i - 1, j)]! + 1; // script word not heard
  const ins = cost[at(i, j - 1)]! + 0.5; // extra word heard (a retake, a filler)
  const best = Math.min(sub, del, ins);
  cost[at(i, j)] = best;
  back[at(i, j)] = best === sub ? 0 : best === del ? 1 : 2;
}
const matched = new Array<boolean>(n).fill(false);
for (let i = n, j = m; i > 0 || j > 0;) {
  const b = back[at(i, j)];
  if (i > 0 && j > 0 && b === 0) {
    if (A[i - 1] === B[j - 1]) { sw[i - 1]!.s = heard[j - 1]!.s; sw[i - 1]!.e = heard[j - 1]!.e; matched[i - 1] = true; }
    i--; j--;
  } else if (i > 0 && (j === 0 || b === 1)) i--;
  else j--;
}
// unmatched words: share the time between the matched neighbours, by length
for (let i = 0; i < n;) {
  if (matched[i]) { i++; continue; }
  let k = i;
  while (k < n && !matched[k]) k++;
  const t0 = i > 0 ? sw[i - 1]!.e! : LEAD, t1 = k < n ? sw[k]!.s! : duration - TAIL;
  const len = sw.slice(i, k).map((x) => norm(x.w).length + 1.5);
  const sum = len.reduce((a, b) => a + b, 0);
  let x = t0;
  for (let q = i; q < k; q++) {
    const d = (len[q - i]! / sum) * Math.max(0, t1 - t0);
    sw[q]!.s = x; sw[q]!.e = x + d * 0.92; x += d;
  }
  i = k;
}

// every line is said after a pause: snap its first word to the end of that pause and its last word to the
// start of the next one (fixes lines that open or close on a number Whisper wrote differently)
for (let li = 0; li < lineMeta.length; li++) {
  const ws = sw.filter((x) => x.line === li);
  const first = ws[0]!, last = ws.at(-1)!;
  const prevEnd = li > 0 ? sw.filter((x) => x.line === li - 1).at(-1)!.e! : 0;
  const before = sil.filter((q) => q.e > prevEnd - 0.3 && q.e < first.e! - 0.05).at(-1);
  if (before) first.s = before.e;
  const nextStart = li < lineMeta.length - 1 ? sw.find((x) => x.line === li + 1)!.s! : duration;
  const after = sil.find((q) => q.s > last.s! + 0.05 && q.s < nextStart + 0.3);
  if (after) last.e = after.s;
}

// every plate holds at least HOLD seconds after its last word: add silence at plate breaks that are shorter
const HOLD = Number(process.env.HOLD ?? 1.2);
const breaks: { at: number; add: number }[] = [];
for (let pi = 1; pi < plates.length; pi++) {
  const prev = sw.filter((x) => lineMeta[x.line]!.plate === plates[pi - 1]!.name).at(-1)!;
  const next = sw.find((x) => lineMeta[x.line]!.plate === plates[pi]!.name)!;
  const gap = next.s! - prev.e!;
  if (gap < HOLD + CUT_LEAD) breaks.push({ at: (prev.e! + next.s!) / 2, add: HOLD + CUT_LEAD - gap });
}
for (const x of sw) {
  const shift = breaks.filter((b) => b.at < x.s!).reduce((a, b) => a + b.add, 0);
  x.s! += shift; x.e! += shift;
}
const segs: string[] = [];
let from = 0;
breaks.forEach((b, i) => {
  segs.push(`[0]atrim=${from}:${b.at},asetpts=PTS-STARTPTS[a${i}]`, `aevalsrc=0:d=${b.add.toFixed(3)}:s=48000[z${i}]`);
  from = b.at;
});
segs.push(`[0]atrim=start=${from},asetpts=PTS-STARTPTS[a${breaks.length}]`);
const order = breaks.map((_, i) => `[a${i}][z${i}]`).join('') + `[a${breaks.length}]`;
const held = path.join(tmp, 'held.wav');
await $`ffmpeg -loglevel error -y -i ${final} -filter_complex ${segs.join(';') + ';' + order + `concat=n=${breaks.length * 2 + 1}:v=0:a=1`} ${held}`;
duration = Number((await $`ffprobe -v error -show_entries format=duration -of csv=p=0 ${held}`.text()).trim());
const scratch = path.join(ROOT, 'audio/narration.scratch.mp3');
if (!existsSync(scratch)) copyFileSync(path.join(ROOT, 'audio/narration.mp3'), scratch);
await $`ffmpeg -loglevel error -y -i ${held} -c:a libmp3lame -b:a 192k ${path.join(ROOT, 'audio/narration.mp3')}`;

// 4. lines, sections (each plate cuts in just before its first word), and the same files narration.ts writes
const r3 = (x: number) => +x.toFixed(3);
const lines = lineMeta.map((lm, i) => {
  const ws = sw.filter((x) => x.line === i);
  return { i, plate: lm.plate, text: lm.text, start: r3(ws[0]!.s!), end: r3(ws.at(-1)!.e!), words: ws.map((x) => ({ w: x.w, start: r3(x.s!), end: r3(x.e!) })) };
});
const sections = plates.map((p, pi) => {
  const first = lines.find((l) => l.plate === p.name)!;
  const prevEnd = pi > 0 ? lines.filter((l) => l.plate === plates[pi - 1]!.name).at(-1)!.end : 0;
  return { name: p.name, start: pi === 0 ? 0 : r3(Math.max(prevEnd + 0.05, first.start - CUT_LEAD)), end: 0 };
});
sections.forEach((s, i) => (s.end = i < sections.length - 1 ? sections[i + 1]!.start : r3(duration)));

const bpm = 100, period = 60 / bpm;
const beats: number[] = [];
for (let b = 0; b * period < duration; b++) beats.push(r3(b * period));
writeFileSync(path.join(ROOT, 'data/lyrics.json'), JSON.stringify({ lines, notes: `voice: ${path.basename(src)}; word times from faster-whisper small.en` }, null, 1));
writeFileSync(path.join(ROOT, 'data/audio.json'), JSON.stringify({
  duration: r3(duration), bpm, beat_period: period, time_signature: 4, beats, downbeats: beats.filter((_, i) => i % 4 === 0),
  sections, fps: 100, rms: [], low: [], mid: [], high: [], vocal: [], drums: [], bass: [], other: [], onsets: {},
  notes: 'synthetic: silent beat grid for the engine helpers; sections = plates',
}, null, 1));

// 5. report: lines where Whisper heard something different from the script are worth a listen
console.log(`duration ${duration.toFixed(1)} s, ${lines.length} lines, ${matched.filter(Boolean).length}/${n} words matched`);
for (const s of sections) console.log(`${s.name.padEnd(8)} ${s.start.toFixed(1).padStart(6)} → ${s.end.toFixed(1).padStart(6)}  (${(s.end - s.start).toFixed(1)} s)`);
lineMeta.forEach((lm, i) => {
  const idx = sw.map((x, k) => [x, k] as const).filter(([x]) => x.line === i).map(([, k]) => k);
  const miss = idx.filter((k) => !matched[k]).map((k) => sw[k]!.w);
  if (miss.length / idx.length > 0.3) console.log(`check line ${i} (${lm.plate}): not heard as written: ${miss.join(' ')}`);
});
