export type CategoryId =
  | 'finance'
  | 'salary'
  | 'business'
  | 'student'
  | 'math'
  | 'converters'
  | 'date'
  | 'health'
  | 'construction'
  | 'vehicle'
  | 'agriculture'
  | 'statistics'
  | 'technology'
  | 'everyday'
  | 'currency'
  | 'pdf-tools';

export type FilterCategoryId = 'all' | 'popular' | 'favorites' | 'history' | CategoryId;

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  shortDesc: string;
  icon: string;
  color: string;
  badgeBg: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  shortName?: string;
  slug?: string;
  category: CategoryId;
  description: string;
  route: string;
  primaryKeyword?: string;
  keywordVariants?: string[];
  questionKeywords?: string[];
  longTailKeywords?: string[];
  searchIntent?: 'transactional' | 'informational' | 'commercial' | 'navigational';
  country?: 'Global' | 'IN' | 'US' | 'UK' | string;
  seasonalRelevance?: string;
  priority?: number; // 1 - 100 Demand Score
  enabled?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  h1?: string;
  introduction?: string;
  keywords: string[];
  icon: string;
  popular?: boolean;
  trending?: boolean;
  formula?: string;
  stepExplanation?: string[];
  assumptions?: string[];
  example?: {
    title: string;
    text: string;
  };
  faqs?: {
    q: string;
    a: string;
  }[];
  relatedToolIds: string[];
  disclaimer?: string;
  lastReviewedDate?: string;
}

export interface CalculationResult {
  toolName: string;
  category: string;
  dateGenerated: string;
  inputs: { label: string; value: string }[];
  primaryResult: {
    label: string;
    value: string;
    subtext?: string;
    badge?: string;
  };
  breakdown: {
    label: string;
    value: string;
    note?: string;
  }[];
  scheduleTable?: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
    totalRow?: (string | number)[];
  };
  chartData?: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  formula?: string;
  disclaimer?: string;
  resultType?: 'CALCULATION' | 'ESTIMATE' | 'PROJECTION' | 'LIVE DATA' | 'HISTORICAL DATA';
  dataSource?: string;
  dataTimestamp?: string;
  freshness?: string;
  geographicScope?: string;
  assumptions?: string[];
}

export type SearchOpportunityStatus =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'VALIDATED'
  | 'BUILD'
  | 'PUBLISHED'
  | 'NO-GO'
  | 'DUPLICATE'
  | 'INSUFFICIENT_DATA';

export interface SearchOpportunity {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  aliases: string[];
  intent: 'transactional' | 'informational' | 'commercial' | 'navigational';
  category: string;
  country: string;
  language: string;
  seasonality: string;
  trendSignal: 'RISING' | 'STABLE' | 'DECLINING' | 'SEASONAL' | 'NEW' | 'INSUFFICIENT_DATA';
  internalSearches: number;
  impressions: number | 'Data unavailable';
  clicks: number | 'Data unavailable';
  ctr: number | 'Data unavailable';
  position: number | 'Data unavailable';
  relatedTools: string[];
  source: string;
  sourceUrl?: string;
  sourceDate: string;
  evidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'FIRST_PARTY_VERIFIED';
  confidence: number; // 0 - 100
  status: SearchOpportunityStatus;
  recommendedAction: string;
}

export interface ResearchPipelineStatus {
  domainCorpusTarget: number;
  status: 'DATASET_UNAVAILABLE' | 'INITIALIZING' | 'READY' | 'SYNCHRONIZED';
  source: string;
  lastRunTimestamp: string;
  method: string;
  coverage: string;
  confidence: string;
  message: string;
  pipelineStages: {
    name: string;
    description: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'BLOCKED';
  }[];
}

export interface NaturalQueryParsedResult {
  toolId: string;
  confidence: number; // 0 to 1
  matchedIntent: string;
  extractedInputs?: Record<string, any>;
  reason: string;
}

export interface FirstPartyEvent {
  type:
    | 'calculator_opened'
    | 'calculation_completed'
    | 'search_performed'
    | 'pdf_downloaded'
    | 'share_clicked'
    | 'tool_favorited'
    | 'tool_history_used';
  toolId?: string;
  query?: string;
  timestamp: string;
  category?: string;
}
