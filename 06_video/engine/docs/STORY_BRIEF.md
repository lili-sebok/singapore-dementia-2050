# Brief for data-story section authors (sections 2 to 4, closing)

The video is a 10-minute university group-project explainer (NUS HS1502): how many people in Singapore will have dementia in 2030 and 2050. It is rendered by a deterministic WebGL engine in `app/` (TypeScript, three.js, bun, Vite). Project root: `06_video/engine` in the repo.

The video has two registers. You are building the **data story** register (paper, ink, one teal accent, charts that grow out of each other, no red pen). The AI comparison section (plates `open` ... `verdict`) is the other register (the "marking session" with a red pen); it is finished, do not touch it.

## Read first, in this order

1. `06_video/plates.md`: the spec. Read "Two registers", "Transitions", and your section's plates. The dot crowd is the thread that runs through the research (see "The dot crowd"); the beats written for sections 2 to 4 predate it, so your brief below says where to follow the dots instead.
2. `app/src/scenes/_story.ts`: base class `StoryScene` (paper, one Canvas2D layer, an in-section `Camera`, the page turn that brings the section in) and helpers (`sectionHead`, `label`, `sourceLine`, `countUp`, `typeText`, `TEAL`).
3. `app/src/scenes/demographics.ts`: section 1, the finished reference for this register. Match its quality, idiom and dot style. Note how it lays the section out as one sheet with regions, moves the camera between them in pauses, cues every beat to narration words, and batches dots by colour.
4. `app/src/scenes/opening.ts`: a second, simpler reference.
5. `app/src/scenes/_kit.ts`: `text`, `hair`, `ruleOn`, `hatchRect`, `ruledBox`, `measureText`, `col()`/`span()` grid, `TYPE` presets, `cue`/`cueEnd`, `C` palette, `Pen` (closing only).
6. `app/src/data.ts`: every figure allowed on screen (MOH, POP, PREV, PROJ, PA, CLOSE, CREDITS, Q2). Import from it.
7. `docs/AGENT_BRIEF.md`: rules written for the AI-section authors. Its rules on determinism, cues, text, em dashes, safe area and checking apply to you too. Its style rules about Sonnet/Gemini and screens do not.
8. Narration: `06_video/narration.txt` (`# plate` headers, one sentence per line). Word times: `data/lyrics.json`. Plate windows: `data/audio.json` `sections`.

## How a section scene works

