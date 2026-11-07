# Full video script

The whole video in running order, with each teammate's section from the Google Doc (Video Script tab, 7 November) and small fixes listed at the end. Narration for the voice: [`narration.txt`](narration.txt) (plain) and [`narration_elevenlabs.txt`](narration_elevenlabs.txt) (with ElevenLabs delivery tags). The visuals will be rebuilt from scratch in one style; "On screen" describes what each line should show, not the final design.

| # | Section | Owner | Words | Length at 150 words/min |
|---|---|---|---|---|
| 0 | Opening | Jacob | 76 | 0:30 |
| 1 | Demographics | Hong Ming | 201 | 1:20 |
| 2 | Dementia prevalence | James | 199 | 1:20 |
| 3 | Projection and validation | Lili | 246 | 1:38 |
| 4 | Physical activity | Zoe | 265 | 1:46 |
| 5 | AI comparison | Jacob | 346 | 2:33 (measured) |
| 6 | Closing | Jacob | 95 | 0:38 |
| | **Total** | | **1,428** | **about 9:45** |

## 0. Opening (Jacob)

**Main point:** dementia cases in Singapore are expected to rise sharply, and we set out to estimate by how much, and to test how well AI handles the same question.

| Narration | On screen |
|---|---|
| In 2023, about 74,000 people in Singapore were living with dementia. | Paper. "2023" and "about 74,000" set large, with a small source line (Ministry of Health). |
| The Ministry of Health expects that number to reach 152,000 by 2030. | An arrow from 2023 to 2030; "152,000" appears at 2030 in a ruled box. |
| And the number of older people here is rising fast. | A simple ageing silhouette or line rising from 2023 towards 2050 (no figure; section 1 gives the numbers). |
| So how many people will have dementia in 2030, and in 2050? | The question typed in full, as the title of the project. |
| We built our own projection from official data, tested it against the Ministry's figure, asked what more physical activity could change, and compared how two AI systems handled the same task. | Five short headings appear in turn: Population, Prevalence, Projection, Physical activity, AI comparison (the agenda for the video). |

**Sources:** about 74,000 (2023) and 152,000 (2030): MOH written parliamentary answer, 4 November 2025.

## 1. Demographics (Hong Ming)

**Main point:** (to be filled in by Hong Ming)

| Narration | On screen |
|---|---|
| To understand how dementia might affect Singapore in the future, we first need to look at something fundamental: how our population is ageing. | Opening footage of Singapore's skyline, transitioning to an animated population pyramid. |
| For our analysis, we collected demographic data from SingStat and the United Nations World Population Prospects 2024. While SingStat provided historical resident population statistics, we selected the UN's medium-variant projections because they extend to 2050 and provide the age-specific data required for our model. | Display SingStat and UN data sources, followed by a timeline from 2023 to 2050. |
| According to these projections, Singapore's population aged 60 and above is expected to grow from approximately 1.07 million in 2023 to 2.11 million by 2050, nearly doubling. | Animated bar chart comparing the population aged 60+ in 2023, 2030 and 2050. |
| But the most striking change occurs among those aged 85 and above. This group is projected to increase from around 72,000 to nearly 329,000 people, more than quadrupling. | Zoom into the 85+ age group, highlighting the increase from 72,078 to 328,792. |
| This matters because dementia prevalence rises sharply with age. We therefore organised our demographic data into three age groups: 60–74, 75–84, and 85+, matching the categories used in the WiSE dementia studies. | Three age groups appear alongside their respective WiSE dementia prevalence rates. |
| However, an important limitation is that UN projections include non-residents, while WiSE focuses on Singapore residents. Recognising this difference is essential when interpreting our results. | Side-by-side comparison: UN total population versus SingStat resident population. |
| Ultimately, our demographic analysis shows why population ageing alone could increase Singapore's dementia burden, even if prevalence within individual age groups declines. | Transition into the dementia prevalence section. |

**Sources:** United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024. https://population.un.org/wpp/ · Singapore Department of Statistics. Population statistics. https://www.singstat.gov.sg/ · Subramaniam et al. (2025). Prevalence of dementia in Singapore: Changes across a decade. https://doi.org/10.1002/alz.14485

**AI tools used:** (to be filled in by Hong Ming)

## 2. Dementia prevalence (James)

**Main point:** (to be filled in by James)

