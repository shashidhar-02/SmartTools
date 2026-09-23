import React from 'react';
import { Layers, FileText, ShieldCheck, Heart, ArrowUp, MessageSquarePlus } from 'lucide-react';
import { CATEGORIES } from '../data/toolsRegistry';
import { CategoryId } from '../types';

interface FooterProps {
  onSelectCategory: (cat: CategoryId) => void;
  onOpenLegal: (page: 'about' | 'privacy' | 'terms' | 'disclaimer' | 'contact') => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenLegal,
  onOpenFeedback,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 pt-16 pb-12 border-t border-slate-800 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & feature row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                SmartTools<span className="text-blue-400">.</span>Hub
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              The premier All-in-One Calculator, Converter, Data & Utility Hub. Every single tool features instant, high-resolution PDF report generation, CSV data export, and direct link sharing. 100% free with no account required.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Universal PDF Export
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No Sign-up Required
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                Mobile & PWA Ready
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/${cat.id}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        onSelectCategory(cat.id);
                      }
                    }}
                    className="hover:text-white transition-colors text-left inline-block"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              More Tools & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(7, 13).map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/${cat.id}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        onSelectCategory(cat.id);
                      }
                    }}
                    className="hover:text-white transition-colors text-left inline-block"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => onOpenLegal('disclaimer')}
                  className="text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  Disclaimer & Estimates
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Compliance Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button onClick={() => onOpenLegal('about')} className="hover:text-white transition-colors cursor-pointer">
              About SmartTools
            </button>
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => onOpenLegal('disclaimer')} className="hover:text-white transition-colors cursor-pointer">
              Disclaimer
            </button>
            <button onClick={() => onOpenLegal('contact')} className="hover:text-white transition-colors cursor-pointer">
              Contact & Support
            </button>
            {onOpenFeedback && (
              <button
                onClick={onOpenFeedback}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Send feedback directly to s94094838@gmail.com"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400" />
                <span>Leave Feedback</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} SmartTools Hub. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
          <p>
            <strong>Educational & Informational Notice:</strong> Calculators and converters provided on SmartTools Hub are designed for planning, calculation assistance, and estimation purposes. Financial rules (e.g., Income Tax slabs, EPF rates, Gratuity, GST) and medical estimates (e.g., BMI, BMR, Calorie Deficit) are calculated according to widely accepted reference models and should be independently verified with certified professionals prior to making binding decisions.
          </p>
        </div>
      </div>
    </footer>
  );
};
