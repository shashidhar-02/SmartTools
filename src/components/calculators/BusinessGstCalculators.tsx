import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../../types';

interface BusinessGstProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const BusinessGstCalculators: React.FC<BusinessGstProps> = ({ toolId, onResultChange }) => {
  // GST States
  const [baseAmount, setBaseAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra'); // Intra (CGST+SGST) or Inter (IGST)

  // Profit Margin States
  const [costPrice, setCostPrice] = useState<number>(500);
  const [sellingPrice, setSellingPrice] = useState<number>(750);

  // Break-Even States
  const [fixedCosts, setFixedCosts] = useState<number>(100000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(200);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(120);

  // Discount States
  const [originalPrice, setOriginalPrice] = useState<number>(2500);
  const [discountPercent, setDiscountPercent] = useState<number>(20);

  const formatCurrency = (val: number) => `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  // 1. GST CALCULATION
  const gstCalculation = useMemo(() => {
    const P = Number(baseAmount) || 0;
    const R = Number(gstRate) || 0;

    let netAmount = 0;
    let gstAmount = 0;
    let totalAmount = 0;

    if (gstType === 'exclusive') {
      netAmount = P;
      gstAmount = (P * R) / 100;
      totalAmount = P + gstAmount;
    } else {
      totalAmount = P;
      netAmount = (P * 100) / (100 + R);
      gstAmount = totalAmount - netAmount;
    }

    const cgst = supplyType === 'intra' ? gstAmount / 2 : 0;
    const sgst = supplyType === 'intra' ? gstAmount / 2 : 0;
    const igst = supplyType === 'inter' ? gstAmount : 0;

    const rows: (string | number)[][] = [
      ['Net Basic Amount (Before GST)', formatCurrency(netAmount), '-'],
      [
        supplyType === 'intra' ? `CGST (${R / 2}%)` : `IGST (${R}%)`,
        formatCurrency(supplyType === 'intra' ? cgst : igst),
        supplyType === 'intra' ? 'Central GST' : 'Integrated GST',
      ],
    ];

    if (supplyType === 'intra') {
      rows.push([`SGST / UTGST (${R / 2}%)`, formatCurrency(sgst), 'State / UT GST']);
    }

    rows.push(['Total GST Amount', formatCurrency(gstAmount), `Total ${R}% tax`]);
    rows.push(['Gross Final Invoice Amount', formatCurrency(totalAmount), 'Billable total']);

    const result: CalculationResult = {
      toolName: toolId === 'gst-split' ? 'CGST / SGST / IGST Split Calculator' : 'GST Calculator',
      category: 'Business & GST',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Amount Entered', value: formatCurrency(P) },
        { label: 'GST Rate', value: `${R}%` },
        { label: 'Calculation Mode', value: gstType === 'exclusive' ? 'GST Exclusive (Added)' : 'GST Inclusive (Extracted)' },
        { label: 'Supply Classification', value: supplyType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)' },
      ],
      primaryResult: {
        label: gstType === 'exclusive' ? 'Total Invoice Amount (With GST)' : 'Net Amount (Before GST)',
        value: formatCurrency(gstType === 'exclusive' ? totalAmount : netAmount),
        subtext: `Total GST Tax Content: ${formatCurrency(gstAmount)} at ${R}% rate`,
        badge: `${R}% GST`,
      },
      breakdown: [
        { label: 'Original Net Price', value: formatCurrency(netAmount) },
        { label: 'Total GST Amount', value: formatCurrency(gstAmount) },
        ...(supplyType === 'intra'
          ? [
              { label: `CGST (${R / 2}%)`, value: formatCurrency(cgst) },
              { label: `SGST (${R / 2}%)`, value: formatCurrency(sgst) },
            ]
          : [{ label: `IGST (${R}%)`, value: formatCurrency(igst) }]),
        { label: 'Total Invoice Amount', value: formatCurrency(totalAmount) },
      ],
      scheduleTable: {
        title: 'GST Tax Invoice Breakdown Schedule',
        headers: ['Component', 'Amount (₹)', 'Tax Description'],
        rows,
      },
      chartData: {
        labels: ['Net Price (Pre-GST)', 'Total GST Tax'],
        values: [Math.round(netAmount), Math.round(gstAmount)],
        colors: ['#3b82f6', '#8b5cf6'],
      },
      formula:
        gstType === 'exclusive'
          ? 'GST Amount = (Amount x Rate) / 100'
          : 'GST Amount = Amount - [Amount x 100 / (100 + Rate)]',
    };
    return result;
  }, [baseAmount, gstRate, gstType, supplyType, toolId]);

  // 2. PROFIT MARGIN & MARKUP
  const marginCalculation = useMemo(() => {
    const cp = Number(costPrice) || 0;
    const sp = Number(sellingPrice) || 0;
    const profit = sp - cp;
    const marginPct = sp > 0 ? (profit / sp) * 100 : 0;
    const markupPct = cp > 0 ? (profit / cp) * 100 : 0;

    const result: CalculationResult = {
      toolName: 'Profit Margin & Markup Calculator',
      category: 'Business & GST',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Cost of Goods / Purchase Price', value: formatCurrency(cp) },
        { label: 'Selling Price / Revenue', value: formatCurrency(sp) },
      ],
      primaryResult: {
        label: profit >= 0 ? 'Net Profit Margin' : 'Net Loss Margin',
        value: `${marginPct.toFixed(2)}%`,
        subtext: `${profit >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(profit)} (Markup on Cost: ${markupPct.toFixed(2)}%)`,
        badge: profit >= 0 ? `${marginPct.toFixed(1)}% Margin` : 'Negative Margin',
      },
      breakdown: [
        { label: 'Cost of Goods Sold (COGS)', value: formatCurrency(cp) },
        { label: 'Gross Revenue / Selling Price', value: formatCurrency(sp) },
        { label: profit >= 0 ? 'Net Profit' : 'Net Loss', value: formatCurrency(profit) },
        { label: 'Profit Margin (%)', value: `${marginPct.toFixed(2)}%` },
        { label: 'Markup on Cost (%)', value: `${markupPct.toFixed(2)}%` },
      ],
      chartData: {
        labels: ['Cost Price', profit > 0 ? 'Net Profit' : 'Net Loss'],
        values: [Math.round(cp), Math.max(0, Math.round(profit))],
        colors: ['#64748b', '#10b981'],
      },
      formula: 'Margin = [(Selling Price - Cost) / Selling Price] x 100',
    };
    return result;
  }, [costPrice, sellingPrice]);

  // 3. BREAK-EVEN POINT
  const breakEvenCalculation = useMemo(() => {
    const fc = Number(fixedCosts) || 0;
    const price = Number(pricePerUnit) || 0;
    const vc = Number(variableCostPerUnit) || 0;

    const cm = price - vc; // Contribution Margin
    const bepUnits = cm > 0 ? fc / cm : 0;
    const bepRevenue = bepUnits * price;

    const result: CalculationResult = {
      toolName: 'Break-Even Point Calculator',
      category: 'Business & GST',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Total Fixed Costs', value: formatCurrency(fc) },
        { label: 'Selling Price per Unit', value: formatCurrency(price) },
        { label: 'Variable Cost per Unit', value: formatCurrency(vc) },
      ],
      primaryResult: {
        label: 'Break-Even Units Needed',
        value: `${Math.ceil(bepUnits).toLocaleString()} Units`,
        subtext: `Total Break-Even Sales Revenue: ${formatCurrency(bepRevenue)}`,
        badge: 'Zero Profit Point',
      },
      breakdown: [
        { label: 'Contribution Margin per Unit', value: formatCurrency(cm) },
        { label: 'Contribution Margin Ratio', value: `${price > 0 ? ((cm / price) * 100).toFixed(1) : 0}%` },
        { label: 'Units to Break Even', value: `${Math.ceil(bepUnits)} units` },
        { label: 'Break-Even Gross Revenue', value: formatCurrency(bepRevenue) },
      ],
      formula: 'Break-Even Units = Total Fixed Costs / (Price per Unit - Variable Cost per Unit)',
    };
    return result;
  }, [fixedCosts, pricePerUnit, variableCostPerUnit]);

  // 4. DISCOUNT
  const discountCalculation = useMemo(() => {
    const orig = Number(originalPrice) || 0;
    const disc = Number(discountPercent) || 0;
    const savings = (orig * disc) / 100;
    const finalPrice = orig - savings;

    const result: CalculationResult = {
      toolName: 'Discount & Sale Price Calculator',
      category: 'Business & GST',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Original List Price', value: formatCurrency(orig) },
        { label: 'Discount Percentage', value: `${disc}% OFF` },
      ],
      primaryResult: {
        label: 'Final Discounted Price',
        value: formatCurrency(finalPrice),
        subtext: `Total You Save: ${formatCurrency(savings)} (${disc}% discount)`,
        badge: 'Special Deal',
      },
      breakdown: [
        { label: 'Original Retail Price', value: formatCurrency(orig) },
        { label: 'Total Amount Saved', value: formatCurrency(savings) },
        { label: 'Final Payable Price', value: formatCurrency(finalPrice) },
      ],
      formula: 'Final Price = Original Price - (Original Price x Discount% / 100)',
    };
    return result;
  }, [originalPrice, discountPercent]);

  React.useEffect(() => {
    if (toolId === 'profit-margin' || toolId === 'margin') {
      onResultChange(marginCalculation);
    } else if (toolId === 'break-even') {
      onResultChange(breakEvenCalculation);
    } else if (toolId === 'discount') {
      onResultChange(discountCalculation);
    } else if (toolId === 'gst' || toolId === 'gst-calculator') {
      onResultChange(gstCalculation);
    } else {
      onResultChange(gstCalculation);
    }
  }, [toolId, gstCalculation, marginCalculation, breakEvenCalculation, discountCalculation, onResultChange]);

  if (toolId === 'profit-margin' || toolId === 'margin') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Cost & Revenue Inputs
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Cost of Goods (CP)</label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Selling Price (SP)</label>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'break-even') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Break-Even Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Total Fixed Overhead Costs</label>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Sale Price per Unit</label>
            <input
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Variable Cost per Unit</label>
            <input
              type="number"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'discount') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Discount Details
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Original Retail Price</label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Discount Rate (%)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{discountPercent}% OFF</span>
          </div>
          <input
            type="range"
            min="1"
            max="95"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    );
  }

  // DEFAULT GST FORM
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        GST Tax Calculation
      </h3>

      {/* Mode toggle: Exclusive vs Inclusive */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setGstType('exclusive')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            gstType === 'exclusive' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          GST Exclusive (Add GST)
        </button>
        <button
          type="button"
          onClick={() => setGstType('inclusive')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
            gstType === 'inclusive' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          GST Inclusive (Extract GST)
        </button>
      </div>

      {/* Base Amount */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          {gstType === 'exclusive' ? 'Net Base Amount (₹)' : 'Gross MRP Amount (₹)'}
        </label>
        <input
          type="number"
          step="100"
          value={baseAmount}
          onChange={(e) => setBaseAmount(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GST Slab Rates quick buttons */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Standard GST Slab Rate</label>
        <div className="grid grid-cols-5 gap-2">
          {[5, 12, 18, 28].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setGstRate(rate)}
              className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                gstRate === rate
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {rate}%
            </button>
          ))}
          <input
            type="number"
            placeholder="Custom %"
            value={gstRate}
            onChange={(e) => setGstRate(Number(e.target.value))}
            className="px-2 py-2 border border-slate-200 rounded-xl text-xs font-bold text-center"
          />
        </div>
      </div>

      {/* Intra-State vs Inter-State */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Supply Location (Tax Split)</label>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSupplyType('intra')}
            className={`p-2 rounded-xl border text-left transition-colors ${
              supplyType === 'intra' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-slate-200 text-slate-600'
            }`}
          >
            <div>Intra-State (Same State)</div>
            <div className="text-[10px] font-normal text-slate-500">CGST (50%) + SGST (50%)</div>
          </button>
          <button
            type="button"
            onClick={() => setSupplyType('inter')}
            className={`p-2 rounded-xl border text-left transition-colors ${
              supplyType === 'inter' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'border-slate-200 text-slate-600'
            }`}
          >
            <div>Inter-State (Different State)</div>
            <div className="text-[10px] font-normal text-slate-500">IGST (100%)</div>
          </button>
        </div>
      </div>
    </div>
  );
};
