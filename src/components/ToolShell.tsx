import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Share2,
  Star,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Info,
  Check,
  MessageSquarePlus,
} from 'lucide-react';
import { ToolDefinition, CalculationResult } from '../types';
import { CATEGORIES, TOOLS_REGISTRY } from '../data/toolsRegistry';
import { exportCalculationToPDF } from '../utils/pdfExport';
import { exportCalculationToCSV } from '../utils/csvExport';
import { shareResult, openWhatsAppShare, copyToClipboard, formatResultForClipboard } from '../utils/shareUtils';
import { useToast } from './Toast';
import { ResultChart } from './ResultChart';
import { requestResultExplanation } from '../lib/ai/aiClient';
import { Sparkles, Bot } from 'lucide-react';

interface ToolShellProps {
  tool: ToolDefinition;
  result: CalculationResult | null;
  children: React.ReactNode;
  onSelectTool: (id: string) => void;
  onSelectCategory: (cat: any) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenFeedback?: (toolId: string) => void;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  result,
  children,
  onSelectTool,
  onSelectCategory,
  isFavorite,
  onToggleFavorite,
  onOpenFeedback,
}) => {
  const { showToast } = useToast();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const category = CATEGORIES.find((c) => c.id === tool.category);

  // Explain with AI handler
  const handleExplainWithAi = async () => {
    if (!result) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await requestResultExplanation(tool.name, result);
      if (response.success && response.explanation) {
        setAiExplanation(response.explanation);
      } else {
        setAiError(response.error || 'Free AI capacity is temporarily unavailable. Your calculation itself is still available.');
      }
    } catch {
      setAiError('Free AI capacity is temporarily unavailable. Your calculation itself is still available.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // PDF Export action
  const handleDownloadPDF = () => {
    if (!result) return;
    try {
      exportCalculationToPDF(result);
      showToast('PDF report generated and downloaded!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF. Please try again.', 'error');
    }
  };

  // CSV Export action
  const handleDownloadCSV = () => {
    if (!result) return;
    try {
      exportCalculationToCSV(result);
      showToast('CSV data table exported successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error exporting CSV.', 'error');
    }
  };

  // Copy Result
  const handleCopy = async () => {
    if (!result) return;
    const text = formatResultForClipboard(result);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      showToast('Calculation summary copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share
  const handleShare = async () => {
    if (!result) return;
    const res = await shareResult(result);
    if (res.shared) {
      showToast(res.method === 'native' ? 'Shared successfully!' : 'Link copied to clipboard!', 'success');
    }
  };

  // WhatsApp
  const handleWhatsApp = () => {
    if (!result) return;
    openWhatsAppShare(result);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const relatedTools = (tool.relatedToolIds || [])
    .map((id) => TOOLS_REGISTRY.find((t) => t.id === id))
    .filter(Boolean) as ToolDefinition[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
        <a
          href="/"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              onSelectCategory('all');
            }
          }}
          className="hover:text-blue-600 transition-colors"
        >
          Home
        </a>
        <span aria-hidden="true">/</span>
        {category && (
          <>
            <a
              href={`/${category.id}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  onSelectCategory(category.id);
                }
              }}
              className="hover:text-blue-600 transition-colors capitalize"
            >
              {category.name}
            </a>
            <span aria-hidden="true">/</span>
          </>
        )}
        <span className="text-slate-800 dark:text-slate-200 font-semibold" aria-current="page">{tool.name}</span>
      </nav>

      {/* Tool Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h1>
            <button
              onClick={() => onToggleFavorite(tool.id)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Universal PDF Export Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 leading-tight">
                PDF Export Ready
              </div>
              <div className="text-[10px] text-blue-700 dark:text-blue-400">
                1-Click Official Report
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Work Area: Form (Left) & Result + Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
        {/* Left Column: Interactive Calculator Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
          {children}
        </div>

        {/* Right Column: Result Presentation & Universal Export Toolbar */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <>
              {/* Primary Output Display Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{result.primaryResult.label}</span>
                  <div className="flex items-center gap-1.5">
                    {result.resultType && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        result.resultType === 'LIVE DATA'
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                          : result.resultType === 'PROJECTION'
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                          : result.resultType === 'ESTIMATE'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                          : 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                      }`}>
                        {result.resultType}
                      </span>
                    )}
                    {result.primaryResult.badge && (
                      <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                        {result.primaryResult.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight my-2">
                  {result.primaryResult.value}
                </div>
                {result.primaryResult.subtext && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.primaryResult.subtext}
                  </p>
                )}

                {/* Data Transparency & Source Citation */}
                {result.dataSource && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
                    <span>Source: <strong className="text-white">{result.dataSource}</strong></span>
                    {result.dataTimestamp && (
                      <span className="text-slate-400 font-mono text-[10px]">{result.dataTimestamp}</span>
                    )}
                  </div>
                )}

                {/* Quick breakdown list */}
                {result.breakdown && result.breakdown.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-700/80 space-y-2.5">
                    {result.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{item.label}</span>
                        <div className="text-right">
                          <span className="font-semibold text-white">{item.value}</span>
                          {item.note && (
                            <span className="text-[10px] text-slate-400 ml-1.5">
                              ({item.note})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stated Assumptions for Projections and Estimates */}
                {result.assumptions && result.assumptions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Stated Assumptions:
                    </span>
                    <ul className="space-y-1">
                      {result.assumptions.map((assump, i) => (
                        <li key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span>{assump}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Visual Breakdown Chart */}
              {result.chartData && (
                <ResultChart data={result.chartData} title="Visual Allocation Breakdown" />
              )}

              {/* Explain with AI - Free OpenRouter model feature */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>AI Insight</span>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Instant Calculation Insights
                  </span>
                </div>

                {!aiExplanation && !isAiLoading && !aiError && (
                  <button
                    onClick={handleExplainWithAi}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Explain this result with AI</span>
                  </button>
                )}

                {isAiLoading && (
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-xs text-purple-900 dark:text-purple-300 font-medium">
                      Generating calculation insights...
                    </span>
                  </div>
                )}

                {aiExplanation && (
                  <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                        Educational Explanation
                      </span>
                      <button
                        onClick={() => setAiExplanation(null)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {aiExplanation}
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                    <p className="text-xs text-amber-800 dark:text-amber-300">{aiError}</p>
                    <button
                      onClick={handleExplainWithAi}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>

              {/* ACTION TOOLBAR - PDF, CSV, PRINT, SHARE */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Download & Share Results</span>
                </div>

                {/* Primary Download PDF Button */}
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Result as PDF</span>
                </button>

                {/* Secondary Action Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {result.scheduleTable ? (
                    <button
                      onClick={handleDownloadCSV}
                      className="flex flex-col items-center justify-center py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                      title="Download Schedule Table as CSV"
                    >
                      <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                      <span>Export CSV</span>
                    </button>
                  ) : null}

                  <button
                    onClick={handleCopy}
                    className="flex flex-col items-center justify-center py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    title="Copy calculation summary"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400 mb-1" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex flex-col items-center justify-center py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    title="Print cleanly"
                  >
                    <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400 mb-1" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    className="flex flex-col items-center justify-center py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    title="Share to WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex flex-col items-center justify-center py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    title="Share link"
                  >
                    <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                    <span>Share</span>
                  </button>
                </div>

                {onOpenFeedback && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Notice a discrepancy or have ideas?</span>
                    <button
                      type="button"
                      onClick={() => onOpenFeedback(tool.id)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      title="Send feedback or report issue for this calculator directly to s94094838@gmail.com"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Leave Feedback</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400">
              <Info className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Enter values above to calculate</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Your primary result, detailed breakdown, and PDF download button will appear right here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Amortization / Breakdown Schedule Table (Full Width) */}
      {result?.scheduleTable && (
        <div className="my-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/60">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {result.scheduleTable.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete progression schedule • Exportable as PDF or CSV
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                CSV
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                PDF Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-100/80 dark:bg-slate-800/90 sticky top-0 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  {result.scheduleTable.headers.map((h, idx) => (
                    <th key={idx} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300 font-mono">
                {result.scheduleTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {result.scheduleTable.totalRow && (
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                  <tr>
                    {result.scheduleTable.totalRow.map((cell, idx) => (
                      <td key={idx} className="px-4 py-3 font-mono">
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* SEO & Educational Content Section: Formula, Step Explanation & Worked Example */}
      <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formula & Explanation */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Formula & Calculation Logic
            </h3>
          </div>

          {tool.formula && (
            <div className="p-3 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-blue-300 rounded-xl font-mono text-xs overflow-x-auto">
              {tool.formula}
            </div>
          )}

          {tool.stepExplanation && (
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                How to calculate step-by-step:
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {tool.stepExplanation.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tool.example && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Example: {tool.example.title}
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{tool.example.text}</p>
            </div>
          )}
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions (FAQ)
            </h3>
          </div>

          {tool.faqs && tool.faqs.length > 0 ? (
            <div className="space-y-2.5">
              {tool.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left px-4 py-3 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This tool provides instantaneous, client-side calculations. You can export complete results to PDF at any time without storing data on remote servers.
            </p>
          )}

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              Need this calculation recorded for tax audit, loan meeting, or academic submission? Click <strong>&quot;Download Result as PDF&quot;</strong> above for an official document format.
            </span>
          </div>
        </div>
      </div>

      {/* Related Tools Internal Linking */}
      {relatedTools.length > 0 && (
        <div className="my-10">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Related Calculators & Converters</span>
            {category && (
              <a
                href={`/${category.id}`}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    onSelectCategory(category.id);
                  }
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                More in {category.name} →
              </a>
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((rel) => (
              <a
                key={rel.id}
                href={rel.route}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    onSelectTool(rel.id);
                  }
                }}
                className="text-left p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {rel.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
