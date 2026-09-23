import React, { useState } from 'react';
import {
  Search,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Star,
  Layers,
} from 'lucide-react';
import { CategoryId, FilterCategoryId, ToolDefinition } from '../types';
import { CATEGORIES, TOOLS_REGISTRY } from '../data/toolsRegistry';

interface HomeHubProps {
  selectedCategory: FilterCategoryId;
  onSelectCategory: (cat: FilterCategoryId) => void;
  onSelectTool: (id: string) => void;
  onOpenSearch: () => void;
  favorites: string[];
}

export const HomeHub: React.FC<HomeHubProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectTool,
  onOpenSearch,
  favorites,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  // Filter tools based on selectedCategory and inline filterQuery
  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'popular'
        ? tool.popular
        : selectedCategory === 'favorites'
        ? favorites.includes(tool.id)
        : tool.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!filterQuery.trim()) return true;

    const q = filterQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const popularTools = TOOLS_REGISTRY.filter((t) => t.popular);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>SmartTools Hub • All-in-One Data & Calculation Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Calculate, Convert & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Download Instant PDF Reports
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Every calculator, converter, and data report on SmartTools Hub generates a formatted, high-resolution PDF with schedules, formulas, and visual breakdowns. 100% free, client-side & no account required.
          </p>

          {/* Quick Search Action Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-slate-300 text-sm shadow-xl transition-all group"
            >
              <span className="flex items-center gap-3">
                <Search className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Search 60+ calculators (e.g., &quot;EMI&quot;, &quot;Income Tax&quot;, &quot;SIP&quot;, &quot;Attendance&quot;)</span>
              </span>
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-white/20 border border-white/30 rounded text-slate-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Universal PDF Export</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Sign-up / Total Privacy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Real-time Calculation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Popular Tools Carousel / Quick Cards */}
        {selectedCategory === 'all' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Most Popular Calculators
                </h2>
              </div>
              <button
                onClick={() => onSelectCategory('popular')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all popular
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTools.slice(0, 8).map((tool) => (
                <a
                  key={tool.id}
                  href={tool.route}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                      onSelectTool(tool.id);
                    }
                  }}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {tool.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        PDF Ready
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>Calculate Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Category Navigation Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Explore Calculators by Category
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              15 Specialized Categories
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>All Tools</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {TOOLS_REGISTRY.length}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory('popular')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'popular'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <span>Popular</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === 'popular' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {popularTools.length}
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter Input for current category */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={`Filter in ${
                selectedCategory === 'all'
                  ? 'All Tools'
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.name
              }...`}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto">
            Showing <strong>{filteredTools.length}</strong> calculators
          </span>
        </div>

        {/* Full Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);
            return (
              <a
                key={tool.id}
                href={tool.route}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    onSelectTool(tool.id);
                  }
                }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tool.category}
                    </span>
                    {isFav && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {tool.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700/60"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 flex items-center gap-1">
                    Launch Tool
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/60">
                    <FileText className="w-3 h-3 text-blue-500" />
                    PDF Ready
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">No calculators found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find any tools matching &quot;{filterQuery}&quot;. Try another search keyword or switch categories.
            </p>
            <button
              onClick={() => {
                setFilterQuery('');
                onSelectCategory('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* How It Works & Universal PDF Philosophy */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                The SmartTools Hub Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Universal PDF Generation Built-in to Every Calculation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rather than treating PDF as an isolated file-compression or merging widget, SmartTools Hub integrates official PDF report generation as a first-class feature across all 60+ calculators.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-700/80">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Enter Parameters</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time sliders, inputs, and presets calculate your financial, engineering, or everyday figures without page reload.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Analyze Visual Breakdown</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  View year-by-year amortization, tax slabs, step-by-step mathematical reasoning, and worked examples.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">1-Click PDF & CSV</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download an official, branded PDF document ready to print, share via WhatsApp, or submit to banks and advisors.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
