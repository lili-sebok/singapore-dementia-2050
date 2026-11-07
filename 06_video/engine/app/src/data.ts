// Every number and quote shown on screen. Sources: 05_ai_comparison/results.md and the run logs in
// 05_ai_comparison/runs/ (singapore-dementia-2050 repo). Do not retype figures in scenes: import from here.
// A = Claude Sonnet 5.5, B = Gemini 3.8 Flash.

export const CAND = {
  A: { letter: 'A', name: 'Claude Sonnet 5.5', maker: 'Anthropic', tier: 'mid-tier, low reasoning effort' },
  B: { letter: 'B', name: 'Gemini 3.8 Flash', maker: 'Google', tier: 'mid-tier, low reasoning effort' },
} as const;

export const MOH_2030 = 152000; // MOH written parliamentary answer, 4 Nov 2025
export const WISE_PUBLISHED_2023 = 73918;

export const Q1 = {
  // runs/2026-10-06_task1_*_run1.md (verbatim)
  quoteB: '"...it is estimated that approximately 152,000 people in Singapore will have dementia by the year 2050."',
  quoteA: '"...projections of about 80,000 people with dementia by 2030."',
  score: { A: 51.3, B: 25.0 },
};

export const Q2 = {
  // band arithmetic: UN WPP 2024 population x WiSE 2023 prevalence (verified by computation)
  bands: ['60–74', '75–84', '85+'],
  rates: ['3.0%', '18.2%', '48.6%'],
  // totals are from unrounded band values (cells sum to 137,086 for 2030): show the footnote 'totals from unrounded values'
  y2030: { pop: [900014, 337242, 100223], cases: [27000, 61378, 48708], total: 137087 },
  y2050: { pop: [1244081, 541417, 328792], cases: [37322, 98538, 159793], total: 295653 },
  method2023: 96694, // same method on UN 2023 population
  // runs/2026-10-06_task2_claude-sonnet_run1.md (verbatim)
  quoteA1: '"Applying the 2023 rates to the UN 2023 counts gives about 96,700 cases, but the study published 73,918."',
  quoteA2: '"The UN figures likely include non-residents, or otherwise differ in coverage."',
  factorA: '0.765',
  rescaledA: { y2030: 'about 105,000', y2050: 'about 226,000' },
  // findings: WiSE survey-weighted base vs SingStat resident 60+, 2023
  singstatResidents60: 1011631,
  wiseBase: 838800,
  baseGapLabel: 'about 17% smaller',
  // V2 prompt, run 1 (6 Oct) and run 2 (14 Oct)
  runs: { A: [62.0, 81.5], B: [56.9, 56.9] },
  run1Gap: 5.1,
  swingA: 19.5,
  // prompt versions
  prompts: {
    A: { V1: 46.9, V2: [62.0, 81.5], V3: 79.8 },
    B: { V1: 43.5, V2: [56.9, 56.9], V3: 76.5 },
  },
  v2Text: '"...produce estimates for 2030 and 2050 and explain your method."',
  v3Role: '"You are an epidemiologist..."',
  v3Checklist: ['assumptions', 'method', 'check 2023 against the published count', 'judge the 2013–2023 change', 'range of estimates', 'headline choice', 'limitations'],
};

export const Q3 = {
  growthAgeing: 1.42,
  growthNeeded: 2.06,
  // runs/2026-10-14_task3_*_run1.md (verbatim)
  quoteA: '"I could not find a reasonable set of assumptions in this data that gives 152,000 in 2030"',
  quoteB: '"...assuming a slight continued decline in age-specific rates..."',
  score: { A: 71.3, B: 59.8 },
};

export const AUDIT = {
  // runs/2026-10-14_citation-audit_*_run1.md
  rows: ['WiSE 2023, 60–74', 'WiSE 2023, 75–84', 'WiSE 2023, 85+', 'Residents aged 60+, 2023', 'Relative risk, inactivity'],
  A: ['idk', 'idk', 'idk', 'idk', 'about 1.4 (Lancet Commission 2020)'],
  B: ['idk', 'idk', 'idk', 'about 1,010,000', '1.40 (Lancet Commission 2020)'],
  extras: [
    { who: 'B', claim: 'Table A1', fix: 'T3' },
    { who: 'B', claim: '95% CI 1.16–1.68', fix: 'not in source' },
  ],
  mythos: 'Even the strongest model tried, Mythos 5.1 at max effort, said the 2024 Lancet Commission kept a relative risk of 1.4. It moved to 1.2.',
  score: { A: 20, B: 40 },
};

export const SYSTEM = { A: 53.6, B: 45.4 };

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// ---------------------------------------------------------------------------------------------
// Full video: opening, sections 1 to 4 and closing (06_video/full_script.md). Sources per block.

// Opening and closing. MOH written parliamentary answer, 4 Nov 2025: "In 2023, there were about 74,000
// persons living with dementia ... We estimate this will grow to 152,000 by 2030."
export const MOH = { y2023Label: 'about 74,000', y2030: 152000, source: 'Ministry of Health, written parliamentary answer, 4 Nov 2025' };

