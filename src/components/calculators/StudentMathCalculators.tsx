import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../../types';

interface StudentMathProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

const gcd = (a: number, b: number): number => {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
};

const lcm = (a: number, b: number): number => {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
};

export const StudentMathCalculators: React.FC<StudentMathProps> = ({ toolId, onResultChange }) => {
  // Percentage States
  const [obtainedMarks, setObtainedMarks] = useState<number>(465);
  const [totalMarks, setTotalMarks] = useState<number>(500);

  // Required Marks States
  const [internalObtained, setInternalObtained] = useState<number>(38);
  const [internalTotal, setInternalTotal] = useState<number>(50);
  const [internalWeight, setInternalWeight] = useState<number>(30); // 30%
  const [finalExamTotal, setFinalExamTotal] = useState<number>(100);
  const [targetCourseGrade, setTargetCourseGrade] = useState<number>(85); // 85%

  // Study Hours States
  const [daysUntilExam, setDaysUntilExam] = useState<number>(14);
  const [totalChapters, setTotalChapters] = useState<number>(8);
  const [hoursPerChapter, setHoursPerChapter] = useState<number>(6);
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(4);

  // Scientific States
  const [sciValue, setSciValue] = useState<number>(45);
  const [sciAngleMode, setSciAngleMode] = useState<'deg' | 'rad'>('deg');
  const [sciOp, setSciOp] = useState<'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'sqrt' | 'square' | 'fact'>('sin');

  // Ratio States
  const [ratioA, setRatioA] = useState<number>(16);
  const [ratioB, setRatioB] = useState<number>(24);
  const [ratioC, setRatioC] = useState<number>(40);

  // LCM & GCD States
  const [lcmGcdInput, setLcmGcdInput] = useState<string>('24, 36, 60');

  // CGPA States
  const [cgpaValue, setCgpaValue] = useState<number>(8.8);
  const [cgpaScale, setCgpaScale] = useState<number>(10);
  const [cbseMultiplier, setCbseMultiplier] = useState<number>(9.5);

  // Attendance States
  const [attendedClasses, setAttendedClasses] = useState<number>(48);
  const [totalClassesHeld, setTotalClassesHeld] = useState<number>(70);
  const [targetAttendance, setTargetAttendance] = useState<number>(75);

  // Fraction States
  const [num1, setNum1] = useState<number>(3);
  const [den1, setDen1] = useState<number>(4);
  const [fractionOp, setFractionOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [num2, setNum2] = useState<number>(2);
  const [den2, setDen2] = useState<number>(5);

  // Quadratic States
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // 1. ATTENDANCE & SHORTAGE RECOVERY
  const attendanceCalculation = useMemo(() => {
    const attended = Number(attendedClasses) || 0;
    const total = Number(totalClassesHeld) || 1;
    const target = Number(targetAttendance) || 75;

    const currentPercent = (attended / total) * 100;

    let classesNeeded = 0;
    let safeBunks = 0;

    if (currentPercent < target) {
      // Need more classes: (attended + x) / (total + x) >= target/100
      // 100(attended + x) >= target(total + x)
      // 100x - target*x >= target*total - 100*attended
      // x >= (target*total - 100*attended) / (100 - target)
      if (target < 100) {
        classesNeeded = Math.ceil((target * total - 100 * attended) / (100 - target));
      }
    } else {
      // Can bunk classes: attended / (total + b) >= target/100
      // 100*attended >= target*(total + b)
      // b <= (100*attended - target*total) / target
      safeBunks = Math.floor((100 * attended - target * total) / target);
    }

    const rows: (string | number)[][] = [
      ['Classes Currently Attended', `${attended} classes`, 'Present'],
      ['Total Classes Conducted to Date', `${total} classes`, 'Held'],
      ['Current Attendance Status', `${currentPercent.toFixed(2)}%`, currentPercent >= target ? 'Eligible / Safe' : 'Shortage Alert'],
      ['Minimum Target Required', `${target}%`, 'Academic Criteria'],
    ];

    if (currentPercent < target) {
      rows.push(['Consecutive Classes Required to Attend', `${classesNeeded} more classes without missing`, 'Recovery Plan']);
    } else {
      rows.push(['Safe Bunks Allowed', `${safeBunks} classes can be missed`, 'Buffer Available']);
    }

    const result: CalculationResult = {
      toolName: 'Attendance & Shortage Recovery Calculator',
      category: 'Student Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Attended Classes', value: `${attended}` },
        { label: 'Total Classes Held', value: `${total}` },
        { label: 'Target Attendance Criteria', value: `${target}%` },
      ],
      primaryResult: {
        label: currentPercent < target ? 'Attendance Shortage Alert!' : 'Attendance Safe!',
        value: `${currentPercent.toFixed(2)}%`,
        subtext:
          currentPercent < target
            ? `You must attend the next ${classesNeeded} consecutive classes to reach ${target}% criteria.`
            : `You have sufficient attendance! You can safely bunk up to ${safeBunks} classes and remain above ${target}%.`,
        badge: currentPercent >= target ? 'Safe' : 'Shortage',
      },
      breakdown: [
        { label: 'Current Attendance Percentage', value: `${currentPercent.toFixed(2)}%` },
        { label: 'Target Percentage', value: `${target}%` },
        { label: 'Classes Missed / Absent', value: `${total - attended} classes` },
        ...(currentPercent < target
          ? [{ label: 'Required Consecutive Classes', value: `${classesNeeded} classes` }]
          : [{ label: 'Safe Bunks Remaining', value: `${safeBunks} classes` }]),
      ],
      scheduleTable: {
        title: 'Attendance Standing & Eligibility Breakdown',
        headers: ['Metric', 'Value', 'Status'],
        rows,
      },
      formula: 'Required Classes = (Target% x Total - 100 x Attended) / (100 - Target%)',
    };
    return result;
  }, [attendedClasses, totalClassesHeld, targetAttendance]);

  // 2. PERCENTAGE CALCULATOR
  const percentageCalculation = useMemo(() => {
    const obt = Number(obtainedMarks) || 0;
    const tot = Number(totalMarks) || 1;
    const pct = (obt / tot) * 100;

    let grade = 'F';
    if (pct >= 90) grade = 'A+ (Outstanding)';
    else if (pct >= 80) grade = 'A (Excellent)';
    else if (pct >= 70) grade = 'B+ (Very Good)';
    else if (pct >= 60) grade = 'B (First Class)';
    else if (pct >= 50) grade = 'C (Second Class)';
    else if (pct >= 35) grade = 'D (Pass)';

    const result: CalculationResult = {
      toolName: 'Percentage Calculator',
      category: 'Student Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Marks / Points Obtained', value: `${obt}` },
        { label: 'Maximum Total Marks', value: `${tot}` },
      ],
      primaryResult: {
        label: 'Calculated Percentage',
        value: `${pct.toFixed(2)}%`,
        subtext: `Result: ${grade}`,
        badge: `${pct.toFixed(1)}%`,
      },
      breakdown: [
        { label: 'Marks Obtained', value: `${obt}` },
        { label: 'Maximum Marks', value: `${tot}` },
        { label: 'Marks Missed', value: `${Math.max(0, tot - obt)}` },
        { label: 'Equivalent CGPA (CBSE 9.5)', value: `${(pct / 9.5).toFixed(2)} / 10` },
      ],
      formula: 'Percentage (%) = (Marks Obtained / Maximum Marks) x 100',
    };
    return result;
  }, [obtainedMarks, totalMarks]);

  // 3. CGPA CALCULATOR
  const cgpaCalculation = useMemo(() => {
    const cgpa = Number(cgpaValue) || 0;
    const mult = Number(cbseMultiplier) || 9.5;
    const pct = cgpa * mult;

    let division = 'Pass';
    if (pct >= 75) division = 'First Class with Distinction';
    else if (pct >= 60) division = 'First Division';
    else if (pct >= 50) division = 'Second Division';
    else if (pct >= 35) division = 'Third Division';

    const usGpa4 = (cgpa / 10) * 4;

    const result: CalculationResult = {
      toolName: 'CGPA to Percentage & GPA Calculator',
      category: 'Student Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Cumulative GPA (CGPA)', value: `${cgpa} / 10` },
        { label: 'Conversion Multiplier', value: `${mult} (CBSE Standard)` },
      ],
      primaryResult: {
        label: 'Equivalent Percentage',
        value: `${pct.toFixed(2)}%`,
        subtext: `Classification: ${division} • Equivalent US GPA: ${usGpa4.toFixed(2)} / 4.0`,
        badge: 'Graduated',
      },
      breakdown: [
        { label: 'CGPA Score', value: `${cgpa} / 10` },
        { label: 'Percentage (%)', value: `${pct.toFixed(2)}%` },
        { label: 'US 4.0 Scale GPA', value: `${usGpa4.toFixed(2)} / 4.0` },
        { label: 'University Division', value: division },
      ],
      formula: 'Percentage = CGPA x 9.5 (CBSE / AICTE Guidelines)',
    };
    return result;
  }, [cgpaValue, cbseMultiplier]);

  // 4. QUADRATIC EQUATION SOLVER
  const quadraticCalculation = useMemo(() => {
    const a = Number(quadA) || 0;
    const b = Number(quadB) || 0;
    const c = Number(quadC) || 0;

    if (a === 0) {
      return {
        toolName: 'Quadratic Equation Solver',
        category: 'Math',
        dateGenerated: new Date().toLocaleDateString(),
        inputs: [{ label: 'Equation', value: `${b}x + ${c} = 0` }],
        primaryResult: { label: 'Linear Root', value: `x = ${(-c / (b || 1)).toFixed(3)}` },
        breakdown: [],
      };
    }

    const D = b * b - 4 * a * c; // Discriminant
    let root1 = '';
    let root2 = '';
    let nature = '';

    if (D > 0) {
      const r1 = (-b + Math.sqrt(D)) / (2 * a);
      const r2 = (-b - Math.sqrt(D)) / (2 * a);
      root1 = r1.toFixed(3);
      root2 = r2.toFixed(3);
      nature = 'Two distinct real roots';
    } else if (D === 0) {
      const r = -b / (2 * a);
      root1 = r.toFixed(3);
      root2 = r.toFixed(3);
      nature = 'Two equal real roots';
    } else {
      const real = (-b / (2 * a)).toFixed(3);
      const imag = (Math.sqrt(-D) / (2 * a)).toFixed(3);
      root1 = `${real} + ${imag}i`;
      root2 = `${real} - ${imag}i`;
      nature = 'Complex conjugate roots';
    }

    const result: CalculationResult = {
      toolName: 'Quadratic Equation Solver',
      category: 'Math',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Coefficient a', value: `${a}` },
        { label: 'Coefficient b', value: `${b}` },
        { label: 'Constant c', value: `${c}` },
        { label: 'Equation Format', value: `${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0` },
      ],
      primaryResult: {
        label: 'Roots of Equation (x₁, x₂)',
        value: `x₁ = ${root1}, x₂ = ${root2}`,
        subtext: `Discriminant Δ = ${D} (${nature})`,
      },
      breakdown: [
        { label: 'Discriminant (b² - 4ac)', value: `${D}` },
        { label: 'Nature of Roots', value: nature },
        { label: 'First Root (x₁)', value: root1 },
        { label: 'Second Root (x₂)', value: root2 },
        { label: 'Vertex of Parabola (x, y)', value: `(${-b / (2 * a)}, ${c - (b * b) / (4 * a)})` },
      ],
      formula: 'x = (-b ± √(b² - 4ac)) / 2a',
    };
    return result;
  }, [quadA, quadB, quadC]);

  // 5. REQUIRED MARKS CALCULATOR
  const requiredMarksCalculation = useMemo(() => {
    const obt = Number(internalObtained) || 0;
    const tot = Math.max(1, Number(internalTotal) || 1);
    const wInt = Math.max(1, Math.min(99, Number(internalWeight) || 30));
    const wFinal = 100 - wInt;
    const finalMax = Math.max(1, Number(finalExamTotal) || 100);
    const target = Number(targetCourseGrade) || 75;

    const internalPct = (obt / tot) * 100;
    const internalContributed = (internalPct * wInt) / 100;
    const neededFromFinal = target - internalContributed;
    const finalScorePctNeeded = (neededFromFinal / wFinal) * 100;
    const finalRawMarksNeeded = (finalScorePctNeeded * finalMax) / 100;

    let feasibility = 'Achievable';
    let badgeColor = 'Feasible';
    if (finalScorePctNeeded > 100) {
      feasibility = 'Mathematically Impossible (Exceeds 100%)';
      badgeColor = 'Impossible';
    } else if (finalScorePctNeeded <= 0) {
      feasibility = 'Already Guaranteed (0 Marks Needed)';
      badgeColor = 'Guaranteed';
    }

    const result: CalculationResult = {
      toolName: 'Final Exam Required Marks Calculator',
      category: 'Student Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Internal Score', value: `${obt} / ${tot} (${internalPct.toFixed(1)}%) with ${wInt}% Weight` },
        { label: 'Final Exam Weight', value: `${wFinal}% of course grade` },
        { label: 'Target Overall Grade', value: `${target}%` },
      ],
      primaryResult: {
        label: 'Marks Needed on Final Exam',
        value: finalScorePctNeeded <= 0 ? '0 / 100 (Safe)' : `${Math.ceil(finalRawMarksNeeded)} / ${finalMax}`,
        subtext: `Target Percentage: ${Math.max(0, finalScorePctNeeded).toFixed(1)}% on Final Exam (${feasibility})`,
        badge: badgeColor,
      },
      breakdown: [
        { label: 'Internal Marks Obtained', value: `${obt} / ${tot}` },
        { label: 'Points Secured from Internals', value: `${internalContributed.toFixed(2)}% out of ${wInt}%` },
        { label: 'Remaining Points Needed', value: `${Math.max(0, neededFromFinal).toFixed(2)}% out of ${wFinal}%` },
        { label: 'Required Score on Final Exam', value: `${Math.max(0, finalScorePctNeeded).toFixed(1)}%` },
        { label: 'Raw Score Needed', value: `${Math.ceil(Math.max(0, finalRawMarksNeeded))} / ${finalMax}` },
      ],
      formula: 'Required Final % = (Target Overall % - Internal Contribution) / Final Weightage %',
    };
    return result;
  }, [internalObtained, internalTotal, internalWeight, finalExamTotal, targetCourseGrade]);

  // 6. STUDY HOURS & TIMETABLE ESTIMATOR
  const studyHoursCalculation = useMemo(() => {
    const days = Math.max(1, Number(daysUntilExam) || 1);
    const topics = Math.max(1, Number(totalChapters) || 1);
    const hrsPerTopic = Math.max(0.5, Number(hoursPerChapter) || 1);
    const dailyAvail = Math.max(0.5, Number(dailyStudyHours) || 1);

    const totalHoursNeeded = topics * hrsPerTopic;
    const totalHoursAvailable = days * dailyAvail;
    const diffHours = totalHoursAvailable - totalHoursNeeded;
    const recommendedDaily = totalHoursNeeded / days;

    const result: CalculationResult = {
      toolName: 'Exam Preparation & Study Timetable Calculator',
      category: 'Student Tools',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Days Remaining Until Exam', value: `${days} days` },
        { label: 'Chapters / Modules to Study', value: `${topics} chapters (${hrsPerTopic} hrs each)` },
        { label: 'Your Current Daily Study Pace', value: `${dailyAvail} hours / day` },
      ],
      primaryResult: {
        label: 'Recommended Daily Study Hours',
        value: `${recommendedDaily.toFixed(1)} hrs / day`,
        subtext: diffHours >= 0 ? `Schedule on track! Buffer time: +${diffHours.toFixed(1)} hours` : `Shortage of ${Math.abs(diffHours).toFixed(1)} hours! Increase daily study by ${(Math.abs(diffHours) / days).toFixed(1)} hrs/day.`,
        badge: diffHours >= 0 ? 'On Track' : 'Intensive Study Required',
      },
      breakdown: [
        { label: 'Total Syllabus Study Hours Required', value: `${totalHoursNeeded} hours` },
        { label: 'Total Dedicated Hours Available', value: `${totalHoursAvailable} hours` },
        { label: 'Net Hours Balance', value: `${diffHours >= 0 ? '+' : ''}${diffHours.toFixed(1)} hours` },
        { label: 'Time Allocated per Chapter', value: `${hrsPerTopic} hours` },
      ],
      formula: 'Recommended Daily Hours = (Total Chapters × Hours per Chapter) / Days Remaining',
    };
    return result;
  }, [daysUntilExam, totalChapters, hoursPerChapter, dailyStudyHours]);

  // 7. SCIENTIFIC CALCULATOR
  const scientificCalculation = useMemo(() => {
    const v = Number(sciValue) || 0;
    const rad = sciAngleMode === 'deg' ? (v * Math.PI) / 180 : v;

    let res = 0;
    let label = '';
    let formula = '';

    if (sciOp === 'sin') {
      res = Math.sin(rad);
      label = `sin(${v}${sciAngleMode === 'deg' ? '°' : ' rad'})`;
      formula = 'sin(θ)';
    } else if (sciOp === 'cos') {
      res = Math.cos(rad);
      label = `cos(${v}${sciAngleMode === 'deg' ? '°' : ' rad'})`;
      formula = 'cos(θ)';
    } else if (sciOp === 'tan') {
      res = Math.tan(rad);
      label = `tan(${v}${sciAngleMode === 'deg' ? '°' : ' rad'})`;
      formula = 'tan(θ)';
    } else if (sciOp === 'log') {
      res = v > 0 ? Math.log10(v) : NaN;
      label = `log₁₀(${v})`;
      formula = 'log10(x)';
    } else if (sciOp === 'ln') {
      res = v > 0 ? Math.log(v) : NaN;
      label = `ln(${v})`;
      formula = 'ln(x)';
    } else if (sciOp === 'sqrt') {
      res = v >= 0 ? Math.sqrt(v) : NaN;
      label = `√(${v})`;
      formula = 'sqrt(x)';
    } else if (sciOp === 'square') {
      res = v * v;
      label = `(${v})²`;
      formula = 'x²';
    } else if (sciOp === 'fact') {
      const n = Math.min(100, Math.max(0, Math.round(v)));
      let f = 1;
      for (let i = 2; i <= n; i++) f *= i;
      res = f;
      label = `${n}!`;
      formula = 'n! = n × (n-1) × ... × 1';
    }

    const formattedVal = isNaN(res) ? 'Undefined' : Number(res.toFixed(8)).toString();

    const result: CalculationResult = {
      toolName: 'Scientific Function Calculator',
      category: 'Math',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Input Value (x)', value: `${v}` },
        { label: 'Angle Mode', value: sciAngleMode.toUpperCase() },
        { label: 'Selected Function', value: label },
      ],
      primaryResult: {
        label: label,
        value: formattedVal,
        subtext: `Precision: 8 decimal places`,
        badge: sciOp.toUpperCase(),
      },
      breakdown: [
        { label: 'Input x', value: `${v}` },
        { label: 'Function Formula', value: formula },
        { label: 'Computed Result', value: formattedVal },
      ],
      formula,
    };
    return result;
  }, [sciValue, sciAngleMode, sciOp]);

  // 8. FRACTION ARITHMETIC & REDUCTION
  const fractionCalculation = useMemo(() => {
    const n1 = Math.round(Number(num1) || 0);
    const d1 = Math.round(Number(den1) || 1) || 1;
    const n2 = Math.round(Number(num2) || 0);
    const d2 = Math.round(Number(den2) || 1) || 1;

    let resNum = 0;
    let resDen = 1;

    if (fractionOp === '+') {
      resNum = n1 * d2 + n2 * d1;
      resDen = d1 * d2;
    } else if (fractionOp === '-') {
      resNum = n1 * d2 - n2 * d1;
      resDen = d1 * d2;
    } else if (fractionOp === '*') {
      resNum = n1 * n2;
      resDen = d1 * d2;
    } else if (fractionOp === '/') {
      resNum = n1 * d2;
      resDen = d1 * n2 || 1;
    }

    const commonDiv = gcd(resNum, resDen);
    let simpNum = resNum / commonDiv;
    let simpDen = resDen / commonDiv;
    if (simpDen < 0) {
      simpNum = -simpNum;
      simpDen = -simpDen;
    }

    const dec = simpNum / simpDen;
    let mixedStr = '';
    if (Math.abs(simpNum) >= simpDen && simpDen !== 1) {
      const whole = Math.trunc(simpNum / simpDen);
      const rem = Math.abs(simpNum % simpDen);
      if (rem > 0) {
        mixedStr = `${whole} ${rem}/${simpDen}`;
      }
    }

    const result: CalculationResult = {
      toolName: 'Fraction Arithmetic & Reduction Calculator',
      category: 'Math',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'First Fraction', value: `${n1} / ${d1}` },
        { label: 'Operation', value: fractionOp },
        { label: 'Second Fraction', value: `${n2} / ${d2}` },
      ],
      primaryResult: {
        label: 'Simplified Result',
        value: simpDen === 1 ? `${simpNum}` : `${simpNum} / ${simpDen}`,
        subtext: `Decimal Value: ${dec.toFixed(4)}${mixedStr ? ` • Mixed Fraction: ${mixedStr}` : ''}`,
        badge: 'Reduced',
      },
      breakdown: [
        { label: 'Raw Unsimplified Fraction', value: `${resNum} / ${resDen}` },
        { label: 'Greatest Common Divisor (GCD)', value: `${commonDiv}` },
        { label: 'Reduced Lowest Terms', value: simpDen === 1 ? `${simpNum}` : `${simpNum} / ${simpDen}` },
        { label: 'Decimal Equivalent', value: dec.toString() },
      ],
      formula: 'Fraction Result = (n₁/d₁) [op] (n₂/d₂)',
    };
    return result;
  }, [num1, den1, fractionOp, num2, den2]);

  // 9. RATIO SIMPLIFIER & PROPORTION SOLVER
  const ratioCalculation = useMemo(() => {
    const a = Math.round(Number(ratioA) || 1);
    const b = Math.round(Number(ratioB) || 1);
    const c = Math.round(Number(ratioC) || 0);

    const div = c > 0 ? gcd(gcd(a, b), c) : gcd(a, b);
    const simpA = a / div;
    const simpB = b / div;
    const simpC = c > 0 ? c / div : 0;

    const totalParts = simpA + simpB + (simpC > 0 ? simpC : 0);
    const pctA = ((simpA / totalParts) * 100).toFixed(1);
    const pctB = ((simpB / totalParts) * 100).toFixed(1);
    const pctC = simpC > 0 ? ((simpC / totalParts) * 100).toFixed(1) : '0';

    const simpStr = c > 0 ? `${simpA} : ${simpB} : ${simpC}` : `${simpA} : ${simpB}`;

    const result: CalculationResult = {
      toolName: 'Ratio Simplifier & Proportion Solver',
      category: 'Math',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Input Ratio', value: c > 0 ? `${a} : ${b} : ${c}` : `${a} : ${b}` },
      ],
      primaryResult: {
        label: 'Simplified Ratio',
        value: simpStr,
        subtext: `Share Breakdown: A (${pctA}%) • B (${pctB}%)${c > 0 ? ` • C (${pctC}%)` : ''}`,
        badge: 'Lowest Terms',
      },
      breakdown: [
        { label: 'Common Divisor / GCD Factor', value: `${div}` },
        { label: 'Simplified Lowest Terms', value: simpStr },
        { label: 'Total Ratio Units (Parts)', value: `${totalParts}` },
        { label: 'Part A Share', value: `${pctA}%` },
        { label: 'Part B Share', value: `${pctB}%` },
        ...(c > 0 ? [{ label: 'Part C Share', value: `${pctC}%` }] : []),
      ],
      formula: 'Simplified Ratio = A/GCD : B/GCD : C/GCD',
    };
    return result;
  }, [ratioA, ratioB, ratioC]);

  // 10. LCM & GCD CALCULATOR
  const lcmGcdCalculation = useMemo(() => {
    const nums = lcmGcdInput
      .split(/[\s,]+/)
      .map((s) => Math.abs(parseInt(s.trim(), 10)))
      .filter((n) => !isNaN(n) && n > 0);

    const validNums = nums.length > 0 ? nums : [24, 36, 60];

    let computedGcd = validNums[0];
    let computedLcm = validNums[0];

    for (let i = 1; i < validNums.length; i++) {
      computedGcd = gcd(computedGcd, validNums[i]);
      computedLcm = lcm(computedLcm, validNums[i]);
    }

    const result: CalculationResult = {
      toolName: 'LCM & GCD / HCF Calculator',
      category: 'Math',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Input Numbers', value: validNums.join(', ') },
        { label: 'Total Number Count', value: `${validNums.length} numbers` },
      ],
      primaryResult: {
        label: 'Greatest Common Divisor (GCD / HCF)',
        value: `${computedGcd}`,
        subtext: `Least Common Multiple (LCM): ${computedLcm.toLocaleString()}`,
        badge: `GCD: ${computedGcd}`,
      },
      breakdown: [
        { label: 'Numbers Analyzed', value: validNums.join(', ') },
        { label: 'GCD / HCF (Highest Common Factor)', value: `${computedGcd}` },
        { label: 'LCM (Least Common Multiple)', value: `${computedLcm.toLocaleString()}` },
      ],
      formula: 'GCD = Euclidean Algorithm | LCM(a, b) = |a × b| / GCD(a, b)',
    };
    return result;
  }, [lcmGcdInput]);

  React.useEffect(() => {
    if (toolId === 'attendance') {
      onResultChange(attendanceCalculation);
    } else if (toolId === 'cgpa') {
      onResultChange(cgpaCalculation);
    } else if (toolId === 'quadratic') {
      onResultChange(quadraticCalculation);
    } else if (toolId === 'required-marks') {
      onResultChange(requiredMarksCalculation);
    } else if (toolId === 'study-hours') {
      onResultChange(studyHoursCalculation);
    } else if (toolId === 'scientific') {
      onResultChange(scientificCalculation);
    } else if (toolId === 'fraction') {
      onResultChange(fractionCalculation);
    } else if (toolId === 'ratio') {
      onResultChange(ratioCalculation);
    } else if (toolId === 'lcm-gcd') {
      onResultChange(lcmGcdCalculation);
    } else if (toolId === 'percentage') {
      onResultChange(percentageCalculation);
    } else {
      onResultChange(percentageCalculation);
    }
  }, [
    toolId,
    attendanceCalculation,
    percentageCalculation,
    cgpaCalculation,
    quadraticCalculation,
    requiredMarksCalculation,
    studyHoursCalculation,
    scientificCalculation,
    fractionCalculation,
    ratioCalculation,
    lcmGcdCalculation,
    onResultChange,
  ]);

  if (toolId === 'attendance') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Attendance Tracker & Recovery
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Classes Attended (Present)</label>
          <input
            type="number"
            value={attendedClasses}
            onChange={(e) => setAttendedClasses(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Total Classes Conducted (Held)</label>
          <input
            type="number"
            value={totalClassesHeld}
            onChange={(e) => setTotalClassesHeld(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Target Attendance Criteria (%)</label>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{targetAttendance}%</span>
          </div>
          <div className="flex gap-2 mb-2">
            {[75, 80, 85].map((tgt) => (
              <button
                key={tgt}
                type="button"
                onClick={() => setTargetAttendance(tgt)}
                className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  targetAttendance === tgt ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {tgt}%
              </button>
            ))}
          </div>
          <input
            type="range"
            min="60"
            max="95"
            value={targetAttendance}
            onChange={(e) => setTargetAttendance(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'cgpa') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          CGPA to Percentage Converter
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Enter CGPA (Scale of 10)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={cgpaValue}
            onChange={(e) => setCgpaValue(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Conversion Multiplier</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCbseMultiplier(9.5)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                cbseMultiplier === 9.5 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'
              }`}
            >
              9.5 (CBSE Standard)
            </button>
            <button
              type="button"
              onClick={() => setCbseMultiplier(10)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                cbseMultiplier === 10 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'
              }`}
            >
              10.0 (Direct % / VTU)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'quadratic') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Quadratic Coefficients (ax² + bx + c = 0)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Coefficient a</label>
            <input
              type="number"
              value={quadA}
              onChange={(e) => setQuadA(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-center"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Coefficient b</label>
            <input
              type="number"
              value={quadB}
              onChange={(e) => setQuadB(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-center"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Constant c</label>
            <input
              type="number"
              value={quadC}
              onChange={(e) => setQuadC(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-center"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'required-marks') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Final Exam Target Score Planner
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Marks Secured</label>
            <input
              type="number"
              min="0"
              value={internalObtained}
              onChange={(e) => setInternalObtained(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Maximum Marks</label>
            <input
              type="number"
              min="1"
              value={internalTotal}
              onChange={(e) => setInternalTotal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Internal Weightage (%)</label>
            <input
              type="number"
              min="10"
              max="90"
              value={internalWeight}
              onChange={(e) => setInternalWeight(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Final Exam Total Marks</label>
            <input
              type="number"
              min="1"
              value={finalExamTotal}
              onChange={(e) => setFinalExamTotal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Target Overall Course Grade (%)</label>
          <input
            type="number"
            min="35"
            max="100"
            value={targetCourseGrade}
            onChange={(e) => setTargetCourseGrade(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'study-hours') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Study Schedule & Hours Estimator
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Days Until Exam</label>
            <input
              type="number"
              min="1"
              value={daysUntilExam}
              onChange={(e) => setDaysUntilExam(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Chapters / Modules</label>
            <input
              type="number"
              min="1"
              value={totalChapters}
              onChange={(e) => setTotalChapters(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Hours Needed per Chapter</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={hoursPerChapter}
              onChange={(e) => setHoursPerChapter(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Available Daily Study Hours</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'scientific') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Scientific Math Functions
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Input Number (x)</label>
          <input
            type="number"
            step="any"
            value={sciValue}
            onChange={(e) => setSciValue(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Angle Unit (for Trig)</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSciAngleMode('deg')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                sciAngleMode === 'deg' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Degrees (°)
            </button>
            <button
              type="button"
              onClick={() => setSciAngleMode('rad')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                sciAngleMode === 'rad' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Radians (rad)
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Function</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'sin', label: 'sin(x)' },
              { id: 'cos', label: 'cos(x)' },
              { id: 'tan', label: 'tan(x)' },
              { id: 'log', label: 'log₁₀(x)' },
              { id: 'ln', label: 'ln(x)' },
              { id: 'sqrt', label: '√x' },
              { id: 'square', label: 'x²' },
              { id: 'fact', label: 'x!' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSciOp(f.id as any)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  sciOp === f.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'fraction') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Fraction Arithmetic & Reduction
        </h3>
        <div className="grid grid-cols-5 items-center gap-2">
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-semibold text-slate-600 text-center block">Numerator 1</label>
            <input
              type="number"
              value={num1}
              onChange={(e) => setNum1(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-center"
            />
            <div className="border-b-2 border-slate-400 my-1"></div>
            <label className="text-[10px] font-semibold text-slate-600 text-center block">Denominator 1</label>
            <input
              type="number"
              value={den1}
              onChange={(e) => setDen1(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-center"
            />
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center">
            <select
              value={fractionOp}
              onChange={(e) => setFractionOp(e.target.value as any)}
              className="px-2 py-2 border border-slate-300 rounded-xl text-base font-bold bg-white text-blue-600 cursor-pointer text-center"
            >
              <option value="+">+</option>
              <option value="-">−</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-semibold text-slate-600 text-center block">Numerator 2</label>
            <input
              type="number"
              value={num2}
              onChange={(e) => setNum2(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-center"
            />
            <div className="border-b-2 border-slate-400 my-1"></div>
            <label className="text-[10px] font-semibold text-slate-600 text-center block">Denominator 2</label>
            <input
              type="number"
              value={den2}
              onChange={(e) => setDen2(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-center"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'ratio') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Ratio Simplifier (A : B : C)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Part A</label>
            <input
              type="number"
              min="1"
              value={ratioA}
              onChange={(e) => setRatioA(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-center"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Part B</label>
            <input
              type="number"
              min="1"
              value={ratioB}
              onChange={(e) => setRatioB(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-center"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Part C (Optional)</label>
            <input
              type="number"
              min="0"
              value={ratioC}
              onChange={(e) => setRatioC(Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-center"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'lcm-gcd') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          LCM & GCD / HCF Parameters
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Enter Numbers (separated by comma or space)
          </label>
          <input
            type="text"
            value={lcmGcdInput}
            onChange={(e) => setLcmGcdInput(e.target.value)}
            placeholder="e.g. 24, 36, 60"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
          <p className="text-[11px] text-slate-400 mt-1">Supports any 2, 3, or more integers.</p>
        </div>
      </div>
    );
  }

  // DEFAULT: PERCENTAGE
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        Marks Percentage Calculator
      </h3>
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Marks Obtained</label>
        <input
          type="number"
          value={obtainedMarks}
          onChange={(e) => setObtainedMarks(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Maximum Total Marks</label>
        <input
          type="number"
          value={totalMarks}
          onChange={(e) => setTotalMarks(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
        />
      </div>
    </div>
  );
};
