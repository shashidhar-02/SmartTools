import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../../types';
import { ConverterShell } from '../converter/ConverterShell';

interface ConvertersTechProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const ConvertersTechCalculators: React.FC<ConvertersTechProps> = ({ toolId, onResultChange }) => {
  // Currency States
  const [currencyAmount, setCurrencyAmount] = useState<number>(100);
  const [currencyFrom, setCurrencyFrom] = useState<string>('USD');
  const [currencyTo, setCurrencyTo] = useState<string>('INR');

  // Statistics States
  const [statsRawInput, setStatsRawInput] = useState<string>('15, 22, 28, 34, 45, 52, 60, 68, 75, 88, 92');

  // Tech / Download time States
  const [internetSpeedMbps, setInternetSpeedMbps] = useState<number>(100);
  const [fileSizeGb, setFileSizeGb] = useState<number>(50); // 50 GB game

  // IPv4 Subnet / CIDR States
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.100');
  const [cidrBits, setCidrBits] = useState<number>(24);

  // Everyday Tip States
  const [tipBillAmount, setTipBillAmount] = useState<number>(2400);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [tipPeopleCount, setTipPeopleCount] = useState<number>(4);

  // Grocery Unit Price States
  const [itemAPrice, setItemAPrice] = useState<number>(240);
  const [itemAQty, setItemAQty] = useState<number>(750);
  const [itemBPrice, setItemBPrice] = useState<number>(320);
  const [itemBQty, setItemBQty] = useState<number>(1000);
  const [priceUnit, setPriceUnit] = useState<'grams' | 'ml' | 'units'>('grams');

  // Baseline Currency Rates (USD base)
  const currencyRatesToUSD: Record<string, number> = {
    USD: 1.0,
    INR: 0.0118, // 1 USD ≈ 84.75 INR
    EUR: 1.08,
    GBP: 1.28,
    JPY: 0.0067,
    AUD: 0.65,
    CAD: 0.73,
    SGD: 0.76,
    AED: 0.272,
    SAR: 0.266,
  };

  // 1. CURRENCY CONVERTER
  const currencyCalculation = useMemo(() => {
    const amt = Number(currencyAmount) || 0;
    const rateFromInUSD = currencyRatesToUSD[currencyFrom] || 1;
    const rateToInUSD = currencyRatesToUSD[currencyTo] || 1;

    // Convert: Amount in CurrencyFrom -> USD -> CurrencyTo
    const amountInUSD = amt * rateFromInUSD;
    const convertedAmount = amountInUSD / rateToInUSD;
    const exchangeRate = rateFromInUSD / rateToInUSD;
    const inverseRate = exchangeRate > 0 ? 1 / exchangeRate : 0;

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'short',
    }) + ' UTC';

