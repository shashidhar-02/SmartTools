import React, { useState, useMemo } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { CalculationResult } from '../../types';

interface FinanceProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const FinanceCalculators: React.FC<FinanceProps> = ({ toolId, onResultChange }) => {
  // Common states
  const [loanAmount, setLoanAmount] = useState<number>(1000000); // 10 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(10);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  // SIP / LumpSum states
  const [sipMonthly, setSipMonthly] = useState<number>(5000);
  const [sipReturnRate, setSipReturnRate] = useState<number>(12);
  const [sipYears, setSipYears] = useState<number>(15);

  // Compound Interest states
  const [ciPrincipal, setCiPrincipal] = useState<number>(100000);
  const [ciRate, setCiRate] = useState<number>(7.5);
  const [ciYears, setCiYears] = useState<number>(5);
  const [ciFrequency, setCiFrequency] = useState<number>(12); // monthly

  const resetEmi = () => {
    setLoanAmount(1000000);
    setInterestRate(8.5);
    setTenureYears(10);
    setTenureType('years');
  };

  const resetSip = () => {
    setSipMonthly(5000);
    setSipReturnRate(12);
    setSipYears(15);
  };

  const resetCi = () => {
    setCiPrincipal(100000);
    setCiRate(7.5);
    setCiYears(5);
    setCiFrequency(12);
  };

  // Retirement states
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(40000);
  const [inflationRate, setInflationRate] = useState<number>(6);

  // Simple Interest states
  const [siPrincipal, setSiPrincipal] = useState<number>(100000);
  const [siRate, setSiRate] = useState<number>(8.0);
  const [siYears, setSiYears] = useState<number>(3);