| Narration | On screen |
|---|---|
| Now that we've seen how Singapore's population is ageing, let's look at how common dementia is among older adults. | Transition from population ageing chart to title: "Dementia Prevalence in Singapore". |
| To investigate this, we used data from the Well-being of the Singapore Elderly, or WiSE, studies conducted in 2013 and 2023. | Timeline showing WiSE 2013 and WiSE 2023. |
| These studies measured dementia prevalence, which refers to the percentage of people in a population living with dementia. | Simple illustration explaining prevalence, with highlighted individuals in a group. |
| Interestingly, overall dementia prevalence among adults aged 60 and above decreased from 10% in 2013 to 8.8% in 2023. | Two bars comparing 10.0% and 8.8%, with a downward arrow. |
| But does this decline occur across all age groups? | Transition to age-specific prevalence chart. |
| Among those aged 60 to 74, prevalence decreased from 3.4% to 3.0%. | Highlight the 60–74 age group. |
| For those aged 75 to 84, it decreased from 21.6% to 18.2%. | Highlight the 75–84 age group. |
| And among those aged 85 and above, it fell from 56.2% to 48.6%. | Highlight the 85+ age group. |
| Although prevalence decreased in every age group, the likelihood of living with dementia still increased sharply with age. | Display all three age groups side by side, highlighting the higher prevalence in older groups. |
| Importantly, the overall decline was not statistically significant, with a p-value of 0.298. This means we cannot confidently conclude that the observed decrease reflects a genuine population-wide trend. | Show "p = 0.298" and "Not statistically significant". |
| Therefore, we cannot assume dementia prevalence will continue declining at the same rate. | Question mark appears beside a projected downward trend. |
| To account for this uncertainty, our model considers three possibilities: rates constant, decline continues, and half-pace decline. | Three labelled lines appear, leading into the next section on projections. |

**Sources:** Subramaniam et al. (2025). Prevalence of dementia in Singapore: Changes across a decade. https://doi.org/10.1002/alz.14485 · Institute of Mental Health (IMH). (2024, 28 August). IMH study shows decrease in prevalence of dementia and improvement in treatment gap among older adults in Singapore over the past decade [Media release]. https://www.nhghealth.com.sg/imh/media-library/research/documents/20240828_WiSE-Dementia-Decrease.pdf

**AI tools used:** ChatGPT

## 3. Projection and validation (Lili)

**Main point:** (to be filled in by Lili)

| Narration | On screen |
|---|---|
| Now that we understand dementia prevalence, let's combine it with Singapore's ageing population to estimate future dementia cases. | Transition from the previous prevalence chart to the title "Projecting Dementia Cases in Singapore". |
| Our calculation was straightforward: we multiplied the population in each age group by its dementia prevalence, then added the results together. | Three age groups appear: 60–74, 75–84 and 85+. Animation shows population × prevalence = dementia cases, followed by a total. |
| However, because future dementia prevalence is uncertain, we developed three different scenarios. | Three lines appear on a graph, labelled with the scenario names. |
| In the first scenario, rates constant, dementia prevalence stays at its 2023 level. | First line remains flat on a prevalence graph. |
| In the second, decline continues, the reductions observed between 2013 and 2023 continue at the same annual pace. | Second line slopes downwards. |
| In the third, half-pace decline, prevalence continues decreasing, but at half the historical pace. | Third line slopes downwards more gradually. |
| All three scenarios begin with 96,694 modelled dementia cases in 2023. | Display "2023: 96,694 cases" as the common starting point. |
| By 2030, rates constant projects 137,087 cases, decline continues projects 123,177, and half-pace decline projects 129,970. | Bar chart comparing the three scenarios in 2030, with exact numbers above each bar. |
| Despite declining prevalence in two scenarios, the total number of cases still increases because of population ageing. | Animated older population increases while projected case numbers rise. |
| By 2050, the differences become even larger. | Timeline moves from 2030 to 2050. |
| Rates constant reaches 295,653 cases, decline continues reaches 196,615, and half-pace decline reaches 241,237. | Three bars grow to their 2050 values. Highlight the difference between highest and lowest. |
| To assess our projections, we compared them with the Ministry of Health's published estimate of 152,000 cases by 2030. | Horizontal reference line at 152,000 labelled "MOH estimate, 2030". |
| All three projections fall below this estimate, with rates constant coming closest. | Highlight the 137,087 bar against the 152,000 reference line. |
| However, our 2023 starting point is already higher than the survey's own published count of 73,918, so these comparisons cannot be treated as formal validation. | "Our 2023 model: 96,694" beside "WiSE published, 2023: 73,918", with a caution mark. |
| Our results are therefore scenarios rather than guaranteed predictions, illustrating how assumptions influence future dementia estimates. | Three scenario lines appear together with the caption "Different assumptions, different projections". |
| Next, we examine whether increasing physical activity could help reduce this future burden. | Transition to an animation of older adults walking and exercising. |