// Section 1. UN World Population Prospects 2024 (medium variant from 2024), Singapore, persons.
// Bands from 01_demographics/model_input_population.csv (the team's model input). The 5-year rows in
// singapore_population_by_age_1950_2100.csv are rounded, so their 85+ sum for 2023 is 72,079: use these.
export const POP = {
  source: 'UN World Population Prospects 2024, medium variant',
  years: [2023, 2030, 2050],
  bands: ['60–74', '75–84', '85+'],
  byBand: { 2023: [789711, 208640, 72078], 2030: [900014, 337242, 100223], 2050: [1244081, 541417, 328792] },
  total60: { 2023: 1070430, 2030: 1337479, 2050: 2114290 },
  total60Label: { 2023: '1.07 million', 2050: '2.11 million' },
  // pyramid: 5-year bands 0-4 ... 100+, both sexes (singapore_population_by_age_1950_2100.csv)
  pyramidAges: ['0–4','5–9','10–14','15–19','20–24','25–29','30–34','35–39','40–44','45–49','50–54','55–59','60–64','65–69','70–74','75–79','80–84','85–89','90–94','95–99','100+'],
  pyramid: {
    2023: [228712,224895,228780,375906,554944,601190,567374,469059,417574,374018,347410,328797,312327,270448,206936,127312,81328,44557,20502,5904,1116],
    2050: [161060,177054,216751,258556,304482,299840,282516,269506,342216,510637,578632,566150,487399,409016,347666,303384,238033,181069,102710,37030,7983],
  },
  // SingStat residents aged 60+, 2023 (Population Trends / table used in 01_demographics; CLAUDE.md finding 2)
  singstatResidents60_2023: 1011631,
};

// Section 2. WiSE (Well-being of the Singapore Elderly), 10/66 criteria, residents 60+.
// 2023 and overall: Subramaniam et al. 2025, Alzheimer's & Dementia (Supp. Table S1; p = 0.298 Results 3.1, Table 2).
// 2013 bands: IMH media release, 28 Aug 2024 (as cited by James).
export const PREV = {
  overall: { 2013: '10.0%', 2023: '8.8%' },
  pValue: '0.298',
  bands: ['60–74', '75–84', '85+'],
  y2013: [3.4, 21.6, 56.2],
  y2023: [3.0, 18.2, 48.6],
  source2023: 'Subramaniam et al. 2025, Alzheimer’s & Dementia',
  source2013: 'IMH media release, 28 Aug 2024',
};

// Section 3. Our projection (03_projection_model/projection_model.ipynb; recomputed, CLAUDE.md key numbers).
export const PROJ = {
  base2023: 96694,
  scenarios: [
    { key: 'constant', name: 'Rates constant', y2030: 137087, y2050: 295653 },
    { key: 'half', name: 'Half-pace decline', y2030: 129970, y2050: 241237 },
    { key: 'decline', name: 'Decline continues', y2030: 123177, y2050: 196615 },
  ],
  wisePublished2023: 73918, // Subramaniam et al. 2025
};

// Section 4. NPHS 2024 (insufficiently active, 60-74); Iso-Markku et al. 2022, BJSM (pooled RR 0.80, 95% CI 0.77-0.84;
// team uses RR = 1/0.80 = 1.25); avoidable cases from 04_physical_activity/Risk_calculations.csv (rates constant).
export const PA = {
  inactive: 19.7, // per cent, adults 60-74, NPHS 2024
  rrProtective: '0.80', rr: '1.25', lowerRiskLabel: 'about 20% lower risk',
  paf: '4.69%',
  pafFormula: 'PAF = P(RR − 1) / (P(RR − 1) + 1)',
  pifFormula: 'PIF = (P₀ − P₁)(RR − 1) / (1 + P₀(RR − 1))',
  scenarios: [
    { cut: '5%', basis: 'National Steps Challenge', y2030: 322, y2050: 694 },
    { cut: '15%', basis: 'WHO global target', y2030: 965, y2050: 2082 },
    { cut: '50%', basis: 'Ambitious, hypothetical', y2030: 3217, y2050: 6939 },
  ],
  paperTitle: 'Physical activity as a protective factor for dementia and Alzheimer’s disease: systematic review, meta-analysis and quality assessment of cohort and case–control studies',
  paperAuthors: 'Iso-Markku, Kujala, Knittle, Polet, Vuoksimaa, Waller',
  paperCite: 'Br J Sports Med 2022; 56(12): 701–709',
};

// Closing (rounded from PROJ and PA, as spoken).
export const CLOSE = { range2030: 'about 123,000 to 137,000', range2050: 'about 197,000 to 296,000', avoidable2050: 'up to about 7,000' };

// Credits: AI tools used (06_video/full_script.md, each section's "AI tools used").
export const CREDITS = {
  team: ['Hong Ming', 'James', 'Lili', 'Zoe', 'Jacob'],
  ai: [['ElevenLabs', 'narration voice'], ['Claude Code', 'built the animation'], ['ChatGPT', 'drafting help, sections 2 to 4']],
};
