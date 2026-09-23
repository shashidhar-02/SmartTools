import React, { useState, useMemo } from 'react';
import { CalculationResult } from '../../types';

interface HealthLifestyleProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const HealthLifestyleCalculators: React.FC<HealthLifestyleProps> = ({ toolId, onResultChange }) => {
  // BMI States
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(68);

  // Construction States
  const [roomLength, setRoomLength] = useState<number>(14);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  const [unitDim, setUnitDim] = useState<'feet' | 'meters'>('feet');
  const [tileLengthInches, setTileLengthInches] = useState<number>(24);
  const [tileWidthInches, setTileWidthInches] = useState<number>(24);

  // Vehicle Fuel States
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(250);
  const [vehicleMileageKmpl, setVehicleMileageKmpl] = useState<number>(16);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(104);

  // Agriculture Land States
  const [landValue, setLandValue] = useState<number>(5);
  const [agriUnitFrom, setAgriUnitFrom] = useState<'acre' | 'hectare' | 'bigha' | 'guntha'>('acre');

  const formatCurrency = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  // 1. BMI CALCULATOR
  const bmiCalculation = useMemo(() => {
    const hM = (Number(heightCm) || 1) / 100;
    const wKg = Number(weightKg) || 1;
    const bmi = wKg / (hM * hM);

    let category = 'Normal Weight';
    let badgeColor = 'text-emerald-500';
    if (bmi < 18.5) {
      category = 'Underweight';
    } else if (bmi < 25) {
      category = 'Healthy / Normal Weight';
    } else if (bmi < 30) {
      category = 'Overweight';
    } else {
      category = 'Obesity';
    }

    const minHealthyWeight = (18.5 * hM * hM).toFixed(1);
    const maxHealthyWeight = (24.9 * hM * hM).toFixed(1);

    const result: CalculationResult = {
      toolName: 'BMI Calculator (Body Mass Index)',
      category: 'Health & Fitness',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Height', value: `${heightCm} cm (${(heightCm / 30.48).toFixed(1)} ft)` },
        { label: 'Weight', value: `${weightKg} kg (${(weightKg * 2.20462).toFixed(1)} lbs)` },
      ],
      primaryResult: {
        label: 'Your Body Mass Index (BMI)',
        value: `${bmi.toFixed(1)} kg/m²`,
        subtext: `Classification: ${category} (WHO Standard)`,
        badge: category,
      },
      breakdown: [
        { label: 'BMI Score', value: `${bmi.toFixed(2)}` },
        { label: 'Weight Category', value: category },
        { label: 'Healthy Weight Range for your height', value: `${minHealthyWeight} kg - ${maxHealthyWeight} kg` },
        { label: 'Ponderal Index', value: `${(wKg / Math.pow(hM, 3)).toFixed(2)} kg/m³` },
      ],
      scheduleTable: {
        title: 'WHO Body Mass Index Classification Scale',
        headers: ['Classification', 'BMI Range (kg/m²)', 'Health Risk Level'],
        rows: [
          ['Underweight', '< 18.5', 'Risk of nutritional deficiency'],
          ['Normal Weight', '18.5 – 24.9', 'Lowest health risk / Optimal'],
          ['Overweight', '25.0 – 29.9', 'Increased risk of cardiovascular disease'],
          ['Class I Obesity', '30.0 – 34.9', 'High risk'],
          ['Class II Obesity', '35.0 – 39.9', 'Very high risk'],
        ],
      },
      formula: 'BMI = Weight (kg) / [Height (m)]²',
      disclaimer: 'Informational estimate only. BMI does not evaluate body fat percentage or muscle mass. Consult a physician for diagnostic advice.',
    };
    return result;
  }, [heightCm, weightKg]);

  // 2. CONSTRUCTION TILES & FLOORING
  const tileCalculation = useMemo(() => {
    const l = Number(roomLength) || 0;
    const w = Number(roomWidth) || 0;
    const roomAreaSqFt = unitDim === 'feet' ? l * w : l * w * 10.7639;

    const tileL = Number(tileLengthInches) || 12;
    const tileW = Number(tileWidthInches) || 12;
    const singleTileAreaSqFt = (tileL * tileW) / 144;

    const baseTilesCount = singleTileAreaSqFt > 0 ? roomAreaSqFt / singleTileAreaSqFt : 0;
    const wastage10 = baseTilesCount * 0.10;
    const totalTilesWithWastage = Math.ceil(baseTilesCount + wastage10);
    const boxesNeeded = Math.ceil(totalTilesWithWastage / 4); // assume 4 tiles/box for 2x2

    const result: CalculationResult = {
      toolName: toolId === 'room-area' ? 'Room & Land Area Calculator' : 'Tiles & Flooring Quantity Calculator',
      category: 'Home & Construction',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Room Dimensions', value: `${l} x ${w} ${unitDim}` },
        { label: 'Tile Dimensions', value: `${tileL}" x ${tileW}" (${(tileL / 12).toFixed(1)} x ${(tileW / 12).toFixed(1)} ft)` },
        { label: 'Cutting Wastage Allowance', value: '10% Standard' },
      ],
      primaryResult: {
        label: toolId === 'room-area' ? 'Total Carpet Area' : 'Total Tiles Required (with 10% Wastage)',
        value: toolId === 'room-area' ? `${roomAreaSqFt.toFixed(1)} Sq. Ft.` : `${totalTilesWithWastage} Tiles`,
        subtext: `Room Area: ${roomAreaSqFt.toFixed(1)} sq ft (${(roomAreaSqFt / 10.7639).toFixed(2)} sq meters)`,
        badge: `${Math.ceil(boxesNeeded)} Boxes`,
      },
      breakdown: [
        { label: 'Total Room Floor Area', value: `${roomAreaSqFt.toFixed(2)} Sq. Ft.` },
        { label: 'Floor Area in Square Meters', value: `${(roomAreaSqFt / 10.7639).toFixed(2)} m²` },
        { label: 'Perimeter of Room', value: `${2 * (l + w)} ${unitDim}` },
        { label: 'Exact Tiles without Wastage', value: `${Math.ceil(baseTilesCount)} tiles` },
        { label: '10% Extra for Cuts & Breakage', value: `${Math.ceil(wastage10)} tiles` },
        { label: 'Approximate Boxes Needed (4/box)', value: `${boxesNeeded} boxes` },
      ],
      formula: 'Tiles Required = (Floor Area / Tile Area) x 1.10 (with 10% wastage margin)',
    };
    return result;
  }, [roomLength, roomWidth, unitDim, tileLengthInches, tileWidthInches, toolId]);

  // 3. VEHICLE FUEL COST
  const fuelCalculation = useMemo(() => {
    const dist = Number(tripDistanceKm) || 0;
    const mileage = Number(vehicleMileageKmpl) || 1;
    const price = Number(fuelPricePerLiter) || 0;

    const fuelLiters = dist / mileage;
    const totalCost = fuelLiters * price;
    const costPerKm = dist > 0 ? totalCost / dist : 0;

    const result: CalculationResult = {
      toolName: 'Fuel Cost & Mileage Calculator',
      category: 'Vehicle',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Trip Distance', value: `${dist} km` },
        { label: 'Vehicle Fuel Economy / Mileage', value: `${mileage} km/l` },
        { label: 'Fuel Price', value: `₹${price} / liter` },
      ],
      primaryResult: {
        label: 'Total Trip Fuel Expense',
        value: formatCurrency(totalCost),
        subtext: `Cost per kilometer: ₹${costPerKm.toFixed(2)}/km • Total Fuel: ${fuelLiters.toFixed(1)} Liters`,
        badge: `₹${costPerKm.toFixed(2)}/km`,
      },
      breakdown: [
        { label: 'Total Distance', value: `${dist} km` },
        { label: 'Fuel Consumed', value: `${fuelLiters.toFixed(2)} Liters` },
        { label: 'Fuel Price per Liter', value: `₹${price}` },
        { label: 'Cost per Kilometer', value: `₹${costPerKm.toFixed(2)}` },
        { label: 'Total Fuel Bill', value: formatCurrency(totalCost) },
      ],
      formula: 'Total Fuel Cost = (Distance / Mileage) x Fuel Price per Liter',
    };
    return result;
  }, [tripDistanceKm, vehicleMileageKmpl, fuelPricePerLiter]);

  // 4. AGRICULTURE CONVERTER
  const agriCalculation = useMemo(() => {
    const val = Number(landValue) || 0;
    let acre = val;
    if (agriUnitFrom === 'hectare') acre = val * 2.47105;
    if (agriUnitFrom === 'bigha') acre = val * 0.62; // Standard average bigha
    if (agriUnitFrom === 'guntha') acre = val / 40;

    const sqFt = acre * 43560;
    const hectare = acre / 2.47105;
    const bigha = acre / 0.62;
    const guntha = acre * 40;
    const sqM = sqFt / 10.7639;

    const result: CalculationResult = {
      toolName: 'Agricultural Land Area Converter',
      category: 'Agriculture',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Land Quantity', value: `${val} ${agriUnitFrom.toUpperCase()}` },
      ],
      primaryResult: {
        label: 'Equivalent Acreage',
        value: `${acre.toFixed(3)} Acres`,
        subtext: `${sqFt.toLocaleString()} Sq. Ft. • ${hectare.toFixed(3)} Hectares`,
      },
      breakdown: [
        { label: 'Acres', value: `${acre.toFixed(3)} acres` },
        { label: 'Hectares', value: `${hectare.toFixed(3)} ha` },
        { label: 'Bigha (Standard avg)', value: `${bigha.toFixed(2)} bigha` },
        { label: 'Guntha', value: `${guntha.toFixed(2)} guntha` },
        { label: 'Square Feet', value: `${Math.round(sqFt).toLocaleString()} sq ft` },
        { label: 'Square Meters', value: `${Math.round(sqM).toLocaleString()} m²` },
      ],
      formula: '1 Acre = 43,560 Sq Ft = 40 Gunthas = 0.4047 Hectares',
    };
    return result;
  }, [landValue, agriUnitFrom]);

  React.useEffect(() => {
    if (toolId === 'room-area' || toolId === 'tiles-flooring' || toolId === 'paint-calc') {
      onResultChange(tileCalculation);
    } else if (toolId === 'fuel-cost' || toolId === 'ev-savings') {
      onResultChange(fuelCalculation);
    } else if (toolId === 'agri-land' || toolId === 'crop-yield') {
      onResultChange(agriCalculation);
    } else {
      onResultChange(bmiCalculation);
    }
  }, [toolId, bmiCalculation, tileCalculation, fuelCalculation, agriCalculation, onResultChange]);

  if (toolId === 'room-area' || toolId === 'tiles-flooring' || toolId === 'paint-calc') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Room & Tile Dimensions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Room Length ({unitDim})</label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Room Width ({unitDim})</label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tile Size Length (inches)</label>
            <input
              type="number"
              value={tileLengthInches}
              onChange={(e) => setTileLengthInches(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tile Size Width (inches)</label>
            <input
              type="number"
              value={tileWidthInches}
              onChange={(e) => setTileWidthInches(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    );
  }

  if (toolId === 'fuel-cost' || toolId === 'ev-savings') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Trip & Vehicle Mileage
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Trip Distance (Kilometers)</label>
          <input
            type="number"
            value={tripDistanceKm}
            onChange={(e) => setTripDistanceKm(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Vehicle Mileage (km / liter)</label>
          <input
            type="number"
            value={vehicleMileageKmpl}
            onChange={(e) => setVehicleMileageKmpl(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Current Fuel Price (₹ / liter)</label>
          <input
            type="number"
            value={fuelPricePerLiter}
            onChange={(e) => setFuelPricePerLiter(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
          />
        </div>
      </div>
    );
  }

  if (toolId === 'agri-land' || toolId === 'crop-yield') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
          Agricultural Land Units
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Land Area Value</label>
            <input
              type="number"
              value={landValue}
              onChange={(e) => setLandValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Current Unit</label>
            <select
              value={agriUnitFrom}
              onChange={(e) => setAgriUnitFrom(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="acre">Acres</option>
              <option value="hectare">Hectares</option>
              <option value="bigha">Bigha</option>
              <option value="guntha">Guntha</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: BMI CALCULATOR
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
        Body Measurements
      </h3>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-700">Height (cm)</label>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {heightCm} cm ({(heightCm / 30.48).toFixed(1)} ft)
          </span>
        </div>
        <input
          type="number"
          min="50"
          max="250"
          value={heightCm}
          onChange={(e) => setHeightCm(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
        />
        <input
          type="range"
          min="120"
          max="220"
          value={heightCm}
          onChange={(e) => setHeightCm(Number(e.target.value))}
          className="w-full mt-2 accent-blue-600 cursor-pointer"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-700">Weight (kg)</label>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {weightKg} kg ({(weightKg * 2.20462).toFixed(1)} lbs)
          </span>
        </div>
        <input
          type="number"
          min="20"
          max="300"
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
        />
        <input
          type="range"
          min="30"
          max="150"
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
          className="w-full mt-2 accent-blue-600 cursor-pointer"
        />
      </div>
    </div>
  );
};
