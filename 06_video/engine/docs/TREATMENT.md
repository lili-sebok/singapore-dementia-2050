# AI comparison section: treatment and style bible

Version 2, 2026-10-23. Replaces the first script (`05_ai_comparison/video_script.md`). Owner: Jacob. Length about 2:40 of a 10-minute group video. Built on the WebGL engine in `app/` (adapted from mexicat/pdoom-video, MIT); see `docs/ENGINE.md`.

## The idea in one paragraph

The section is staged as **a marking session**. The two AI systems are candidates sitting the same paper; their answers arrive on a dark screen (the machine's voice), get printed onto paper as transcripts, and are **marked by a red pen** (the human check). The pen is the one recurring character: a single red nib dragging a hairline that ticks, strikes through, circles, underlines, draws arrows to the margin and writes short margin notes in a single-stroke hand. It is the visual form of the section's conclusion: every number was checked against the original source. Everything else is typeset like a scientific paper or exam script: Swiss-grid layout, hairline rules, engraved charts, small mono annotations. The light/dark rhythm carries meaning: **dark = the AI speaking, paper = us checking**.

## What this must not look like

The first version read as generic "AI video": dark gradient backgrounds, floating glowing orbs, frosted-glass cards, neon glows on numbers, a 3D monolith for each AI, emoji pins, a stock skyline. All of that is gone. Specifically:

- No glow on text or numbers. Bloom is effectively off except a faint warmth on the red pen nib.
- No gradients for decoration, no glassmorphism, no drop shadows on cards, no rounded "app UI" cards.
- No brand logos, no imitation of real chat-product UIs (no ChatGPT/Claude/Gemini interface chrome). The dark screen is a plain terminal-like field with mono text.
- No robots, brains, circuits, sparkles, particle fields, stock imagery, emoji, cartoon faces.
- No centred-everything layouts except where the composition is the point (the final line).
- No colour-coding the two systems with saturated hues. They are distinguished by **label and fill pattern**: Sonnet is solid ink, Gemini is engraved hatching. This also survives greyscale and colour-blind viewing.
- Motion is purposeful: holds, then decisive eased moves (outExpo, inOutCubic). Nothing drifts or bobs for its own sake.

## Palette

Paper plates (most of the video):

- **paper** `#EEE9DF` background, with very subtle fibre texture and a slight vignette (printed, not glossy).
- **ink** `#16161A` type and line work.
- **graphite** `#6B6760` secondary text, gridlines, captions.
- **rule** `#C9C2B4` hairlines and table rules on paper.
- **pen** `#C8301E` the red pen: only the checker uses it (ticks, strikes, circles, margin notes, marks out of 100). Nothing else is red.

Screen plates (the AI's answers):

- **screen** `#0E0F11` background, **screen-text** `#D9D4CA` mono text, **screen-dim** `#6E6A63`.

One semantic exception: the official MOH figure **152,000** is set in ink inside a thin ruled box everywhere it appears (a "quoted official figure" device), never coloured.

## Type

- **Archivo** (grotesk): headings, labels, big numbers. Tight, confident; use width (condensed for long labels) rather than size jumps.
- **IBM Plex Mono**: everything the AI wrote (quotes, transcripts), data tables, prompt text, small annotations.
- **Cormorant Garamond italic**: rare; the examiner's typeset remarks and the final line's emphasis word only.
- **Single-stroke hand (`hscript` or `script` in `stroke.ts`)**: the red pen's margin notes, written in sync with the pen.
- Typographic punctuation in display text (’ “ ” – ×). Mono keeps straight quotes for AI output.
- Numbers always with thousands separators. Lining figures.

## Motifs

1. **The red pen.** A small nib (a short dark-red capsule with a bright point) that moves along a path, leaving a hairline in `pen`. Strokes are written, never popped in. Ticks are two-segment strokes; strikes are slightly irregular single strokes; circles are hand-wobbly ellipses that overshoot their start. Margin notes are written in the single-stroke hand at about 70 to 90 px cap height. The pen enters and leaves the frame between marks rather than teleporting.
2. **The transcript.** An AI answer first appears on the dark screen, typed token by token (fast, ~60 chars/s, mono). On the cut to paper it is shown as a printed transcript block: a mono quote with a small header line `CANDIDATE B · GEMINI 3.8 FLASH · 6 OCT 2026` and a left hairline. The pen marks on the transcript.
3. **The candidate labels.** `A  Claude Sonnet 5.5` and `B  Gemini 3.8 Flash` in a fixed small style (Archivo 700 caps letter + name). Sonnet's marks in charts are solid ink; Gemini's are hatched ink (`engrave`/`hatch` in GLSL or Canvas2D hatching).
4. **Marks out of 100.** Scores are written by the pen in the margin as `51.3` with a short underline and a small printed `/100`. Never animated counters spinning up.
5. **The ruled box** around official figures (152,000; 73,918 when it is the published count).

## Narration (scratch track: macOS `say`, voice Daniel; replace with the real recording)

The narration lines below are the source for `06_video/narration.txt`; each line is one timing line. Scene windows in `src/timeline.ts` are anchored to these lines by their first words, so edits here move the edit automatically after re-running `tools/narration.ts`.

| Plate | Narration |
|---|---|
| open | We put the same questions to two AI systems, word for word. Then we checked every answer against the original source. |
| setup | The candidates: Claude Sonnet and Gemini Flash, each company's mid-tier model. Same conditions every time: a new chat, the identical prompt, no web search, and no sight of our answer. |
| recall | Question one, from memory. Gemini gave the Ministry of Health's 2030 projection as its answer for 2050. Sonnet credited the Ministry with eighty thousand by 2030, and didn't seem to know the 2023 survey existed. |
| arith | Question two came with our data. Both did the arithmetic perfectly: 137,087 people in 2030, and 295,653 in 2050. Exactly our figures. |
| judge | The difference was judgement. Gemini never checked its method against the published 2023 count. Sonnet did, blamed the gap on non-residents, and cut its answer by about a quarter. The real cause is the survey's own base, about seventeen per cent smaller than the resident population. |
| rerun | Eight days later we set the same question again. Gemini's answer came back almost word for word. Sonnet's score moved nineteen and a half points, more than the gap between the two systems. One run proves very little. |
| prompt | A more detailed prompt raised both scores. But under every prompt, Sonnet gave the same rescaled answer. The checklist got them to cover the right points. It didn't get them to make the right call. |
| moh | Question three: what would it take to reach the official 152,000 for 2030? Ageing alone gives growth of 1.42 times. 152,000 needs 2.06. Sonnet concluded it couldn't be reproduced from the data. Gemini found the right numbers, then described a rise as a decline. |
| audit | Asked to cite their figures, both mostly said they didn't know, which is honest. The mistakes were in the extra detail: a table number and a confidence interval that aren't in the source. |
| verdict | Sonnet finished ahead overall, but the lesson is the same for both. Reliable at arithmetic. Unreliable at judgement and recall. And the most damaging errors were the confident ones. Checking against the original source caught a mistake in every system we tested. |

## Plates

Each plate lists what is on screen, beat by beat, keyed to narration words. "→ word" means the action lands on that word's start. All figures come from the data block at the end; scene code must use `app/src/data.ts`, never retype numbers.

### open (screen → paper)

- Black screen field. A mono prompt line types at the top-left of a 12-column grid: `> How many people in Singapore will have dementia in 2050?` (typed fast, cursor block).
- Two answer slots open below it, labelled `A` and `B`, each a thin rule with a blinking cursor. → "word for word": the identical prompt is duplicated into both slots (a hard copy, the line jumps twice).
- → "Then we checked": the screen field slides up and away like a page being pulled, revealing paper beneath. The red pen enters and draws one long horizontal underline across the paper, which becomes the first rule of the next plate.

### setup (paper)

- An exam cover sheet, typeset: title `PAPER: SINGAPORE DEMENTIA, 2030 AND 2050`, a two-row table `CANDIDATE A  Claude Sonnet 5.5  Anthropic  mid-tier, low reasoning effort` / `CANDIDATE B  Gemini 3.8 Flash  Google  mid-tier, low reasoning effort`. Rows type in on "The candidates".
- `CONDITIONS` list of four lines: `new chat for every run`, `identical prompt, pasted verbatim`, `no web search`, `never shown our answer`. → each condition as it is spoken: the pen ticks it in the left margin.
- `QUESTIONS` list on the right column, small: `1 Cold recall`, `2 Build the projection`, `2b Same question, eight days later`, `2c Three prompt versions`, `3 Reverse-engineer 152,000`, `4 Citation audit`. Visible but unmarked.
- Footer in small mono: `marked on a written rubric: modelling decisions, arithmetic, recalled facts`.

### recall (screen → paper)

- Screen: `QUESTION 1 · FROM MEMORY` then candidate B's answer types: `"...it is estimated that approximately 152,000 people in Singapore will have dementia by the year 2050."`
- → "Gemini gave": cut to paper; the same quote appears as a printed transcript block in the right half. The pen circles `2050`, draws an arrow out to the margin and writes `2030 figure`. Below it a small timeline (2023, 2030, 2050) in ink hairline: the ruled-box `152,000` sits at 2030; a dashed ink arc shows it being moved to 2050.
- → "Sonnet credited": candidate A's transcript block types into the left half: `"...projections of about 80,000 people with dementia by 2030."` The pen strikes `80,000` and writes `MOH: 152,000` above it. Small printed line under it: `knowledge appears to predate the 2023 survey`.
- End: pen writes the marks: A `51.3`, B `25.0`, each `/100`.

### arith (paper)

- A worked calculation set as a ledger table: rows 60–74, 75–84, 85+; columns population (UN WPP 2024), prevalence (WiSE 2023), cases. Year 2030 first: `900,014 × 3.0% = 27,000`, `337,242 × 18.2% = 61,378`, `100,223 × 48.6% = 48,708`, total `137,087`. Rows fill in one after another as a plotter would write them (mono digits appearing left to right, fast).
- → "295,653": the 2030 column slides left and the 2050 column fills: `1,244,081 × 3.0% = 37,322`, `541,417 × 18.2% = 98,538`, `328,792 × 48.6% = 159,793`, total `295,653`.
- Two narrow columns at the right: `A` and `B`, each showing their stated totals `137,087` and `295,653`. → "Exactly our figures": the pen ticks both, twice each.

### judge (paper)

- Top: a question in Archivo: `Does the method reproduce the published 2023 count?` with the published `73,918` in a ruled box, and the same method applied to 2023, `96,694`, in mono (31% higher).
- → "Gemini never checked": under B, an empty check box is drawn by the pen and left empty; a small printed note `never checked; headline kept at 137,087`.
- → "Sonnet did": under A, the pen ticks the check box; A's transcript appears (verbatim): `"Applying the 2023 rates to the UN 2023 counts gives about 96,700 cases, but the study published 73,918."` then `"The UN figures likely include non-residents, or otherwise differ in coverage."` A's 2030 figure `137,087` is multiplied visibly `× 0.765` to `about 105,000` (2050: `about 226,000`). → "non-residents": the pen strikes `non-residents` and writes `wrong cause`.
- → "The real cause": a two-bar engraved chart, full width: `Resident population aged 60+, 2023 (SingStat)  1,011,631` solid ink bar; `WiSE survey-weighted base  838,800` hatched bar. The difference is bracketed with a hairline and labelled `about 17% smaller`. The pen underlines `17%`.

### rerun (paper)

- Two transcript sheets per candidate, dated `6 OCT` and `14 OCT`, offset like papers on a desk (flat, no perspective tricks, a 1 px rule for the paper edge, no shadow).
- → "almost word for word": B's two sheets slide together and align exactly; the overlap shows no difference (a small printed `diff: no change in score`). Scores `56.9` and `56.9` written by the pen.
- → "nineteen and a half points": A's sheets stay apart; scores `62.0` and `81.5`; a vertical dimension line (engineering-drawing style, arrowheads, extension lines) between the two heights reads `19.5`. Beside it, a much shorter dimension line for the gap between A and B in the first run reads `5.1`.
- → "One run proves very little": the pen underlines the line, typeset small: `single-run differences between systems are not reported as real`.

### prompt (paper)

- Three prompt cards across the top, typeset as plain ruled boxes with mono text: `V1 minimal: the question and the data`, `V2 standard: "...produce estimates for 2030 and 2050 and explain your method."`, `V3 guided: "You are an epidemiologist..."` plus a seven-line checklist (`assumptions`, `method`, `check 2023 against the published count`, `judge the 2013–2023 change`, `range of estimates`, `headline choice`, `limitations`).
- A slope chart drawn as a pen plotter would: hairline axes 40 to 90, x positions V1, V2, V3. A: `46.9`, `62.0–81.5` (shown as a vertical range bar at V2), `79.8`, solid ink line and points. B: `43.5`, `56.9`, `76.5`, hatched/dashed ink line with open points.
- → "the same rescaled answer": beside each of A's three points, a small mono tag `about 105,000` appears in identical position relative to the point; the pen circles all three tags with one continuous loop.
- → "make the right call": typeset line below the chart: `The checklist fixed coverage, not judgement.` with *judgement* in Cormorant italic.

### moh (screen → paper)

- Screen: `QUESTION 3 · WHAT WOULD PRODUCE THIS?` and the ruled-box `152,000 (2030)` typed in mono.
- → "Ageing alone": cut to paper. A horizontal scale from the 2023 baseline: two measured bars drawn like ruler readings from the same zero: `× 1.42  ageing alone` (solid) and `× 2.06  what 152,000 needs` (outline only, unfilled); the gap between their ends is hatched and labelled `rising rates, or a different base`.
- → "Sonnet concluded": A's transcript: `"I could not find a reasonable set of assumptions in this data that gives 152,000 in 2030"`. Pen tick.
- → "Gemini found": B's transcript: `"...assuming a slight continued decline in age-specific rates..."`. → "a rise as a decline": the pen strikes `decline` and writes `rise` above it, with a small upward arrow.
- Marks written: A `71.3`, B `59.8`.

### audit (paper)

- Five index-card rows in a ruled table (not floating cards): `WiSE 2023, 60–74`, `WiSE 2023, 75–84`, `WiSE 2023, 85+`, `Residents aged 60+, 2023`, `Relative risk, inactivity`. Columns A and B.
- → "didn't know": cells fill with a small mono stamp `I don't know` for: A rows 1–4, B rows 1–3. → "which is honest": the remaining cells (A row 5; B rows 4 and 5) show the given value and the pen ticks them (A: `about 1.4`, Lancet Commission 2020; B: `about 1,010,000`; `1.40`, Lancet Commission 2020).
- → "extra detail": a second, narrower table `VOLUNTEERED DETAIL` slides in below: B `Table A1` → pen strikes and writes `T3`; B `95% CI 1.16–1.68` → pen strikes and writes `not in source`.
- Footnote, graphite, small: `Even the strongest model tried, Mythos 5.1 at max effort, said the 2024 Lancet Commission kept a relative risk of 1.4. It moved to 1.2.`

### verdict (paper)

- `SYSTEM SCORE (mean of four tasks, /100)` with two horizontal bars: A solid `53.6`, B hatched `45.4`. Values written by the pen.
- Caveat block in small graphite type, ruled left: `One scorer so far. Few runs per task, so gaps of a few points are noise. Scores drafted with Claude Code, an Anthropic model, and checked by hand; a blind second scorer is pending.`
- → "Reliable at arithmetic": the score block clears to blank paper; three typeset lines arrive one per sentence, left-aligned on the grid at large size: `Reliable at arithmetic.` / `Unreliable at judgement and recall.` / `The confident errors did the most damage.`
- → "Checking against the original source": the pen draws one final long tick in the margin, then writes `checked` beneath it. Hold 1 s on paper, cut to black.

## Production notes

- **Narration**: scratch track from macOS `say` (Daniel, en-GB) with proportional word timing. When the real voiceover exists: put it at `audio/narration.mp3` and re-run `bun tools/narration.ts --audio audio/narration.mp3` (forced alignment with Whisper) so every cue follows the real voice.
- **Generative AI requirement**: the video as a whole must use at least one generative AI tool. This section was built with Claude Code; if the group wants a generative asset in this section specifically, the cleanest option is an AI voice for the narration, disclosed in the credits. No AI-generated imagery is planned here.
- **Accuracy**: every figure on screen comes from `05_ai_comparison/results.md` and the run logs, collected in `app/src/data.ts`. Paraphrases are marked as paraphrases on screen; verbatim quotes are verbatim.

## Data block (single source: `app/src/data.ts`)

See `app/src/data.ts`. It holds every number and quote used on screen with its source file.
