// The edit. Windows come from the narration plates (data/audio.json, written by tools/align.ts), so
// re-timing the narration moves the edit. A data-story section is one entry spanning its plates (its
// camera moves between them inside the scene); it starts PAGE_TURN_DUR early so it can turn the page
// over the previous one. The AI comparison keeps one entry per plate, with hard cuts.
import type { TimelineEntry } from './engine/engine';
import type { SceneClass } from './engine/scene';
import type { Lyrics } from './engine/lyrics';
import type { AudioData } from './engine/audio';
import { PAGE_TURN_DUR } from './scenes/_story';

const modules = import.meta.glob<{ default: SceneClass }>('./scenes/*.ts');
const scene = (name: string) => () => {
  const m = modules[`./scenes/${name}.ts`];
  return m ? m() : Promise.reject(new Error(`scene module not found: scenes/${name}.ts`));
};

interface Entry { id: string; from: string; to: string; turn?: boolean }
export const ENTRIES: Entry[] = [
  { id: 'title', from: 'op-count', to: 'op-count' },
  { id: 'opening', from: 'op-count', to: 'op-question', turn: true },
  { id: 'demographics', from: 'dem-data', to: 'dem-caveat', turn: true },
  { id: 'prevalence', from: 'prev-define', to: 'prev-signif', turn: true },
  { id: 'projection', from: 'proj-method', to: 'proj-close', turn: true },
  { id: 'activity', from: 'pa-risk', to: 'pa-caveat', turn: true },
  ...['open', 'setup', 'recall', 'arith', 'judge', 'rerun', 'prompt', 'moh', 'audit', 'verdict'].map((p) => ({ id: p, from: p, to: p })),
  { id: 'closing', from: 'cl-range', to: 'cl-end', turn: true },
];

export function makeTimeline(ly: Lyrics, au: AudioData): TimelineEntry[] {
  const idx = (n: string) => {
    const i = au.sections.findIndex((x) => x.name === n);
    if (i < 0) throw new Error(`no narration plate '${n}'`);
    return i;
  };
  // where an entry's own content begins: its first plate, except the opening, which shares that plate
  // with the title card and begins just before the first word
  const startOf = (e: Entry) => (e.id === 'opening' ? ly.lines[0]!.start - 0.25 : au.sections[idx(e.from)]!.start);
  // only entries whose scene module exists (sections are built one at a time)
  const have = ENTRIES.filter((e) => modules[`./scenes/${e.id}.ts`]);
  const out: TimelineEntry[] = [];
  have.forEach((e, k) => {
    idx(e.to);
    const next = have[k + 1];
    const start = k === 0 ? 0 : startOf(e) - (e.turn ? PAGE_TURN_DUR - 0.25 : 0);
    // an entry followed by a page turn stays on until the turn has finished
    const end = next ? startOf(next) + (next.turn ? 0.25 : 0) : au.duration;
    out.push({ id: e.id, load: scene(e.id), start, end });
  });
  return out;
}
