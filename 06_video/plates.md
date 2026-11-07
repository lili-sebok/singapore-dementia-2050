# Plate specs: title, opening, sections 1 to 4, closing

What each new plate shows, beat by beat, for the rebuild. The AI comparison's ten plates are specified in [`ai_comparison/script.md`](ai_comparison/script.md) and are reused as they are. Narration: [`narration.txt`](narration.txt) (each `#` header starts a plate). "→ word" means the action lands when that word is spoken. Lengths are from the timed ElevenLabs voice (1.35x).

## Two registers, one production

The whole video shares a foundation, so it reads as one piece: paper background, ink type, the same fonts (Archivo for headings and figures, IBM Plex Mono for data and sources), the same 12-column grid, typeset charts with hairline rules, graphite for secondary text, and a small source line under every figure.

On top of that, the video has two registers:

**The data story (opening, sections 1 to 4, closing).** The research is told through charts that grow out of each other.

- **Charts lead.** Large, near full-width, given room to move. Fewer, bigger elements per plate than the AI section.
- **One continuous thread within a section.** Charts grow out of each other: the population pyramid collapses into three age groups, the prevalence bars split by age, the prevalence lines become case lines. The viewer follows one line of reasoning from people to cases.
- **The dot crowd: one dot is about 1,000 people aged 60+.** Section 1 builds the older population out of dots (1,070 for 2023, 2,114 for 2050, from the UN five-year rows divided by 1,000), and they carry through the research: in section 2 the share with dementia in each age group turns teal; in section 3 the teal dots gather into case counts against MOH's 152,000; in section 4 a few teal dots fade back for the cases avoided. Sections 2 to 4 are still to be built, so their beats below may change to follow the dots.
- **One accent colour: deep teal `#1F6F6B`.** It marks the single figure or element that matters at each moment (the 85+ bars, the 48.6% bar, the 2050 range). Everything else is ink and graphite. Teal is used sparingly: one highlighted thing at a time.
- **Scenarios by line style:** rates constant solid, half-pace decline dashed, decline continues dotted, everywhere, including the closing. The highlighted scenario at any moment takes the teal.
- **No red pen and no marking.** No ticks, circles, scores or margin notes here.
- **Motion:** smooth, continuous transforms (bars growing, shapes morphing, lines drawing) with eased timing; holds when a figure is spoken. Nothing drifts or decorates.

**Sound.** One instrumental music bed (ElevenLabs Music, "Quiet Inquiry", 2:30, looped) runs under the whole video, about 17 dB below the voice and ducked further while the narrator speaks. Page-turn and pen-tick sound effects to come.

**The marking session (section 5, AI comparison).** Unchanged: dark screens for the AI speaking, paper for us checking, and the red pen, which appears for the first time when this section starts. Red belongs only to this section (and one callback in the closing), so the switch itself says "now we check the machines".

Both registers avoid footage, stock images, logos, glows, gradients, emoji and cartoon faces. Where a teammate asked for one of these, the plate gives a drawn equivalent and says so.

## Transitions

