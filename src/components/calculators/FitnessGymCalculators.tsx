import React, { useState, useMemo, useEffect } from 'react';
import { Activity, Dumbbell, Flame, HeartPulse, Scale, Timer, Zap, Droplets } from 'lucide-react';
import { CalculationResult } from '../../types';

interface FitnessGymProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const FitnessGymCalculators: React.FC<FitnessGymProps> = ({ toolId, onResultChange }) => {
  // Common states
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(28);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [activityLevel, setActivityLevel] = useState<number>(1.55); // moderate exercise
  const [fitnessGoal, setFitnessGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');

  // Water Intake states
  const [workoutMinutes, setWorkoutMinutes] = useState<number>(45);
  const [climateType, setClimateType] = useState<'normal' | 'hot' | 'very_hot'>('normal');

  // One Rep Max (1RM) States
  const [liftWeight, setLiftWeight] = useState<number>(100);
  const [liftReps, setLiftReps] = useState<number>(5);

  // Plate Calculator States
  const [barbellWeight, setBarbellWeight] = useState<number>(20);
  const [targetWeight, setTargetWeight] = useState<number>(100);

  // Running Pace States
  const [runDistanceKm, setRunDistanceKm] = useState<number>(10);
  const [runHours, setRunHours] = useState<number>(0);
  const [runMinutes, setRunMinutes] = useState<number>(50);
  const [runSeconds, setRunSeconds] = useState<number>(0);

  // Calories Burned States
  const [exerciseType, setExerciseType] = useState<string>('running');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // 1. BMI Calculation
  const bmiCalculation = useMemo(() => {
    const hM = (Number(heightCm) || 1) / 100;
    const wKg = Number(weightKg) || 1;
    const bmi = wKg / (hM * hM);

    let category = 'Healthy / Normal Weight';
    let badgeColor = 'text-emerald-500';
    if (bmi < 18.5) {
      category = 'Underweight';
      badgeColor = 'text-amber-500';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      badgeColor = 'text-emerald-500';
    } else if (bmi < 30) {
      category = 'Overweight';
      badgeColor = 'text-amber-600';
    } else {
      category = 'Obese';
      badgeColor = 'text-rose-600';
    }

    const minNormal = 18.5 * hM * hM;
    const maxNormal = 24.9 * hM * hM;

    const result: CalculationResult = {
      toolName: 'BMI Calculator (Body Mass Index)',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Height', value: `${heightCm} cm (${(heightCm / 30.48).toFixed(1)} ft)` },
        { label: 'Weight', value: `${weightKg} kg (${(weightKg * 2.20462).toFixed(1)} lbs)` },
        { label: 'Age & Sex', value: `${age} yrs, ${gender === 'male' ? 'Male' : 'Female'}` },
      ],
      primaryResult: {
        label: 'Your Body Mass Index (BMI)',
        value: `${bmi.toFixed(1)} kg/m²`,
        subtext: `Classification: ${category} (WHO Standard)`,
        badge: category,
      },
      breakdown: [
        { label: 'BMI Score', value: bmi.toFixed(2) },
        { label: 'Weight Status', value: category },
        { label: 'Healthy Weight Range for Height', value: `${minNormal.toFixed(1)} kg - ${maxNormal.toFixed(1)} kg` },
        { label: 'Ponderal Index', value: `${(wKg / Math.pow(hM, 3)).toFixed(2)} kg/m³` },
      ],
      formula: 'BMI = Weight (kg) / [Height (m)]²',
      disclaimer: 'Estimates provided for informational and educational planning. Athletes with high muscle mass may test higher.',
    };
    return result;
  }, [heightCm, weightKg, age, gender]);

