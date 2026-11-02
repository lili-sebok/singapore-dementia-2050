# Group video script

HS1502 group video: 10 minutes maximum, 15% of the module, half the grade on production quality. Everyone gets the same video grade.

## What you need to do

**Due: Friday 6 November.** Work in the shared Google Doc, Video Script tab. This file is the final copy, updated from the Doc.

1. Find your section in the Video Script tab of the Google Doc (the table below says which one is yours and how long it should be).
2. Write the **narration**: the exact words a voice will say, one sentence per line. About **150 words per minute** of video, so 1:30 is roughly 220 words. Read it aloud with a timer to check.
3. Next to each part of the narration, write what should be **on screen** while it is said: which chart, table, number or picture, and what to point at. A plain description is enough ("bar chart of 60+ population in 2023, 2030, 2050, the 2050 bar highlighted"). Sketches or screenshots of your own charts are welcome.
4. List the **source** of every number you mention (paper, table, page or dataset).
5. Fill in the one-sentence **main point** and the **AI tools** you used, if any.

You do **not** need to make any video, animation or recording. Jacob builds all the visuals in one style and adds the voice, then shares a draft for everyone to check.

If anything is unclear, ask in the group chat before the deadline rather than leaving the section blank.

## Running order

| # | Section | Owner | Length | Words | Status |
|---|---|---|---|---|---|
| 0 | Opening | Jacob | 0:30 | 75 | To write |
| 1 | Demographics | Hong Ming | ~1:20 | 201 | Written |
| 2 | Dementia prevalence | James | ~1:20 | 199 | Written |
| 3 | Projection and validation | Lili | 1:45 | 260 | Not started |
| 4 | Physical activity | Zoe | 1:30 | 220 | Not started |
| 5 | AI comparison | Jacob | 2:33 | 346 | Written |
| 6 | Closing | Jacob | 0:30 | 75 | To write |
| | **Total** | | **~9:28** | | |

Lengths of written sections are estimated from their word counts at 150 words per minute.

## Rules for everyone

- **Numbers:** only figures you have checked in the original source, and the same figures as in the report.
- **Scenario names:** use the same three names everywhere: rates constant, decline continues, half-pace decline.
- **Counts first:** give absolute numbers of people, not only percentages.
- **Plain words:** the viewer has not read the report. Explain any term the first time you use it (for example, what "prevalence" means).

## Example: what a finished section looks like

A short piece of the AI comparison section, written in the same format:

> **Main point:** both AI systems did the arithmetic perfectly but made errors of judgement and recall.
>
> | Narration | On screen |
> |---|---|
> | Question two came with our data. | Title "Question 2: with our data". The data package appears as a table: population and prevalence for each age band. |
> | Both did the arithmetic perfectly: 137,087 people in 2030, and 295,653 in 2050. | The table fills in band by band, then the two totals. Each total gets a red tick as it is said. |
> | Exactly our figures. | Our own totals appear beside the AI's: identical. |
>
> **Sources:** 137,087 and 295,653: our projection (UN WPP 2024 population × WiSE 2023 rates), `05_ai_comparison/results.md`.

## Section template

```
Main point (one sentence):

Narration | On screen
(one row per sentence or two)

Sources for every number:

AI tools used (if any):
```

## 0. Opening

**Owner:** Jacob · **Length:** 0:30

Could cover: the research question (how many Singapore residents aged 60+ will have dementia in 2030 and 2050), and why it matters.

## 1. Demographics

**Owner:** Hong Ming · **Length:** 1:30

Could cover (check against your own work): how many residents are aged 60+ now and in 2030 and 2050 (UN World Population Prospects 2024, medium variant); why we used UN projections rather than SingStat; how much the oldest age groups grow.

## 2. Dementia prevalence

**Owner:** James · **Length:** 1:30

Could cover (check against your own work): what the WiSE studies measured (2013 and 2023); prevalence in each age band (60–74, 75–84, 85+) and how it changed; that the overall fall was not statistically significant.

## 3. Projection and validation

**Owner:** Lili · **Length:** 1:45

Could cover (check against your own work): the method (people in each age band × prevalence in that band, added up); the three scenarios and their results for 2030 and 2050; how the 2030 results compare with MOH's published 152,000.

## 4. Physical activity

**Owner:** Zoe · **Length:** 1:30

Could cover (check against your own work): how many older adults are insufficiently active (NPHS 2024); the relative risk of dementia from inactivity and where it comes from; what share of cases is linked to inactivity, and how many cases fewer activity targets could prevent, applied to the projections from section 3.

## 5. AI comparison

**Owner:** Jacob · **Length:** 2:33 · **Status:** done (rendered)

Full script: [`ai_comparison/script.md`](ai_comparison/script.md).

## 6. Closing

**Owner:** Jacob · **Length:** 0:30

Could cover: the headline numbers, the main limitations, and what the results mean.

## Generative AI used (for the credits)

| Section | Tool | Used for |
|---|---|---|
| All | Claude Code | building the animation |
| 5. AI comparison | ElevenLabs | narration voice |
