import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../../types';

interface SalaryTaxProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const SalaryTaxCalculators: React.FC<SalaryTaxProps> = ({ toolId, onResultChange }) => {
  // CTC to In-Hand states
  const [annualCtc, setAnnualCtc] = useState<number>(1200000); // 12 Lakhs
  const [basicPercent, setBasicPercent] = useState<number>(40); // 40% of CTC
  const [hraPercent, setHraPercent] = useState<number>(20); // 20% of CTC
  const [professionalTaxMonthly, setProfessionalTaxMonthly] = useState<number>(200);
  const [employeePfRate, setEmployeePfRate] = useState<number>(12); // 12% of Basic

  // Tax Calculator states
  const [financialYear, setFinancialYear] = useState<string>('2025-26');
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [section80C, setSection80C] = useState<number>(150000);
  const [section80D, setSection80D] = useState<number>(25000);
  const [rentPaidAnnual, setRentPaidAnnual] = useState<number>(180000);
  const [isMetroCity, setIsMetroCity] = useState<boolean>(true);

  // Salary Hike states
  const [currentSalary, setCurrentSalary] = useState<number>(800000);
  const [hikePercentage, setHikePercentage] = useState<number>(15);

  // HRA Exemption states
  const [hraBasicMonthly, setHraBasicMonthly] = useState<number>(50000);
  const [hraDaMonthly, setHraDaMonthly] = useState<number>(0);
  const [hraReceivedMonthly, setHraReceivedMonthly] = useState<number>(20000);
  const [hraRentPaidMonthly, setHraRentPaidMonthly] = useState<number>(25000);
  const [hraIsMetro, setHraIsMetro] = useState<boolean>(true);

  // EPF / PF states
  const [pfBasicMonthly, setPfBasicMonthly] = useState<number>(40000);
  const [pfCurrentAge, setPfCurrentAge] = useState<number>(28);
  const [pfRetireAge, setPfRetireAge] = useState<number>(58);
  const [pfCurrentBalance, setPfCurrentBalance] = useState<number>(150000);
  const [pfExpectedHike, setPfExpectedHike] = useState<number>(7);
  const [pfInterestRate, setPfInterestRate] = useState<number>(8.25);

