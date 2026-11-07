# Video engine

Everything needed to render the group video from `06_video/narration.txt`. Each frame is computed from the time `t` alone, in a web app (TypeScript, three.js, bun, Vite) that headless Chrome renders and pipes into ffmpeg.

## Licence

The engine is adapted from [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video), MIT licence, copyright 2026 Giacomo Magnanini: see `LICENSE`, which applies to the engine code and must stay with it. Our scenes, data and tools are built on top of it.

Fonts in `app/public/fonts/`:

- Archivo, Cormorant Garamond and IBM Plex Mono are under the SIL Open Font License; the licence text for each is in `OFL-*.txt`.
- The single-stroke SVG fonts in `stroke/` (EMS under the OFL, plus the Hershey fonts) carry their own licence and attribution in each file's header.

## Layout

- `app/`: the engine (`src/engine/`), the scenes (`src/scenes/`, one per section or plate), the timeline (`src/timeline.ts`) and every figure shown on screen (`src/data.ts`; scenes never type numbers). `scripts/render.ts` renders stills, contact sheets, sound cues and the video.
- `tools/`:
  - `align.ts` and `whisper_words.py` time the narration;
  - `mix.ts` lays music and sound effects under a render;
  - `narration.ts` makes a macOS `say` scratch track.
- `audio/`:
  - `voice/full_v2_1.35x.mp3`: the ElevenLabs narration take;
  - `narration.mp3`: that take with timing pauses added, written by `align.ts`;
  - the two music beds and the two sound effects.
- `data/`: word and plate timings (`lyrics.json`, `audio.json`, written by `align.ts`) and sound cues (`sfx.json`).
- `docs/`:
  - `TREATMENT.md`: style for the AI comparison section;
  - `AGENT_BRIEF.md` and `STORY_BRIEF.md`: rules for writing scenes;
  - `ENGINE.upstream.md`: the upstream engine guide.
- The plate specs are in `06_video/plates.md`.
- `out/`: renders. Git ignores it; share the finished video separately.

## Rendering

You need [bun](https://bun.sh), ffmpeg and a Chromium build for headless rendering, such as Playwright's Chrome for Testing. Re-timing also needs [uv](https://docs.astral.sh/uv/), which fetches faster-whisper on first use.

```sh
cd 06_video/engine/app
bun install
export CHROME_PATH="<path to the Chrome for Testing binary>"

# re-time after editing 06_video/narration.txt or recording a new voice take
(cd .. && LEAD=6.0 HOLD=1.0 TAIL=7.5 bun tools/align.ts audio/voice/full_v2_1.35x.mp3)

# check frames
bun scripts/render.ts stills --t 40,120 --out ../out/stills

# full video, then sound
bun scripts/render.ts video --samples auto --shutter 0.2 --out ../out/full_raw.mp4
bun scripts/render.ts events
(cd .. && bun tools/mix.ts out/full_raw.mp4 out/full.mp4)
```

The full render took about 13 minutes on an M5 Pro MacBook (35,451 frames in 786 s).
