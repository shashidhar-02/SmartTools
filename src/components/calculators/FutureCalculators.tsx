import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  Sun, 
  BatteryCharging, 
  CalendarClock, 
  Sparkles, 
  DollarSign, 
  Info,
  Clock
} from 'lucide-react';
import { CalculationResult } from '../../types';

interface FutureCalculatorsProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const FutureCalculators: React.FC<FutureCalculatorsProps> = ({ toolId, onResultChange }) => {
  // 1. LLM Token Cost states
  const [modelType, setModelType] = useState<string>('openrouter-free');
  const [monthlyRequests, setMonthlyRequests] = useState<number>(50000);
  const [avgInputTokens, setAvgInputTokens] = useState<number>(800);
  const [avgOutputTokens, setAvgOutputTokens] = useState<number>(300);

  // 2. GPU Compute & Power states
  const [gpuModel, setGpuModel] = useState<string>('h100');
  const [gpuQuantity, setGpuQuantity] = useState<number>(4);
  const [hoursPerDay, setHoursPerDay] = useState<number>(24);
  const [electricityRateKwh, setElectricityRateKwh] = useState<number>(0.12); // $0.12/kWh

  // 3. EV Charging states
  const [monthlyDistanceKm, setMonthlyDistanceKm] = useState<number>(1500);
  const [evEfficiencyKmPerKwh, setEvEfficiencyKmPerKwh] = useState<number>(6.5); // ~6.5 km/kWh
  const [electricityTariffPerUnit, setElectricityTariffPerUnit] = useState<number>(7.5); // ₹7.5 or $0.10
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(102); // ₹102
  const [iceMileageKmPerLiter, setIceMileageKmPerLiter] = useState<number>(14);

  // 4. Solar Rooftop states
  const [rooftopAreaSqFt, setRooftopAreaSqFt] = useState<number>(600);
  const [dailySunHours, setDailySunHours] = useState<number>(5);
  const [monthlyBillCurrent, setMonthlyBillCurrent] = useState<number>(4500);