  // FD states
  const [fdDeposit, setFdDeposit] = useState<number>(200000);
  const [fdRate, setFdRate] = useState<number>(7.1);
  const [fdYears, setFdYears] = useState<number>(3);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);

  // RD states
  const [rdMonthly, setRdMonthly] = useState<number>(5000);
  const [rdRate, setRdRate] = useState<number>(6.8);
  const [rdYears, setRdYears] = useState<number>(3);

  // PPF states
  const [ppfAnnual, setPpfAnnual] = useState<number>(150000);
  const [ppfRate, setPpfRate] = useState<number>(7.1);
  const [ppfYears, setPpfYears] = useState<number>(15);

  // Inflation states
  const [inflationCost, setInflationCost] = useState<number>(100000);
  const [inflationRateVal, setInflationRateVal] = useState<number>(6.0);
  const [inflationYears, setInflationYears] = useState<number>(10);

  // Retirement Planner states
  const [retireCurrentAge, setRetireCurrentAge] = useState<number>(30);
  const [retireAge, setRetireAge] = useState<number>(60);
  const [retireMonthlyExpense, setRetireMonthlyExpense] = useState<number>(45000);
  const [retireInflation, setRetireInflation] = useState<number>(6.0);
  const [retirePostReturn, setRetirePostReturn] = useState<number>(8.0);

  // Savings Goal states
  const [goalTargetAmount, setGoalTargetAmount] = useState<number>(2500000);
  const [goalYears, setGoalYears] = useState<number>(5);
  const [goalReturnRate, setGoalReturnRate] = useState<number>(12);

  // Rule of 72 states
  const [rule72Rate, setRule72Rate] = useState<number>(12);

  // Format currency
  const formatCurrency = (val: number, symbol = '₹') => {
    return `${symbol}${Math.round(val).toLocaleString('en-IN')}`;
  };

  // 1. EMI CALCULATOR
  const emiCalculation = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const annualR = Number(interestRate) || 0;
    const totalMonths = tenureType === 'years' ? (Number(tenureYears) || 1) * 12 : Number(tenureYears) || 1;
    const monthlyR = annualR / 12 / 100;

    let emi = 0;
    if (monthlyR > 0 && totalMonths > 0) {
      emi = (P * monthlyR * Math.pow(1 + monthlyR, totalMonths)) / (Math.pow(1 + monthlyR, totalMonths) - 1);
    } else if (totalMonths > 0) {
      emi = P / totalMonths;
    }

    const totalPayment = emi * totalMonths;
    const totalInterest = Math.max(0, totalPayment - P);

    // Generate yearly amortization schedule
    const scheduleRows: (string | number)[][] = [];
    let balance = P;
    const yearsCount = Math.ceil(totalMonths / 12);

    for (let y = 1; y <= yearsCount; y++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestM = balance * monthlyR;
        const principalM = Math.min(balance, emi - interestM);
        yearlyInterest += interestM;
        yearlyPrincipal += principalM;
        balance -= principalM;
      }

      scheduleRows.push([
        `Year ${y}`,
        formatCurrency(yearlyPrincipal),
        formatCurrency(yearlyInterest),
        formatCurrency(yearlyPrincipal + yearlyInterest),
        formatCurrency(Math.max(0, balance)),
      ]);
      if (balance <= 0) break;
    }

    const result: CalculationResult = {
      toolName: 'EMI Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Loan Principal Amount', value: formatCurrency(P) },
        { label: 'Annual Interest Rate', value: `${annualR}%` },
        { label: 'Loan Tenure', value: `${tenureYears} ${tenureType}` },
      ],
      primaryResult: {
        label: 'Monthly EMI Amount',
        value: formatCurrency(emi),
        subtext: `Total repayment over ${tenureYears} ${tenureType} is ${formatCurrency(totalPayment)}`,
      },
      breakdown: [
        { label: 'Principal Loan Amount', value: formatCurrency(P), note: `${((P / (totalPayment || 1)) * 100).toFixed(1)}% of total` },
        { label: 'Total Interest Payable', value: formatCurrency(totalInterest), note: `${((totalInterest / (totalPayment || 1)) * 100).toFixed(1)}% of total` },
        { label: 'Total Amount Payable (Principal + Interest)', value: formatCurrency(totalPayment) },
      ],
      scheduleTable: {
        title: 'Year-by-Year Loan Amortization Schedule',
        headers: ['Year', 'Principal Paid', 'Interest Paid', 'Total Payment', 'Remaining Balance'],
        rows: scheduleRows,
        totalRow: ['Total', formatCurrency(P), formatCurrency(totalInterest), formatCurrency(totalPayment), '₹0'],
      },
      chartData: {
        labels: ['Principal Loan', 'Total Interest'],
        values: [Math.round(P), Math.round(totalInterest)],
        colors: ['#2563eb', '#f59e0b'],
      },
      formula: 'EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]',
    };

    return result;
  }, [loanAmount, interestRate, tenureYears, tenureType]);

  // 2. SIP CALCULATOR
  const sipCalculation = useMemo(() => {
    const P = Number(sipMonthly) || 0;
    const r = (Number(sipReturnRate) || 0) / 100 / 12;
    const n = (Number(sipYears) || 0) * 12;

    let maturity = 0;
    if (r > 0 && n > 0) {
      maturity = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    } else {
      maturity = P * n;
    }

    const totalInvested = P * n;
    const estReturns = Math.max(0, maturity - totalInvested);

    // Yearly schedule
    const scheduleRows: (string | number)[][] = [];
    for (let y = 1; y <= sipYears; y++) {
      const mCount = y * 12;
      const curInvested = P * mCount;
      const curMaturity = r > 0 ? P * ((Math.pow(1 + r, mCount) - 1) / r) * (1 + r) : curInvested;
      const curGain = curMaturity - curInvested;
      scheduleRows.push([
        `Year ${y}`,
        formatCurrency(curInvested),
        formatCurrency(curGain),
        formatCurrency(curMaturity),
      ]);
    }

    const result: CalculationResult = {
      toolName: 'SIP Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Monthly Investment', value: formatCurrency(P) },
        { label: 'Expected Annual Return', value: `${sipReturnRate}%` },
        { label: 'Investment Time Period', value: `${sipYears} Years` },
      ],
      primaryResult: {
        label: 'Expected Maturity Corpus',
        value: formatCurrency(maturity),
        subtext: `Total estimated profit: ${formatCurrency(estReturns)} over ${sipYears} years`,
        badge: 'Wealth Creation',
      },
      breakdown: [
        { label: 'Total Capital Invested', value: formatCurrency(totalInvested), note: `${((totalInvested / (maturity || 1)) * 100).toFixed(1)}%` },
        { label: 'Estimated Wealth Gain (Return)', value: formatCurrency(estReturns), note: `${((estReturns / (maturity || 1)) * 100).toFixed(1)}%` },
        { label: 'Total Value on Maturity', value: formatCurrency(maturity) },
      ],
      scheduleTable: {
        title: 'Year-by-Year SIP Growth Schedule',
        headers: ['Year', 'Invested Amount', 'Estimated Wealth Gain', 'Total Portfolio Value'],
        rows: scheduleRows,
      },
      chartData: {
        labels: ['Invested Capital', 'Estimated Wealth Gain'],
        values: [Math.round(totalInvested), Math.round(estReturns)],
        colors: ['#3b82f6', '#10b981'],
      },
      formula: 'M = P x [((1 + i)^n - 1) / i] x (1 + i)',
    };
    return result;
  }, [sipMonthly, sipReturnRate, sipYears]);

  // 3. COMPOUND INTEREST CALCULATOR
  const ciCalculation = useMemo(() => {
    const P = Number(ciPrincipal) || 0;
    const r = (Number(ciRate) || 0) / 100;
    const t = Number(ciYears) || 0;
    const n = Number(ciFrequency) || 1;

    const amount = P * Math.pow(1 + r / n, n * t);
    const totalInterest = Math.max(0, amount - P);

    const scheduleRows: (string | number)[][] = [];
    for (let y = 1; y <= t; y++) {
      const curAmount = P * Math.pow(1 + r / n, n * y);
      const interestEarned = curAmount - P;
      scheduleRows.push([
        `Year ${y}`,
        formatCurrency(P),
        formatCurrency(interestEarned),
        formatCurrency(curAmount),
      ]);
    }

    const result: CalculationResult = {
      toolName: 'Compound Interest Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Initial Principal Amount', value: formatCurrency(P) },
        { label: 'Annual Interest Rate', value: `${ciRate}%` },
        { label: 'Time Period', value: `${t} Years` },
        { label: 'Compounding Frequency', value: ciFrequency === 12 ? 'Monthly' : ciFrequency === 4 ? 'Quarterly' : 'Annually' },
      ],
      primaryResult: {
        label: 'Total Future Value',
        value: formatCurrency(amount),
        subtext: `Total Compound Interest Earned: ${formatCurrency(totalInterest)}`,
      },
      breakdown: [
        { label: 'Principal Amount', value: formatCurrency(P) },
        { label: 'Total Compound Interest', value: formatCurrency(totalInterest) },
        { label: 'Final Maturity Value', value: formatCurrency(amount) },
        { label: 'Rule of 72 Doubling Time', value: r > 0 ? `${(72 / (ciRate)).toFixed(1)} Years` : 'N/A' },
      ],
      scheduleTable: {
        title: 'Year-by-Year Compound Growth Table',
        headers: ['Year', 'Principal', 'Cumulative Interest', 'Ending Balance'],
        rows: scheduleRows,
      },
      chartData: {
        labels: ['Initial Principal', 'Compound Interest'],
        values: [Math.round(P), Math.round(totalInterest)],
        colors: ['#6366f1', '#10b981'],
      },
      formula: 'A = P x (1 + r/n)^(nt)',
    };
    return result;
  }, [ciPrincipal, ciRate, ciYears, ciFrequency]);

  // 4. SIMPLE INTEREST
  const siCalculation = useMemo(() => {
    const P = Number(siPrincipal) || 0;
    const R = Number(siRate) || 0;
    const T = Number(siYears) || 0;

    const interest = (P * R * T) / 100;
    const totalAmount = P + interest;

    const result: CalculationResult = {
      toolName: 'Simple Interest Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Principal Amount', value: formatCurrency(P) },
        { label: 'Annual Interest Rate', value: `${R}% p.a.` },
        { label: 'Tenure Period', value: `${T} Years` },
      ],
      primaryResult: {
        label: 'Total Simple Interest Earned',
        value: formatCurrency(interest),
        subtext: `Total Final Maturity: ${formatCurrency(totalAmount)}`,
        badge: `${R}% Simple`,
      },
      breakdown: [
        { label: 'Initial Principal Deposit', value: formatCurrency(P) },
        { label: 'Total Simple Interest', value: formatCurrency(interest) },
        { label: 'Annual Interest Payout', value: formatCurrency(T > 0 ? interest / T : 0) },
        { label: 'Total Maturity Balance', value: formatCurrency(totalAmount) },
      ],
      formula: 'SI = (Principal × Rate × Time) / 100',
    };
    return result;
  }, [siPrincipal, siRate, siYears]);

  // 5. FIXED DEPOSIT (FD)
  const fdCalculation = useMemo(() => {
    const P = Number(fdDeposit) || 0;
    const baseR = Number(fdRate) || 0;
    const effectiveRate = baseR + (isSeniorCitizen ? 0.5 : 0);
    const t = Number(fdYears) || 0;
    const n = 4; // Quarterly compounding (standard Indian banking)

    const r = effectiveRate / 100;
    const maturityAmount = P * Math.pow(1 + r / n, n * t);
    const totalInterest = Math.max(0, maturityAmount - P);

    const result: CalculationResult = {
      toolName: 'Fixed Deposit (FD) Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Deposit Principal', value: formatCurrency(P) },
        { label: 'Interest Rate', value: `${effectiveRate.toFixed(2)}% p.a. ${isSeniorCitizen ? '(+0.50% Sr. Citizen)' : ''}` },
        { label: 'Tenure', value: `${t} Years` },
        { label: 'Compounding', value: 'Quarterly (RBI Banking Standard)' },
      ],
      primaryResult: {
        label: 'Maturity Amount',
        value: formatCurrency(maturityAmount),
        subtext: `Total Interest Earned: ${formatCurrency(totalInterest)}`,
        badge: 'Quarterly Compounded',
      },
      breakdown: [
        { label: 'Principal Deposited', value: formatCurrency(P) },
        { label: 'Total Interest Accrued', value: formatCurrency(totalInterest) },
        { label: 'Maturity Value', value: formatCurrency(maturityAmount) },
      ],
      formula: 'A = P × (1 + r/4)^(4 × t)',
    };
    return result;
  }, [fdDeposit, fdRate, fdYears, isSeniorCitizen]);

  // 6. RECURRING DEPOSIT (RD)
  const rdCalculation = useMemo(() => {
    const P = Number(rdMonthly) || 0;
    const R = Number(rdRate) || 0;
    const years = Number(rdYears) || 0;
    const totalMonths = years * 12;

    const i = R / 400; // Quarterly rate factor
    let maturity = 0;
    for (let m = 1; m <= totalMonths; m++) {
      const q = (totalMonths - m + 1) / 3;
      maturity += P * Math.pow(1 + i, q);
    }

    const totalDeposited = P * totalMonths;
    const totalInterest = Math.max(0, maturity - totalDeposited);

    const result: CalculationResult = {
      toolName: 'Recurring Deposit (RD) Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Monthly Installment', value: `${formatCurrency(P)} / month` },
        { label: 'Annual Interest Rate', value: `${R}% p.a.` },
        { label: 'Tenure Duration', value: `${years} Years (${totalMonths} months)` },
      ],
      primaryResult: {
        label: 'Maturity Value',
        value: formatCurrency(maturity),
        subtext: `Total Deposited: ${formatCurrency(totalDeposited)} • Interest: ${formatCurrency(totalInterest)}`,
        badge: 'Quarterly Compounding',
      },
      breakdown: [
        { label: 'Total Amount Deposited', value: formatCurrency(totalDeposited) },
        { label: 'Total Interest Earned', value: formatCurrency(totalInterest) },
        { label: 'Final Maturity Payout', value: formatCurrency(maturity) },
      ],
      formula: 'RD Maturity = Sum of monthly deposits compounded quarterly per Post Office / RBI guidelines',
    };
    return result;
  }, [rdMonthly, rdRate, rdYears]);

  // 7. PUBLIC PROVIDENT FUND (PPF)
  const ppfCalculation = useMemo(() => {
    const annualDep = Math.min(150000, Number(ppfAnnual) || 0);
    const r = (Number(ppfRate) || 7.1) / 100;
    const years = Math.max(15, Number(ppfYears) || 15);

    let balance = 0;
    let totalInvested = 0;

    for (let y = 1; y <= years; y++) {
      totalInvested += annualDep;
      balance = (balance + annualDep) * (1 + r);
    }

    const totalInterest = Math.max(0, balance - totalInvested);

    const result: CalculationResult = {
      toolName: 'Public Provident Fund (PPF) Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Annual Deposit (Max ₹1.5L)', value: formatCurrency(annualDep) },
        { label: 'PPF Interest Rate', value: `${(r * 100).toFixed(1)}% p.a. (Govt Guaranteed)` },
        { label: 'Tenure Lock-in', value: `${years} Years (Statutory Minimum 15 Yrs)` },
      ],
      primaryResult: {
        label: 'Maturity Corpus (Tax-Free)',
        value: formatCurrency(balance),
        subtext: `Interest Earned: ${formatCurrency(totalInterest)} • 100% Tax-Exempt under EEE`,
        badge: 'EEE Tax Status',
      },
      breakdown: [
        { label: 'Total Invested over Tenure', value: formatCurrency(totalInvested) },
        { label: 'Total Compound Interest', value: formatCurrency(totalInterest) },
        { label: 'Total Tax-Free Maturity', value: formatCurrency(balance) },
        { label: 'Annual Tax Deduction (Sec 80C)', value: formatCurrency(annualDep) },
      ],
      formula: 'PPF Balance = Future value of annual investments compounded annually at govt rate (7.1%)',
    };
    return result;
  }, [ppfAnnual, ppfRate, ppfYears]);

  // 8. INFLATION CALCULATOR
  const inflationCalculation = useMemo(() => {
    const cost = Number(inflationCost) || 0;
    const rate = (Number(inflationRateVal) || 0) / 100;
    const yrs = Number(inflationYears) || 0;

    const futureCost = cost * Math.pow(1 + rate, yrs);
    const purchasingPower = cost / Math.pow(1 + rate, yrs);
    const priceIncrease = futureCost - cost;

    const result: CalculationResult = {
      toolName: 'Inflation & Purchasing Power Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Current Cost / Amount', value: formatCurrency(cost) },
        { label: 'Annual Inflation Rate', value: `${(rate * 100).toFixed(1)}%` },
        { label: 'Time Horizon', value: `${yrs} Years` },
      ],
      primaryResult: {
        label: `Cost in ${yrs} Years`,
        value: formatCurrency(futureCost),
        subtext: `Price Increase: +${formatCurrency(priceIncrease)} (+${((futureCost / (cost || 1) - 1) * 100).toFixed(1)}%)`,
        badge: `+${(rate * 100).toFixed(1)}%/yr`,
      },
      breakdown: [
        { label: 'Current Value of Money', value: formatCurrency(cost) },
        { label: `Equivalent Cost in ${yrs} Years`, value: formatCurrency(futureCost) },
        { label: `Purchasing Power of Today's ${formatCurrency(cost)} in ${yrs} Yrs`, value: formatCurrency(purchasingPower) },
        { label: 'Cumulative Price Surge', value: `+${((futureCost / (cost || 1) - 1) * 100).toFixed(1)}%` },
      ],
      formula: 'Future Cost = Current Cost × (1 + InflationRate)^Years',
    };
    return result;
  }, [inflationCost, inflationRateVal, inflationYears]);

  // 9. RETIREMENT PLANNER
  const retirementCalculation = useMemo(() => {
    const curAge = Number(retireCurrentAge) || 30;
    const retAge = Number(retireAge) || 60;
    const exp = Number(retireMonthlyExpense) || 40000;
    const inf = (Number(retireInflation) || 6) / 100;
    const retReturn = (Number(retirePostReturn) || 8) / 100;

    const yearsToRetire = Math.max(1, retAge - curAge);
    const postRetireYears = Math.max(10, 85 - retAge);

    const futureMonthlyExp = exp * Math.pow(1 + inf, yearsToRetire);
    const futureAnnualExp = futureMonthlyExp * 12;

    const realRate = (retReturn - inf) / (1 + inf);
    const corpusNeeded =
      realRate !== 0
        ? futureAnnualExp * ((1 - Math.pow(1 + realRate, -postRetireYears)) / realRate)
        : futureAnnualExp * postRetireYears;

    const result: CalculationResult = {
      toolName: 'Retirement Corpus & Pension Planner',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Current Age / Retirement Age', value: `${curAge} yrs / ${retAge} yrs (${yearsToRetire} yrs to save)` },
        { label: 'Current Monthly Living Expense', value: formatCurrency(exp) },
        { label: 'Expected Inflation Rate', value: `${(inf * 100).toFixed(1)}% p.a.` },
        { label: 'Post-Retirement Investment Return', value: `${(retReturn * 100).toFixed(1)}% p.a.` },
      ],
      primaryResult: {
        label: 'Required Retirement Corpus',
        value: formatCurrency(corpusNeeded),
        subtext: `First Year Monthly Expense at Age ${retAge}: ${formatCurrency(futureMonthlyExp)} / month`,
        badge: `${postRetireYears} Yrs Pension`,
      },
      breakdown: [
        { label: 'Current Monthly Living Costs', value: formatCurrency(exp) },
        { label: `Inflated Monthly Cost at Age ${retAge}`, value: formatCurrency(futureMonthlyExp) },
        { label: 'Annual Spending in Retirement', value: formatCurrency(futureAnnualExp) },
        { label: 'Net Real Post-Retirement Return', value: `${(realRate * 100).toFixed(2)}%` },
        { label: 'Target Retirement Corpus Fund', value: formatCurrency(corpusNeeded) },
      ],
      formula: 'Corpus = Inflated Annual Expense × Present Value of Annuity over Post-Retirement Lifespan',
    };
    return result;
  }, [retireCurrentAge, retireAge, retireMonthlyExpense, retireInflation, retirePostReturn]);

  // 10. SAVINGS GOAL PLANNER
  const savingsGoalCalculation = useMemo(() => {
    const target = Number(goalTargetAmount) || 1000000;
    const years = Math.max(1, Number(goalYears) || 1);
    const r = (Number(goalReturnRate) || 10) / 100;
    const months = years * 12;
    const monthlyRate = r / 12;

    const monthlySip = (target * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalInvested = monthlySip * months;
    const wealthGain = Math.max(0, target - totalInvested);

    const result: CalculationResult = {
      toolName: 'Savings Goal & Target Wealth Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Financial Goal Target', value: formatCurrency(target) },
        { label: 'Time Horizon', value: `${years} Years (${months} months)` },
        { label: 'Expected Investment Return', value: `${(r * 100).toFixed(1)}% p.a.` },
      ],
      primaryResult: {
        label: 'Monthly Investment Required',
        value: `${formatCurrency(monthlySip)} / month`,
        subtext: `Total Capital Invested: ${formatCurrency(totalInvested)} • Wealth Gain: ${formatCurrency(wealthGain)}`,
        badge: `${years} Yr Goal`,
      },
      breakdown: [
        { label: 'Target Goal Corpus', value: formatCurrency(target) },
        { label: 'Required Monthly SIP Contribution', value: formatCurrency(monthlySip) },
        { label: 'Total Principal Saved', value: formatCurrency(totalInvested) },
        { label: 'Compounded Wealth Growth', value: formatCurrency(wealthGain) },
      ],
      formula: 'Monthly SIP = Target × i / [((1 + i)^n - 1)]',
    };
    return result;
  }, [goalTargetAmount, goalYears, goalReturnRate]);

  // 11. RULE OF 72
  const ruleOf72Calculation = useMemo(() => {
    const rate = Math.max(0.1, Number(rule72Rate) || 12);
    const doubleYears = 72 / rate;
    const tripleYears = 114 / rate;
    const quadrupleYears = 144 / rate;

    const result: CalculationResult = {
      toolName: 'Rule of 72 Doubling Time Calculator',
      category: 'Finance',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Annual Compounded Return', value: `${rate.toFixed(2)}%` },
      ],
      primaryResult: {
        label: 'Time to Double Your Money (2x)',
        value: `${doubleYears.toFixed(1)} Years`,
        subtext: `Tripling Time (3x): ${tripleYears.toFixed(1)} Years • Quadrupling Time (4x): ${quadrupleYears.toFixed(1)} Years`,
        badge: 'Rule of 72',
      },
      breakdown: [
        { label: 'Annual Compounded Interest Rate', value: `${rate.toFixed(2)}%` },
        { label: 'Years to Double Investment (2x)', value: `${doubleYears.toFixed(2)} years` },
        { label: 'Years to Triple Investment (3x - Rule of 114)', value: `${tripleYears.toFixed(2)} years` },
        { label: 'Years to Quadruple Investment (4x - Rule of 144)', value: `${quadrupleYears.toFixed(2)} years` },
      ],
      formula: 'Years to Double = 72 / Interest Rate (%)',
    };
    return result;
  }, [rule72Rate]);

  // Sync result with parent whenever relevant tool calculation updates
  React.useEffect(() => {
    if (toolId === 'emi' || toolId === 'home-loan' || toolId === 'car-loan' || toolId === 'personal-loan' || toolId === 'mortgage') {
      onResultChange(emiCalculation);
    } else if (toolId === 'sip' || toolId === 'lump-sum' || toolId === 'cagr') {
      onResultChange(sipCalculation);
    } else if (toolId === 'simple-interest') {
      onResultChange(siCalculation);
    } else if (toolId === 'fd') {
      onResultChange(fdCalculation);
    } else if (toolId === 'rd') {
      onResultChange(rdCalculation);
    } else if (toolId === 'ppf') {
      onResultChange(ppfCalculation);
    } else if (toolId === 'inflation') {
      onResultChange(inflationCalculation);
    } else if (toolId === 'retirement') {
      onResultChange(retirementCalculation);
    } else if (toolId === 'savings-goal') {
      onResultChange(savingsGoalCalculation);
    } else if (toolId === 'rule-of-72') {
      onResultChange(ruleOf72Calculation);
    } else if (toolId === 'compound-interest') {
      onResultChange(ciCalculation);
    } else {
      onResultChange(ciCalculation);
    }
  }, [
    toolId,
    emiCalculation,
    sipCalculation,
    ciCalculation,
    siCalculation,
    fdCalculation,
    rdCalculation,
    ppfCalculation,
    inflationCalculation,
    retirementCalculation,
    savingsGoalCalculation,
    ruleOf72Calculation,
    onResultChange,
  ]);

  // RENDER EMI FORM
  if (toolId === 'emi' || toolId === 'home-loan' || toolId === 'car-loan' || toolId === 'personal-loan' || toolId === 'mortgage') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          {toolId === 'home-loan' ? 'Home Loan Parameters' : toolId === 'car-loan' ? 'Car Loan Parameters' : 'Loan & EMI Details'}
        </h3>

        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Principal Loan Amount</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {formatCurrency(loanAmount)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">₹</span>
            <input
              type="number"
              min="10000"
              max="100000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="range"
            min="50000"
            max="10000000"
            step="50000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>₹50K</span>
            <span>₹25L</span>
            <span>₹50L</span>
            <span>₹1 Crore</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Annual Interest Rate (%)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {interestRate}% p.a.
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="35"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            min="5"
            max="20"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Loan Tenure</label>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setTenureType('years')}
                className={`px-2 py-0.5 rounded-md font-medium ${tenureType === 'years' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'}`}
              >
                Years
              </button>
              <button
                type="button"
                onClick={() => setTenureType('months')}
                className={`px-2 py-0.5 rounded-md font-medium ${tenureType === 'months' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'}`}
              >
                Months
              </button>
            </div>
          </div>
          <input
            type="number"
            min="1"
            max={tenureType === 'years' ? 35 : 420}
            value={tenureYears}
            onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            min="1"
            max={tenureType === 'years' ? 30 : 360}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onResultChange(emiCalculation)}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate EMI</span>
          </button>
          <button
            type="button"
            onClick={resetEmi}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>
    );
  }

  // RENDER SIP FORM
  if (toolId === 'sip' || toolId === 'lump-sum' || toolId === 'cagr') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          SIP Investment Parameters
        </h3>

        {/* Monthly Investment */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Monthly SIP Contribution</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {formatCurrency(sipMonthly)} / mo
            </span>
          </div>
          <input
            type="number"
            min="500"
            max="1000000"
            step="500"
            value={sipMonthly}
            onChange={(e) => setSipMonthly(Math.max(100, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={sipMonthly}
            onChange={(e) => setSipMonthly(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Expected Return */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Expected Annual Return (%)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {sipReturnRate}% p.a.
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="30"
            step="0.5"
            value={sipReturnRate}
            onChange={(e) => setSipReturnRate(Math.max(0.5, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            min="5"
            max="25"
            step="0.5"
            value={sipReturnRate}
            onChange={(e) => setSipReturnRate(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Investment Period */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Investment Period (Years)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {sipYears} Years
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="40"
            value={sipYears}
            onChange={(e) => setSipYears(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="range"
            min="1"
            max="35"
            value={sipYears}
            onChange={(e) => setSipYears(Number(e.target.value))}
            className="w-full mt-2 accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onResultChange(sipCalculation)}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate SIP Returns</span>
          </button>
          <button
            type="button"
            onClick={resetSip}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>
    );
  }

  // SIMPLE INTEREST FORM
  if (toolId === 'simple-interest') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Simple Interest Calculator
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Principal Amount (₹)</label>
          <input
            type="number"
            min="1000"
            value={siPrincipal}
            onChange={(e) => setSiPrincipal(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Interest Rate (% p.a.)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={siRate}
              onChange={(e) => setSiRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tenure (Years)</label>
            <input
              type="number"
              min="1"
              value={siYears}
              onChange={(e) => setSiYears(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // FIXED DEPOSIT (FD) FORM
  if (toolId === 'fd') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Fixed Deposit (FD) Calculator
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">FD Deposit Amount (₹)</label>
          <input
            type="number"
            min="5000"
            step="10000"
            value={fdDeposit}
            onChange={(e) => setFdDeposit(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Annual Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={fdRate}
              onChange={(e) => setFdRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Duration (Years)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={fdYears}
              onChange={(e) => setFdYears(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            id="srCitizenCheck"
            checked={isSeniorCitizen}
            onChange={(e) => setIsSeniorCitizen(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="srCitizenCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
            Senior Citizen (+0.50% extra interest rate)
          </label>
        </div>
      </div>
    );
  }

  // RECURRING DEPOSIT (RD) FORM
  if (toolId === 'rd') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Recurring Deposit (RD) Calculator
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Monthly Installment (₹)</label>
          <input
            type="number"
            min="500"
            step="500"
            value={rdMonthly}
            onChange={(e) => setRdMonthly(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Interest Rate (% p.a.)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={rdRate}
              onChange={(e) => setRdRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tenure (Years)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={rdYears}
              onChange={(e) => setRdYears(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // PPF FORM
  if (toolId === 'ppf') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Public Provident Fund (PPF) Calculator
        </h3>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Yearly Deposit (Max ₹1.5L / year)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {formatCurrency(ppfAnnual)}
            </span>
          </div>
          <input
            type="number"
            min="500"
            max="150000"
            step="5000"
            value={ppfAnnual}
            onChange={(e) => setPpfAnnual(Math.min(150000, Math.max(500, Number(e.target.value))))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Govt Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={ppfRate}
              onChange={(e) => setPpfRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Duration (Min 15 Yrs)</label>
            <input
              type="number"
              min="15"
              max="50"
              value={ppfYears}
              onChange={(e) => setPpfYears(Math.max(15, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // INFLATION FORM
  if (toolId === 'inflation') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Inflation & Purchasing Power Calculator
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Current Cost / Price (₹)</label>
          <input
            type="number"
            min="100"
            step="1000"
            value={inflationCost}
            onChange={(e) => setInflationCost(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Annual Inflation Rate (%)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={inflationRateVal}
              onChange={(e) => setInflationRateVal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Years into Future</label>
            <input
              type="number"
              min="1"
              max="60"
              value={inflationYears}
              onChange={(e) => setInflationYears(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // RETIREMENT FORM
  if (toolId === 'retirement') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Retirement Corpus & Pension Planner
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Current Age</label>
            <input
              type="number"
              min="18"
              max="70"
              value={retireCurrentAge}
              onChange={(e) => setRetireCurrentAge(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Retirement Age</label>
            <input
              type="number"
              min="40"
              max="80"
              value={retireAge}
              onChange={(e) => setRetireAge(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Current Monthly Expenses (₹)</label>
          <input
            type="number"
            min="5000"
            step="5000"
            value={retireMonthlyExpense}
            onChange={(e) => setRetireMonthlyExpense(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Expected Inflation (%)</label>
            <input
              type="number"
              step="0.5"
              value={retireInflation}
              onChange={(e) => setRetireInflation(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Post-Retire Return (%)</label>
            <input
              type="number"
              step="0.5"
              value={retirePostReturn}
              onChange={(e) => setRetirePostReturn(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // SAVINGS GOAL FORM
  if (toolId === 'savings-goal') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Savings Goal & Target Wealth Planner
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Target Corpus Amount (₹)</label>
          <input
            type="number"
            min="10000"
            step="50000"
            value={goalTargetAmount}
            onChange={(e) => setGoalTargetAmount(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Time Horizon (Years)</label>
            <input
              type="number"
              min="1"
              max="40"
              value={goalYears}
              onChange={(e) => setGoalYears(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Expected Return (% p.a.)</label>
            <input
              type="number"
              step="0.5"
              value={goalReturnRate}
              onChange={(e) => setGoalReturnRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  // RULE OF 72 FORM
  if (toolId === 'rule-of-72') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Rule of 72 Doubling Time Calculator
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Expected Annual Return Rate (%)</label>
          <input
            type="number"
            step="0.5"
            min="0.1"
            max="100"
            value={rule72Rate}
            onChange={(e) => setRule72Rate(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[6, 8, 12, 15].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setRule72Rate(rate)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                rule72Rate === rate ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {rate}% p.a.
            </button>
          ))}
        </div>
      </div>
    );
  }

  // DEFAULT / COMPOUND INTEREST FORM
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        Investment & Interest Parameters
      </h3>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Initial Principal Deposit</label>
        <input
          type="number"
          min="1000"
          step="10000"
          value={ciPrincipal}
          onChange={(e) => setCiPrincipal(Math.max(0, Number(e.target.value)))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Annual Interest Rate (%)</label>
        <input
          type="number"
          min="0.1"
          max="30"
          step="0.1"
          value={ciRate}
          onChange={(e) => setCiRate(Math.max(0.1, Number(e.target.value)))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tenure (Years)</label>
        <input
          type="number"
          min="1"
          max="50"
          value={ciYears}
          onChange={(e) => setCiYears(Math.max(1, Number(e.target.value)))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Compounding Frequency</label>
        <select
          value={ciFrequency}
          onChange={(e) => setCiFrequency(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={12}>Compounded Monthly (12 times/yr)</option>
          <option value={4}>Compounded Quarterly (4 times/yr)</option>
          <option value={2}>Compounded Semi-Annually (2 times/yr)</option>
          <option value={1}>Compounded Annually (1 time/yr)</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onResultChange(ciCalculation)}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>Calculate Growth</span>
        </button>
        <button
          type="button"
          onClick={resetCi}
          className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
