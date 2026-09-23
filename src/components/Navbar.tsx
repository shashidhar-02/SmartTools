import React, { useState } from 'react';
import {
  Search,
  FileText,
  Menu,
  X,
  Star,
  History,
  Sparkles,
  ChevronDown,
  Layers,
  MessageSquarePlus,
} from 'lucide-react';
import { CATEGORIES, TOOLS_REGISTRY } from '../data/toolsRegistry';
import { CategoryId } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activeCategory: CategoryId | 'all' | 'popular' | 'favorites' | 'history';
  onSelectCategory: (cat: CategoryId | 'all' | 'popular' | 'favorites' | 'history') => void;
  onSelectTool: (toolId: string) => void;
  onOpenSearch: () => void;
  onOpenFeedback: () => void;
  favoritesCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  onSelectTool,
  onOpenSearch,
  onOpenFeedback,
  favoritesCount,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0">
          Universal Feature
        </span>
        <span className="truncate">
          Every calculation, table & result can be exported as a professional PDF report!
        </span>
        <FileText className="w-3.5 h-3.5 opacity-90 hidden sm:inline shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <button
            onClick={() => {
              onSelectCategory('all');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  SmartTools<span className="text-blue-600 font-black">.</span>
                </span>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded uppercase">
                  Hub
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide hidden sm:block">
                Calculators • Converters • PDF Reports
              </p>
            </div>
          </button>

          {/* Desktop & Tablet Search Trigger */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs lg:text-sm text-slate-400 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">Search 60+ tools (e.g. emi, salary, bmi)...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-2xs shrink-0 ml-2">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PDF Studio Dedicated Link */}
            <button
              onClick={() => onSelectCategory('pdf-tools')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'pdf-tools'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold border border-rose-200 dark:border-rose-800'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>PDF Studio</span>
            </button>

            {/* Quick Filter: Popular */}
            <button
              onClick={() => onSelectCategory('popular')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'popular'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular</span>
            </button>

            {/* Quick Filter: Favorites */}
            <button
              onClick={() => onSelectCategory('favorites')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'favorites'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Saved Favorites"
            >
              <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
              {favoritesCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Quick Filter: History */}
            <button
              onClick={() => onSelectCategory('history')}
              className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'history'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Recently Used"
            >
              <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              {historyCount > 0 && (
                <span className="text-[10px] bg-slate-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Feedback Trigger */}
            <button
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              title="Feedback & Support"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Day / Dark / System Theme Toggle */}
            <ThemeToggle className="hidden sm:inline-block" />

            {/* Mobile Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Search calculators"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile & Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Category Bar (Scrollable horizontally) */}
        <div className="hidden lg:flex items-center gap-1.5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Tools
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto shadow-xl">
          {/* Dedicated In-Menu Search Bar */}
          <div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-all text-left shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                  Search 60+ tools (e.g., emi, gst, bmi)...
                </span>
              </div>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-2xs shrink-0 ml-2">
                Search
              </span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-left border ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              All Tools
            </button>
            <button
              onClick={() => {
                onSelectCategory('popular');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-left border flex items-center justify-between ${
                activeCategory === 'popular'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
              }`}
            >
              <span>Popular</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onSelectCategory('favorites');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-left border flex items-center justify-between ${
                activeCategory === 'favorites'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
              }`}
            >
              <span>Favorites ({favoritesCount})</span>
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => {
                onSelectCategory('pdf-tools');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg text-xs font-semibold text-left border flex items-center justify-between ${
                activeCategory === 'pdf-tools'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
              }`}
            >
              <span>PDF Studio</span>
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Leave Feedback CTA */}
          <button
            type="button"
            onClick={() => {
              onOpenFeedback();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50"
          >
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Leave Feedback / Report Problem</span>
            </div>
            <span className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
              Email Support
            </span>
          </button>

          {/* Mobile Theme Selector */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Display Theme
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Tool Categories List */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Tool Categories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors min-h-[40px] ${
                    activeCategory === cat.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {TOOLS_REGISTRY.filter((t) => t.category === cat.id).length} tools
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

