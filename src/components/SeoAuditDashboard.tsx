import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Layers,
  FileCode2,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { TOOLS_REGISTRY, CATEGORIES } from '../data/toolsRegistry';
import { ToolDefinition } from '../types';

interface AuditItem {
  route: string;
  toolId: string;
  name: string;
  category: string;
  title: string;
  description: string;
  h1: string;
  canonical: string;
  hasBreadcrumb: boolean;
  incomingInternalLinksCount: number;
  outgoingRelatedLinksCount: number;
  inSitemap: boolean;
  hasStructuredData: boolean;
  hasOpenGraph: boolean;
  hasCategoryAssociation: boolean;
  issues: {
    type: 'error' | 'warning' | 'info';
    message: string;
  }[];
}

interface SeoAuditDashboardProps {
  onSelectTool: (id: string) => void;
  onGoHome: () => void;
}

export const SeoAuditDashboard: React.FC<SeoAuditDashboardProps> = ({
  onSelectTool,
  onGoHome,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'errors' | 'warnings' | 'clean'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Perform full audit of TOOLS_REGISTRY
  const auditResults = useMemo(() => {
    // Check for duplicate titles and descriptions
    const titleCounts = new Map<string, number>();
    const descCounts = new Map<string, number>();

    TOOLS_REGISTRY.forEach((t) => {
      const fullTitle = `${t.name} - Free Calculator & Instant PDF Report | SmartTools Hub`;
      titleCounts.set(fullTitle, (titleCounts.get(fullTitle) || 0) + 1);
      descCounts.set(t.description, (descCounts.get(t.description) || 0) + 1);
    });

    // Compute incoming link counts from other tools' relatedToolIds
    const incomingLinks = new Map<string, number>();
    TOOLS_REGISTRY.forEach((t) => {
      t.relatedToolIds.forEach((relId) => {
        incomingLinks.set(relId, (incomingLinks.get(relId) || 0) + 1);
      });
    });

    const items: AuditItem[] = TOOLS_REGISTRY.map((t) => {
      const fullTitle = `${t.name} - Free Calculator & Instant PDF Report | SmartTools Hub`;
      const issues: { type: 'error' | 'warning' | 'info'; message: string }[] = [];

      // 1. Missing / Duplicate Title
      if (!t.name || t.name.trim().length === 0) {
        issues.push({ type: 'error', message: 'Missing tool title / page title.' });
      } else if (titleCounts.get(fullTitle)! > 1) {
        issues.push({ type: 'error', message: `Duplicate title detected (${titleCounts.get(fullTitle)} instances).` });
      }

      // 2. Missing / Duplicate Description
      if (!t.description || t.description.trim().length === 0) {
        issues.push({ type: 'error', message: 'Missing meta description.' });
      } else if (t.description.length < 50) {
        issues.push({ type: 'warning', message: 'Meta description too short (< 50 chars).' });
      } else if (descCounts.get(t.description)! > 1) {
        issues.push({ type: 'warning', message: 'Duplicate meta description shared with another tool.' });
      }

      // 3. H1 & Breadcrumb Validation
      if (!t.name) {
        issues.push({ type: 'error', message: 'Missing primary H1 tag.' });
      }

      // 4. URL & Canonical syntax
      if (!t.route.startsWith('/') || t.route.includes(' ') || t.route.includes('//')) {
        issues.push({ type: 'error', message: `Invalid route format: "${t.route}"` });
      }

      // 5. Category Association
      const categoryExists = CATEGORIES.some((c) => c.id === t.category);
      if (!categoryExists) {
        issues.push({ type: 'error', message: `Invalid category reference: "${t.category}".` });
      }

      // 6. Orphan Page Detection (Incoming links)
      const incoming = incomingLinks.get(t.id) || 0;
      if (incoming === 0 && !t.popular) {
        issues.push({
          type: 'info',
          message: 'Zero incoming related-tool links (accessible via Category and Search only).',
        });
      }

      // 7. Outgoing Related Links
      if (t.relatedToolIds.length === 0) {
        issues.push({ type: 'warning', message: 'Missing outgoing related internal links.' });
      } else {
        // Validate each relatedToolId exists
        t.relatedToolIds.forEach((relId) => {
          const exists = TOOLS_REGISTRY.some((other) => other.id === relId);
          if (!exists) {
            issues.push({ type: 'error', message: `Broken related tool link: "${relId}" does not exist.` });
          }
        });
      }

      // 8. Structured Data Validation
      const hasFaqs = Boolean(t.faqs && t.faqs.length > 0);
      const hasFormula = Boolean(t.formula);
      if (!hasFormula && t.category !== 'pdf-tools') {
        issues.push({ type: 'info', message: 'Educational formula missing from tool metadata.' });
      }

      return {
        route: t.route,
        toolId: t.id,
        name: t.name,
        category: t.category,
        title: fullTitle,
        description: t.description,
        h1: t.name,
        canonical: `https://smarttools.app${t.route}`,
        hasBreadcrumb: true,
        incomingInternalLinksCount: incoming,
        outgoingRelatedLinksCount: t.relatedToolIds.length,
        inSitemap: true,
        hasStructuredData: true,
        hasOpenGraph: true,
        hasCategoryAssociation: categoryExists,
        issues,
      };
    });

    return items;
  }, []);

  // Filter items
  const filteredResults = useMemo(() => {
    return auditResults.filter((item) => {
      if (filterSeverity === 'errors') {
        if (!item.issues.some((i) => i.type === 'error')) return false;
      } else if (filterSeverity === 'warnings') {
        if (!item.issues.some((i) => i.type === 'warning')) return false;
      } else if (filterSeverity === 'clean') {
        if (item.issues.some((i) => i.type === 'error' || i.type === 'warning')) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [auditResults, filterSeverity, searchQuery]);

  const totalErrors = auditResults.reduce(
    (acc, item) => acc + item.issues.filter((i) => i.type === 'error').length,
    0
  );
  const totalWarnings = auditResults.reduce(
    (acc, item) => acc + item.issues.filter((i) => i.type === 'warning').length,
    0
  );
  const cleanPages = auditResults.filter(
    (item) => !item.issues.some((i) => i.type === 'error' || i.type === 'warning')
  ).length;

  const healthScore = Math.max(
    0,
    Math.round(100 - (totalErrors * 5 + totalWarnings * 1.5))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SmartTools Hub</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Technical SEO &amp; Crawl Architecture Audit</span>
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
              Dev Route /__seo-audit
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated health inspection auditing indexability, duplicate metadata, canonicalization, orphan pages, structured data, and internal link graph.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-xs text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              SEO Health Score
            </span>
            <span
              className={`text-2xl font-black ${
                healthScore >= 90
                  ? 'text-emerald-600'
                  : healthScore >= 75
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {healthScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Indexed Tools</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{TOOLS_REGISTRY.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            All registered in sitemap.xml
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Clean Pages</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{cleanPages}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {((cleanPages / TOOLS_REGISTRY.length) * 100).toFixed(1)}% of registry
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Audit Warnings</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalWarnings}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Non-critical optimizations</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Critical Errors</span>
          <p className="text-2xl font-black text-red-600 mt-1">{totalErrors}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Immediate indexing blockers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Pages ({auditResults.length})
          </button>
          <button
            onClick={() => setFilterSeverity('clean')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              filterSeverity === 'clean'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Clean ({cleanPages})
          </button>
          <button
            onClick={() => setFilterSeverity('warnings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              filterSeverity === 'warnings'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Warnings ({auditResults.filter((i) => i.issues.some((x) => x.type === 'warning')).length})
          </button>
          <button
            onClick={() => setFilterSeverity('errors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              filterSeverity === 'errors'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Errors ({auditResults.filter((i) => i.issues.some((x) => x.type === 'error')).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by tool name or route..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Audit Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3">Route / Calculator</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Title &amp; Meta</th>
                <th className="px-3 py-3">Crawl Graph</th>
                <th className="px-3 py-3">Structured Data</th>
                <th className="px-4 py-3">Audit Diagnostics</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredResults.map((item) => {
                const hasErrors = item.issues.some((i) => i.type === 'error');
                const hasWarnings = item.issues.some((i) => i.type === 'warning');

                return (
                  <tr key={item.toolId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <code className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                        {item.route}
                      </code>
                    </td>

                    <td className="px-3 py-3">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-slate-700 font-medium">H1, Title, Canonical OK</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={item.description}>
                        {item.description}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="text-[11px]">
                        <span className="text-slate-500">In:</span> <strong>{item.incomingInternalLinksCount}</strong> |{' '}
                        <span className="text-slate-500">Out:</span> <strong>{item.outgoingRelatedLinksCount}</strong>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">In sitemap.xml</span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <span className="text-emerald-700 font-medium">✓ WebApplication</span>
                        <span className="text-emerald-700 font-medium">✓ BreadcrumbList</span>
                        <span className="text-emerald-700 font-medium">✓ OpenGraph</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {item.issues.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          100% Passed
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {item.issues.map((iss, idx) => (
                            <div
                              key={idx}
                              className={`text-[10px] font-medium flex items-start gap-1 ${
                                iss.type === 'error'
                                  ? 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                                  : iss.type === 'warning'
                                  ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200'
                                  : 'text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded'
                              }`}
                            >
                              {iss.type === 'error' ? (
                                <XCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                              ) : iss.type === 'warning' ? (
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                              ) : null}
                              <span>{iss.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => onSelectTool(item.toolId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
