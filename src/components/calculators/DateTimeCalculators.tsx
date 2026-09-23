import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../../types';

interface DateTimeProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const DateTimeCalculators: React.FC<DateTimeProps> = ({ toolId, onResultChange }) => {
  // Age states
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Date difference states
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  // Add / Subtract states
  const [baseDate, setBaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [unitCount, setUnitCount] = useState<number>(45);
  const [unitType, setUnitType] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  // 1. AGE CALCULATOR
  const ageCalculation = useMemo(() => {
    const d1 = new Date(birthDate);
    const d2 = new Date(targetDate);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return {
        toolName: 'Age Calculator',
        category: 'Date & Time',
        dateGenerated: new Date().toLocaleDateString(),
        inputs: [],
        primaryResult: { label: 'Age', value: 'Invalid Date' },
        breakdown: [],
      };
    }

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalWeeks = (totalDays / 7).toFixed(1);

    // Next birthday calculation
    const nextBdayYear = d2.getMonth() > d1.getMonth() || (d2.getMonth() === d1.getMonth() && d2.getDate() > d1.getDate())
      ? d2.getFullYear() + 1
      : d2.getFullYear();
    const nextBday = new Date(nextBdayYear, d1.getMonth(), d1.getDate());
    const daysToNextBday = Math.ceil((nextBday.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));

    const result: CalculationResult = {
      toolName: 'Age Calculator & Exact Birthday',
      category: 'Date & Time',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Date of Birth', value: d1.toDateString() },
        { label: 'Calculated Age as of', value: d2.toDateString() },
      ],
      primaryResult: {
        label: 'Exact Chronological Age',
        value: `${years} Years, ${months} Months, ${days} Days`,
        subtext: `Next birthday in ${daysToNextBday} days!`,
        badge: `${years} yrs old`,
      },
      breakdown: [
        { label: 'Total Years', value: `${years} years` },
        { label: 'Total Months Lived', value: `${years * 12 + months} months` },
        { label: 'Total Weeks Lived', value: `${totalWeeks} weeks` },
        { label: 'Total Days Lived', value: `${totalDays.toLocaleString()} days` },
        { label: 'Total Approximate Hours', value: `${totalHours.toLocaleString()} hours` },
        { label: 'Days until Next Birthday', value: `${daysToNextBday} days` },
      ],
      scheduleTable: {
        title: 'Life Milestones & Time Elapsed',
        headers: ['Unit of Time', 'Equivalent Duration'],
        rows: [
          ['Years, Months, Days', `${years} years, ${months} months, ${days} days`],
          ['Total Months', `${years * 12 + months} months`],
          ['Total Weeks', `${totalWeeks} weeks`],
          ['Total Calendar Days', `${totalDays.toLocaleString()} days`],
          ['Total Elapsed Hours', `${totalHours.toLocaleString()} hours`],
          ['Upcoming Birthday Date', nextBday.toDateString()],
        ],
      },
      formula: 'Exact calendar difference accounting for variable month lengths and leap years',
    };
    return result;
  }, [birthDate, targetDate]);

  // 2. DATE DIFFERENCE & WORKING DAYS
  const dateDiffCalculation = useMemo(() => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;

    // Calculate business working days (Mon-Fri)
    let workingDays = 0;
    const cur = new Date(Math.min(d1.getTime(), d2.getTime()));
    const end = new Date(Math.max(d1.getTime(), d2.getTime()));

    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
    }
    const weekendDays = totalDays - workingDays;

    const result: CalculationResult = {
      toolName: toolId === 'working-days' ? 'Working Days & Business Days Calculator' : 'Date Difference Calculator',
      category: 'Date & Time',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Start Date', value: d1.toDateString() },
        { label: 'End Date', value: d2.toDateString() },
      ],
      primaryResult: {
        label: toolId === 'working-days' ? 'Total Working Business Days' : 'Total Calendar Days',
        value: toolId === 'working-days' ? `${workingDays} Business Days` : `${totalDays} Days`,
        subtext: `${weeks} weeks and ${remDays} days • ${workingDays} working days`,
        badge: `${totalDays} Total Days`,
      },
      breakdown: [
        { label: 'Total Calendar Days', value: `${totalDays} days` },
        { label: 'Business / Working Days (Mon-Fri)', value: `${workingDays} days` },
        { label: 'Weekend Days (Sat-Sun)', value: `${weekendDays} days` },
        { label: 'Weeks + Days', value: `${weeks} weeks, ${remDays} days` },
      ],
      formula: 'Duration = |EndDate - StartDate| (Calendar and 5-day business week models)',
    };
    return result;
  }, [startDate, endDate, toolId]);

  // 3. ADD / SUBTRACT
  const addSubtractCalculation = useMemo(() => {
    const base = new Date(baseDate);
    const count = Number(unitCount) || 0;
    const sign = operation === 'add' ? 1 : -1;
    const resDate = new Date(base);

    if (unitType === 'days') {
      resDate.setDate(resDate.getDate() + sign * count);
    } else if (unitType === 'weeks') {
      resDate.setDate(resDate.getDate() + sign * count * 7);
    } else if (unitType === 'months') {
      resDate.setMonth(resDate.getMonth() + sign * count);
    } else if (unitType === 'years') {
      resDate.setFullYear(resDate.getFullYear() + sign * count);
    }

    const dayName = resDate.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedResult = `${dayName}, ${resDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    const result: CalculationResult = {
      toolName: 'Add or Subtract Date Calculator',
      category: 'Date & Time',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Starting Reference Date', value: base.toDateString() },
        { label: 'Operation', value: `${operation === 'add' ? 'Add (+)' : 'Subtract (-)'} ${count} ${unitType}` },
      ],
      primaryResult: {
        label: `${operation === 'add' ? 'Future' : 'Past'} Calculated Date`,
        value: formattedResult,
        subtext: `Exact result: ${count} ${unitType} ${operation === 'add' ? 'after' : 'before'} ${base.toDateString()}`,
        badge: dayName,
      },
      breakdown: [
        { label: 'Original Date', value: base.toDateString() },
        { label: 'Offset Applied', value: `${operation === 'add' ? '+' : '-'}${count} ${unitType}` },
        { label: 'Resulting Date', value: resDate.toISOString().split('T')[0] },
        { label: 'Day of the Week', value: dayName },
      ],
      formula: 'TargetDate = BaseDate ± (Count x UnitInterval)',
    };
    return result;
  }, [baseDate, operation, unitCount, unitType]);

  React.useEffect(() => {
    if (toolId === 'date-difference' || toolId === 'working-days') {
      onResultChange(dateDiffCalculation);
    } else if (toolId === 'date-add-subtract') {
      onResultChange(addSubtractCalculation);
    } else if (toolId === 'age') {
      onResultChange(ageCalculation);
    } else {
      onResultChange(ageCalculation);
    }
  }, [toolId, ageCalculation, dateDiffCalculation, addSubtractCalculation, onResultChange]);

  if (toolId === 'date-difference' || toolId === 'working-days') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          {toolId === 'working-days' ? 'Business Days Date Range' : 'Date Range'}
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'date-add-subtract') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Add / Subtract Date Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Reference Start Date</label>
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Action</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setOperation('add')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  operation === 'add' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                + Add (Future)
              </button>
              <button
                type="button"
                onClick={() => setOperation('subtract')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  operation === 'subtract' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                - Subtract (Past)
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Unit</label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Number of {unitType}</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={unitCount}
            onChange={(e) => setUnitCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
      </div>
    );
  }

  // DEFAULT: AGE CALCULATOR
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        Birthdate & Target Date
      </h3>
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Date of Birth (DOB)</label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Age as of Date</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};
