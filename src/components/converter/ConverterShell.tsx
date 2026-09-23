import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Scale,
  Ruler,
  Thermometer,
  Box,
  Gauge,
  Clock,
  HardDrive,
  Sparkles,
  Info,
  ExternalLink,
} from 'lucide-react';
import { CalculationResult, ToolDefinition } from '../../types';
import { getToolById, TOOLS } from '../../data/toolsRegistry';
import {
  CONVERSION_CATEGORIES,
  ConverterCategory,
  UnitDefinition,
  getUnitsByCategory,
  getCategoryMetadata,
  formatConversionFormula,
  convertWithMathJS,
} from '../../lib/converters/units';

export type { ConverterCategory, UnitDefinition };

// Map icons to categories
export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  length: Ruler,
  weight: Scale,
  mass: Scale,
  temperature: Thermometer,
  volume: Box,
  speed: Gauge,
  time: Clock,
  data: HardDrive,
};

export interface ConverterShellProps {
  toolId?: string;
  initialCategory?: ConverterCategory;
  onResultChange?: (result: CalculationResult) => void;
  className?: string;
}

export const ConverterShell: React.FC<ConverterShellProps> = ({
  toolId = 'unit-converter',
  initialCategory = 'length',
  onResultChange,
  className = '',
}) => {
  // Query existing tools registry for tool metadata & related tools
  const toolMeta = useMemo(() => getToolById(toolId), [toolId]);

  const [selectedCategory, setSelectedCategory] = useState<ConverterCategory>(initialCategory);
  
  const currentCategoryDef = useMemo(
    () => getCategoryMetadata(selectedCategory),
    [selectedCategory]
  );
  
  const availableUnits = useMemo(
    () => getUnitsByCategory(selectedCategory),
    [selectedCategory]
  );

  const [fromUnitId, setFromUnitId] = useState<string>(currentCategoryDef.defaultFrom);
  const [toUnitId, setToUnitId] = useState<string>(currentCategoryDef.defaultTo);
  const [precision, setPrecision] = useState<number>(4);

  // Bidirectional values
  // We keep 'fromValue' string and 'toValue' string
  // 'lastEdited' tracks whether user typed into 'from' or 'to'
  const [fromValue, setFromValue] = useState<string>('10');
  const [toValue, setToValue] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from');
  const [copiedField, setCopiedField] = useState<'from' | 'to' | null>(null);

  // Sync default units when category changes
  useEffect(() => {
    const meta = getCategoryMetadata(selectedCategory);
    setFromUnitId(meta.defaultFrom);
    setToUnitId(meta.defaultTo);
    setFromValue('10');
    setLastEdited('from');
  }, [selectedCategory]);

  const fromUnitObj = availableUnits.find((u) => u.id === fromUnitId) || availableUnits[0];
  const toUnitObj = availableUnits.find((u) => u.id === toUnitId) || availableUnits[1] || availableUnits[0];

  // Core math.js conversion executor via structured units registry
  const convertUnits = useCallback((val: number, srcUnit: string, targetUnit: string): number => {
    return convertWithMathJS(val, srcUnit, targetUnit);
  }, []);

  // Format number respecting chosen precision
  const formatVal = useCallback((num: number, prec: number): string => {
    if (isNaN(num)) return '';
    if (num === 0) return '0';
    if (Math.abs(num) < 1e-6 || Math.abs(num) >= 1e9) {
      return num.toExponential(prec);
    }
    // Round to precision decimals and strip unnecessary trailing zeros
    const factor = Math.pow(10, prec);
    const rounded = Math.round(num * factor) / factor;
    return String(rounded);
  }, []);

  // Live Bidirectional Calculation updates
  useEffect(() => {
    if (lastEdited === 'from') {
      const num = parseFloat(fromValue);
      if (isNaN(num)) {
        setToValue('');
      } else {
        const converted = convertUnits(num, fromUnitObj.mathjsUnit, toUnitObj.mathjsUnit);
        setToValue(formatVal(converted, precision));
      }
    } else {
      const num = parseFloat(toValue);
      if (isNaN(num)) {
        setFromValue('');
      } else {
        const converted = convertUnits(num, toUnitObj.mathjsUnit, fromUnitObj.mathjsUnit);
        setFromValue(formatVal(converted, precision));
      }
    }
  }, [fromValue, toValue, fromUnitObj, toUnitObj, precision, lastEdited, convertUnits, formatVal]);

  // Swap Units Handler
  const handleSwap = () => {
    const prevFrom = fromUnitId;
    const prevTo = toUnitId;
    setFromUnitId(prevTo);
    setToUnitId(prevFrom);
    setLastEdited('from');
  };

  // 1-unit baseline reference rate
  const unitFactor = useMemo(() => {
    const one = convertUnits(1, fromUnitObj.mathjsUnit, toUnitObj.mathjsUnit);
    return formatVal(one, 6);
  }, [fromUnitObj, toUnitObj, convertUnits, formatVal]);

  const inverseFactor = useMemo(() => {
    const oneInv = convertUnits(1, toUnitObj.mathjsUnit, fromUnitObj.mathjsUnit);
    return formatVal(oneInv, 6);
  }, [fromUnitObj, toUnitObj, convertUnits, formatVal]);

  // Quick Comparison Table (1, 5, 10, 25, 50, 100)
  const quickMatrix = useMemo(() => {
    const steps = [1, 5, 10, 25, 50, 100];
    return steps.map((s) => ({
      input: s,
      output: formatVal(convertUnits(s, fromUnitObj.mathjsUnit, toUnitObj.mathjsUnit), precision),
    }));
  }, [fromUnitObj, toUnitObj, precision, convertUnits, formatVal]);

  // Resolve related tools from existing tools registry
  const relatedTools = useMemo((): ToolDefinition[] => {
    if (!toolMeta?.relatedToolIds) return [];
    return toolMeta.relatedToolIds
      .map((id: string) => TOOLS.find((t: ToolDefinition) => t.id === id))
      .filter((t): t is ToolDefinition => Boolean(t));
  }, [toolMeta]);

  // Emit formatted CalculationResult for Universal PDF / CSV / Share
  useEffect(() => {
    if (!onResultChange) return;

    const fromNum = parseFloat(fromValue) || 0;
    const formulaStr = formatConversionFormula(fromUnitObj, toUnitObj, unitFactor);

    const res: CalculationResult = {
      toolName: toolMeta?.name || `${currentCategoryDef.name} Converter`,
      category: 'Unit Converters',
      dateGenerated: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      inputs: [
        { label: 'Category', value: currentCategoryDef.name },
        { label: 'Input Quantity', value: `${fromNum} ${fromUnitObj.name} (${fromUnitObj.symbol})` },
        { label: 'Target Unit', value: `${toUnitObj.name} (${toUnitObj.symbol})` },
        { label: 'Unit Rate', value: `1 ${fromUnitObj.symbol} = ${unitFactor} ${toUnitObj.symbol}` },
      ],
      primaryResult: {
        label: `Converted ${toUnitObj.name}`,
        value: `${toValue || '0'} ${toUnitObj.symbol}`,
        subtext: `${fromValue || '0'} ${fromUnitObj.symbol} = ${toValue || '0'} ${toUnitObj.symbol}`,
        badge: 'Precision math.js Dual-Engine',
      },
      breakdown: [
        { label: 'Source Quantity', value: `${fromValue || '0'} ${fromUnitObj.symbol}` },
        { label: 'Target Result', value: `${toValue || '0'} ${toUnitObj.symbol}` },
        { label: 'Conversion Factor', value: `1 ${fromUnitObj.symbol} = ${unitFactor} ${toUnitObj.symbol}` },
        { label: 'Inverse Rate', value: `1 ${toUnitObj.symbol} = ${inverseFactor} ${fromUnitObj.symbol}` },
        { label: 'Computation Engine', value: 'math.js Dimension Vector Parser' },
      ],
      formula: formulaStr,
      disclaimer: 'Bidirectional precision mode active: Editing either field dynamically converts values using math.js without remote network latency.',
    };

    onResultChange(res);
  }, [
    fromValue,
    toValue,
    fromUnitObj,
    toUnitObj,
    currentCategoryDef,
    toolMeta,
    unitFactor,
    inverseFactor,
    onResultChange,
  ]);

  const copyText = (text: string, field: 'from' | 'to') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Tabs from Registry */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CONVERSION_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || Box;
          const isActive = cat.id === selectedCategory || (cat.id === 'weight' && selectedCategory === 'mass');
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Bidirectional Conversion Engine Card */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Dual-Input Layout • Precision Mode
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Decimals:</span>
            <select
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
              aria-label="Decimal Precision"
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>

        {/* Dual Input Converter Controls with Central Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Left / Source Input Field */}
          <div className="md:col-span-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="from-unit-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                From Unit
              </label>
              <select
                id="from-unit-select"
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={fromValue}
                aria-label={`From value in ${fromUnitObj.name}`}
                onChange={(e) => {
                  setLastEdited('from');
                  setFromValue(e.target.value);
                }}
                placeholder="Enter quantity..."
                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent focus:outline-none pr-14"
              />
              <div className="absolute right-0 flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{fromUnitObj.symbol}</span>
                <button
                  onClick={() => copyText(fromValue, 'from')}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy value"
                >
                  {copiedField === 'from' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-600 rounded-2xl shadow-xs transition-all cursor-pointer group hover:rotate-180 transform duration-300"
              title="Swap From and To units"
              aria-label="Swap From and To units"
            >
              <ArrowLeftRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Right / Target Input Field */}
          <div className="md:col-span-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="to-unit-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                To Unit
              </label>
              <select
                id="to-unit-select"
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={toValue}
                aria-label={`To value in ${toUnitObj.name}`}
                onChange={(e) => {
                  setLastEdited('to');
                  setToValue(e.target.value);
                }}
                placeholder="Result..."
                className="w-full text-2xl font-black text-blue-600 dark:text-blue-400 bg-transparent focus:outline-none pr-14"
              />
              <div className="absolute right-0 flex items-center gap-1.5">
                <span className="text-sm font-bold text-blue-500 dark:text-blue-400">{toUnitObj.symbol}</span>
                <button
                  onClick={() => copyText(toValue, 'to')}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Copy result"
                >
                  {copiedField === 'to' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Exchange Rate & Conversion Formula Banner */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              1 {fromUnitObj.name} ={' '}
              <strong className="text-blue-600 dark:text-blue-400 font-bold">
                {unitFactor} {toUnitObj.symbol}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              1 {toUnitObj.name} = {inverseFactor} {fromUnitObj.symbol}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>math.js precision dimension engine</span>
          </div>
        </div>
      </div>

      {/* Quick Reference Conversion Multiples Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            Quick Reference Multiples: {fromUnitObj.symbol} to {toUnitObj.symbol}
          </span>
          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Standard Scales</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickMatrix.map((item) => (
            <div
              key={item.input}
              className="bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-center transition-colors"
            >
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {item.input} {fromUnitObj.symbol}
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 truncate">
                {item.output} {toUnitObj.symbol}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools from Tools Registry */}
      {relatedTools.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Related Tools:</span>
          {relatedTools.map((rel: ToolDefinition) => (
            <a
              key={rel.id}
              href={rel.route}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span>{rel.shortName || rel.name}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};