- One file `app/src/scenes/<id>.ts`, default export a class extending `StoryScene`, `override init()` to compute cue times into `this.t` and set `this.cam`, and `draw(c, t)` to draw the sheet (camera already applied; call `this.screen(c)` to draw in screen space). The timeline (`app/src/timeline.ts`) already has an entry for your id; it starts loading your scene as soon as the file exists.
- Your window is `this.ctx.start` to `this.ctx.end`. It starts about 0.95 s before your first plate (the page turn over the previous section plays during that time, handled by the base class). Have the section label and heading already on the page at `this.ctx.start` so the turn reveals them, as demographics.ts does.
- Every beat is anchored to a narration word with `cue(ly, '<distinctive start of the line>', '<word>')`. Never hard-code seconds. `cue(ly, line, 0)` is the line's first word.
- Camera moves happen in pauses between plates (0.8 to 1.3 s, keys ending just before the next plate's first word). Use regions of one large sheet, like section 1. Slight push-ins are fine; keep text inside the frame and the safe area (x 120 to 1800, y 110 to 970 in screen space).

## Style (enforced)

- Paper ground, ink type, graphite secondary text, hairline rules. One accent: `TEAL` (#1F6F6B), one highlighted thing at a time. No red, no pen (except the single closing tick), no glow, gradients, shadows, rounded cards, logos, emoji, particles or decorative motion.
- Fonts via `TYPE`: `display` for headings and big figures, `label` for small spaced caps, `body` for prose, `mono` for data, formulas and sources.
- Scenarios by line style, everywhere: rates constant **solid**, half-pace decline **dashed** `[14, 9]`, decline continues **dotted** `[2, 7]` (title.ts uses these). The highlighted scenario at a moment takes the teal.
- Dots: same look as section 1. Ink `C.ink` or `TEAL`, radius 3.1 on a 9 px pitch in crowds and blocks (12 rows deep, filled column by column), or larger (radius 6 to 8) when a grid of 100 stands for percentages. Batch fills by colour as demographics.ts does (thousands of arcs per frame otherwise get slow). Dots move by staggered, eased flights (copy `flight()`), never pop.
- Motion: holds, then decisive eased moves; things appear on their cue and stay put.
- No em dash character (U+2014) anywhere on screen. En dashes in ranges (60–74) are fine. Thousands separators on every number.
- Every chart or figure group gets a source line at the foot of its region (`sourceLine`).

## Numbers

Use only figures in `data.ts`, the plates.md spec, or computed here from them. If you compute a figure (a dot count, a ratio), compute it in code from data.ts values with a comment, and list it in your final report. Figures already checked:

- 2023 population 60+ by age group in dots (1 dot ≈ 1,000 people): 790, 209, 72 (from POP.byBand[2023] / 1,000).
- At the 2023 WiSE rates those contain 24, 38, 35 people with dementia in dots (3.0% of 790, 18.2% of 209, 48.6% of 72), 97 in all, matching the model's 96,694 cases in 2023.
- 2030 at constant rates: 27, 61, 49 dots of cases (Q2.y2030.cases / 1,000), 137 in all (137,087).
- Scenario prevalence per age group a in year y: p(a, y) = p2023(a) × (1 + f × r(a))^(y − 2023), with r(a) = (p2023(a) / p2013(a))^(1/10) − 1, f = 0 (rates constant), 1 (decline continues), 0.5 (half-pace decline). This reproduces PROJ exactly (verified). Between 2023, 2030 and 2050 you may compute intermediate years with this formula and PROJ's populations only at 2023, 2030 and 2050; for case lines, draw straight segments 2023 → 2030 → 2050 through PROJ's values (we have no population for other years).

## Rules

- Create or edit only your own file(s): `app/src/scenes/<id>.ts` and helpers `app/src/scenes/<id>-*.ts`. Do not edit `_story.ts`, `_kit.ts`, `data.ts`, `timeline.ts`, the engine, docs, narration or other scenes. Need a helper from demographics.ts or a kit change? Copy it into your file and say so in your report.
- Pure function of `t`: no `Math.random`, no `Date.now`. Use `hash` from `../engine/util` for per-dot variation.
- Other agents are building other sections at the same time. Renders start their own private servers, so that is fine. Always pass `--only <id>` to renders so other agents' half-written scenes are not loaded.

## Checking (do this many times)

```sh
cd 06_video/engine/app
export CHROME_PATH="$HOME/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
bunx tsc --noEmit -p tsconfig.json 2>&1 | grep 'scenes/<id>'
bun scripts/render.ts sheet --times a,b,c,... --cols 4 --only <id> --out ../out/wip/<id>/sheet.png
bun scripts/render.ts stills --t a,b --only <id> --out ../out/wip/<id>
```

Look at the images with the Read tool: at every cue, mid camera move, during the page turn (first second of the window), and at the end of every plate (the last 0.2 s before the next plate starts). Fix overlaps, cramped or empty layouts, text off the grid, things that pop in, anything that looks generic. A section-1 still for comparison: render `--only demographics` at a few times between 33 and 113. The render prints `SCENE ERRORS` if your scene throws. A favicon 404 in the browser log is harmless.

## Final report

Reply with: files created; each plate as built and which cue drives each beat; any departure from plates.md and why; every computed figure; anything you could not source from data.ts (leave it out rather than invent it); the paths of your last contact sheets.