  // 5. Future Date & Working Days states
  const [baseDate, setBaseDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [daysToAdd, setDaysToAdd] = useState<number>(90);
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(true);

  // --- MODEL PRICING TABLE ($ per 1M tokens) ---
  const MODEL_PRICES: Record<string, { name: string; inPerM: number; outPerM: number; provider: string }> = {
    'openrouter-free': { name: 'OpenRouter Free Pool (openrouter/free)', inPerM: 0, outPerM: 0, provider: 'OpenRouter' },
    'gemini-flash': { name: 'Gemini 1.5 Flash', inPerM: 0.075, outPerM: 0.30, provider: 'Google' },
    'gpt-4o-mini': { name: 'GPT-4o Mini', inPerM: 0.15, outPerM: 0.60, provider: 'OpenAI' },
    'claude-haiku': { name: 'Claude 3.5 Haiku', inPerM: 0.80, outPerM: 4.00, provider: 'Anthropic' },
    'llama-3-70b': { name: 'Llama 3.3 70B Instruct', inPerM: 0.40, outPerM: 0.40, provider: 'Meta / Groq' },
    'gpt-4o': { name: 'GPT-4o Full', inPerM: 2.50, outPerM: 10.00, provider: 'OpenAI' },
    'claude-sonnet': { name: 'Claude 3.5 Sonnet', inPerM: 3.00, outPerM: 15.00, provider: 'Anthropic' },
  };

  // 1. LLM Token Calculation
  const tokenCalculation = useMemo(() => {
    const selected = MODEL_PRICES[modelType] || MODEL_PRICES['openrouter-free'];
    const totalInputTokensMonthly = monthlyRequests * avgInputTokens;
    const totalOutputTokensMonthly = monthlyRequests * avgOutputTokens;
    const totalTokensMonthly = totalInputTokensMonthly + totalOutputTokensMonthly;

    const inputCostUsd = (totalInputTokensMonthly / 1_000_000) * selected.inPerM;
    const outputCostUsd = (totalOutputTokensMonthly / 1_000_000) * selected.outPerM;
    const totalCostUsd = inputCostUsd + outputCostUsd;
    const totalCostInr = totalCostUsd * 86.5; // conversion rate reference

    const costPer1kRequests = monthlyRequests > 0 ? (totalCostUsd / monthlyRequests) * 1000 : 0;

    const result: CalculationResult = {
      toolName: 'AI & LLM Token Cost Calculator',
      category: 'Technology',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      resultType: selected.inPerM === 0 ? 'CALCULATION' : 'ESTIMATE',
      dataSource: 'Official Provider API Pricing Schemas (2026)',
      dataTimestamp: '2026-03-01',
      freshness: 'Verified Baseline',
      inputs: [
        { label: 'Selected Model', value: selected.name },
        { label: 'Monthly Request Volume', value: `${monthlyRequests.toLocaleString()} queries/month` },
        { label: 'Average Tokens per Request', value: `${avgInputTokens} in / ${avgOutputTokens} out` },
      ],
      primaryResult: {
        label: 'Estimated Monthly Inference Cost',
        value: selected.inPerM === 0 ? '$0.00 (100% Free)' : `$${totalCostUsd.toFixed(2)} / month`,
        subtext: `₹${Math.round(totalCostInr).toLocaleString('en-IN')} INR equivalent | ${totalTokensMonthly.toLocaleString()} total tokens`,
        badge: selected.inPerM === 0 ? 'Strict Free Architecture' : 'Commercial API',
      },
      breakdown: [
        { label: 'Model Provider', value: selected.provider },
        { label: 'Monthly Input Tokens', value: `${(totalInputTokensMonthly / 1_000_000).toFixed(2)}M tokens ($${inputCostUsd.toFixed(2)})` },
        { label: 'Monthly Output Tokens', value: `${(totalOutputTokensMonthly / 1_000_000).toFixed(2)}M tokens ($${outputCostUsd.toFixed(2)})` },
        { label: 'Cost per 1,000 Queries', value: `$${costPer1kRequests.toFixed(4)}` },
        { label: 'Yearly Run-rate Projection', value: `$${(totalCostUsd * 12).toFixed(2)} / year` },
      ],
      chartData: {
        labels: ['Input Token Cost', 'Output Token Cost'],
        values: [Math.max(0.01, inputCostUsd), Math.max(0.01, outputCostUsd)],
        colors: ['#3b82f6', '#8b5cf6'],
      },
      formula: 'Cost = (Input Tokens / 1M × Input Rate) + (Output Tokens / 1M × Output Rate)',
      assumptions: [
        'Standard non-cached API request rates',
        'Assumes uniform token distribution across all queries',
        'Excludes enterprise tier volume discounts or batch discounts',
      ],
    };
    return result;
  }, [modelType, monthlyRequests, avgInputTokens, avgOutputTokens]);

  // 2. GPU Compute & Power Calculation
  const gpuCalculation = useMemo(() => {
    const GPU_SPECS: Record<string, { name: string; watts: number; cloudHourlyUsd: number }> = {
      h100: { name: 'NVIDIA H100 SXM5 80GB', watts: 700, cloudHourlyUsd: 2.85 },
      a100: { name: 'NVIDIA A100 80GB PCIe', watts: 400, cloudHourlyUsd: 1.45 },
      l40s: { name: 'NVIDIA L40S 48GB', watts: 350, cloudHourlyUsd: 0.95 },
      rtx4090: { name: 'NVIDIA RTX 4090 24GB', watts: 450, cloudHourlyUsd: 0.45 },
    };

    const spec = GPU_SPECS[gpuModel] || GPU_SPECS.h100;
    const monthlyHours = hoursPerDay * 30.5;
    const totalCloudMonthlyUsd = gpuQuantity * spec.cloudHourlyUsd * monthlyHours;

    // Power calculation with 1.25 PUE cooling factor
    const pueFactor = 1.25;
    const totalWatts = gpuQuantity * spec.watts * pueFactor;
    const monthlyKwh = (totalWatts * monthlyHours) / 1000;
    const monthlyElectricityUsd = monthlyKwh * electricityRateKwh;

    const result: CalculationResult = {
      toolName: 'AI GPU Cloud & Electricity Cost Calculator',
      category: 'Technology',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      resultType: 'ESTIMATE',
      inputs: [
        { label: 'GPU Cluster Spec', value: `${gpuQuantity} × ${spec.name}` },
        { label: 'Operational Schedule', value: `${hoursPerDay} hours/day (${monthlyHours.toFixed(0)} hrs/mo)` },
        { label: 'Electricity Tariff', value: `$${electricityRateKwh}/kWh (PUE 1.25 cooling)` },
      ],
      primaryResult: {
        label: 'Total Monthly Cloud Cost',
        value: `$${Math.round(totalCloudMonthlyUsd).toLocaleString()} / month`,
        subtext: `Estimated Raw Power Consumption: ${monthlyKwh.toFixed(0)} kWh ($${monthlyElectricityUsd.toFixed(2)})`,
      },
      breakdown: [
        { label: 'Total Thermal Design Power (Cluster + PUE)', value: `${(totalWatts / 1000).toFixed(2)} kW continuous` },
        { label: 'Monthly Electricity Consumption', value: `${monthlyKwh.toFixed(0)} kWh` },
        { label: 'Estimated Power Cost (Self-Hosted)', value: `$${monthlyElectricityUsd.toFixed(2)}` },
        { label: 'Cloud Rental Equivalent', value: `$${totalCloudMonthlyUsd.toFixed(2)}` },
        { label: 'Estimated Annual Cloud Run-Rate', value: `$${(totalCloudMonthlyUsd * 12).toLocaleString()}` },
      ],
      formula: 'Energy (kWh) = [Quantity × Watts × PUE × Hours] / 1000 | Cloud = Quantity × Hourly Rate × Hours',
      assumptions: ['1.25 Power Usage Effectiveness (PUE) factor includes server host and data-center cooling'],
    };
    return result;
  }, [gpuModel, gpuQuantity, hoursPerDay, electricityRateKwh]);

  // 3. EV Charging vs Fuel Savings
  const evCalculation = useMemo(() => {
    const kwhNeededMonthly = monthlyDistanceKm / evEfficiencyKmPerKwh;
    const monthlyEvCost = kwhNeededMonthly * electricityTariffPerUnit;

    const fuelLitersMonthly = monthlyDistanceKm / iceMileageKmPerLiter;
    const monthlyIceCost = fuelLitersMonthly * fuelPricePerLiter;

    const monthlySavings = monthlyIceCost - monthlyEvCost;
    const annualSavings = monthlySavings * 12;
    const fiveYearSavings = annualSavings * 5;

    // Projected battery health after 5 years / 75,000 km (~91% retention)
    const projectedHealthPercent = Math.max(80, 100 - (monthlyDistanceKm * 12 * 5 * 0.00012)).toFixed(1);

    const result: CalculationResult = {
      toolName: 'EV Charging vs Fuel Savings & Battery Calculator',
      category: 'Vehicle',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      resultType: 'PROJECTION',
      inputs: [
        { label: 'Monthly Driving Distance', value: `${monthlyDistanceKm.toLocaleString()} km` },
        { label: 'EV Efficiency & Tariff', value: `${evEfficiencyKmPerKwh} km/kWh @ ₹${electricityTariffPerUnit}/unit` },
        { label: 'Petrol/Diesel Benchmark', value: `${iceMileageKmPerLiter} km/L @ ₹${fuelPricePerLiter}/liter` },
      ],
      primaryResult: {
        label: 'Monthly Net Fuel Savings',
        value: `₹${Math.round(monthlySavings).toLocaleString('en-IN')}`,
        subtext: `Annual Savings: ₹${Math.round(annualSavings).toLocaleString('en-IN')} | EV Cost: ₹${Math.round(monthlyEvCost)} vs Petrol: ₹${Math.round(monthlyIceCost)}`,
      },
      breakdown: [
        { label: 'Monthly EV Energy Required', value: `${kwhNeededMonthly.toFixed(1)} kWh units` },
        { label: 'Monthly Electricity Cost', value: `₹${Math.round(monthlyEvCost).toLocaleString('en-IN')} (₹${(monthlyEvCost / monthlyDistanceKm).toFixed(2)}/km)` },
        { label: 'Monthly Petrol / Diesel Cost', value: `₹${Math.round(monthlyIceCost).toLocaleString('en-IN')} (₹${(monthlyIceCost / monthlyDistanceKm).toFixed(2)}/km)` },
        { label: 'Estimated 5-Year Cumulative Savings', value: `₹${Math.round(fiveYearSavings).toLocaleString('en-IN')}` },
        { label: 'Projected 5-Year Battery Capacity Retention', value: `~${projectedHealthPercent}% (LFP/NMC cell benchmark)` },
      ],
      chartData: {
        labels: ['EV Electricity Cost', 'Petrol/Diesel Cost'],
        values: [Math.round(monthlyEvCost), Math.round(monthlyIceCost)],
        colors: ['#10b981', '#ef4444'],
      },
      formula: 'Savings = (Distance / ICE Mileage × Fuel Price) - (Distance / EV Efficiency × Electricity Rate)',
      assumptions: ['Domestic home charging rate assumed; commercial fast DC chargers incur higher per-unit rates'],
    };
    return result;
  }, [monthlyDistanceKm, evEfficiencyKmPerKwh, electricityTariffPerUnit, fuelPricePerLiter, iceMileageKmPerLiter]);

  // 4. Solar Rooftop Calculation
  const solarCalculation = useMemo(() => {
    // 1 kW rooftop solar requires approx 100 sq ft
    const maxCapacityKw = Math.min(15, Math.floor(rooftopAreaSqFt / 100));
    const recommendedKw = Math.max(1, maxCapacityKw);

    // Generation: 1 kW generates approx 4 units (kWh) per day with 5 sun hours
    const dailyKwh = recommendedKw * dailySunHours * 0.8; // 80% system efficiency
    const monthlyKwh = dailyKwh * 30;

    const unitRateEstimated = 8.0; // ₹8 per unit average
    const monthlySolarSavings = monthlyKwh * unitRateEstimated;
    const newEstimatedBill = Math.max(0, monthlyBillCurrent - monthlySolarSavings);

    // Approximate solar installation cost: ₹55,000 per kW in India with subsidy
    const totalInstallCost = recommendedKw * 55000;
    const paybackYears = monthlySolarSavings > 0 ? (totalInstallCost / (monthlySolarSavings * 12)) : 5;

    const result: CalculationResult = {
      toolName: 'Solar Rooftop & Grid Payback Calculator',
      category: 'Technology',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      resultType: 'ESTIMATE',
      inputs: [
        { label: 'Rooftop Available Area', value: `${rooftopAreaSqFt} sq ft (${recommendedKw} kW capacity)` },
        { label: 'Daily Sunlight Hours', value: `${dailySunHours} peak sun hours` },
        { label: 'Current Monthly Electricity Bill', value: `₹${monthlyBillCurrent.toLocaleString('en-IN')}` },
      ],
      primaryResult: {
        label: 'Recommended System Size & Savings',
        value: `${recommendedKw} kW System (₹${Math.round(monthlySolarSavings).toLocaleString('en-IN')} / mo)`,
        subtext: `Payback Period: ~${paybackYears.toFixed(1)} Years | New Monthly Bill: ₹${Math.round(newEstimatedBill).toLocaleString('en-IN')}`,
      },
      breakdown: [
        { label: 'Recommended Solar Capacity', value: `${recommendedKw} kW Peak (Requires ~${recommendedKw * 100} sq ft)` },
        { label: 'Estimated Monthly Generation', value: `${Math.round(monthlyKwh)} Units (kWh)` },
        { label: 'Estimated Turnkey System Cost (Subsidized)', value: `₹${totalInstallCost.toLocaleString('en-IN')}` },
        { label: 'Annual Electricity Bill Reduction', value: `₹${Math.round(monthlySolarSavings * 12).toLocaleString('en-IN')}` },
        { label: 'Estimated Capital Payback Period', value: `${paybackYears.toFixed(1)} Years` },
        { label: 'Annual CO₂ Emissions Offset', value: `~${(monthlyKwh * 12 * 0.82 / 1000).toFixed(1)} Metric Tons CO₂` },
      ],
      chartData: {
        labels: ['Solar Savings', 'Remaining Bill'],
        values: [Math.round(monthlySolarSavings), Math.round(newEstimatedBill)],
        colors: ['#f59e0b', '#64748b'],
      },
      formula: 'Monthly Generation = System kW × Sun Hours × 0.80 efficiency × 30 days',
      assumptions: ['Includes standard grid-tied net-metering and PM Surya Ghar benchmark subsidies'],
    };
    return result;
  }, [rooftopAreaSqFt, dailySunHours, monthlyBillCurrent]);

  // 5. Future Date & Working Days Calculation
  const dateCalculation = useMemo(() => {
    const start = new Date(baseDate);
    const target = new Date(start);

    if (!excludeWeekends) {
      target.setDate(target.getDate() + daysToAdd);
    } else {
      let added = 0;
      while (added < daysToAdd) {
        target.setDate(target.getDate() + 1);
        const day = target.getDay();
        if (day !== 0 && day !== 6) {
          added++;
        }
      }
    }

    const dayName = target.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = target.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // Leap year check
    const year = target.getFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    const result: CalculationResult = {
      toolName: 'Future Date & Working Days Intelligence',
      category: 'Date & Time',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      resultType: 'CALCULATION',
      inputs: [
        { label: 'Starting Reference Date', value: baseDate },
        { label: 'Days Added', value: `${daysToAdd} ${excludeWeekends ? 'Working Business Days (No weekends)' : 'Calendar Days'}` },
      ],
      primaryResult: {
        label: 'Target Calculated Date',
        value: `${formattedDate}`,
        subtext: `${dayName} | Target Year: ${year} (${isLeap ? 'Leap Year' : 'Non-leap year'})`,
      },
      breakdown: [
        { label: 'Start Date', value: baseDate },
        { label: 'Calculated Target Date', value: formattedDate },
        { label: 'Day of Week', value: dayName },
        { label: 'Working Days Filter', value: excludeWeekends ? 'Saturdays and Sundays excluded' : 'All calendar days included' },
        { label: 'Leap Year Status', value: isLeap ? `${year} is a Leap Year (366 days)` : `${year} is standard (365 days)` },
      ],
      formula: 'Date_Target = Date_Start + N Days (Iterating business days excluding Day 0 and Day 6)',
    };
    return result;
  }, [baseDate, daysToAdd, excludeWeekends]);

  // Sync result to parent ToolShell
  useEffect(() => {
    if (toolId === 'gpu-cost' || toolId === 'gpu-compute') {
      onResultChange(gpuCalculation);
    } else if (toolId === 'ev-savings' || toolId === 'ev-charging') {
      onResultChange(evCalculation);
    } else if (toolId === 'solar-savings' || toolId === 'solar-rooftop') {
      onResultChange(solarCalculation);
    } else if (toolId === 'future-date' || toolId === 'working-days-calc') {
      onResultChange(dateCalculation);
    } else {
      // Default AI LLM Token Cost
      onResultChange(tokenCalculation);
    }
  }, [toolId, tokenCalculation, gpuCalculation, evCalculation, solarCalculation, dateCalculation, onResultChange]);

  // Render LLM UI
  if (toolId === 'ai-tokens' || toolId === 'token-cost' || toolId === 'ai-cost') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>LLM Inference Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Model Selection</label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="openrouter-free">openrouter/free (100% Free - $0.00 / 1M)</option>
            <option value="gemini-flash">Gemini 1.5 Flash ($0.075 / $0.30 per 1M)</option>
            <option value="gpt-4o-mini">GPT-4o Mini ($0.15 / $0.60 per 1M)</option>
            <option value="llama-3-70b">Llama 3.3 70B ($0.40 / $0.40 per 1M)</option>
            <option value="claude-haiku">Claude 3.5 Haiku ($0.80 / $4.00 per 1M)</option>
            <option value="gpt-4o">GPT-4o ($2.50 / $10.00 per 1M)</option>
            <option value="claude-sonnet">Claude 3.5 Sonnet ($3.00 / $15.00 per 1M)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Query Volume</label>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
              {monthlyRequests.toLocaleString()} requests/month
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={monthlyRequests}
            onChange={(e) => setMonthlyRequests(Number(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Avg Input Tokens</label>
            <input
              type="number"
              min="10"
              max="128000"
              value={avgInputTokens}
              onChange={(e) => setAvgInputTokens(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Avg Output Tokens</label>
            <input
              type="number"
              min="10"
              max="8192"
              value={avgOutputTokens}
              onChange={(e) => setAvgOutputTokens(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // Render GPU Compute UI
  if (toolId === 'gpu-cost' || toolId === 'gpu-compute') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>GPU Compute & Thermal Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">GPU Architecture</label>
          <select
            value={gpuModel}
            onChange={(e) => setGpuModel(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="h100">NVIDIA H100 SXM5 80GB (700W, ~$2.85/hr)</option>
            <option value="a100">NVIDIA A100 80GB (400W, ~$1.45/hr)</option>
            <option value="l40s">NVIDIA L40S 48GB (350W, ~$0.95/hr)</option>
            <option value="rtx4090">NVIDIA RTX 4090 24GB (450W, ~$0.45/hr)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cluster Size (GPUs)</label>
            <input
              type="number"
              min="1"
              max="64"
              value={gpuQuantity}
              onChange={(e) => setGpuQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hours per Day</label>
            <input
              type="number"
              min="1"
              max="24"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, Number(e.target.value))))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Electricity Rate ($/kWh)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={electricityRateKwh}
            onChange={(e) => setElectricityRateKwh(Math.max(0.01, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // Render EV UI
  if (toolId === 'ev-savings' || toolId === 'ev-charging') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <BatteryCharging className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Electric Vehicle Energy Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly Travel Distance (km)</label>
          <input
            type="number"
            min="100"
            value={monthlyDistanceKm}
            onChange={(e) => setMonthlyDistanceKm(Math.max(10, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">EV Mileage (km/kWh)</label>
            <input
              type="number"
              step="0.1"
              value={evEfficiencyKmPerKwh}
              onChange={(e) => setEvEfficiencyKmPerKwh(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Electricity Tariff (₹/unit)</label>
            <input
              type="number"
              step="0.5"
              value={electricityTariffPerUnit}
              onChange={(e) => setElectricityTariffPerUnit(Math.max(0.1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fuel Price (₹/Liter)</label>
            <input
              type="number"
              value={fuelPricePerLiter}
              onChange={(e) => setFuelPricePerLiter(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Petrol Car Mileage (km/L)</label>
            <input
              type="number"
              value={iceMileageKmPerLiter}
              onChange={(e) => setIceMileageKmPerLiter(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // Render Solar UI
  if (toolId === 'solar-savings' || toolId === 'solar-rooftop') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <span>Solar Rooftop Feasibility Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Available Shade-Free Rooftop (Sq Ft)</label>
          <input
            type="number"
            min="100"
            value={rooftopAreaSqFt}
            onChange={(e) => setRooftopAreaSqFt(Math.max(50, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Rule of thumb: 100 sq ft accommodates ~1 kW of solar panels</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Peak Sun Hours / Day</label>
            <input
              type="number"
              step="0.5"
              min="2"
              max="8"
              value={dailySunHours}
              onChange={(e) => setDailySunHours(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Monthly Bill (₹)</label>
            <input
              type="number"
              min="500"
              value={monthlyBillCurrent}
              onChange={(e) => setMonthlyBillCurrent(Math.max(100, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // Default Future Date & Working Days UI
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span>Date & Working Days Parameters</span>
      </h3>

      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Starting Reference Date</label>
        <input
          type="date"
          value={baseDate}
          onChange={(e) => setBaseDate(e.target.value)}
          className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Days to Add</label>
        <input
          type="number"
          min="1"
          max="3650"
          value={daysToAdd}
          onChange={(e) => setDaysToAdd(Math.max(1, Number(e.target.value)))}
          className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
        />
        <div className="flex gap-2 mt-2">
          {[30, 60, 90, 180, 365].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDaysToAdd(d)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              +{d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeWeekends}
            onChange={(e) => setExcludeWeekends(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Exclude Saturdays and Sundays (Working Business Days Only)
          </span>
        </label>
      </div>
    </div>
  );
};
