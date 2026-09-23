import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'dropdown' | 'segmented';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'dropdown',
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const themes: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
    {
      id: 'light',
      label: 'Day (Light)',
      icon: Sun,
      description: 'Clean high-contrast daytime view',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Comfortable low-glare evening view',
    },
    {
      id: 'system',
      label: 'System',
      icon: Laptop,
      description: 'Matches your OS display settings',
    },
  ];

  if (variant === 'segmented') {
    return (
      <div
        className={`flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}
        role="group"
        aria-label="Select color theme"
      >
        {themes.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={`${t.label}: ${t.description}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.id === 'light' ? 'Day' : t.id === 'dark' ? 'Dark' : 'Auto'}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default dropdown variant
  const CurrentIcon =
    theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current theme: ${theme} (${resolvedTheme} active). Change theme`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title="Change theme (Day / Dark / System)"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-amber-500 dark:text-blue-400" />
        <span className="hidden sm:inline capitalize">
          {theme === 'light' ? 'Day' : theme === 'dark' ? 'Dark' : 'System'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Display Theme
            </span>
          </div>

          <div className="py-1">
            {themes.map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1 rounded-lg ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">{t.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                        {t.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