  // Gratuity states
  const [gratuityBasic, setGratuityBasic] = useState<number>(65000);
  const [gratuityTenureYears, setGratuityTenureYears] = useState<number>(7);

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  // 1. CTC TO IN-HAND
  const ctcCalculation = useMemo(() => {
    const ctc = Number(annualCtc) || 0;
    const basicAnnual = (ctc * (Number(basicPercent) || 40)) / 100;
    const hraAnnual = (ctc * (Number(hraPercent) || 20)) / 100;
    const epfAnnual = (basicAnnual * (Number(employeePfRate) || 12)) / 100;
    const ptAnnual = (Number(professionalTaxMonthly) || 200) * 12;

    // Estimate income tax under new regime with ₹75k standard deduction
    const taxableIncome = Math.max(0, ctc - 75000 - ptAnnual);
    let estAnnualTax = 0;
    if (taxableIncome > 1200000) {
      estAnnualTax = (taxableIncome - 1200000) * 0.15 + 40000;
    } else if (taxableIncome > 800000) {
      estAnnualTax = (taxableIncome - 800000) * 0.10 + 10000;
    }

    const specialAllowanceAnnual = Math.max(0, ctc - (basicAnnual + hraAnnual + epfAnnual));
    const totalDeductionsAnnual = epfAnnual + ptAnnual + estAnnualTax;
    const inHandAnnual = Math.max(0, ctc - totalDeductionsAnnual);
    const inHandMonthly = inHandAnnual / 12;

    const rows: (string | number)[][] = [
      ['Basic Salary (40% CTC)', formatCurrency(basicAnnual / 12), formatCurrency(basicAnnual)],
      ['House Rent Allowance (HRA)', formatCurrency(hraAnnual / 12), formatCurrency(hraAnnual)],
      ['Special / Flexi Allowance', formatCurrency(specialAllowanceAnnual / 12), formatCurrency(specialAllowanceAnnual)],
      ['Gross Earnings', formatCurrency(ctc / 12), formatCurrency(ctc)],
      ['Employee Provident Fund (EPF)', `-${formatCurrency(epfAnnual / 12)}`, `-${formatCurrency(epfAnnual)}`],
      ['Professional Tax (PT)', `-${formatCurrency(ptAnnual / 12)}`, `-${formatCurrency(ptAnnual)}`],
      ['Estimated Income Tax (TDS)', `-${formatCurrency(estAnnualTax / 12)}`, `-${formatCurrency(estAnnualTax)}`],
    ];

    const result: CalculationResult = {
      toolName: 'CTC to In-Hand Salary Calculator',
      category: 'Salary & Tax',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Annual CTC Package', value: formatCurrency(ctc) },
        { label: 'Basic Salary Ratio', value: `${basicPercent}%` },
        { label: 'HRA Allowance', value: `${hraPercent}%` },
        { label: 'Employee PF Contribution', value: `${employeePfRate}% of Basic` },
      ],
      primaryResult: {
        label: 'Net Monthly Take-Home (In-Hand)',
        value: formatCurrency(inHandMonthly),
        subtext: `Annual In-Hand Pay: ${formatCurrency(inHandAnnual)} after PF, PT & TDS`,
        badge: 'Take-Home Pay',
      },
      breakdown: [
        { label: 'Gross Annual CTC', value: formatCurrency(ctc) },
        { label: 'Monthly Gross Earnings', value: formatCurrency(ctc / 12) },
        { label: 'Monthly Total Deductions', value: formatCurrency(totalDeductionsAnnual / 12) },
        { label: 'Annual Net Take-Home', value: formatCurrency(inHandAnnual) },
        { label: 'Annual Total Deductions', value: formatCurrency(totalDeductionsAnnual) },
      ],
      scheduleTable: {
        title: 'Complete Monthly & Annual Salary Structure Breakdown',
        headers: ['Salary Component', 'Monthly (₹)', 'Annual (₹)'],
        rows,
        totalRow: ['Net Take-Home Salary', formatCurrency(inHandMonthly), formatCurrency(inHandAnnual)],
      },
      chartData: {
        labels: ['Net In-Hand Take-Home', 'Annual Total Deductions'],
        values: [Math.round(inHandAnnual), Math.round(totalDeductionsAnnual)],
        colors: ['#10b981', '#ef4444'],
      },
      formula: 'Net In-Hand = Gross Salary - (EPF + Professional Tax + Income Tax TDS)',
    };
    return result;
  }, [annualCtc, basicPercent, hraPercent, professionalTaxMonthly, employeePfRate]);

  // 2. INCOME TAX CALCULATOR
  const taxCalculation = useMemo(() => {
    const gross = Number(annualCtc) || 0;
    const stdDeduction = taxRegime === 'new' ? 75000 : 50000;
    let taxable = gross;

    if (taxRegime === 'new') {
      taxable = Math.max(0, gross - stdDeduction);
    } else {
      const totalDeductions = stdDeduction + Math.min(150000, Number(section80C) || 0) + (Number(section80D) || 0);
      taxable = Math.max(0, gross - totalDeductions);
    }

    let tax = 0;
    const slabBreakdown: (string | number)[][] = [];

    if (taxRegime === 'new') {
      // New Regime Slabs (Budget 2024-2026 update)
      // 0 - 3L: Nil
      // 3L - 7L: 5%
      // 7L - 10L: 10%
      // 10L - 12L: 15%
      // 12L - 15L: 20%
      // Above 15L: 30%
      if (taxable <= 700000) {
        tax = 0; // Section 87A rebate
        slabBreakdown.push(['Up to ₹7,00,000', '0%', '₹0 (Section 87A Rebate)']);
      } else {
        if (taxable > 300000) {
          const t1 = Math.min(400000, taxable - 300000) * 0.05;
          tax += t1;
          slabBreakdown.push(['₹3,00,000 to ₹7,00,000', '5%', formatCurrency(t1)]);
        }
        if (taxable > 700000) {
          const t2 = Math.min(300000, taxable - 700000) * 0.10;
          tax += t2;
          slabBreakdown.push(['₹7,00,000 to ₹10,00,000', '10%', formatCurrency(t2)]);
        }
        if (taxable > 1000000) {
          const t3 = Math.min(200000, taxable - 1000000) * 0.15;
          tax += t3;
          slabBreakdown.push(['₹10,00,000 to ₹12,00,000', '15%', formatCurrency(t3)]);
        }
        if (taxable > 1200000) {
          const t4 = Math.min(300000, taxable - 1200000) * 0.20;
          tax += t4;
          slabBreakdown.push(['₹12,00,000 to ₹15,00,000', '20%', formatCurrency(t4)]);
        }
        if (taxable > 1500000) {
          const t5 = (taxable - 1500000) * 0.30;
          tax += t5;
          slabBreakdown.push(['Above ₹15,00,000', '30%', formatCurrency(t5)]);
        }
      }
    } else {
      // Old Regime
      if (taxable <= 500000) {
        tax = 0;
        slabBreakdown.push(['Up to ₹5,00,000', '0%', '₹0 (Section 87A Rebate)']);
      } else {
        if (taxable > 250000) {
          const t1 = Math.min(250000, taxable - 250000) * 0.05;
          tax += t1;
          slabBreakdown.push(['₹2,50,000 to ₹5,00,000', '5%', formatCurrency(t1)]);
        }
        if (taxable > 500000) {
          const t2 = Math.min(500000, taxable - 500000) * 0.20;
          tax += t2;
          slabBreakdown.push(['₹5,00,000 to ₹10,00,000', '20%', formatCurrency(t2)]);
        }
        if (taxable > 1000000) {
          const t3 = (taxable - 1000000) * 0.30;
          tax += t3;
          slabBreakdown.push(['Above ₹10,00,000', '30%', formatCurrency(t3)]);
        }
      }
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    const result: CalculationResult = {
      toolName: `Income Tax Calculator (${financialYear})`,
      category: 'Salary & Tax',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Financial Year', value: `FY ${financialYear}` },
        { label: 'Tax Regime Chosen', value: taxRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime' },
        { label: 'Gross Annual Income', value: formatCurrency(gross) },
        { label: 'Standard Deduction', value: formatCurrency(stdDeduction) },
      ],
      primaryResult: {
        label: 'Total Income Tax Payable',
        value: formatCurrency(totalTax),
        subtext: `Includes 4% Health & Education Cess (${formatCurrency(cess)})`,
      },
      breakdown: [
        { label: 'Gross Total Income', value: formatCurrency(gross) },
        { label: 'Net Taxable Income', value: formatCurrency(taxable) },
        { label: 'Base Tax', value: formatCurrency(tax) },
        { label: 'Health & Education Cess (4%)', value: formatCurrency(cess) },
        { label: 'Net Tax Payable', value: formatCurrency(totalTax) },
      ],
      scheduleTable: {
        title: `Income Tax Slab Breakdown (${taxRegime === 'new' ? 'New Regime' : 'Old Regime'})`,
        headers: ['Taxable Slab', 'Tax Rate', 'Calculated Tax'],
        rows: slabBreakdown,
        totalRow: ['Total Tax with Cess', 'Effective Rate: ' + ((totalTax / (gross || 1)) * 100).toFixed(1) + '%', formatCurrency(totalTax)],
      },
      chartData: {
        labels: ['Post-Tax Income', 'Income Tax Payable'],
        values: [Math.max(0, Math.round(gross - totalTax)), Math.round(totalTax)],
        colors: ['#10b981', '#ef4444'],
      },
      formula: 'Total Tax = Base Slab Tax + 4% Health & Education Cess - 87A Rebate',
    };
    return result;
  }, [annualCtc, financialYear, taxRegime, section80C, section80D]);

  // 3. SALARY HIKE
  const hikeCalculation = useMemo(() => {
    const cur = Number(currentSalary) || 0;
    const hike = Number(hikePercentage) || 0;
    const increment = (cur * hike) / 100;
    const newSalary = cur + increment;
    const monthlyDiff = increment / 12;

    const result: CalculationResult = {
      toolName: 'Salary Increment & Hike Calculator',
      category: 'Salary & Tax',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Current CTC / Salary', value: formatCurrency(cur) },
        { label: 'Appraisal Hike Percentage', value: `${hike}%` },
      ],
      primaryResult: {
        label: 'Revised New Annual CTC',
        value: formatCurrency(newSalary),
        subtext: `Monthly Increase: +${formatCurrency(monthlyDiff)} / month`,
        badge: `+${hike}% Hike`,
      },
      breakdown: [
        { label: 'Current Annual Salary', value: formatCurrency(cur) },
        { label: 'Annual Salary Increment', value: `+${formatCurrency(increment)}` },
        { label: 'Current Monthly Pay', value: formatCurrency(cur / 12) },
        { label: 'New Monthly Pay', value: formatCurrency(newSalary / 12) },
      ],
      formula: 'New Salary = Current Salary x (1 + Hike% / 100)',
    };
    return result;
  }, [currentSalary, hikePercentage]);

  // 4. HRA EXEMPTION (Section 10(13A))
  const hraCalculation = useMemo(() => {
    const basicAnnual = (Number(hraBasicMonthly) || 0) * 12;
    const daAnnual = (Number(hraDaMonthly) || 0) * 12;
    const salaryForHra = basicAnnual + daAnnual;

    const actualHraAnnual = (Number(hraReceivedMonthly) || 0) * 12;
    const rentPaidAnnual = (Number(hraRentPaidMonthly) || 0) * 12;

    const limit1 = actualHraAnnual;
    const limit2 = hraIsMetro ? salaryForHra * 0.5 : salaryForHra * 0.4;
    const limit3 = Math.max(0, rentPaidAnnual - 0.1 * salaryForHra);

    const exemptHraAnnual = Math.max(0, Math.min(limit1, limit2, limit3));
    const taxableHraAnnual = Math.max(0, actualHraAnnual - exemptHraAnnual);
    const estTaxSaved = Math.round(exemptHraAnnual * 0.312); // 30% slab + 4% cess

    const result: CalculationResult = {
      toolName: 'HRA Tax Exemption Calculator (Section 10(13A))',
      category: 'Salary & Tax',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Basic Salary + DA', value: `${formatCurrency(salaryForHra / 12)} / month (${formatCurrency(salaryForHra)}/yr)` },
        { label: 'Actual HRA Received', value: `${formatCurrency(actualHraAnnual / 12)} / month` },
        { label: 'Rent Paid to Landlord', value: `${formatCurrency(rentPaidAnnual / 12)} / month` },
        { label: 'Location Category', value: hraIsMetro ? 'Metro (50% Basic: Delhi/Mum/Kol/Chn)' : 'Non-Metro (40% Basic)' },
      ],
      primaryResult: {
        label: 'Annual Tax-Exempt HRA',
        value: formatCurrency(exemptHraAnnual),
        subtext: `Taxable HRA: ${formatCurrency(taxableHraAnnual)}/yr (${formatCurrency(taxableHraAnnual / 12)}/mo)`,
        badge: `Saves ~${formatCurrency(estTaxSaved)} in Tax`,
      },
      breakdown: [
        { label: 'Actual HRA Received from Employer', value: formatCurrency(actualHraAnnual) },
        { label: `50% or 40% of Salary for HRA (${hraIsMetro ? '50%' : '40%'})`, value: formatCurrency(limit2) },
        { label: 'Excess Rent Paid over 10% of Salary', value: formatCurrency(limit3) },
        { label: 'Section 10(13A) Exempted HRA (Minimum of 3)', value: formatCurrency(exemptHraAnnual) },
        { label: 'Taxable Portion of HRA Added to Income', value: formatCurrency(taxableHraAnnual) },
        { label: 'Approximate Tax Saved (30% Bracket)', value: formatCurrency(estTaxSaved) },
      ],
      formula: 'Exempt HRA = Min(Actual HRA, 50%/40% of Basic+DA, Rent Paid - 10% of Basic+DA)',
    };
    return result;
  }, [hraBasicMonthly, hraDaMonthly, hraReceivedMonthly, hraRentPaidMonthly, hraIsMetro]);

  // 5. EPF / PROVIDENT FUND CORPUS CALCULATOR
  const pfCalculation = useMemo(() => {
    const basicMonthly = Number(pfBasicMonthly) || 15000;
    const employeeShareMonthly = basicMonthly * 0.12;
    const employerEpfMonthly = basicMonthly * 0.0367;
    const employerEpsMonthly = Math.min(1250, basicMonthly * 0.0833);
    const totalMonthlyDeposit = employeeShareMonthly + employerEpfMonthly;

    const currentAge = Number(pfCurrentAge) || 28;
    const retireAge = Number(pfRetireAge) || 58;
    const years = Math.max(1, retireAge - currentAge);
    const annualRate = (Number(pfInterestRate) || 8.25) / 100;
    const annualHike = (Number(pfExpectedHike) || 7) / 100;

    let balance = Number(pfCurrentBalance) || 0;
    let totalEmployeeInvested = 0;
    let totalEmployerInvested = 0;
    let runningBasic = basicMonthly;

    for (let y = 1; y <= years; y++) {
      const empShare = runningBasic * 0.12 * 12;
      const emrShare = runningBasic * 0.0367 * 12;
      totalEmployeeInvested += empShare;
      totalEmployerInvested += emrShare;

      const yearDeposit = empShare + emrShare;
      // Monthly compounding / annual crediting
      const interestEarned = (balance + yearDeposit / 2) * annualRate;
      balance = balance + yearDeposit + interestEarned;
      runningBasic *= 1 + annualHike;
    }

    const totalInvested = totalEmployeeInvested + totalEmployerInvested;
    const totalInterestEarned = Math.max(0, balance - totalInvested - (Number(pfCurrentBalance) || 0));

    const result: CalculationResult = {
      toolName: 'EPF / Employees Provident Fund Calculator',
      category: 'Salary & Tax',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Current Monthly Basic Salary', value: formatCurrency(basicMonthly) },
        { label: 'Current Age / Retirement Age', value: `${currentAge} yrs / ${retireAge} yrs (${years} yrs investment)` },
        { label: 'Current EPF Balance', value: formatCurrency(Number(pfCurrentBalance) || 0) },
        { label: 'EPFO Interest Rate', value: `${pfInterestRate}% p.a. (Govt Announced)` },
      ],
      primaryResult: {
        label: 'Maturity EPF Corpus at Retirement',
        value: formatCurrency(balance),
        subtext: `Total Interest Earned: ${formatCurrency(totalInterestEarned)}`,
        badge: `${years} Years Compounding`,
      },
      breakdown: [
        { label: 'Monthly Employee Share (12%)', value: formatCurrency(employeeShareMonthly) },
        { label: 'Monthly Employer EPF Share (3.67%)', value: formatCurrency(employerEpfMonthly) },
        { label: 'Monthly Employer Pension EPS (8.33%)', value: formatCurrency(employerEpsMonthly) },
        { label: 'Total Employee Deposits over Career', value: formatCurrency(totalEmployeeInvested) },
        { label: 'Total Employer Deposits over Career', value: formatCurrency(totalEmployerInvested) },
        { label: 'Total Compound Interest Accumulated', value: formatCurrency(totalInterestEarned) },
      ],
      formula: 'EPF Maturity = Future Value of Monthly Contributions (15.67% Basic) at 8.25% Annual Compounding',
    };
    return result;
  }, [pfBasicMonthly, pfCurrentAge, pfRetireAge, pfCurrentBalance, pfExpectedHike, pfInterestRate]);

  // 6. GRATUITY CALCULATOR (Payment of Gratuity Act 1972)
  const gratuityCalculation = useMemo(() => {
    const basic = Number(gratuityBasic) || 0;
    const tenure = Math.max(0, Number(gratuityTenureYears) || 0);

    // Formula: (15 * Last Basic * Tenure) / 26
    const gratuityRaw = tenure >= 5 ? Math.round((15 * basic * tenure) / 26) : 0;
    const maxExempt = 2000000; // 20 Lakhs statutory ceiling
    const exemptGratuity = Math.min(gratuityRaw, maxExempt);
    const taxableGratuity = Math.max(0, gratuityRaw - maxExempt);

    const result: CalculationResult = {
      toolName: 'Gratuity Calculator (Payment of Gratuity Act 1972)',
      category: 'Salary & Tax',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Last Drawn Basic + DA', value: formatCurrency(basic) },
        { label: 'Total Completed Years of Service', value: `${tenure} years ${tenure < 5 ? '(Min 5 yrs required)' : ''}` },
        { label: 'Act Applicability', value: 'Covered under Gratuity Act (15/26 Formula)' },
      ],
      primaryResult: {
        label: 'Total Gratuity Payable',
        value: tenure >= 5 ? formatCurrency(gratuityRaw) : '₹0 (Ineligible)',
        subtext: tenure >= 5 ? (taxableGratuity > 0 ? `Tax-free: ${formatCurrency(exemptGratuity)} • Taxable: ${formatCurrency(taxableGratuity)}` : '100% Tax-Exempt under Section 10(10)') : 'Minimum 5 continuous years of service is required by law.',
        badge: tenure >= 5 ? `${tenure} Yrs Tenure` : 'Under 5 Years',
      },
      breakdown: [
        { label: 'Last Drawn Monthly Basic + DA', value: formatCurrency(basic) },
        { label: 'Statutory Working Days per Month', value: '26 days' },
        { label: 'Gratuity Factor', value: '15 days per year of service' },
        { label: 'Gross Calculated Gratuity', value: formatCurrency(gratuityRaw) },
        { label: 'Income Tax Exemption Ceiling (Sec 10(10))', value: '₹20,00,000' },
        { label: 'Tax-Free Gratuity Amount', value: formatCurrency(exemptGratuity) },
        { label: 'Taxable Gratuity Portion', value: formatCurrency(taxableGratuity) },
      ],
      formula: 'Gratuity = (15 × Last Drawn Basic Salary × Completed Years of Service) / 26',
    };
    return result;
  }, [gratuityBasic, gratuityTenureYears]);

  React.useEffect(() => {
    if (toolId === 'income-tax' || toolId === 'tax-regime') {
      onResultChange(taxCalculation);
    } else if (toolId === 'salary-hike') {
      onResultChange(hikeCalculation);
    } else if (toolId === 'hra-exemption') {
      onResultChange(hraCalculation);
    } else if (toolId === 'pf') {
      onResultChange(pfCalculation);
    } else if (toolId === 'gratuity') {
      onResultChange(gratuityCalculation);
    } else if (toolId === 'ctc-to-in-hand' || toolId === 'salary') {
      onResultChange(ctcCalculation);
    } else {
      onResultChange(ctcCalculation);
    }
  }, [
    toolId,
    ctcCalculation,
    taxCalculation,
    hikeCalculation,
    hraCalculation,
    pfCalculation,
    gratuityCalculation,
    onResultChange,
  ]);

  if (toolId === 'income-tax') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Income Tax Configuration
        </h3>

        {/* Financial Year Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026-27">FY 2026-27 (Latest)</option>
              <option value="2025-26">FY 2025-26</option>
              <option value="2024-25">FY 2024-25</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tax Regime</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTaxRegime('new')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taxRegime === 'new' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
              >
                New Regime (Default)
              </button>
              <button
                type="button"
                onClick={() => setTaxRegime('old')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${taxRegime === 'old' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
              >
                Old Regime
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Gross Annual Total Income</label>
          <input
            type="number"
            step="50000"
            value={annualCtc}
            onChange={(e) => setAnnualCtc(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {taxRegime === 'old' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Old Regime Deductions
            </h4>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Section 80C (PPF, ELSS, EPF, LIC - Max 1.5L)</label>
              <input
                type="number"
                max="150000"
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Section 80D (Health Insurance)</label>
              <input
                type="number"
                value={section80D}
                onChange={(e) => setSection80D(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (toolId === 'salary-hike') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Salary Increment Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Current Annual CTC</label>
          <input
            type="number"
            value={currentSalary}
            onChange={(e) => setCurrentSalary(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Appraisal Hike (%)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              +{hikePercentage}%
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="200"
            value={hikePercentage}
            onChange={(e) => setHikePercentage(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            min="1"
            max="50"
            value={hikePercentage}
            onChange={(e) => setHikePercentage(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'hra-exemption') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          HRA & Rent Exemption Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Basic Salary (₹)</label>
            <input
              type="number"
              value={hraBasicMonthly}
              onChange={(e) => setHraBasicMonthly(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly DA (₹)</label>
            <input
              type="number"
              value={hraDaMonthly}
              onChange={(e) => setHraDaMonthly(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">HRA Received / Month (₹)</label>
            <input
              type="number"
              value={hraReceivedMonthly}
              onChange={(e) => setHraReceivedMonthly(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Actual Rent Paid / Month (₹)</label>
            <input
              type="number"
              value={hraRentPaidMonthly}
              onChange={(e) => setHraRentPaidMonthly(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Rental City Category</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHraIsMetro(true)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                hraIsMetro ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Metro (50% Basic)
              <span className="block text-[10px] font-normal opacity-80">Delhi, Mumbai, Kolkata, Chennai</span>
            </button>
            <button
              type="button"
              onClick={() => setHraIsMetro(false)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                !hraIsMetro ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Non-Metro (40% Basic)
              <span className="block text-[10px] font-normal opacity-80">Bengaluru, Hyd, Pune & all others</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'pf') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          EPF Contribution & Retirement Horizon
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Basic Salary (₹)</label>
          <input
            type="number"
            step="1000"
            value={pfBasicMonthly}
            onChange={(e) => setPfBasicMonthly(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Current Age (Years)</label>
            <input
              type="number"
              min="18"
              max="57"
              value={pfCurrentAge}
              onChange={(e) => setPfCurrentAge(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Retirement Age (Years)</label>
            <input
              type="number"
              min="40"
              max="65"
              value={pfRetireAge}
              onChange={(e) => setPfRetireAge(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Current EPF Balance (₹)</label>
            <input
              type="number"
              step="10000"
              value={pfCurrentBalance}
              onChange={(e) => setPfCurrentBalance(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Annual Salary Hike (%)</label>
            <input
              type="number"
              min="0"
              max="25"
              value={pfExpectedHike}
              onChange={(e) => setPfExpectedHike(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'gratuity') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Gratuity Calculation Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Last Drawn Basic + DA (₹ / month)</label>
          <input
            type="number"
            step="1000"
            value={gratuityBasic}
            onChange={(e) => setGratuityBasic(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700">Completed Years of Service</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {gratuityTenureYears} Years
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="45"
            value={gratuityTenureYears}
            onChange={(e) => setGratuityTenureYears(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Note: Continuous service of at least 5 full years with the same employer is required by law.
          </p>
        </div>
      </div>
    );
  }

  // DEFAULT: CTC TO IN-HAND
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        CTC Package & Structure
      </h3>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-700">Total Annual CTC</label>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {formatCurrency(annualCtc)}
          </span>
        </div>
        <input
          type="number"
          step="50000"
          value={annualCtc}
          onChange={(e) => setAnnualCtc(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="range"
          min="200000"
          max="5000000"
          step="50000"
          value={annualCtc}
          onChange={(e) => setAnnualCtc(Number(e.target.value))}
          className="w-full mt-2 accent-blue-600 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Basic Salary (% of CTC)</label>
          <input
            type="number"
            min="20"
            max="60"
            value={basicPercent}
            onChange={(e) => setBasicPercent(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">HRA (% of CTC)</label>
          <input
            type="number"
            min="10"
            max="50"
            value={hraPercent}
            onChange={(e) => setHraPercent(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
          />
        </div>
      </div>
    </div>
  );
};
