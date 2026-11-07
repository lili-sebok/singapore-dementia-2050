# Brief for scene authors

You are building plates for a ~2:30 explainer video section (a university group project comparing how two AI systems handled a dementia-projection task). The video is rendered by a deterministic WebGL engine (TypeScript + three.js, bun + Vite) in `app/`. The project root is `06_video/engine` in the repo.

## Read first (in this order)

1. `docs/TREATMENT.md`: the concept ("a marking session"), the style rules, the palette, the narration, and a beat-by-beat description of every plate. Your plates' sections are your spec.
2. `app/src/scenes/_kit.ts`: the shared kit. Use it: `Paper` ground, `Pen` (tick, strike, underline, circle, arrow, note, score), `text`, `typeOn`, `ruleOn`, `hair`, `hatchRect`, `ruledBox`, `candidate`, transcript helpers, `cue`/`cueEnd` for narration timing, the 12-column `col()`/`span()` grid and `TYPE` presets.
3. `app/src/scenes/setup.ts`: the reference plate. Match its quality bar and idiom (layout on the grid, small spaced caps labels in graphite, hairline rules, restrained motion, pen marks timed to narration words). Render it once to see it (command below) before you start.
4. `app/src/data.ts`: every number and quote allowed on screen. Import from it. Never type a figure into a scene, never invent or round differently, never paraphrase a quote that is given verbatim.
5. `docs/ENGINE.upstream.md`: the engine guide from the upstream project (scene API, determinism rules, Layer2D, FSPass, LineBatch, stills/sheet/video commands). Ignore its song-specific parts (lyrics karaoke rules, P(doom), beats as the main clock); here the "lyrics" are the narration lines in `data/lyrics.json`, and `this.ctx.lyrics.get('<words from a narration line>')` finds a line.

## Rules

- Only create or edit your own files: `app/src/scenes/<plate>.ts` and helpers named `app/src/scenes/<plate>-*.ts`. Do not edit `_kit.ts`, `data.ts`, `timeline.ts`, the engine, docs, or other plates. If you need a kit change, implement it locally in your helper file and say in your final report what you would move into the kit.
- A scene class default-exports from `app/src/scenes/<plate>.ts`, extends `Scene`, uses `override init()`, and fully overwrites `out` each frame (render `Paper` first, or fill the screen colour). Pure function of `f.t`: no `Math.random`, no `Date.now`.
- Timing: anchor every beat to narration words with `cue(this.ctx.lyrics, '<distinctive words of the line>', '<word>')`. Never hard-code seconds. Your plate's window is `this.ctx.start` to `this.ctx.end` (from `data/audio.json` sections). The narration timing is a scratch track and will be re-timed later to a real voice, so everything must follow the cues.
- Style (from the treatment, enforced): no glow, no gradients, no drop shadows on cards, no rounded app-style cards, no logos, no imitation of real chat UIs, no emoji, no particles, no decorative motion. Paper plates: paper ground, ink type, graphite secondary, rule hairlines. Only the pen is red. Sonnet (candidate A) is solid ink; Gemini (candidate B) is hatched ink (`hatchRect`) or outline. Screen plates (the AI speaking): fill `C.screen`, mono text in `C.screenText`, labels in `C.screenDim`; no pen on the screen.
- Text: Archivo for headings/labels/numbers (`TYPE.display`, `TYPE.label`, `TYPE.body`), IBM Plex Mono for anything an AI wrote, data tables and prompts (`TYPE.mono`), Cormorant italic only for a single emphasis word where the treatment says so. Never use an em dash (the character U+2014) in any on-screen text; en dashes in ranges (60–74) are fine. Thousands separators on every number (`fmt` in data.ts).
- Motion: holds, then decisive eased moves (`ease.outCubic`, `ease.outExpo`, `ease.inOutCubic`). Things appear on their cue and stay put. The pen writes marks; marks are never popped in. Leave the pen off-screen when it has nothing to do (the kit parks it automatically on long gaps).
- Keep content inside x 120 to 1800 and y 110 to 970 (the subtitle-free area; nothing important below y 980).
- Hard cuts between plates are the default (windows touch). If your plate starts on the screen and changes to paper, do that transition inside your plate.

## Checking your work

Render stills and LOOK at them with the Read tool. Do this many times: at every cue in your plate, plus the first and last 0.2 s of the window. Compare against `setup.ts` for quality. Fix overlaps, cramped spacing, text running off the grid, marks that miss their targets, anything that reads as generic or "AI-made".

```sh
cd 06_video/engine/app
export CHROME_PATH="$HOME/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
bunx tsc --noEmit -p tsconfig.json 2>&1 | grep 'scenes/<plate>'      # typecheck your files
bun scripts/render.ts stills --t 40.2,44.0,47.5 --only <plate> --out ../out/wip/<plate>
bun scripts/render.ts sheet --from <start> --to <end> --n 16 --cols 4 --only <plate> --out ../out/wip/<plate>/sheet.png
```

Section windows (seconds) are in `data/audio.json` under `sections`; read them there. Word times are in `data/lyrics.json`. A render prints `SCENE ERRORS` if your scene throws: read them. A 404 for a favicon in the browser log is harmless.

Other agents are rendering at the same time; each render starts its own private server, so that is fine. Do not run long fixed `sleep`s to wait for anything; renders are synchronous commands.

## Final report

When done, reply with: the files you created, a short description of each plate as built, which narration cues drive which beats, anything in the treatment you changed and why, kit changes you would make, and any figure or quote you could not find in `data.ts` (do not invent it; leave it out and report it).
