export type SourceTier = 1 | 2 | 3 | 4;

export type ClaimStatus = 'verified' | 'unverified' | 'disputed';

export interface Citation {
  index: number;
  url: string;
  title: string;
  domain: string;
  tier: SourceTier;
  snippet?: string;
}

export interface Report {
  topic: string;
  markdown: string;
  citations: Citation[];
  verified_count: number;
  unverified_count: number;
  disputed_count: number;
}

export interface SourceCandidate {
  url: string;
  title: string;
  snippet?: string;
  published_date?: string | null;
  tavily_score?: number;
  domain: string;
  tier: SourceTier;
  lead_only: boolean;
  primary_source_hint?: boolean;
  vet_score: number;
  selected: boolean;
  extracted: boolean;
  citation_index?: number | null;
}

export interface Claim {
  id: string;
  sub_question_id: string;
  text: string;
  source_url: string;
  source_domain: string;
  status: ClaimStatus;
  corroborating_domains: string[];
  contradicting_domains: string[];
  citation_index?: number | null;
}

export interface SubQuestion {
  id: string;
  question: string;
  search_query: string;
  time_sensitive?: boolean;
  candidates?: SourceCandidate[];
  claims?: Claim[];
  retries?: number;
  needs_research?: boolean;
  strict_filter?: boolean;
}

export type EventType =
  | 'run_started'
  | 'plan_ready'
  | 'subq_started'
  | 'source_found'
  | 'vetted'
  | 'source_selected'
  | 'extracting'
  | 'extracted'
  | 'claim_added'
  | 'corroboration'
  | 'critic_flag'
  | 'research_round'
  | 'writing'
  | 'report_ready'
  | 'error'
  | 'done';

export interface StreamEvent {
  type: EventType;
  message: string;
  data: Record<string, any>;
  timestamp?: number;
}

export interface HealthResponse {
  status: string;
  fake_mode: boolean;
  model: string;
  missing_keys: string[];
}

export interface StartRunResponse {
  run_id: string;
  topic: string;
  status: 'running' | 'done' | 'error';
}

export interface GetRunResponse {
  run_id: string;
  topic: string;
  status: 'running' | 'done' | 'error';
  report: Report | null;
  events: StreamEvent[];
}