**Sources:** United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024. https://population.un.org/wpp/ (age-specific population estimates and projections) · Subramaniam et al. (2025). Prevalence of dementia in Singapore: Changes across a decade. https://doi.org/10.1002/alz.14485 (age-specific prevalence; published 2023 count of 73,918) · Our Python projection model (`03_projection_model/projection_model.ipynb`): the 2023 baseline (96,694) and the three scenario projections for 2030 and 2050, from UN population data and WiSE prevalence · Ministry of Health, Singapore (4 November 2025). Parliamentary answer reporting the estimate of 152,000 people living with dementia by 2030.

**AI tools used:** ChatGPT (GPT-6): used to structure the narration, improve clarity, and prepare visual suggestions. Numerical projections were taken from our Python model.

## 4. Physical activity (Zoe)

**Main point:** (to be filled in by Zoe)

| Narration | On screen |
|---|---|
| Physical inactivity is a potentially modifiable dementia risk factor. A systematic review and meta-analysis found that higher physical activity was associated with about a 20 per cent lower risk of dementia. | Drawn figures of older people walking; the animation stops and the paper's title and authors (Iso-Markku et al., 2022) appear as a citation. |
| To assess its potential impact on Singapore's future dementia burden, we used physical activity data from the National Population Health Survey: 19.7 per cent of adults aged 60 to 74 are insufficiently active. | Simple infographic: 100 people, about 20 of them marked (19.7%) to show physical inactivity prevalence. |
| We calculated the Population Attributable Fraction to estimate the proportion of dementia cases attributable to physical inactivity, which was about 4.7 per cent. | Show formula: PAF = P(RR−1) / (P(RR−1)+1). Display 4.69% on screen, highlighted. |
| To estimate how many cases could be avoided under three scenarios for reducing inactivity, we used the Potential Impact Fraction. | Show formula: PIF = (P0−P1)(RR−1) / (1+P0(RR−1)). |
| The 5% reduction was inspired by the National Steps Challenge, while the 15% scenario was based on the World Health Organization's global target. The 50% reduction represented an ambitious hypothetical scenario. | Bars for the three scenarios, each labelled: 5% (steps icon, drawn), 15% ("WHO target", as text), 50%. |
| Applied to our rates-constant projections, a 5% reduction could avoid about 322 cases in 2030 and 694 in 2050. The estimates rise to 965 and 2,082 under the 15% scenario, and 3,217 and 6,939 under the 50% scenario. | Animated bar chart, 2030 and 2050 shown differently. |
| These results suggest that a greater reduction in physical inactivity could contribute to lowering Singapore's future dementia burden. The higher estimates in 2050 reflect the larger projected dementia burden, which highlights the potential importance of physical activity as the population ages. | Drawn figures exercising, which then form an arrow pointing downwards (redrawn in the video's style; reference image is a stock photo and can't be used). |
| However, these estimates assume a causal relationship between physical inactivity and dementia, and that the inactivity rate for ages 60 to 74 applies to everyone over 60. They therefore illustrate the potential contribution of reducing physical inactivity rather than the number of cases that would actually be prevented. | The downward arrow morphs into an exclamation mark, then a caution symbol (drawn in the video's style). |

**Sources:** Ministry of Health and Health Promotion Board, Singapore (2025). National Population Health Survey 2024 · Iso-Markku, P., Kujala, U. M., Knittle, K., Polet, J., Vuoksimaa, E., & Waller, K. (2022). Physical activity as a protective factor for dementia and Alzheimer's disease: systematic review, meta-analysis and quality assessment of cohort and case-control studies. Br J Sports Med, 56(12), 701–709. https://doi.org/10.1136/bjsports-2021-104981 · Normatov, B., Song, H., Jin, S., Zhang, X., He, Y., Lim, N. W. H., Zheng, V. F., Bin Mohd Aziz, M. H., Müller-Riemenschneider, F., Ling Lee, C. P., & Dickens, B. L. (2026). Impact of the national steps challenge physical activity programme on obesity and type 2 diabetes prevalence in Singapore to 2050: simulation-based forecasting analysis. The Lancet Regional Health - Western Pacific, 68, 101831. https://doi.org/10.1016/j.lanwpc.2026.101831 · World Health Organization (2018). Global action plan on physical activity 2018–2030: More active people for a healthier world. · Avoidable cases: `04_physical_activity/Risk_calculations.csv`.

**AI tools used:** ChatGPT (GPT-6, for language purposes)

## 5. AI comparison (Jacob)

Full script and plate-by-plate visuals: [`ai_comparison/script.md`](ai_comparison/script.md). Narration as in [`narration.txt`](narration.txt).

## 6. Closing (Jacob)

**Main point:** cases will roughly double or more by 2050 whatever happens to prevalence, our numbers fall short of MOH's, and every figure needed checking at the source.

| Narration | On screen |
|---|---|
| So by 2030, we project between about 123,000 and 137,000 people with dementia, and by 2050, between about 197,000 and 296,000. | The three scenario lines from section 3, drawn again from 2023 to 2050, with the 2030 and 2050 ranges bracketed. |
| Even if prevalence keeps falling, the number of cases doubles by 2050, because the population is ageing. | The lowest line (decline continues) highlighted, from 96,694 to 196,615. |
| All three scenarios fall below the Ministry's 152,000 for 2030, and ageing alone cannot explain that figure. | The 152,000 reference line at 2030, above all three points. |
| Cutting inactivity could avoid up to about 7,000 cases by 2050. | A small bracket at the 2050 rates-constant point: "up to about 7,000 avoidable" (50% scenario). |
| These are scenarios, not forecasts, built on survey rates and a decline that was not statistically significant. | Caption: "Scenarios, not forecasts." |
| And every number in this video was checked against its original source. | A final tick; fade to black, then credits (including AI tools used). |

**Sources:** projections: our model (UN WPP 2024 × WiSE 2023), section 3. 152,000: MOH, 4 November 2025. About 7,000: 6,939 avoidable cases in 2050 at a 50% reduction in inactivity, rates constant (section 4). Ageing alone gives ×1.42 growth 2023–2030 against the ×2.06 that 152,000 needs (section 5).

## Changes made to the Doc text

Narration (all fixes of wording or clarity; no figure changed):

- **James:** full stop added after "18.2%".
- **Lili:** "approximately 96,694" to "96,694" (an exact figure); "even more significant" to "even larger" (James has just used "significant" in its statistical sense); the validation caveat now names the real issue, that our 2023 baseline (96,694) is above the survey's published 73,918, instead of "differences in population coverage" (the gap comes mainly from WiSE's weighted base, as section 5 explains, so the old wording contradicted it).
- **Zoe:** the meta-analysis result added ("about a 20 per cent lower risk", Iso-Markku pooled RR 0.80); the 19.7% added to the narration (it was only on screen); "approximately 4.69%" to "about 4.7 per cent" for speaking; the PIF sentence rewritten ("under different three physical inactivity reduction scenario"); the avoidable-cases sentence rewritten ("322 in 2030 could potentially be avoided in 2030") and now says the figures use the rates-constant projections; thousands separators; "Singapore`s" fixed; the caveat now also says the 60–74 inactivity rate is applied to everyone over 60.
- **Jacob (section 5):** uses the Doc wording ("against the source", "asked the same question again"), but restores "Sonnet did check, but blamed the gap on non-residents": without it, the line no longer says Sonnet checked, which is the point of the contrast with Gemini.

On screen and references:

- **Lili:** "coloured lines" to "lines" (the video uses ink, hatching and one red pen); the caution panel now shows the two 2023 numbers; em dash in the AI tools line replaced.
- **Zoe:** icon grid shows about 20 of 100, not the reference image's 3 of 100; the WHO logo replaced by the text "WHO target" (logos are out of the video's style, and WHO restricts use of its logo); the crowd arrow and caution sign marked to be redrawn (the crowd image is a stock photo); NPHS reference year 2025, with its suggested group authors; the doubled "https://doi.org/" prefix in Normatov removed.
- **James:** "Institution" to Institute; date "(2024, August 2024)" to (2024, 28 August); empty rows removed.
- Hong Ming's section is unchanged.

Still needed from the team: a "Main point" for sections 1 to 4, and AI tools for section 1.
