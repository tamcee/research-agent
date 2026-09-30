import { Report, StreamEvent } from '../types';

export const EV_REPORT: Report = {
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

export const NUCLEAR_REPORT: Report = {
  topic: "Is nuclear power necessary to reach net-zero emissions?",
  markdown: `# Is nuclear power necessary to reach net-zero emissions?

This report examines the role of nuclear fission in global decarbonization scenarios. Across multiple international energy models and empirical grid studies, firm zero-carbon baseload generation is identified as a critical cost-minimizing complement to variable renewable energy sources like wind and solar.

## What do leading climate models conclude regarding nuclear capacity in net-zero pathways?

Systematic reviews by the Intergovernmental Panel on Climate Change (IPCC) and the International Energy Agency (IEA) show that in the majority of 1.5°C-consistent pathways, nuclear energy generation approximately doubles by 2050. [1] While theoretically possible to model 100% renewable grids, doing so requires massive overbuilding of generation capacity, seasonal hydrogen storage, and transmission networks that increase total system costs by 20% to 40%. [1] Nuclear power offers high capacity factors exceeding 90%, providing stable foundation loads independent of meteorological conditions. [2]

## What are the comparative capital costs and construction timelines between nuclear and renewables?

Modern Generation III+ reactors have faced significant capital cost overruns and protracted build times in Western nations, often exceeding a decade per installation. [1] In contrast, utility-scale solar photovoltaics and onshore wind have plummeted in levelized cost of electricity (LCOE) by over 70% over the last decade. [2] However, proponents and grid engineers highlight that LCOE neglects system-level balancing, reserve margin, and long-duration storage costs incurred when variable renewable penetration exceeds 70–80%. [3]

## How do small modular reactors (SMRs) alter safety and proliferation considerations?

Advanced Small Modular Reactors (SMRs) incorporate passive gravity-driven safety mechanisms that shut down cooling loops without operator intervention or external power. [1] Factory fabrication of standardized modular components aims to compress construction cycles and reduce upfront financing burdens. [2] Nonetheless, regulatory licensing pathways remain in early development, and non-proliferation safeguards require rigorous oversight for novel high-assay low-enriched uranium (HALEU) fuels. [3]

## Synthesis

While wind, solar, and battery storage will provide the bulk of near-term capacity additions, firm clean generation remains essential for cost-effective deep decarbonization. Nuclear energy serves as a vital stabilizing asset for industrial heat and grid inertia, though its deployment speed depends heavily on standardized engineering and regulatory streamlining.

## Sources
1. [IEA: Nuclear Power and Secure Energy Transitions](https://www.iea.org/reports/nuclear-power-and-secure-energy-transitions) — www.iea.org (tier 1)
2. [Nature Energy: Firm low-carbon power complements renewables](https://www.nature.com/articles/s41560) — nature.com (tier 1)
3. [Reuters: Energy transition and nuclear economics review](https://www.reuters.com/business/energy/nuclear-power-net-zero) — www.reuters.com (tier 2)

---

† unverified — asserted by a single source.  ‡ disputed — independent sources conflict.

*18 verified · 2 unverified · 0 disputed claims across all sub-questions.*`,
  citations: [
    {
      index: 1,
      title: "Nuclear Power and Secure Energy Transitions",
      domain: "www.iea.org",
      url: "https://www.iea.org/reports/nuclear-power-and-secure-energy-transitions",
      tier: 1,
    },
    {
      index: 2,
      title: "Firm low-carbon power complements renewables",
      domain: "nature.com",
      url: "https://www.nature.com/articles/s41560",
      tier: 1,
    },
    {
      index: 3,
      title: "Energy transition and nuclear economics review",
      domain: "www.reuters.com",
      url: "https://www.reuters.com/business/energy/nuclear-power-net-zero",
      tier: 2,
    },
  ],
  verified_count: 18,
  unverified_count: 2,
  disputed_count: 0,
};

export const FASTING_REPORT: Report = {
  topic: "Does intermittent fasting produce clinically meaningful longevity benefits?",
  markdown: `# Does intermittent fasting produce clinically meaningful longevity benefits?

This report evaluates clinical and preclinical evidence regarding intermittent fasting (IF) and time-restricted feeding (TRF). While animal models consistently demonstrate cellular repair via autophagy and extended median lifespan, human randomized controlled trials demonstrate cardiometabolic improvements that are primarily mediated by caloric restriction rather than fasting timing alone.

## What cellular mechanisms are activated during sustained fasting windows?

Prolonged nutrient deprivation triggers cellular stress responses characterized by AMPK activation, mTOR inhibition, and stimulated macroautophagy. [1] These molecular switches promote mitochondrial biogenesis and clearance of damaged organelles in murine studies. [1] In human trials, fasting periods exceeding 16 hours initiate ketone body production and mild metabolic hormesis. [2]

## What do human randomized controlled trials reveal about weight and metabolic health?

Meta-analyses of randomized trials comparing time-restricted eating (e.g. 16:8) against standard daily caloric restriction show equivalent outcomes for weight loss, insulin sensitivity, and lipid reductions. [1] In studies where total caloric intake and protein consumption are strictly matched, intermittent fasting confers negligible incremental metabolic benefits over conventional caloric deficits. [2]

## Synthesis

Intermittent fasting is an effective behavioral framework for achieving calorie deficits and improving glycemic control, but claims of independent longevity benefits in humans remain unsupported by long-term epidemiological evidence.

## Sources
1. [New England Journal of Medicine: Effects of Intermittent Fasting on Health and Aging](https://www.nejm.org/doi/full/10.1056/NEJMra1905136) — nejm.org (tier 1)
2. [JAMA Internal Medicine: Effects of Time-Restricted Eating on Weight Loss](https://jamanetwork.com/journals/jamainternalmedicine) — jamanetwork.com (tier 1)

---

† unverified — asserted by a single source.  ‡ disputed — independent sources conflict.

*14 verified · 1 unverified · 0 disputed claims across all sub-questions.*`,
  citations: [
    {
      index: 1,
      title: "Effects of Intermittent Fasting on Health and Aging",
      domain: "nejm.org",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMra1905136",
      tier: 1,
    },
    {
      index: 2,
      title: "Effects of Time-Restricted Eating on Weight Loss",
      domain: "jamanetwork.com",
      url: "https://jamanetwork.com/journals/jamainternalmedicine",
      tier: 1,
    },
  ],
  verified_count: 14,
  unverified_count: 1,
  disputed_count: 0,
};

export const MOE_REPORT: Report = {
  topic: "How does deep learning scaling compare between dense models and mixture-of-experts?",
  markdown: `# How does deep learning scaling compare between dense models and mixture-of-experts?

This report investigates the computational trade-offs, pretraining efficiency, and inference economics of Mixture-of-Experts (MoE) architectures compared to traditional dense transformer models.

## How does parameter efficiency and compute budget compare during pretraining?

Sparse Mixture-of-Experts models decouple parameter count from per-token compute FLOPs by activating only a subset of expert feed-forward networks for each input token. [1] Empirical scaling studies show that MoE architectures achieve the same training loss as dense counterparts with 30% to 50% fewer training FLOPs. [1] This enables training models with hundreds of billions of parameters within realistic energy and accelerator budgets. [2]

## What are the key bottlenecks during inference and serving?

While MoE models deliver superior compute efficiency during forward passes, they introduce severe memory bandwidth and communication overheads. [1] The entire parameter footprint must reside in high-bandwidth memory (HBM), requiring multiple GPUs even for low-batch inference. [2] Routing mechanisms can also induce load imbalances across distributed tensor cores. [3]

## Synthesis

Mixture-of-Experts provides an undeniable Pareto improvement for training throughput and task performance under fixed FLOP budgets. However, serving efficiency at low batch sizes requires specialized memory optimization and aggressive quantization strategies.

## Sources
1. [arXiv: Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer](https://arxiv.org/abs/1701.06538) — arxiv.org (tier 1)
2. [arXiv: Switch Transformers: Scaling to Trillion Parameter Models](https://arxiv.org/abs/2101.03961) — arxiv.org (tier 1)
3. [IEEE Micro: Hardware and Communication Challenges in MoE Inference](https://ieeexplore.ieee.org) — ieeexplore.ieee.org (tier 1)

---

† unverified — asserted by a single source.  ‡ disputed — independent sources conflict.

*21 verified · 0 unverified · 0 disputed claims across all sub-questions.*`,
  citations: [
    {
      index: 1,
      title: "Outrageously Large Neural Networks: The Sparsely-Gated MoE Layer",
      domain: "arxiv.org",
      url: "https://arxiv.org/abs/1701.06538",
      tier: 1,
    },
    {
      index: 2,
      title: "Switch Transformers: Scaling to Trillion Parameter Models",
      domain: "arxiv.org",
      url: "https://arxiv.org/abs/2101.03961",
      tier: 1,
    },
    {
      index: 3,
      title: "Hardware and Communication Challenges in MoE Inference",
      domain: "ieeexplore.ieee.org",
      url: "https://ieeexplore.ieee.org",
      tier: 1,
    },
  ],
  verified_count: 21,
  unverified_count: 0,
  disputed_count: 0,
};

export const SAMPLE_REPORT = EV_REPORT;

export function getSampleForTopic(topic: string): { report: Report; events: StreamEvent[] } {
  const lower = topic.toLowerCase();
  let report = EV_REPORT;
  if (lower.includes('nuclear')) {
    report = NUCLEAR_REPORT;
  } else if (lower.includes('fasting')) {
    report = FASTING_REPORT;
  } else if (lower.includes('mixture-of-experts') || lower.includes('scaling') || lower.includes('dense')) {
    report = MOE_REPORT;
  }

  const events: StreamEvent[] = [
    {
      type: 'run_started',
      message: `Starting research pipeline`,
      data: { topic: report.topic },
    },
    {
      type: 'plan_ready',
      message: 'Decomposed topic into targeted sub-questions',
      data: {
        sub_questions: [
          { question: 'What is the current state of evidence and consensus?' },
          { question: 'What are the main counterarguments and limitations?' },
          { question: 'What is the near-term technological and clinical trajectory?' },
        ],
      },
    },
    {
      type: 'subq_started',
      message: `Analyzing primary literature and evidence`,
      data: { index: 1, total: 3 },
    },
    {
      type: 'source_found',
      message: `Discovered authoritative source candidates across tier 1 & 2 domains`,
      data: { domain: report.citations[0]?.domain || 'arxiv.org', tier: 1 },
    },
    {
      type: 'vetted',
      message: 'Vetted candidates across domain credibility tiers',
      data: { domain: report.citations[0]?.domain || 'arxiv.org', vet_score: 0.94 },
    },
    {
      type: 'extracted',
      message: 'Extracted full text via trafilatura',
      data: { char_count: 14200 },
    },
    {
      type: 'claim_added',
      message: `Distilled atomic claims into Chroma vector DB`,
      data: {},
    },
    {
      type: 'corroboration',
      message: `Cross-source corroboration verified across independent domains`,
      data: { status: 'verified' },
    },
    {
      type: 'writing',
      message: 'Drafting synthesis essay with verified claim labeling',
      data: {},
    },
    {
      type: 'report_ready',
      message: `Synthesized cited report (${report.verified_count} verified claims)`,
      data: { report },
    },
    {
      type: 'done',
      message: 'Research run complete',
      data: { report },
    },
  ];

  return { report, events };
}

export const SAMPLE_EVENTS: StreamEvent[] = getSampleForTopic(EV_REPORT.topic).events;
