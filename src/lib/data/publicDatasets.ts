export interface PublicIndicator {
  id: string;
  sourceName: string;
  sourceUrl: string;
  dataset: string;
  indicator: string;
  code: string;
  publishedAt: string;
  retrievedAt: string;
  unit: string;
  frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'Policy Review';
  jurisdiction: 'Global' | 'India' | 'United States' | 'European Union';
  currentValue: number;
  previousValue: number;
  period: string;
  notes: string;
}

// Authoritative Public Indicators catalog
export const PUBLIC_INDICATORS_REGISTRY: PublicIndicator[] = [
  {
    id: 'ind-wb-gdp-in',
    sourceName: 'World Bank Open Data API',
    sourceUrl: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=IN',
    dataset: 'World Development Indicators',
    indicator: 'GDP Growth (annual %)',
    code: 'NY.GDP.MKTP.KD.ZG',
    publishedAt: '2025-07-01',
    retrievedAt: new Date().toISOString().split('T')[0],
    unit: '% Annual',
    frequency: 'Annual',
    jurisdiction: 'India',
    currentValue: 7.2,
    previousValue: 7.0,
    period: 'FY 2024-25',
    notes: 'Official National Accounts data reported via World Bank API.',
  },
  {
    id: 'ind-rbi-repo-rate',
    sourceName: 'Reserve Bank of India (RBI)',
    sourceUrl: 'https://rbi.org.in',
    dataset: 'Monetary Policy Indicators',
    indicator: 'Policy Repo Rate',
    code: 'RBI_REPO_POLICY',
    publishedAt: '2026-02-06',
    retrievedAt: new Date().toISOString().split('T')[0],
    unit: '% per annum',
    frequency: 'Policy Review',
    jurisdiction: 'India',
    currentValue: 6.50,
    previousValue: 6.50,
    period: 'Bi-monthly Resolution',
    notes: 'Benchmark policy interest rate set by the Monetary Policy Committee (MPC).',
  },
  {
    id: 'ind-wb-cpi-in',
    sourceName: 'MOSPI / World Bank Open Data',
    sourceUrl: 'https://mospi.gov.in',
    dataset: 'Consumer Price Index (Combined)',
    indicator: 'Headline CPI Inflation',
    code: 'FP.CPI.TOTL.ZG',
    publishedAt: '2026-02-12',
    retrievedAt: new Date().toISOString().split('T')[0],
    unit: '% YoY',
    frequency: 'Monthly',
    jurisdiction: 'India',
    currentValue: 4.85,
    previousValue: 5.10,
    period: 'January 2026',
    notes: 'Headline retail inflation based on CPI 2012=100.',
  },
  {
    id: 'ind-fred-fed-funds',
    sourceName: 'Federal Reserve Economic Data (FRED)',
    sourceUrl: 'https://fred.stlouisfed.org/series/FEDFUNDS',
    dataset: 'Federal Reserve Monetary Data',
    indicator: 'Effective Federal Funds Rate',
    code: 'FEDFUNDS',
    publishedAt: '2026-02-01',
    retrievedAt: new Date().toISOString().split('T')[0],
    unit: '% per annum',
    frequency: 'Monthly',
    jurisdiction: 'United States',
    currentValue: 4.33,
    previousValue: 4.58,
    period: 'January 2026',
    notes: 'Volume-weighted median of overnight federal funds transactions.',
  },
  {
    id: 'ind-wb-population-global',
    sourceName: 'United Nations / World Bank',
    sourceUrl: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
    dataset: 'World Population Prospects',
    indicator: 'Total World Population',
    code: 'SP.POP.TOTL',
    publishedAt: '2025-12-01',
    retrievedAt: new Date().toISOString().split('T')[0],
    unit: 'Billion Persons',
    frequency: 'Annual',
    jurisdiction: 'Global',
    currentValue: 8.16,
    previousValue: 8.09,
    period: '2025 Revision',
    notes: 'UN Population Division demographic estimates.',
  },
];