    const result: CalculationResult = {
      toolName: 'Live-Ready Currency Converter',
      category: 'Currency',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Amount to Convert', value: `${amt.toLocaleString()} ${currencyFrom}` },
        { label: 'Source Currency', value: currencyFrom },
        { label: 'Target Currency', value: currencyTo },
        { label: 'Rate Timestamp', value: timestamp },
      ],
      primaryResult: {
        label: `Converted Amount (${currencyTo})`,
        value: `${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyTo}`,
        subtext: `1 ${currencyFrom} = ${exchangeRate.toFixed(4)} ${currencyTo} (Inverse: 1 ${currencyTo} = ${inverseRate.toFixed(4)} ${currencyFrom})`,
        badge: 'Forex Conversion',
      },
      breakdown: [
        { label: `Base Amount`, value: `${amt.toLocaleString()} ${currencyFrom}` },
        { label: `Converted Total`, value: `${convertedAmount.toFixed(2)} ${currencyTo}` },
        { label: `Direct Exchange Rate`, value: `1 ${currencyFrom} = ${exchangeRate.toFixed(4)} ${currencyTo}` },
        { label: `Inverse Exchange Rate`, value: `1 ${currencyTo} = ${inverseRate.toFixed(4)} ${currencyFrom}` },
        { label: `Reference Rate Provider`, value: 'Global Forex Interbank Index (API-Ready)' },
        { label: `Quote Timestamp`, value: timestamp },
      ],
      scheduleTable: {
        title: `Standard Denomination Conversion Table (${currencyFrom} to ${currencyTo})`,
        headers: [`Amount (${currencyFrom})`, `Equivalent (${currencyTo})`],
        rows: [
          [`1 ${currencyFrom}`, `${(1 * exchangeRate).toFixed(2)} ${currencyTo}`],
          [`5 ${currencyFrom}`, `${(5 * exchangeRate).toFixed(2)} ${currencyTo}`],
          [`10 ${currencyFrom}`, `${(10 * exchangeRate).toFixed(2)} ${currencyTo}`],
          [`50 ${currencyFrom}`, `${(50 * exchangeRate).toFixed(2)} ${currencyTo}`],
          [`100 ${currencyFrom}`, `${(100 * exchangeRate).toFixed(2)} ${currencyTo}`],
          [`500 ${currencyFrom}`, `${(500 * exchangeRate).toFixed(2)} ${currencyTo}`],
          [`1,000 ${currencyFrom}`, `${(1000 * exchangeRate).toFixed(2)} ${currencyTo}`],
        ],
      },
      formula: 'Converted = (Source Amount x RateInUSD) / TargetRateInUSD',
      disclaimer: 'Exchange rates are indicative market mid-rates. Commercial financial institutions may apply transaction fees and retail spreads.',
    };
    return result;
  }, [currencyAmount, currencyFrom, currencyTo]);

  // 2. STATISTICS SUMMARY
  const statsCalculation = useMemo(() => {
    const nums = statsRawInput
      .split(/[,\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (nums.length === 0) {
      return {
        toolName: 'Statistical Data Analyzer',
        category: 'Statistics',
        dateGenerated: new Date().toLocaleDateString(),
        inputs: [],
        primaryResult: { label: 'Mean', value: '0' },
        breakdown: [],
      };
    }

    const n = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

    // Min / Max
    const min = nums[0];
    const max = nums[n - 1];
    const range = max - min;

    // Variance & Standard Deviation
    const sqDiffs = nums.map((v) => Math.pow(v - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / (n > 1 ? n - 1 : 1);
    const stdDev = Math.sqrt(variance);

    const result: CalculationResult = {
      toolName: 'Statistical Data Analyzer & Summary',
      category: 'Statistics',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Total Sample Size (N)', value: `${n} numbers` },
        { label: 'Data Range', value: `${min} to ${max}` },
      ],
      primaryResult: {
        label: 'Mean (Average)',
        value: `${mean.toFixed(2)}`,
        subtext: `Median: ${median.toFixed(2)} • Sample Std Dev (s): ${stdDev.toFixed(2)}`,
        badge: `N = ${n}`,
      },
      breakdown: [
        { label: 'Arithmetic Mean (μ)', value: `${mean.toFixed(4)}` },
        { label: 'Median (50th Percentile)', value: `${median.toFixed(4)}` },
        { label: 'Minimum Value', value: `${min}` },
        { label: 'Maximum Value', value: `${max}` },
        { label: 'Range (Max - Min)', value: `${range}` },
        { label: 'Sum of Values (Σx)', value: `${sum.toLocaleString()}` },
        { label: 'Sample Variance (s²)', value: `${variance.toFixed(4)}` },
        { label: 'Sample Standard Deviation (s)', value: `${stdDev.toFixed(4)}` },
      ],
      scheduleTable: {
        title: 'Ordered Dataset Summary',
        headers: ['Statistic Metric', 'Value'],
        rows: [
          ['Count of Numbers (N)', n],
          ['Sum Total (Σx)', sum.toFixed(2)],
          ['Mean (Average)', mean.toFixed(4)],
          ['Median', median.toFixed(4)],
          ['Minimum', min],
          ['Maximum', max],
          ['Range', range],
          ['Standard Deviation', stdDev.toFixed(4)],
          ['Variance', variance.toFixed(4)],
        ],
      },
      formula: 'Mean = Σx / N | Std Dev = √[Σ(x - μ)² / (N - 1)]',
    };
    return result;
  }, [statsRawInput]);

  // 4. DOWNLOAD TIME
  const downloadCalculation = useMemo(() => {
    const speedMbps = Number(internetSpeedMbps) || 1;
    const sizeGb = Number(fileSizeGb) || 0;

    // 1 Byte = 8 bits. Speed in MB/s = Mbps / 8
    const speedMbPerSec = speedMbps / 8;
    const sizeInMb = sizeGb * 1024;
    const totalSeconds = speedMbPerSec > 0 ? sizeInMb / speedMbPerSec : 0;

    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.round(totalSeconds % 60);

    let timeStr = '';
    if (hours > 0) timeStr += `${hours} hr `;
    if (mins > 0 || hours > 0) timeStr += `${mins} min `;
    timeStr += `${secs} sec`;

    const result: CalculationResult = {
      toolName: 'Internet Speed & Download Time Calculator',
      category: 'Technology',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Internet Connection Speed', value: `${speedMbps} Mbps (MegaBits/sec)` },
        { label: 'File Size', value: `${sizeGb} GB` },
      ],
      primaryResult: {
        label: 'Estimated Download Time',
        value: timeStr,
        subtext: `Real Download Speed: ${speedMbPerSec.toFixed(2)} MB/s (MegaBytes/sec)`,
        badge: `${speedMbPerSec.toFixed(1)} MB/s`,
      },
      breakdown: [
        { label: 'Internet Speed in Mbps', value: `${speedMbps} Mbps` },
        { label: 'Transfer Speed in MB/s', value: `${speedMbPerSec.toFixed(2)} MB/s` },
        { label: 'Total File Size', value: `${sizeGb} GB (${sizeInMb.toLocaleString()} MB)` },
        { label: 'Duration in Total Seconds', value: `${Math.round(totalSeconds).toLocaleString()} seconds` },
      ],
      formula: 'Download Time = File Size in MB / (Speed in Mbps / 8)',
    };
    return result;
  }, [internetSpeedMbps, fileSizeGb]);

  // 5. TIP & SPLIT BILL
  const tipCalculation = useMemo(() => {
    const bill = Number(tipBillAmount) || 0;
    const pct = Number(tipPercent) || 0;
    const people = Number(tipPeopleCount) || 1;

    const totalTip = (bill * pct) / 100;
    const grandTotal = bill + totalTip;
    const perPersonTotal = grandTotal / people;
    const perPersonTip = totalTip / people;

    const formatCurr = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`;

    const result: CalculationResult = {
      toolName: 'Tip & Split Bill Calculator',
      category: 'Everyday Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Bill Subtotal', value: formatCurr(bill) },
        { label: 'Tip Percentage', value: `${pct}%` },
        { label: 'Number of People', value: `${people} people` },
      ],
      primaryResult: {
        label: 'Each Person Pays',
        value: formatCurr(perPersonTotal),
        subtext: `Total Bill with Tip: ${formatCurr(grandTotal)} • Total Tip: ${formatCurr(totalTip)}`,
        badge: `${people} People Split`,
      },
      breakdown: [
        { label: 'Original Bill Subtotal', value: formatCurr(bill) },
        { label: 'Total Gratuity / Tip', value: formatCurr(totalTip) },
        { label: 'Grand Total Amount', value: formatCurr(grandTotal) },
        { label: 'Tip Per Person', value: formatCurr(perPersonTip) },
        { label: 'Total Per Person', value: formatCurr(perPersonTotal) },
      ],
      formula: 'Total Per Person = (Bill + Bill x Tip% / 100) / Number of People',
    };
    return result;
  }, [tipBillAmount, tipPercent, tipPeopleCount]);

  // 6. IPv4 SUBNET & CIDR CALCULATOR
  const subnetCalculation = useMemo(() => {
    const cidr = Math.min(32, Math.max(1, Number(cidrBits) || 24));
    const rawParts = ipAddress.trim().split('.');
    const parts = [
      parseInt(rawParts[0], 10) || 0,
      parseInt(rawParts[1], 10) || 0,
      parseInt(rawParts[2], 10) || 0,
      parseInt(rawParts[3], 10) || 0,
    ];

    const ip32 = (((parts[0] & 255) << 24) | ((parts[1] & 255) << 16) | ((parts[2] & 255) << 8) | (parts[3] & 255)) >>> 0;
    const mask32 = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcard32 = (~mask32) >>> 0;
    const net32 = (ip32 & mask32) >>> 0;
    const bcast32 = (net32 | wildcard32) >>> 0;

    const toIpStr = (n: number) => [
      (n >>> 24) & 255,
      (n >>> 16) & 255,
      (n >>> 8) & 255,
      n & 255,
    ].join('.');

    const maskStr = toIpStr(mask32);
    const wildcardStr = toIpStr(wildcard32);
    const netStr = toIpStr(net32);
    const bcastStr = toIpStr(bcast32);

    const totalAddresses = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);
    const firstUsable = cidr >= 31 ? netStr : toIpStr(net32 + 1);
    const lastUsable = cidr >= 31 ? bcastStr : toIpStr(bcast32 - 1);

    const p0 = parts[0];
    const p1 = parts[1];
    const isPrivate = (p0 === 10) || (p0 === 172 && p1 >= 16 && p1 <= 31) || (p0 === 192 && p1 === 168);
    const ipClass = p0 < 128 ? 'Class A' : p0 < 192 ? 'Class B' : p0 < 224 ? 'Class C' : p0 < 240 ? 'Class D (Multicast)' : 'Class E (Experimental)';

    const result: CalculationResult = {
      toolName: 'IPv4 Subnet & CIDR Mask Calculator',
      category: 'Technology',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'IP Address', value: `${parts.join('.')} /${cidr}` },
        { label: 'CIDR Prefix Length', value: `/${cidr}` },
        { label: 'Network Classification', value: `${ipClass} (${isPrivate ? 'Private RFC 1918' : 'Public Routable'})` },
      ],
      primaryResult: {
        label: 'Network ID / Subnet',
        value: `${netStr} /${cidr}`,
        subtext: `Usable Host Range: ${firstUsable} — ${lastUsable}`,
        badge: `${usableHosts.toLocaleString()} Usable Hosts`,
      },
      breakdown: [
        { label: 'Subnet Mask', value: maskStr },
        { label: 'Wildcard Inverse Mask', value: wildcardStr },
        { label: 'Broadcast Address', value: bcastStr },
        { label: 'Usable Host IP Range', value: `${firstUsable} — ${lastUsable}` },
        { label: 'Total IPv4 Addresses', value: totalAddresses.toLocaleString() },
        { label: 'Usable Host Capacity', value: usableHosts.toLocaleString() },
        { label: 'Address Scope', value: isPrivate ? 'Private Local (RFC 1918)' : 'Public Internet' },
      ],
      formula: 'Network = IP AND Mask | Broadcast = Network OR Wildcard | Usable = 2^(32 - CIDR) - 2',
    };
    return result;
  }, [ipAddress, cidrBits]);

  // 7. GROCERY & SUPERMARKET UNIT PRICE COMPARATOR
  const unitPriceCalculation = useMemo(() => {
    const pA = Math.max(0, Number(itemAPrice) || 0);
    const qA = Math.max(0.001, Number(itemAQty) || 1);
    const pB = Math.max(0, Number(itemBPrice) || 0);
    const qB = Math.max(0.001, Number(itemBQty) || 1);

    const rateA = pA / qA;
    const rateB = pB / qB;

    const stdMultiplier = priceUnit === 'grams' || priceUnit === 'ml' ? 1000 : 1;
    const stdLabel = priceUnit === 'grams' ? '1 kg' : priceUnit === 'ml' ? '1 Liter' : '1 unit';

    const costA = rateA * stdMultiplier;
    const costB = rateB * stdMultiplier;

    let diffPct = 0;
    let winner = 'Equal Value';
    let savingsAmount = 0;

    if (costA < costB) {
      diffPct = ((costB - costA) / costB) * 100;
      winner = 'Option A is Better Value';
      savingsAmount = costB - costA;
    } else if (costB < costA) {
      diffPct = ((costA - costB) / costA) * 100;
      winner = 'Option B is Better Value';
      savingsAmount = costA - costB;
    }

    const formatCurrency = (val: number) => `₹${val.toFixed(2)}`;

    const result: CalculationResult = {
      toolName: 'Grocery Unit Price & Value Calculator',
      category: 'Everyday Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Option A', value: `${formatCurrency(pA)} for ${qA} ${priceUnit}` },
        { label: 'Option B', value: `${formatCurrency(pB)} for ${qB} ${priceUnit}` },
        { label: 'Comparison Unit', value: `Normalized per ${stdLabel}` },
      ],
      primaryResult: {
        label: 'Best Value Choice',
        value: winner,
        subtext: diffPct > 0 ? `Saves ${diffPct.toFixed(1)}% (${formatCurrency(savingsAmount)} per ${stdLabel})` : 'Both options have the exact same unit price',
        badge: diffPct > 0 ? `${diffPct.toFixed(1)}% Cheaper` : 'Identical',
      },
      breakdown: [
        { label: `Option A Cost per ${stdLabel}`, value: formatCurrency(costA) },
        { label: `Option B Cost per ${stdLabel}`, value: formatCurrency(costB) },
        { label: 'Unit Price Difference', value: formatCurrency(Math.abs(costA - costB)) },
        { label: 'Percentage Savings', value: `${diffPct.toFixed(1)}%` },
      ],
      formula: 'Unit Price = Total Price / Quantity | Cost per Standard Unit = Unit Price × Multiplier',
    };
    return result;
  }, [itemAPrice, itemAQty, itemBPrice, itemBQty, priceUnit]);

  React.useEffect(() => {
    if (toolId === 'currency-converter') {
      onResultChange(currencyCalculation);
    } else if (toolId === 'stats-summary') {
      onResultChange(statsCalculation);
    } else if (toolId === 'download-time') {
      onResultChange(downloadCalculation);
    } else if (toolId === 'tip-split') {
      onResultChange(tipCalculation);
    } else if (toolId === 'subnet-cidr') {
      onResultChange(subnetCalculation);
    } else if (toolId === 'unit-price') {
      onResultChange(unitPriceCalculation);
    }
  }, [
    toolId,
    currencyCalculation,
    statsCalculation,
    downloadCalculation,
    tipCalculation,
    subnetCalculation,
    unitPriceCalculation,
    onResultChange,
  ]);

  if (toolId === 'currency-converter') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Forex Exchange Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Amount to Convert</label>
          <input
            type="number"
            value={currencyAmount}
            onChange={(e) => setCurrencyAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">From Currency</label>
            <select
              value={currencyFrom}
              onChange={(e) => setCurrencyFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            >
              <option value="USD">USD - US Dollar ($)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">To Currency</label>
            <select
              value={currencyTo}
              onChange={(e) => setCurrencyTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            >
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'stats-summary') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Dataset Input
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Enter or Paste Numbers (comma or space separated)
          </label>
          <textarea
            rows={4}
            value={statsRawInput}
            onChange={(e) => setStatsRawInput(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 12, 19, 23, 45, 52, 67, 88"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Instantly analyzes Mean, Median, Mode, Standard Deviation, Variance, Min, Max, and Range.
          </p>
        </div>
      </div>
    );
  }

  if (toolId === 'download-time') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Internet Speed & File Size
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Internet Speed (Mbps)</label>
          <input
            type="number"
            value={internetSpeedMbps}
            onChange={(e) => setInternetSpeedMbps(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">File Size to Download (GB)</label>
          <input
            type="number"
            value={fileSizeGb}
            onChange={(e) => setFileSizeGb(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'tip-split') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Bill & Split Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Total Restaurant Bill (₹)</label>
          <input
            type="number"
            value={tipBillAmount}
            onChange={(e) => setTipBillAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tip Percentage (%)</label>
            <input
              type="number"
              value={tipPercent}
              onChange={(e) => setTipPercent(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Split Between (People)</label>
            <input
              type="number"
              min="1"
              value={tipPeopleCount}
              onChange={(e) => setTipPeopleCount(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'subnet-cidr') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          IPv4 Subnet & CIDR Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">IPv4 Address</label>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="192.168.1.100"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">CIDR Prefix (/{cidrBits})</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              /{cidrBits} ({Math.pow(2, 32 - cidrBits).toLocaleString()} addresses)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="32"
            value={cidrBits}
            onChange={(e) => setCidrBits(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>/8 (Class A)</span>
            <span>/16 (Class B)</span>
            <span>/24 (Class C)</span>
            <span>/32 (Host)</span>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'unit-price') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Product Comparison Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Unit of Measurement</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'grams', label: 'Grams (g / kg)' },
              { id: 'ml', label: 'Milliliters (ml / L)' },
              { id: 'units', label: 'Count / Pieces' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setPriceUnit(u.id as any)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  priceUnit === u.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
          <span className="text-xs font-bold text-blue-800">Option A (Pack 1)</span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={itemAPrice}
                onChange={(e) => setItemAPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Quantity ({priceUnit})</label>
              <input
                type="number"
                min="1"
                value={itemAQty}
                onChange={(e) => setItemAQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-800">Option B (Pack 2)</span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={itemBPrice}
                onChange={(e) => setItemBPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Quantity ({priceUnit})</label>
              <input
                type="number"
                min="1"
                value={itemBQty}
                onChange={(e) => setItemBQty(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UNIVERSAL UNIT CONVERTER (Powered by math.js bidirectional engine)
  if (toolId === 'unit-converter') {
    return <ConverterShell toolId="unit-converter" onResultChange={onResultChange} />;
  }

  // DEFAULT FALLBACK: UNIT CONVERTER
  return <ConverterShell toolId={toolId} onResultChange={onResultChange} />;
};
