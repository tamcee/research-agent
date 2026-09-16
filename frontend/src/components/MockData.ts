import { Report, StreamEvent } from '../types';

export const SAMPLE_REPORT: Report = {
  topic: "Are electric vehicles better for the climate than gas cars?",
  markdown: `# Are electric vehicles better for the climate than gas cars?

This report examines whether electric vehicles (EVs) are better for the climate than traditional internal combustion engine (gasoline) cars. Across multiple lines of inquiry, the scientific evidence consistently shows that electric vehicles generate substantially lower lifecycle greenhouse gas emissions than gas-powered vehicles, even when accounting for intensive battery manufacturing and electricity grids that rely partially on fossil fuels.

## What is the current lifecycle emissions comparison between EVs and gas cars?

Current lifecycle analyses broadly demonstrate that electric vehicles achieve net carbon reductions over internal combustion vehicles across virtually every regional energy grid. [1] Comprehensive cradle-to-grave assessments conducted by the International Council on Clean Transportation and peer-reviewed studies establish that battery electric vehicles produce 50% to 70% fewer lifetime greenhouse gas emissions in the United States and Europe compared with average gasoline vehicles. [1] Even in regions with coal-dominated electricity generation, modern electric drivetrains operate at two to three times the thermodynamic efficiency of gasoline engines, yielding lower net emissions per kilometer traveled. [2]

## How do battery manufacturing emissions impact the carbon payback period?

Battery production requires high-energy extraction and refining of lithium, nickel, and cobalt, resulting in higher upfront emissions during initial vehicle assembly. [1] However, independent academic lifecycle studies find that this manufacturing debt is typically offset ("paid back") within 12 to 24 months of average driving (or roughly 15,000 to 30,000 kilometers). [2] As manufacturing facilities transition toward localized supply chains and zero-emission power sources, upfront production footprints continue to decline year over year. [3]

## What are the main criticisms, mineral supply bottlenecks, and grid strains?

The most substantive environmental challenges facing widespread electric vehicle adoption involve raw material extraction and end-of-life battery recycling. [1] Mining practices for battery-grade minerals in sensitive ecosystems have raised localized biodiversity and water security concerns. [2] Additionally, rapid fleet charging can introduce local peak-load constraints on electrical distribution systems unless paired with managed smart-charging infrastructure and grid modernization. [3] Advanced closed-loop hydrometallurgical recycling, which recovers up to 95% of battery-grade minerals, is currently scaling to mitigate long-term virgin mining demands. [3]

## What is the near-term outlook for grid decarbonization and solid-state batteries?

The near-term trajectory favors electric vehicles even further as national power grids aggressively integrate wind, solar, and modern energy storage. [1] Unlike gasoline cars, whose emissions per mile are locked in at manufacture, every electric vehicle on the road becomes cleaner over time as the power grid decarbonizes. [2] Emerging battery chemistries—such as sodium-ion and solid-state cells—promise to substantially reduce dependence on critical raw materials while improving energy density and lifetime durability. [3]

## Synthesis

Taken together, independent scientific consensus is definitive: battery electric vehicles provide an indispensable reduction in lifecycle greenhouse gas emissions relative to gas-powered vehicles. While the environmental and ethical impacts of mineral extraction require rigorous regulatory standards and closed-loop recycling, the climate benefit of replacing combustion engines is unequivocal across their operating lifespan.

## Sources
1. [NCBI PMC: Lifecycle greenhouse gas emissions of electric and conventional vehicles](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7000/) — www.ncbi.nlm.nih.gov (tier 1)
2. [arXiv: Comparative assessment of electric vehicle lifecycle emissions across grid mixes](https://arxiv.org/abs/247001.11111) — arxiv.org (tier 1)
3. [Reuters: Global automotive transition and grid decarbonization data](https://www.reuters.com/article/are+electric+vehicles+better+for+the+cli) — www.reuters.com (tier 2)

---

† unverified — asserted by a single source.  ‡ disputed — independent sources conflict.

*24 verified · 0 unverified · 0 disputed claims across all sub-questions.*`,
  citations: [
    {
      index: 1,
      title: "Lifecycle greenhouse gas emissions of electric and conventional vehicles",
      domain: "www.ncbi.nlm.nih.gov",
      url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7000/",
      tier: 1,
    },
    {
      index: 2,
      title: "Comparative assessment of electric vehicle lifecycle emissions across grid mixes",
      domain: "arxiv.org",
      url: "https://arxiv.org/abs/247001.11111",
      tier: 1,
    },
    {
      index: 3,
      title: "Global automotive transition and grid decarbonization data",
      domain: "www.reuters.com",
      url: "https://www.reuters.com/article/are+electric+vehicles+better+for+the+cli",
      tier: 2,
    },
  ],
  verified_count: 24,
  unverified_count: 0,
  disputed_count: 0,
};

export const SAMPLE_EVENTS: StreamEvent[] = [
  {
    type: 'run_started',
    message: 'Starting research pipeline',
    data: { topic: 'Are electric vehicles better for the climate than gas cars?' },
  },
  {
    type: 'plan_ready',
    message: 'Decomposed topic into 4 targeted sub-questions',
    data: {
      sub_questions: [
        { question: 'What is the current lifecycle emissions comparison between EVs and gas cars?' },
        { question: 'How do battery manufacturing emissions impact the carbon payback period?' },
        { question: 'What are the main criticisms, mineral supply bottlenecks, and grid strains?' },
        { question: 'What is the near-term outlook for grid decarbonization and solid-state batteries?' },
      ],
    },
  },
  {
    type: 'subq_started',
    message: 'Sub-question 1/4: What is the current lifecycle emissions comparison between EVs and gas cars?',
    data: { index: 1, total: 4 },
  },
  {
    type: 'source_found',
    message: 'Discovered 8 source candidates via Tavily',
    data: { domain: 'ncbi.nlm.nih.gov', tier: 1 },
  },
  {
    type: 'vetted',
    message: 'Vetted 8 candidates across domain credibility tiers',
    data: { domain: 'ncbi.nlm.nih.gov', vet_score: 0.94 },
  },
  {
    type: 'source_selected',
    message: 'Selected top 3 authoritative sources for extraction',
    data: { domain: 'arxiv.org', tier: 1 },
  },
  {
    type: 'extracted',
    message: 'Extracted full text via trafilatura',
    data: { char_count: 14200 },
  },
  {
    type: 'claim_added',
    message: 'Distilled 6 atomic claims into Chroma vector DB',
    data: {},
  },
  {
    type: 'corroboration',
    message: 'Cross-source corroboration: verified across 2+ independent domains',
    data: { status: 'verified', corroborated_by: ['ncbi.nlm.nih.gov', 'arxiv.org'] },
  },
  {
    type: 'writing',
    message: 'Drafting synthesis essay with verified claim labeling',
    data: {},
  },
  {
    type: 'report_ready',
    message: 'Synthesized cited report (24 claims, 3 sources)',
    data: {},
  },
  {
    type: 'done',
    message: 'Research run complete',
    data: {},
  },
];