- **Title card → opening.** The title card (below) turns over like the other sections' pages to reveal the opening.
- **Page turn between main sections.** Each new research section starts with a page turning over: the outgoing page lifts from the bottom-right corner, curls across in 3D with soft shading on the curl and a faint shadow on the page beneath, and lands to reveal the new section's page, already showing its label and heading. About 1.2 s, eased, spanning the pause between the two sections. Used for: opening → 1, 1 → 2, 2 → 3, 3 → 4, and the AI section's verdict → closing.
- **Camera moves between plates within a section.** Each research section is laid out as one large sheet, and its plates are regions of it. Between plates the camera glides to the next region (a pan of about one screen, sometimes with a slight push-in or pull-out, 0.8 to 1.0 s, eased in and out, with the engine's motion blur), so the previous plate's content slides off one edge as the next arrives from the other. Chart transforms carry on through the move where a chart continues (pyramid → age groups, prevalence lines → case lines).
- **Hard cut into the AI section.** Section 4 → the AI section's dark screen stays a hard cut: the change of register is the point. Inside the AI section the existing hard cuts stay.
- Transitions sit in the pauses between plates, so the narration timing is unchanged; each transition overlaps the end of one plate and the start of the next.

**Section labels:** each research section opens with a small label at top left, `1 · POPULATION`, `2 · PREVALENCE`, `3 · PROJECTION`, `4 · PHYSICAL ACTIVITY`, in the same style as the AI section's `QUESTION 2 · WITH OUR DATA`.

## Title card (about 6 s, no narration, before the first word)

- Fades up from black. Small labels: `HS1502 · CONCEPTUAL INTRODUCTION TO MACHINE LEARNING` top left, `NUS · NOVEMBER 2026` top right.
- The title rises into place line by line behind a mask: `Dementia in Singapore` in ink, `2030 and 2050` in teal. A rule draws under it.
- Subtitle: `Projecting cases, checking them against the Ministry of Health, and testing how two AI systems handle the same task.` Then the team's names.
- Lower right, faint: the three scenario lines from section 3 (solid, dashed, dotted) trace from 2023 to 2050, unlabelled except the two years.
- The page turns to the opening.

## Opening (2 plates, 0:28)

### op-count (0:11)
- Paper. Top left, small label `SINGAPORE · PEOPLE LIVING WITH DEMENTIA`.
- → "2023": `2023` at left, and under it `about 74,000` set large, counting in digit by digit.
- → "Ministry": a hairline draws from 2023 to the right; at its end `2030` and `152,000` in teal, set larger than 74,000 so the jump is felt. Source line: `Ministry of Health, written parliamentary answer, 4 Nov 2025`.

### op-question (0:17)
- → "older people": the two figures move up and shrink; a single hairline rises across the page from 2023 to 2050, unlabelled (section 1 gives the numbers).
- → "how many": the question types in large Archivo, centred: `How many people in Singapore will have dementia in 2030 and 2050?`
- → "We built": five short headings in a row under it, one per clause (built, tested, asked, compared): `Population`, `Prevalence`, `Projection`, `Physical activity`, `AI comparison`.
- Plate end: `Population` takes the teal; the page turns to section 1.

## 1. Population (Hong Ming, 4 plates, 1:21)

One sheet, three regions: the pyramid (A, top left), the age groups (B, top right), the caveat (C, below B). The camera zooms in on A for the 85+ beat, then pans A → B → C → B.

### dem-data (0:25)
- Label `1 · POPULATION`. Heading: `How is Singapore ageing?`
- In place of the skyline footage: the **population pyramid for 2023** builds from the bottom up (both sexes combined, ages on the axis). Under-60 rows are plain grey bars; the 60+ rows are made of dots, with the key `● = about 1,000 people aged 60+` and a `60+` bracket.
- → "SingStat": two source cards as plain ruled boxes beside the pyramid: `SingStat · resident population · history` and `United Nations · World Population Prospects 2024 · medium variant · projections by age, to 2050`.
- → "selected": the UN card takes the teal and the SingStat card dims.
- Plate end: the cards clear.

### dem-growth (0:23)
- → "According": the grey bars grow to their 2050 width over a 2023 outline.
- → "2.11 million": the 2023 dots spread out and about 1,044 new dots fall in from above, filling the 2050 shape; a large counter beside it, `PEOPLE AGED 60+`, runs from `1,070,430` to `2,114,290`. → "doubling": `≈ ×2` (2,114,290 / 1,070,430 = 1.98).
- → "85 and above": the camera zooms into the top of the pyramid; the heading and bracket fade. The 85+ dots turn teal; beside them `AGED 85+`, `72,078 → 328,792`. → "quadrupling": `×4.6`.

### dem-bands (0:14)
- → "three age groups": the camera pulls out and pans right while all 2,114 dots lift out of the pyramid in arcs and settle into three blocks: `60–74 · 1,244,081`, `75–84 · 541,417`, `85+ · 328,792` (85+ in teal).
- → "WiSE": a small tag on each block, `WiSE AGE GROUP`.

### dem-caveat (0:19)
- → start: the camera pans down. The dots that 2023 does not have fade out; the rest regroup into one 2023 crowd of 1,070.
- → "UN": `UN count 1,070,430`. → "non-residents": 58 dots at the edge of the crowd turn teal. → "Singapore residents": `SingStat residents 1,011,631` under the rest. → "Recognising": the teal dots lift away, labelled `about 59,000 more in the UN count: it includes non-residents` (1,070,430 − 1,011,631 = 58,799).
- → "Ultimately": the camera pans back up; the dots fly back into the 2050 blocks, with the note `More older people → more cases, even if rates fall` (`even if rates fall` in teal).
- Plate end: the page turns to section 2.

Source line: `UN World Population Prospects 2024 · SingStat`.

## 2. Prevalence (James, 4 plates, 1:22)

### prev-define (0:20)
- Label `2 · PREVALENCE`. Heading: `How common is dementia among older adults?`
- → "WiSE": a timeline with two marks, `WiSE 2013` and `WiSE 2023`, and the name spelled out: `Well-being of the Singapore Elderly`.
- → "prevalence": a definition set like a dictionary entry: **prevalence** · *the share of people in a population living with dementia*. Under it, a grid of 100 small ink dots; 9 fill teal (8.8% is about 9 in 100).

### prev-overall (0:13)
- → "10%": the dots gather into two vertical bars, `2013 10.0%` and `2023 8.8%`; a thin downward arrow between them.
- → "all age groups": the two bars split apart into the three slots.

### prev-bands (0:26)
- A grouped bar chart in the three slots: each age group has a 2013 bar (outline) and a 2023 bar (solid).
- → "60 to 74": that pair grows, `3.4%` and `3.0%`. → "75 to 84": `21.6%`, `18.2%`. → "85 and above": `56.2%`, `48.6%`. The group being spoken is teal; earlier ones return to ink.
- → "sharply with age": a hairline joins the tops of the 2023 bars, rising steeply left to right; `48.6%` stays teal.

### prev-signif (0:23)
- → "not statistically significant": the bars step back; the overall `10.0% → 8.8%` returns at top with `p = 0.298` and `not statistically significant` in a ruled box, `p = 0.298` in teal.
- → "cannot assume": a dotted line extends the decline from 2023 towards 2050 and stops short, ending in a question mark.
- → "three possibilities": three lines fan out from 2023, solid, dashed and dotted: `rates constant`, `half-pace decline`, `decline continues`.
- Plate end: the three lines hold; the page turns to section 3.

Source line: `WiSE 2023: Subramaniam et al. 2025 · WiSE 2013 by age: IMH media release, 28 Aug 2024`.

## 3. Projection (Lili, 6 plates, 1:57)

### proj-method (0:14)
- Label `3 · PROJECTION`. Heading: `From prevalence to people`.
- → "multiplied": a ledger for 2030, set in mono, rows appearing as said: `900,014 × 3.0% = 27,000`, `337,242 × 18.2% = 61,378`, `100,223 × 48.6% = 48,708`, total rule, `137,087` in teal. (Same figures as the AI section's ledger, so the two agree.)

### proj-scenarios (0:26)
- The camera moves right from the ledger to a prevalence chart, 2023 to 2050 (85+ group as the example, starting at 48.6%), in the three line styles from section 2.
- → "first scenario": the solid line draws flat, `rates constant`, in teal.
- → "second": the dotted line draws downward, `decline continues`, now teal (the solid returns to ink).
- → "third": the dashed line draws between them, `half-pace decline`, teal. No end values; the point is the shape.

### proj-2030 (0:26)
- The prevalence chart's axis relabels to cases: the same three line styles, now counting people.
- → "96,694": the shared starting point, `2023 · 96,694 modelled`.
- → "By 2030": the lines reach 2030: `137,087`, `123,177`, `129,970`, each value appearing as spoken, the one being spoken in teal.
- → "still increases": all three rise from 96,694; caption `Even with falling rates, cases rise.`

### proj-2050 (0:17)
- → "By 2050": the chart extends to 2050 (the axis rescales smoothly); the lines continue to `295,653`, `196,615`, `241,237`.
- → "196,615": a teal bracket between the highest and lowest, `≈ 99,000 apart` (295,653 − 196,615 = 99,038).

### proj-moh (0:22)
- → "152,000": a horizontal reference line at 152,000 over the 2030 column, labelled `MOH estimate, 2030 · 152,000`.
- → "fall below": the three 2030 points sit under it; the gap from 137,087 up to the line is shaded teal.
- → "starting point": at 2023, two figures: `our model 96,694` and `WiSE published 73,918`, the gap between them teal, labelled `already higher`.

### proj-close (0:12)
- → "scenarios rather than": the reference marks clear; the three lines remain, captioned `Different assumptions, different projections.`
- → "physical activity": the solid line's 2050 end (295,653) takes the teal, the point section 4 works from.

Source line: `Our model: UN WPP 2024 × WiSE 2023 · MOH 4 Nov 2025 · WiSE published 2023: Subramaniam et al. 2025`.

## 4. Physical activity (Zoe, 5 plates, 1:41)

### pa-risk (0:12)
- Label `4 · PHYSICAL ACTIVITY`. Heading: `Could more activity reduce cases?`
- A row of simple ink walking figures, drawn as line art, walks in along the bottom (Zoe's drawn characters) and stops.
- → "systematic review": the paper's title and authors typeset as a citation card (not a screenshot): *Physical activity as a protective factor for dementia and Alzheimer's disease…*, `Iso-Markku et al. · Br J Sports Med 2022`.
- → "20 per cent": under the card, `about 20% lower risk` in teal, small note `pooled relative risk 0.80`.

### pa-paf (0:21)
- → "19.7": the walking figures multiply into a grid of 100; 20 turn teal (19.7% is about 20 in 100), labelled `19.7% of adults aged 60–74 insufficiently active · NPHS 2024`. (Zoe's reference showed 3 of 100; corrected.)
- → "Population Attributable Fraction": the formula typeset, `PAF = P(RR − 1) / (P(RR − 1) + 1)`, with `P = 19.7%` and `RR = 1.25` under it.
- → "4.7 per cent": the result `4.69%` set large in teal.

### pa-pif (0:18)
- → "Potential Impact Fraction": the PIF formula beside it, `PIF = (P₀ − P₁)(RR − 1) / (1 + P₀(RR − 1))`.
- → "5%", "15%", "50%": three ruled rows: `5% less inactivity · inspired by the National Steps Challenge`, `15% · WHO global target` (text, no logo), `50% · ambitious, hypothetical`, each row teal while spoken.

### pa-cases (0:33)
- → "322": the rows become a bar chart, three groups, each a 2030 bar (outline) and a 2050 bar (solid). Values appear as spoken: `322` / `694`, `965` / `2,082`, `3,217` / `6,939`.
- → "rates-constant": a note at the top, `applied to the rates-constant projection`.
- → "higher estimates in 2050": the 2050 bars take the teal.
- In place of the crowd-forming-an-arrow stock photo: the 100-figure grid returns and the figures slide into the shape of a downward arrow, in ink with the 20 teal figures at its tip.

### pa-caveat (0:17)
- → "assume a causal": the arrow's figures regroup into a thin exclamation mark inside a hairline triangle (an ink caution sign, not a yellow one); beside it two assumptions as a ruled list: `inactivity causes dementia`, `the 60–74 rate applies to everyone over 60`.
- → "rather than": caption `Potential, not predicted.`
- Plate end: hard cut to the AI section's dark screen (no page turn): the register changes here.

Source line: `NPHS 2024 · Iso-Markku et al. 2022 · WHO Global Action Plan on Physical Activity 2018–2030 · Normatov et al. 2026`.

## Closing (3 plates, 0:43, plus credits)

### cl-range (0:19)
- The page turns from the AI section's verdict back to the data-story register. The section 3 chart returns: three scenario lines from 2023 to 2050.
- → "2030": a teal bracket at 2030, `about 123,000 to 137,000`. → "2050": a teal bracket at 2050, `about 197,000 to 296,000`.
- → "keeps falling": the dotted line takes the teal, `96,694 → 196,615`, with `×2` beside it.

### cl-moh (0:12)
- → "152,000": the MOH reference line returns at 2030, above all three points.
- → "Cutting inactivity": at the 2050 rates-constant point, a short teal downward bracket, `up to about 7,000 avoidable`.

### cl-end (0:12)
- → "scenarios, not forecasts": everything clears to paper; one line set large, left-aligned: `Scenarios, not forecasts.`
- → "checked": the one callback to the AI section: the red pen draws a single long tick in the margin. Hold, then cut to the credits.

### credits (about 5 s, no narration)
- Paper, small type, two columns: the team (Hong Ming, James, Lili, Zoe, Jacob) and `AI tools used: ElevenLabs (narration voice) · Claude Code (built the animation) · ChatGPT (drafting help, sections 2 to 4)`. Fade to black.

## Notes for the build

- The engine supports overlapping plates: the incoming plate gets the outgoing plate's last frame (`f.under`) and a 0→1 progress (`f.tin`) over the overlap, and composites the transition itself (`handlesTransition`). The page turn is a curled three.js plane textured with the outgoing frame over the incoming one; the camera move draws both plates as neighbouring regions of one sheet, translated together. Both get built once as shared kit pieces. Where a chart continues across a camera move, the two plates' agents agree the handover shape.
- The section 1 caveat puts UN 1,070,430 against SingStat 1,011,631 for 2023 (5.8% higher), as Hong Ming asked; it does not claim this explains the 96,694 vs 73,918 gap (section 3 and the AI section deal with that).
- 85+ in 2023 is 72,078 (the team's model input). The UN file's rounded five-year rows add to 72,079; the pyramid uses those rows for its shape, but every label uses 72,078.
- Figures computed here, not in a teammate's script: dot counts (UN five-year rows / 1,000, rounded: 1,070 for 2023, 2,114 for 2050), `about 59,000` and its 58 dots (58,799), `≈ ×2` (1.98), `×4.6` (328,792 / 72,078 = 4.56), `≈ 99,000 apart` (99,038), 9 of 100 dots (8.8%), 20 of 100 figures (19.7%), `×2` in the closing (196,615 / 96,694 = 2.03). Remove any that feel like too much.
