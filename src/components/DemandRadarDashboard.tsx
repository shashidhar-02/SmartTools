import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight, 
  Info,
  Database,
  Cpu,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Activity
} from 'lucide-react';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';
import { GET_RESEARCH_PIPELINE_STATUS, INITIAL_SEARCH_OPPORTUNITIES } from '../lib/research/pipeline';
import { PUBLIC_INDICATORS_REGISTRY } from '../lib/data/publicDatasets';
import { getFirstPartyEvents, getUnfulfilledQueries } from '../lib/analytics/firstPartyLearning';

interface DemandRadarProps {
  onSelectTool: (id: string) => void;
  onGoHome: () => void;
}

export const DemandRadarDashboard: React.FC<DemandRadarProps> = ({ onSelectTool, onGoHome }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'opportunities' | 'firstparty' | 'publicdata' | 'methodology' | 'gsc'>('pipeline');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const pipelineStatus = GET_RESEARCH_PIPELINE_STATUS();
  const searchOpportunities = INITIAL_SEARCH_OPPORTUNITIES;
  const publicIndicators = PUBLIC_INDICATORS_REGISTRY;
  const firstPartyEvents = getFirstPartyEvents();
  const unfulfilledQueries = getUnfulfilledQueries();

  const tools = TOOLS_REGISTRY.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.primaryKeyword && t.primaryKeyword.toLowerCase().includes(q)) ||
        (t.keywords && t.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const categories = Array.from(new Set(TOOLS_REGISTRY.map((t) => t.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Search-Intent Radar & 100K-Domain Research Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Demand Radar™
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time search understanding, offline web corpus research pipeline, first-party query intelligence, and verified public datasets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGoHome}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-t border-slate-800 pt-4 flex-wrap">
          {[
            { id: 'pipeline', label: '100K Research Pipeline', icon: Compass },
            { id: 'opportunities', label: 'Search Opportunities DB', icon: Layers },
            { id: 'firstparty', label: 'First-Party Learning Loop', icon: Activity },
            { id: 'publicdata', label: 'Public Data Connectors', icon: Globe },
            { id: 'methodology', label: 'Scoring & Zero-Fabrication', icon: ShieldCheck },
            { id: 'gsc', label: 'Google Search Console Bridge', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 100K-WEBSITE RESEARCH PIPELINE TAB */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Zero-Fabrication Status Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
                    Strict Zero-Fabrication Policy: Research Dataset Status
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded">
                    {pipelineStatus.status}
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                  {pipelineStatus.message}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/60 text-xs">
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-400 block text-[11px]">Primary Source:</span>
                    <strong className="text-amber-900 dark:text-amber-200">{pipelineStatus.source}</strong>
                  </div>
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-400 block text-[11px]">Coverage:</span>
                    <strong className="text-amber-900 dark:text-amber-200">{pipelineStatus.coverage}</strong>
                  </div>
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-400 block text-[11px]">Confidence Level:</span>
                    <strong className="text-amber-900 dark:text-amber-200">{pipelineStatus.confidence}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Research Architecture Flow */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              100,000-Domain Research Pipeline Architecture
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              How the platform identifies emerging calculator categories, user question intents, and missing utility opportunities without scraping or copying competitor UI.
            </p>

            <div className="space-y-4">
              {pipelineStatus.pipelineStages.map((stage, idx) => (
                <div
                  key={stage.name}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {stage.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap ${
                      stage.status === 'COMPLETED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SEARCH OPPORTUNITIES DB TAB */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Search Opportunity Database
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curated keyword intents, evidence levels, status transitions, and implementation actions.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                {searchOpportunities.length} Verified Opportunities
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400 divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-3 px-3">Target Keyword / Intent</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Trend Signal</th>
                    <th className="py-3 px-3">Evidence Level</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {searchOpportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 dark:text-slate-100 block">{opp.keyword}</strong>
                        <span className="text-[11px] text-slate-400">Aliases: {opp.aliases.slice(0, 2).join(', ')}</span>
                      </td>
                      <td className="py-3 px-3 capitalize font-medium">{opp.category}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          opp.trendSignal === 'RISING'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : opp.trendSignal === 'SEASONAL'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                        }`}>
                          {opp.trendSignal}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                          {opp.evidenceLevel} ({opp.confidence}%)
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          opp.status === 'PUBLISHED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : opp.status === 'BUILD'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {opp.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs">
                        {opp.recommendedAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. FIRST-PARTY LEARNING LOOP TAB */}
      {activeTab === 'firstparty' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unfulfilled Search Queries (Missing Tool Opportunities) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Discovered Missing Tool Queries
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                User queries that returned zero matching tools in the search bar. Used to discover high-demand missing calculators.
              </p>

              {unfulfilledQueries.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No unfulfilled queries recorded yet. As users search for unsupported intents, they appear here automatically.
                </div>
              ) : (
                <div className="space-y-2">
                  {unfulfilledQueries.map((item) => (
                    <div
                      key={item.query}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        &quot;{item.query}&quot;
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-bold text-[10px]">
                        Searched {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Privacy-Conscious First-Party Events */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Live Usage Feed (Zero PII)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Anonymous client-side interaction events (`calculator_opened`, `search_performed`, `pdf_downloaded`).
              </p>

              {firstPartyEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No interaction events recorded in this browser session yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {firstPartyEvents.slice(0, 10).map((ev, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                          {ev.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ev.toolId ? `Tool: ${ev.toolId}` : ev.query ? `Query: ${ev.query}` : 'Action'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PUBLIC DATA CONNECTORS TAB */}
      {activeTab === 'publicdata' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Authoritative Public Datasets & Live Indicator Registry
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Connectors for official government datasets, RBI monetary policy, World Bank national accounts, and Federal Reserve statistics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicIndicators.map((ind) => (
                <div
                  key={ind.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        {ind.sourceName} • {ind.jurisdiction}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {ind.indicator}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                        {ind.currentValue} {ind.unit}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Period: {ind.period}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {ind.notes}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Code: <code className="font-mono text-slate-600 dark:text-slate-300">{ind.code}</code></span>
                    <a
                      href={ind.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. METHODOLOGY & ZERO-FABRICATION TAB */}
      {activeTab === 'methodology' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Scoring Methodology & Zero-Fabrication Charter
            </h3>
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                  Absolute Zero-Fabrication Principle
                </h4>
                <p>
                  This platform <strong>NEVER fabricates synthetic search volume, traffic, rankings, CPC, or user numbers</strong>. If a third-party Google Search Console API is not actively authenticated, the dashboard displays <code>Data unavailable</code> rather than simulated metrics.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Demand Scoring Formula (1 - 100)
                </h4>
                <code className="block p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px] my-2">
                  Demand Score = (0.35 × Utility Index) + (0.25 × Evergreen Permanence) + (0.25 × Relative Public Search Signal) + (0.15 × First-Party Intent Volume)
                </code>
                <p>
                  Tools are prioritized for engineering based on genuine computational utility rather than thin keyword variations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GOOGLE SEARCH CONSOLE BRIDGE TAB */}
      {activeTab === 'gsc' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Google Search Console (GSC) First-Party Data Bridge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              When authenticated via OAuth, real Search Analytics metrics (query, page, impressions, clicks, CTR, position) flow directly into the demand matrix.
            </p>

            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-slate-500">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                GSC Property Not Connected in Preview
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                In strict accordance with our Zero-Fabrication policy, click and impression counts are marked as <code>Data unavailable</code> until your production domain verified property is linked.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
