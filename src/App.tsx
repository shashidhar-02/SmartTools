import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHub } from './components/HomeHub';
import { ToolShell } from './components/ToolShell';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { LegalModal } from './components/LegalModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ToastProvider } from './components/Toast';
import { FilterCategoryId, ToolDefinition, CalculationResult } from './types';
import { TOOLS_REGISTRY } from './data/toolsRegistry';

// Category Calculator Modules
import { FinanceCalculators } from './components/calculators/FinanceCalculators';
import { SalaryTaxCalculators } from './components/calculators/SalaryTaxCalculators';
import { BusinessGstCalculators } from './components/calculators/BusinessGstCalculators';
import { StudentMathCalculators } from './components/calculators/StudentMathCalculators';
import { DateTimeCalculators } from './components/calculators/DateTimeCalculators';
import { HealthLifestyleCalculators } from './components/calculators/HealthLifestyleCalculators';
import { FitnessGymCalculators } from './components/calculators/FitnessGymCalculators';
import { ConstructionTilesCalculators } from './components/calculators/ConstructionTilesCalculators';
import { FutureCalculators } from './components/calculators/FutureCalculators';
import { ConvertersTechCalculators } from './components/calculators/ConvertersTechCalculators';
import { PdfStudio } from './components/pdf/PdfStudio';
import { SEOHead } from './components/SEOHead';
import { SeoAuditDashboard } from './components/SeoAuditDashboard';
import { DemandRadarDashboard } from './components/DemandRadarDashboard';
import { CATEGORIES } from './data/toolsRegistry';
import { parseNaturalSearchQuery } from './lib/search/searchRouter';
import { logFirstPartyEvent } from './lib/analytics/firstPartyLearning';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategoryId>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isSeoAuditOpen, setIsSeoAuditOpen] = useState<boolean>(false);
  const [isDemandRadarOpen, setIsDemandRadarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [legalModalPage, setLegalModalPage] = useState<'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact' | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackTargetToolId, setFeedbackTargetToolId] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smarttools_favorites');
      return saved ? JSON.parse(saved) : ['emi', 'sip', 'ctc-to-in-hand', 'gst', 'income-tax', 'bmi'];
    } catch {
      return ['emi', 'sip', 'ctc-to-in-hand', 'gst', 'income-tax', 'bmi'];
    }
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('smarttools_favorites', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // Keyboard shortcut ⌘K or Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parse URL on mount and handle Browser Back/Forward navigation
  const syncFromLocation = useCallback(() => {
    const path = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const paramTool = searchParams.get('tool');
    const paramCat = searchParams.get('cat') as FilterCategoryId;
    const paramQuery = searchParams.get('q');

    if (paramQuery) {
      const parsed = parseNaturalSearchQuery(paramQuery);
      if (parsed.isDirectMatch && parsed.matchedTool) {
        setActiveToolId(parsed.matchedTool.id);
        setSelectedCategory(parsed.matchedTool.category);
        logFirstPartyEvent({
          type: 'search_performed',
          query: paramQuery,
          toolId: parsed.matchedTool.id,
        });
        return;
      }
    }

    if (paramTool) {
      const match = TOOLS_REGISTRY.find((t) => t.id === paramTool || t.slug === paramTool);
      if (match) {
        setActiveToolId(match.id);
        setSelectedCategory(match.category);
        return;
      }
    }

    if (paramCat) {
      setSelectedCategory(paramCat);
      setActiveToolId(null);
      return;
    }

    // Match route or slug from TOOLS_REGISTRY
    const foundTool = TOOLS_REGISTRY.find(
      (t) =>
        t.route.toLowerCase() === path ||
        path.endsWith('/' + t.id) ||
        (t.slug && path.includes(t.slug))
    );
    if (foundTool) {
      setActiveToolId(foundTool.id);
      setSelectedCategory(foundTool.category);
      return;
    }

    // Match category
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    if (cleanPath === '__seo-audit' || searchParams.get('audit') === 'true') {
      setIsSeoAuditOpen(true);
      setIsDemandRadarOpen(false);
      setActiveToolId(null);
      return;
    }

    if (cleanPath === '__demand-radar' || searchParams.get('radar') === 'true') {
      setIsDemandRadarOpen(true);
      setIsSeoAuditOpen(false);
      setActiveToolId(null);
      return;
    }

    if (cleanPath === 'pdf' || cleanPath === 'pdf-tools' || cleanPath.startsWith('pdf/')) {
      setSelectedCategory('pdf-tools');
      setActiveToolId(null);
      setIsSeoAuditOpen(false);
      setIsDemandRadarOpen(false);
      return;
    }

    const matchedCategory = [
      'finance',
      'salary',
      'business',
      'student',
      'math',
      'converters',
      'date',
      'health',
      'construction',
      'vehicle',
      'agriculture',
      'statistics',
      'technology',
      'everyday',
      'currency',
      'popular',
      'favorites',
    ].find((c) => cleanPath === c);

    if (matchedCategory) {
      setSelectedCategory(matchedCategory as FilterCategoryId);
      setActiveToolId(null);
      setIsSeoAuditOpen(false);
    }
  }, []);

  useEffect(() => {
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, [syncFromLocation]);

  // Scroll to top when switching tools or categories + update URL state
  const handleSelectTool = (id: string) => {
    setIsSeoAuditOpen(false);
    setIsDemandRadarOpen(false);
    setActiveToolId(id);
    const tool = TOOLS_REGISTRY.find((t) => t.id === id);
    if (tool) {
      setSelectedCategory(tool.category);
      logFirstPartyEvent({
        type: 'calculator_opened',
        toolId: id,
        category: tool.category,
      });
      try {
        window.history.pushState({ toolId: id }, '', tool.route);
      } catch {
        // Safe fallback in sandboxed frame
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: FilterCategoryId) => {
    setIsSeoAuditOpen(false);
    setIsDemandRadarOpen(false);
    setSelectedCategory(cat);
    setActiveToolId(null);
    try {
      window.history.pushState({ category: cat }, '', cat === 'all' ? '/' : `/${cat}`);
    } catch {
      // Safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setIsSeoAuditOpen(false);
    setIsDemandRadarOpen(false);
    setActiveToolId(null);
    setSelectedCategory('all');
    try {
      window.history.pushState(null, '', '/');
    } catch {
      // Safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSeoAudit = () => {
    setIsSeoAuditOpen(true);
    setIsDemandRadarOpen(false);
    setActiveToolId(null);
    try {
      window.history.pushState({ audit: true }, '', '/__seo-audit');
    } catch {
      // Safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDemandRadar = () => {
    setIsDemandRadarOpen(true);
    setIsSeoAuditOpen(false);
    setActiveToolId(null);
    try {
      window.history.pushState({ radar: true }, '', '/__demand-radar');
    } catch {
      // Safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTool = TOOLS_REGISTRY.find((t) => t.id === activeToolId);

  // Render specific calculator component based on active tool category
  const renderCalculatorBody = () => {
    if (!activeTool) return null;

    const cat = activeTool.category;
    if (
      activeTool.id === 'ai-tokens' ||
      activeTool.id === 'gpu-cost' ||
      activeTool.id === 'solar-savings' ||
      activeTool.id === 'future-date' ||
      activeTool.id === 'ev-savings'
    ) {
      return <FutureCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'finance') {
      return <FinanceCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'salary') {
      return <SalaryTaxCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'business') {
      return <BusinessGstCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'student' || cat === 'math') {
      return <StudentMathCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'date') {
      return <DateTimeCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'health') {
      return <FitnessGymCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'construction') {
      return <ConstructionTilesCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    if (cat === 'vehicle' || cat === 'agriculture') {
      return <HealthLifestyleCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
    }
    // Default / Converters, Tech, Currency, Statistics, Everyday
    return <ConvertersTechCalculators toolId={activeTool.id} onResultChange={setCurrentResult} />;
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-200">
        {/* Dynamic SEO Head & Structured Data Engine */}
        <SEOHead
          tool={activeTool}
          category={CATEGORIES.find((c) => c.id === selectedCategory)}
          mode={
            isSeoAuditOpen
              ? 'audit'
              : activeTool
              ? 'tool'
              : selectedCategory === 'pdf-tools'
              ? 'pdf'
              : selectedCategory !== 'all'
              ? 'category'
              : 'home'
          }
        />

        {/* Navigation Bar */}
        <Navbar
          activeCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onSelectTool={handleSelectTool}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenFeedback={() => {
            setFeedbackTargetToolId(activeToolId);
            setIsFeedbackOpen(true);
          }}
          favoritesCount={favorites.length}
          historyCount={0}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {isDemandRadarOpen ? (
            <DemandRadarDashboard
              onSelectTool={handleSelectTool}
              onGoHome={handleGoHome}
            />
          ) : isSeoAuditOpen ? (
            <SeoAuditDashboard
              onSelectTool={handleSelectTool}
              onGoHome={handleGoHome}
            />
          ) : selectedCategory === 'pdf-tools' || activeTool?.category === 'pdf-tools' ? (
            <PdfStudio initialToolId={activeTool?.id} />
          ) : activeTool ? (
            <ToolShell
              tool={activeTool}
              result={currentResult}
              onSelectTool={handleSelectTool}
              onSelectCategory={handleSelectCategory}
              isFavorite={favorites.includes(activeTool.id)}
              onToggleFavorite={toggleFavorite}
              onOpenFeedback={(toolId) => {
                setFeedbackTargetToolId(toolId || activeToolId);
                setIsFeedbackOpen(true);
              }}
            >
              {renderCalculatorBody()}
            </ToolShell>
          ) : (
            <HomeHub
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onSelectTool={handleSelectTool}
              onOpenSearch={() => setIsSearchOpen(true)}
              favorites={favorites}
            />
          )}
        </main>

        {/* Global Search Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectTool={handleSelectTool}
        />

        {/* Legal & Trust Modal Dialogs */}
        <LegalModal
          page={legalModalPage}
          onClose={() => setLegalModalPage(null)}
          onOpenFeedback={() => {
            setFeedbackTargetToolId(activeToolId);
            setIsFeedbackOpen(true);
          }}
        />

        {/* Feedback & Bug Reporting Modal */}
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          currentToolId={feedbackTargetToolId}
        />

        {/* Global Footer */}
        <Footer
          onSelectCategory={handleSelectCategory}
          onOpenLegal={(p) => setLegalModalPage(p)}
          onOpenFeedback={() => {
            setFeedbackTargetToolId(activeToolId);
            setIsFeedbackOpen(true);
          }}
        />
      </div>
    </ToastProvider>
  );
}