  // 2. BMR & TDEE / Calorie Deficit Calculation
  const tdeeCalculation = useMemo(() => {
    // Mifflin-St Jeor equation
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const tdee = Math.round(bmr * activityLevel);
    const deficitModerate = Math.round(tdee - 500);
    const deficitMild = Math.round(tdee - 250);
    const surplusBulking = Math.round(tdee + 350);

    const targetCal = fitnessGoal === 'lose' ? deficitModerate : fitnessGoal === 'gain' ? surplusBulking : tdee;

    // Macro distribution (40% carbs, 30% protein, 30% fat)
    const proteinGrams = Math.round((targetCal * 0.3) / 4);
    const carbsGrams = Math.round((targetCal * 0.4) / 4);
    const fatsGrams = Math.round((targetCal * 0.3) / 9);

    const result: CalculationResult = {
      toolName: toolId === 'bmr' ? 'BMR Calculator' : 'TDEE & Calorie Deficit Calculator',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Sex & Age', value: `${gender === 'male' ? 'Male' : 'Female'}, ${age} yrs` },
        { label: 'Height & Weight', value: `${heightCm} cm, ${weightKg} kg` },
        { label: 'Activity Multiplier', value: `${activityLevel}x` },
      ],
      primaryResult: {
        label: toolId === 'bmr' ? 'Basal Metabolic Rate (BMR)' : 'Total Daily Energy Expenditure (TDEE)',
        value: `${toolId === 'bmr' ? Math.round(bmr) : tdee} kcal/day`,
        subtext: toolId === 'bmr' ? 'Calories burned at complete resting baseline' : 'Maintenance daily calorie intake',
      },
      breakdown: [
        { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(bmr)} kcal/day` },
        { label: 'Maintenance Calories (TDEE)', value: `${tdee} kcal/day` },
        { label: 'Fat Loss Target (-500 kcal)', value: `${deficitModerate} kcal/day (~0.5 kg loss/wk)` },
        { label: 'Lean Bulk Target (+350 kcal)', value: `${surplusBulking} kcal/day` },
        { label: 'Daily Protein Target', value: `${proteinGrams}g (${(proteinGrams / weightKg).toFixed(1)}g per kg)` },
        { label: 'Daily Carbs Target', value: `${carbsGrams}g` },
        { label: 'Daily Healthy Fats Target', value: `${fatsGrams}g` },
      ],
      chartData: {
        labels: ['Protein (30%)', 'Carbohydrates (40%)', 'Healthy Fats (30%)'],
        values: [proteinGrams * 4, carbsGrams * 4, fatsGrams * 9],
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
      },
      formula: 'BMR (Mifflin-St Jeor): 10W + 6.25H - 5A (+5 for men, -161 for women) | TDEE = BMR × Activity Factor',
    };
    return result;
  }, [weightKg, heightCm, age, gender, activityLevel, fitnessGoal, toolId]);

  // 3. One Rep Max (1RM) Calculation
  const oneRepMaxCalculation = useMemo(() => {
    const w = Number(liftWeight) || 0;
    const r = Math.min(Math.max(Number(liftReps) || 1, 1), 15);

    // Brzycki: w / (1.0278 - 0.0278 * r)
    // Epley: w * (1 + 0.0333 * r)
    const brzycki = r === 1 ? w : Math.round(w / (1.0278 - 0.0278 * r));
    const epley = r === 1 ? w : Math.round(w * (1 + 0.0333 * r));
    const avg1rm = Math.round((brzycki + epley) / 2);

    const percentages = [
      { pct: 100, reps: '1 Rep (Max)', weight: avg1rm },
      { pct: 95, reps: '2 Reps', weight: Math.round(avg1rm * 0.95) },
      { pct: 90, reps: '3-4 Reps', weight: Math.round(avg1rm * 0.90) },
      { pct: 85, reps: '5-6 Reps', weight: Math.round(avg1rm * 0.85) },
      { pct: 80, reps: '7-8 Reps', weight: Math.round(avg1rm * 0.80) },
      { pct: 75, reps: '9-10 Reps', weight: Math.round(avg1rm * 0.75) },
      { pct: 70, reps: '11-12 Reps', weight: Math.round(avg1rm * 0.70) },
      { pct: 65, reps: '13-15 Reps (Hypertrophy)', weight: Math.round(avg1rm * 0.65) },
    ];

    const scheduleRows = percentages.map((p) => [
      `${p.pct}%`,
      `${p.weight} kg (${Math.round(p.weight * 2.20462)} lbs)`,
      p.reps,
      p.pct >= 85 ? 'Max Strength' : p.pct >= 75 ? 'Hypertrophy / Size' : 'Muscular Endurance',
    ]);

    const result: CalculationResult = {
      toolName: 'One Rep Max (1RM) Calculator',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Lifted Weight', value: `${w} kg (${Math.round(w * 2.20462)} lbs)` },
        { label: 'Repetitions Completed', value: `${r} reps` },
      ],
      primaryResult: {
        label: 'Estimated One Rep Max (1RM)',
        value: `${avg1rm} kg (${Math.round(avg1rm * 2.20462)} lbs)`,
        subtext: `Brzycki: ${brzycki} kg | Epley: ${epley} kg`,
      },
      breakdown: [
        { label: '100% 1RM', value: `${avg1rm} kg` },
        { label: '85% Working Set (5RM)', value: `${Math.round(avg1rm * 0.85)} kg` },
        { label: '75% Volume Set (10RM)', value: `${Math.round(avg1rm * 0.75)} kg` },
      ],
      scheduleTable: {
        title: 'Percentage of 1RM Training Table',
        headers: ['% of 1RM', 'Calculated Load', 'Target Rep Range', 'Training Focus'],
        rows: scheduleRows,
      },
      formula: 'Brzycki: Weight / (1.0278 - 0.0278 × Reps) | Epley: Weight × (1 + 0.0333 × Reps)',
    };
    return result;
  }, [liftWeight, liftReps]);

  // 4. Plate Loading Calculator
  const plateCalculation = useMemo(() => {
    const target = Number(targetWeight) || 0;
    const bar = Number(barbellWeight) || 20;
    const weightToLoad = Math.max(0, target - bar);
    const perSide = weightToLoad / 2;

    const standardPlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesPerSide: { plate: number; count: number }[] = [];
    let rem = perSide;

    for (const p of standardPlates) {
      if (rem >= p) {
        const count = Math.floor(rem / p);
        platesPerSide.push({ plate: p, count });
        rem = Math.round((rem - count * p) * 100) / 100;
      }
    }

    const plateDescription = platesPerSide.length > 0
      ? platesPerSide.map((p) => `${p.count}x ${p.plate}kg`).join(', ')
      : 'No plates needed (bar only)';

    const result: CalculationResult = {
      toolName: 'Gym Barbell Plate Calculator',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Target Lift Weight', value: `${target} kg` },
        { label: 'Barbell Weight', value: `${bar} kg` },
      ],
      primaryResult: {
        label: 'Plates Required Each Side',
        value: `${perSide} kg per side`,
        subtext: plateDescription,
      },
      breakdown: [
        { label: 'Total Barbell Weight', value: `${bar} kg` },
        { label: 'Total Weight on Plates', value: `${weightToLoad} kg` },
        { label: 'Weight Each Side', value: `${perSide} kg` },
        { label: 'Remaining Unloaded Difference', value: `${rem} kg` },
      ],
    };
    return result;
  }, [targetWeight, barbellWeight]);

  // 5. Running Pace Calculator
  const paceCalculation = useMemo(() => {
    const dist = Number(runDistanceKm) || 1;
    const totalSec = runHours * 3600 + runMinutes * 60 + runSeconds;
    const totalMin = totalSec / 60;

    const secPerKm = dist > 0 ? totalSec / dist : 0;
    const paceMin = Math.floor(secPerKm / 60);
    const paceSec = Math.round(secPerKm % 60);
    const paceFormatted = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec} min/km`;

    const secPerMile = dist > 0 ? (totalSec / (dist * 0.621371)) : 0;
    const paceMileMin = Math.floor(secPerMile / 60);
    const paceMileSec = Math.round(secPerMile % 60);
    const paceMileFormatted = `${paceMileMin}:${paceMileSec < 10 ? '0' : ''}${paceMileSec} min/mi`;

    const speedKmh = totalMin > 0 ? (dist / (totalMin / 60)).toFixed(2) : '0';

    const result: CalculationResult = {
      toolName: 'Running Pace & Split Calculator',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Distance', value: `${dist} km (${(dist * 0.621371).toFixed(2)} miles)` },
        { label: 'Total Time', value: `${runHours > 0 ? `${runHours}h ` : ''}${runMinutes}m ${runSeconds}s` },
      ],
      primaryResult: {
        label: 'Average Running Pace',
        value: paceFormatted,
        subtext: `${paceMileFormatted} | Speed: ${speedKmh} km/h`,
      },
      breakdown: [
        { label: 'Pace (Metric)', value: paceFormatted },
        { label: 'Pace (Imperial)', value: paceMileFormatted },
        { label: 'Average Speed', value: `${speedKmh} km/h (${(Number(speedKmh) * 0.621371).toFixed(2)} mph)` },
      ],
    };
    return result;
  }, [runDistanceKm, runHours, runMinutes, runSeconds]);

