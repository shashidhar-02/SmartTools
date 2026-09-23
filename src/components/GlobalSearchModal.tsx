import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, FileText, ArrowRight, Sparkles, Zap, CornerDownLeft } from 'lucide-react';
import { TOOLS_REGISTRY, CATEGORIES } from '../data/toolsRegistry';
import { ToolDefinition } from '../types';
import { parseNaturalSearchQuery } from '../lib/search/searchRouter';
import { logFirstPartyEvent, logUnfulfilledQuery } from '../lib/analytics/firstPartyLearning';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Natural Language Understanding & Direct Intent Routing Parser
  const parsedIntent = useMemo(() => {
    return parseNaturalSearchQuery(query);
  }, [query]);

  const normalizedQuery = query.trim().toLowerCase();
  const isPdfSearch = normalizedQuery.includes('pdf');

  const filteredTools: ToolDefinition[] = normalizedQuery
    ? TOOLS_REGISTRY.filter((tool) => {
        return (
          tool.name.toLowerCase().includes(normalizedQuery) ||
          tool.shortName?.toLowerCase().includes(normalizedQuery) ||
          tool.description.toLowerCase().includes(normalizedQuery) ||
          tool.category.toLowerCase().includes(normalizedQuery) ||
          tool.keywords.some((kw) => kw.toLowerCase().includes(normalizedQuery))
        );
      })
    : TOOLS_REGISTRY.filter((t) => t.popular);

  const handleSelect = (toolId: string) => {
    logFirstPartyEvent({
      type: 'search_performed',
      query,
      toolId,
    });
    onSelectTool(toolId);
    onClose();
  };

  // Execute direct match or first result on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (parsedIntent.isDirectMatch && parsedIntent.matchedTool) {
        handleSelect(parsedIntent.matchedTool.id);
      } else if (filteredTools.length > 0) {
        handleSelect(filteredTools[0].id);
      } else if (query.trim().length >= 3) {
        logUnfulfilledQuery(query);
      }
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-6 md:p-20 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto sm:my-0 max-h-[92vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="relative flex items-center px-3 sm:px-4 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 ml-0.5 sm:ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search 60+ tools (e.g. EMI, Tax, BMI, GPA)..."
            className="w-full bg-transparent px-2.5 sm:px-3 py-1.5 text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md shrink-0">
            ESC
          </div>
        </div>

        {/* HIGH-CONFIDENCE DIRECT INTENT MATCH BANNER */}
        {parsedIntent.isDirectMatch && parsedIntent.matchedTool && (
          <div className="mx-3 mt-3 p-3 sm:p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg shrink-0">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-blue-100">
                    Direct Match ({Math.round(parsedIntent.confidence * 100)}%)
                  </span>
                  <span className="text-xs font-bold text-white">
                    {parsedIntent.matchedTool.name}
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5 font-medium">
                  {parsedIntent.matchedIntent}
                </p>
                {parsedIntent.extractedInputs && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(parsedIntent.extractedInputs).map(([k, v]) => (
                      <span key={k} className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-white font-mono">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleSelect(parsedIntent.matchedTool!.id)}
              className="w-full sm:w-auto justify-center px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Open Tool</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Informative banner when searching 'PDF' */}
        {isPdfSearch && (
          <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 p-3.5 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                Universal PDF Export on Every Calculation!
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                SmartTools Hub is an all-in-one calculator & data engine where <strong>every result</strong> can be downloaded as a professional PDF report. Simply open any calculator below and click <strong>&quot;Download PDF&quot;</strong> to export your customized report!
              </p>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[55vh] sm:max-h-[60vh] overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>{normalizedQuery ? `Matching Tools (${filteredTools.length})` : 'Popular Quick Calculators'}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline">Instant Results</span>
          </div>

          {filteredTools.length === 0 ? (
            <div className="py-10 sm:py-12 text-center text-slate-400 dark:text-slate-500 space-y-3 px-3">
              <p className="text-sm font-semibold">No exact tool matches &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We frequently add new calculators based on user requests. If you would like this tool added, please let us know via the Feedback button!
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Tools You Might Need:
                </span>
                <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                  {TOOLS_REGISTRY.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t.id)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            filteredTools.map((tool) => {
              const category = CATEGORIES.find((c) => c.id === tool.category);
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.id)}
                  className="w-full text-left p-3 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3 pr-2">
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.name}
                        </span>
                        {category && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${category.badgeBg}`}>
                            {category.name}
                          </span>
                        )}
                        {tool.popular && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 px-1.5 py-0.5 rounded font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">100% Free</span> No account needed
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>PDF export available on all results</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Direct Intent Engine v2.5</span>
        </div>
      </div>
    </div>
  );
};