  // 6. Daily Water Intake Calculator
  const waterCalculation = useMemo(() => {
    const w = Number(weightKg) || 60;
    const baseMl = w * 35; // 35 ml per kg
    const exerciseAddonMl = (workoutMinutes / 30) * 350;
    const climateAddonMl = climateType === 'very_hot' ? 1000 : climateType === 'hot' ? 500 : 0;
    const totalMl = Math.round(baseMl + exerciseAddonMl + climateAddonMl);
    const totalLiters = (totalMl / 1000).toFixed(2);
    const glasses = Math.round(totalMl / 250); // 250ml per standard glass

    const scheduleRows = [
      ['07:00 AM - Waking Up', '500 ml (2 glasses)', 'Rehydrate after overnight fasting'],
      ['10:30 AM - Mid-Morning', '350 ml', 'Sustain cognitive focus and alertness'],
      ['01:00 PM - Lunch', '250 ml (30m before meal)', 'Aids digestion without diluting enzymes'],
      ['04:30 PM - Workout / Afternoon', `${Math.round(exerciseAddonMl + 250)} ml`, 'Pre/Intra/Post workout hydration'],
      ['08:00 PM - Evening / Dinner', '350 ml', 'Replenish metabolic fluid balance'],
      ['10:00 PM - Pre-Bedtime', '200 ml', 'Prevents nocturnal dehydration'],
    ];

    const result: CalculationResult = {
      toolName: 'Daily Water Intake & Hydration Planner',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Body Weight', value: `${w} kg` },
        { label: 'Daily Exercise Duration', value: `${workoutMinutes} mins/day` },
        { label: 'Climate / Environment', value: climateType === 'very_hot' ? 'Hot & Humid (+1000 ml)' : climateType === 'hot' ? 'Warm / Summer (+500 ml)' : 'Temperate / AC' },
      ],
      primaryResult: {
        label: 'Recommended Daily Water Intake',
        value: `${totalLiters} Liters (${totalMl} ml)`,
        subtext: `Equivalent to ~${glasses} standard glasses (250 ml each)`,
        badge: `${glasses} Glasses`,
      },
      breakdown: [
        { label: 'Basal Hydration Need (35ml/kg)', value: `${(baseMl / 1000).toFixed(2)} L` },
        { label: 'Workout Sweat Loss Compensation', value: `+${(exerciseAddonMl / 1000).toFixed(2)} L` },
        { label: 'Climate Environmental Add-on', value: `+${(climateAddonMl / 1000).toFixed(2)} L` },
        { label: 'Total Daily Fluid Target', value: `${totalLiters} L` },
      ],
      scheduleTable: {
        title: 'Optimal Daily Hydration Pacing Schedule',
        headers: ['Time Window', 'Hydration Target', 'Physiological Purpose'],
        rows: scheduleRows,
      },
      formula: 'Daily Water (ml) = Weight (kg) × 35 + (Workout Mins / 30) × 350 + Climate Factor',
    };
    return result;
  }, [weightKg, workoutMinutes, climateType]);

  // Sync result with parent on changes
  useEffect(() => {
    if (toolId === 'bmi') {
      onResultChange(bmiCalculation);
    } else if (
      toolId === 'bmr-tdee' ||
      toolId === 'bmr' ||
      toolId === 'tdee' ||
      toolId === 'calorie-deficit' ||
      toolId === 'calorie' ||
      toolId === 'protein'
    ) {
      onResultChange(tdeeCalculation);
    } else if (toolId === 'one-rep-max' || toolId === '1rm') {
      onResultChange(oneRepMaxCalculation);
    } else if (toolId === 'plate-calculator') {
      onResultChange(plateCalculation);
    } else if (toolId === 'pace' || toolId === 'running-pace') {
      onResultChange(paceCalculation);
    } else if (toolId === 'water-intake') {
      onResultChange(waterCalculation);
    } else {
      onResultChange(bmiCalculation);
    }
  }, [
    toolId,
    bmiCalculation,
    tdeeCalculation,
    oneRepMaxCalculation,
    plateCalculation,
    paceCalculation,
    waterCalculation,
    onResultChange,
  ]);

  // Render 1RM UI
  if (toolId === 'one-rep-max' || toolId === '1rm') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>One Rep Max (1RM) Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lifted Weight (kg)</label>
          <input
            type="number"
            min="10"
            max="500"
            value={liftWeight}
            onChange={(e) => setLiftWeight(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reps Completed</label>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
              {liftReps} Reps
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            value={liftReps}
            onChange={(e) => setLiftReps(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1 Rep</span>
            <span>6 Reps</span>
            <span>12 Reps</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Plate Calculator UI
  if (toolId === 'plate-calculator') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Barbell Plate Loading Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Total Weight (kg)</label>
          <input
            type="number"
            step="2.5"
            min="20"
            max="500"
            value={targetWeight}
            onChange={(e) => setTargetWeight(Math.max(20, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Barbell Weight</label>
          <select
            value={barbellWeight}
            onChange={(e) => setBarbellWeight(Number(e.target.value))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={20}>Standard Olympic Barbell (20 kg / 44 lbs)</option>
            <option value={15}>Women&apos;s Olympic Barbell (15 kg / 33 lbs)</option>
            <option value={10}>EZ Curl Bar (10 kg / 22 lbs)</option>
          </select>
        </div>
      </div>
    );
  }

  // Render Running Pace UI
  if (toolId === 'pace' || toolId === 'running-pace') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Running Pace & Distance Parameters</span>
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            value={runDistanceKm}
            onChange={(e) => setRunDistanceKm(Math.max(0.1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 mt-2">
            {[5, 10, 21.1, 42.2].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRunDistanceKm(d)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {d === 21.1 ? 'Half Marathon' : d === 42.2 ? 'Marathon' : `${d} km`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hours</label>
            <input
              type="number"
              min="0"
              max="24"
              value={runHours}
              onChange={(e) => setRunHours(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={runMinutes}
              onChange={(e) => setRunMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Seconds</label>
            <input
              type="number"
              min="0"
              max="59"
              value={runSeconds}
              onChange={(e) => setRunSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // Render TDEE / BMR / Calorie / Macro UI
  if (
    toolId === 'bmr-tdee' ||
    toolId === 'bmr' ||
    toolId === 'tdee' ||
    toolId === 'calorie-deficit' ||
    toolId === 'calorie' ||
    toolId === 'protein'
  ) {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>
            {toolId === 'calorie-deficit' ? 'Calorie Deficit & Macro Targets' : 'Metabolism & Calorie Intake Parameters'}
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sex</label>
            <div className="flex gap-2 mt-1">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setGender(s)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    gender === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Age (Years)</label>
            <input
              type="number"
              min="14"
              max="99"
              value={age}
              onChange={(e) => setAge(Math.max(14, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Height (cm)</label>
            <input
              type="number"
              min="100"
              max="250"
              value={heightCm}
              onChange={(e) => setHeightCm(Math.max(50, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={weightKg}
              onChange={(e) => setWeightKg(Math.max(20, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Activity Level</label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(Number(e.target.value))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value={1.2}>Sedentary (Desk job, minimal exercise)</option>
            <option value={1.375}>Lightly Active (Exercise 1-3 days/week)</option>
            <option value={1.55}>Moderately Active (Exercise 3-5 days/week)</option>
            <option value={1.725}>Very Active (Hard training 6-7 days/week)</option>
            <option value={1.9}>Extra Active (Intense training / Physical job)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Goal</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { id: 'lose', label: 'Fat Loss (-500 kcal)' },
              { id: 'maintain', label: 'Maintain Weight' },
              { id: 'gain', label: 'Muscle Gain (+350 kcal)' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFitnessGoal(g.id as any)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  fitnessGoal === g.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Water Intake UI
  if (toolId === 'water-intake') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>Daily Hydration & Water Intake Parameters</span>
        </h3>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Body Weight (kg)</label>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded">
              {weightKg} kg
            </span>
          </div>
          <input
            type="range"
            min="35"
            max="150"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full accent-cyan-600 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Daily Exercise / Sweat Time (Minutes)</label>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded">
              {workoutMinutes} mins
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="15"
            value={workoutMinutes}
            onChange={(e) => setWorkoutMinutes(Number(e.target.value))}
            className="w-full accent-cyan-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Climate & Environment</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { id: 'normal', label: 'Temperate / AC' },
              { id: 'hot', label: 'Warm / Summer (+500ml)' },
              { id: 'very_hot', label: 'Hot & Humid (+1L)' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setClimateType(c.id as any)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  climateType === c.id
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default BMI form
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span>Body Metrics Parameters</span>
      </h3>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Height (cm)</label>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
            {heightCm} cm ({(heightCm / 30.48).toFixed(1)} ft)
          </span>
        </div>
        <input
          type="range"
          min="120"
          max="220"
          value={heightCm}
          onChange={(e) => setHeightCm(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weight (kg)</label>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
            {weightKg} kg ({(weightKg * 2.20462).toFixed(1)} lbs)
          </span>
        </div>
        <input
          type="range"
          min="35"
          max="160"
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>
    </div>
  );
};
