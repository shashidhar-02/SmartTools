import React, { useState, useMemo, useEffect } from 'react';
import { Box, Hammer, Layers, Paintbrush, Ruler, ShieldAlert } from 'lucide-react';
import { CalculationResult } from '../../types';

interface ConstructionProps {
  toolId: string;
  onResultChange: (res: CalculationResult) => void;
}

export const ConstructionTilesCalculators: React.FC<ConstructionProps> = ({ toolId, onResultChange }) => {
  // Tile states
  const [roomLengthFt, setRoomLengthFt] = useState<number>(15);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(12);
  const [tileLengthInches, setTileLengthInches] = useState<number>(24);
  const [tileWidthInches, setTileWidthInches] = useState<number>(24);
  const [wastagePercent, setWastagePercent] = useState<number>(10);
  const [tilesPerBox, setTilesPerBox] = useState<number>(4);
  const [pricePerSqFt, setPricePerSqFt] = useState<number>(45);

  // Concrete states
  const [slabLengthFt, setSlabLengthFt] = useState<number>(20);
  const [slabWidthFt, setSlabWidthFt] = useState<number>(15);
  const [slabThicknessInches, setSlabThicknessInches] = useState<number>(4);
  const [concreteMixRatio, setConcreteMixRatio] = useState<string>('1:2:4'); // cement:sand:aggregate

  // Brick states
  const [wallLengthFt, setWallLengthFt] = useState<number>(20);
  const [wallHeightFt, setWallHeightFt] = useState<number>(10);
  const [wallThicknessInches, setWallThicknessInches] = useState<number>(9); // 4.5" (half brick) or 9" (standard)
  const [brickPriceEach, setBrickPriceEach] = useState<number>(8.5);

  // Paint states
  const [paintWallLengthFt, setPaintWallLengthFt] = useState<number>(18);
  const [paintWallHeightFt, setPaintWallHeightFt] = useState<number>(10);
  const [paintNumWalls, setPaintNumWalls] = useState<number>(4);
  const [paintNumCoats, setPaintNumCoats] = useState<number>(2);
  const [paintOpeningsSqFt, setPaintOpeningsSqFt] = useState<number>(40); // doors and windows

  // 1. Tile Calculation
  const tileCalculation = useMemo(() => {
    const rawAreaSqFt = roomLengthFt * roomWidthFt;
    const tileAreaSqFt = (tileLengthInches * tileWidthInches) / 144;
    const rawTiles = tileAreaSqFt > 0 ? rawAreaSqFt / tileAreaSqFt : 0;
    const wastageTiles = Math.ceil(rawTiles * (wastagePercent / 100));
    const totalTiles = Math.ceil(rawTiles + wastageTiles);
    const totalBoxes = tilesPerBox > 0 ? Math.ceil(totalTiles / tilesPerBox) : 1;
    const totalPurchasedArea = totalBoxes * tilesPerBox * tileAreaSqFt;
    const estimatedCost = totalPurchasedArea * pricePerSqFt;

    const result: CalculationResult = {
      toolName: 'Room & Floor Tile Calculator',
      category: 'Home & Construction',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Room Dimensions', value: `${roomLengthFt} ft × ${roomWidthFt} ft (${rawAreaSqFt} sq ft)` },
        { label: 'Tile Dimensions', value: `${tileLengthInches}" × ${tileWidthInches}" (${tileAreaSqFt.toFixed(2)} sq ft)` },
        { label: 'Configurable Wastage', value: `${wastagePercent}% (Cutting & Pattern cuts)` },
        { label: 'Tiles Per Box', value: `${tilesPerBox} pcs/box` },
      ],
      primaryResult: {
        label: 'Total Tiles & Boxes Needed',
        value: `${totalTiles} Tiles (${totalBoxes} Boxes)`,
        subtext: `Total Floor Area: ${rawAreaSqFt} sq ft | Wastage allowance: +${wastageTiles} tiles`,
      },
      breakdown: [
        { label: 'Net Room Area', value: `${rawAreaSqFt} sq ft (${(rawAreaSqFt * 0.092903).toFixed(1)} sq m)` },
        { label: 'Single Tile Surface Area', value: `${tileAreaSqFt.toFixed(2)} sq ft` },
        { label: 'Exact Tiles (No wastage)', value: `${Math.ceil(rawTiles)} tiles` },
        { label: `Cutting Wastage (+${wastagePercent}%)`, value: `${wastageTiles} tiles` },
        { label: 'Total Recommended Tiles', value: `${totalTiles} tiles` },
        { label: 'Total Boxes to Purchase', value: `${totalBoxes} boxes (${totalBoxes * tilesPerBox} tiles)` },
        { label: 'Estimated Material Cost', value: `₹${Math.round(estimatedCost).toLocaleString('en-IN')}` },
      ],
      formula: 'Tiles = [Room Length × Width] / [Tile Length × Width in sq ft] × (1 + Wastage %)',
      disclaimer: 'Tile wastage varies from 8% for standard grid layouts up to 15% for diagonal or herringbone patterns.',
    };
    return result;
  }, [roomLengthFt, roomWidthFt, tileLengthInches, tileWidthInches, wastagePercent, tilesPerBox, pricePerSqFt]);

  // 2. Concrete Volume & Material Mix Calculation
  const concreteCalculation = useMemo(() => {
    const l = slabLengthFt;
    const w = slabWidthFt;
    const tFt = slabThicknessInches / 12;

    const volumeCuFt = l * w * tFt;
    const volumeCuYd = volumeCuFt / 27;
    const volumeCuM = volumeCuFt * 0.0283168;

    // Dry volume factor ~ 1.54
    const dryVolumeCuFt = volumeCuFt * 1.54;
    // For 1:2:4 mix (sum = 7)
    // Cement: (1/7) * dryVol / 1.25 (1 bag cement = 1.25 cu ft)
    const cementBags = Math.ceil((1 / 7) * dryVolumeCuFt / 1.25);
    const sandCuFt = Math.round((2 / 7) * dryVolumeCuFt);
    const aggregateCuFt = Math.round((4 / 7) * dryVolumeCuFt);

    const result: CalculationResult = {
      toolName: 'Concrete Slab & Volume Calculator',
      category: 'Home & Construction',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Slab Dimensions', value: `${l} ft × ${w} ft × ${slabThicknessInches} inches` },
        { label: 'Nominal Mix Ratio', value: `${concreteMixRatio} (Cement:Sand:Aggregate)` },
      ],
      primaryResult: {
        label: 'Concrete Volume Needed',
        value: `${volumeCuYd.toFixed(2)} Yards³ (${volumeCuM.toFixed(2)} m³)`,
        subtext: `Total Wet Volume: ${volumeCuFt.toFixed(1)} Cubic Feet`,
      },
      breakdown: [
        { label: 'Wet Concrete Volume', value: `${volumeCuFt.toFixed(1)} cu ft (${volumeCuYd.toFixed(2)} cu yds)` },
        { label: 'Dry Volume (1.54x factor)', value: `${dryVolumeCuFt.toFixed(1)} cu ft` },
        { label: 'Cement Bags Required (50kg bags)', value: `${cementBags} Bags` },
        { label: 'Sand Volume Required', value: `${sandCuFt} cu ft (~${(sandCuFt * 0.045).toFixed(1)} Tons)` },
        { label: 'Coarse Aggregate Volume', value: `${aggregateCuFt} cu ft (~${(aggregateCuFt * 0.048).toFixed(1)} Tons)` },
        { label: 'Recommended Water-Cement Ratio', value: '0.45 to 0.50 (~25-28 liters per bag)' },
      ],
      chartData: {
        labels: ['Cement Bags', 'Fine Sand (cu ft)', 'Coarse Aggregate (cu ft)'],
        values: [cementBags * 1.25, sandCuFt, aggregateCuFt],
        colors: ['#64748b', '#f59e0b', '#3b82f6'],
      },
      formula: 'Volume = Length × Width × Thickness | Dry Volume = Wet Volume × 1.54',
    };
    return result;
  }, [slabLengthFt, slabWidthFt, slabThicknessInches, concreteMixRatio]);

  // 3. Brick Masonry Calculation
  const brickCalculation = useMemo(() => {
    const wallAreaSqFt = wallLengthFt * wallHeightFt;
    // Standard modular brick with 10mm mortar: approx 500 bricks per 100 cu ft of 9" wall (or ~8 bricks per sq ft for 4.5", ~16 for 9")
    const bricksPerSqFt = wallThicknessInches >= 8 ? 16 : 8;
    const rawBricks = wallAreaSqFt * bricksPerSqFt;
    const wastage = Math.ceil(rawBricks * 0.05); // 5% breakage
    const totalBricks = rawBricks + wastage;

    // Mortar: approx 1.2 cu ft of mortar per 100 bricks in 1:6 mix -> ~0.2 bags cement per 100 bricks
    const cementBags = Math.ceil((totalBricks / 100) * 0.22);
    const sandCuFt = Math.ceil((totalBricks / 100) * 1.3);

    const totalCost = totalBricks * brickPriceEach;

    const result: CalculationResult = {
      toolName: 'Brick Masonry & Mortar Calculator',
      category: 'Home & Construction',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Wall Dimensions', value: `${wallLengthFt} ft × ${wallHeightFt} ft (${wallAreaSqFt} sq ft)` },
        { label: 'Wall Thickness', value: `${wallThicknessInches} inches (${wallThicknessInches >= 8 ? 'Double brick' : 'Single brick'})` },
        { label: 'Breakage Allowance', value: '5% standard masonry breakage' },
      ],
      primaryResult: {
        label: 'Total Bricks Required',
        value: `${totalBricks.toLocaleString()} Bricks`,
        subtext: `Net: ${rawBricks} + 5% breakage (${wastage} bricks)`,
      },
      breakdown: [
        { label: 'Net Wall Area', value: `${wallAreaSqFt} sq ft` },
        { label: 'Calculated Bricks', value: `${rawBricks} bricks` },
        { label: 'Wastage / Breakage (+5%)', value: `${wastage} bricks` },
        { label: 'Total Bricks to Order', value: `${totalBricks} bricks` },
        { label: 'Cement for Mortar (1:6 mix)', value: `${cementBags} Bags (50kg)` },
        { label: 'Sand for Mortar', value: `${sandCuFt} cu ft (~${(sandCuFt / 100).toFixed(1)} brass)` },
        { label: 'Estimated Brick Cost', value: `₹${Math.round(totalCost).toLocaleString('en-IN')}` },
      ],
      formula: 'Bricks = Wall Area × Bricks per Sq Ft × (1 + Breakage %)',
    };
    return result;
  }, [wallLengthFt, wallHeightFt, wallThicknessInches, brickPriceEach]);

  // 4. Paint Coverage Calculation
  const paintCalculation = useMemo(() => {
    const grossWallArea = paintWallLengthFt * paintWallHeightFt * paintNumWalls;
    const netWallArea = Math.max(0, grossWallArea - paintOpeningsSqFt);
    const totalCoatingArea = netWallArea * paintNumCoats;

    // Standard emulsion paint coverage: ~120 to 140 sq ft per liter (or 350-400 sq ft per gallon)
    const litersNeeded = (totalCoatingArea / 130);
    const roundedLiters = Math.ceil(litersNeeded);
    const gallonsNeeded = (totalCoatingArea / 350).toFixed(1);

    const result: CalculationResult = {
      toolName: 'Paint Coverage & Room Area Calculator',
      category: 'Home & Construction',
      dateGenerated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      inputs: [
        { label: 'Walls & Dimensions', value: `${paintNumWalls} walls (${paintWallLengthFt} ft × ${paintWallHeightFt} ft)` },
        { label: 'Openings Cutout (Doors/Windows)', value: `-${paintOpeningsSqFt} sq ft` },
        { label: 'Coats of Paint', value: `${paintNumCoats} Coats` },
      ],
      primaryResult: {
        label: 'Paint Quantity Required',
        value: `${roundedLiters} Liters (${gallonsNeeded} Gallons)`,
        subtext: `Total Coating Area: ${totalCoatingArea} sq ft (${paintNumCoats} coats)`,
      },
      breakdown: [
        { label: 'Gross Wall Surface Area', value: `${grossWallArea} sq ft` },
        { label: 'Deductions (Doors/Windows)', value: `-${paintOpeningsSqFt} sq ft` },
        { label: 'Net Single Coat Area', value: `${netWallArea} sq ft` },
        { label: `Total Coated Area (${paintNumCoats} coats)`, value: `${totalCoatingArea} sq ft` },
        { label: 'Estimated Primer Needed (1 coat)', value: `${Math.ceil(netWallArea / 120)} Liters` },
        { label: 'Top Coat Paint Needed', value: `${roundedLiters} Liters` },
      ],
      formula: 'Paint (Liters) = [(Wall Area - Openings Area) × Number of Coats] / 130 sq ft per liter',
    };
    return result;
  }, [paintWallLengthFt, paintWallHeightFt, paintNumWalls, paintNumCoats, paintOpeningsSqFt]);

  // Sync result with parent
  useEffect(() => {
    if (toolId === 'concrete' || toolId === 'concrete-calculator') {
      onResultChange(concreteCalculation);
    } else if (toolId === 'brick' || toolId === 'brick-calculator' || toolId === 'brick-cement') {
      onResultChange(brickCalculation);
    } else if (toolId === 'paint' || toolId === 'paint-calculator' || toolId === 'paint-calc') {
      onResultChange(paintCalculation);
    } else {
      // Default tile
      onResultChange(tileCalculation);
    }
  }, [toolId, tileCalculation, concreteCalculation, brickCalculation, paintCalculation, onResultChange]);

  // Render Concrete UI
  if (toolId === 'concrete' || toolId === 'concrete-calculator') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Concrete Slab & Footing Parameters</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Length (Feet)</label>
            <input
              type="number"
              min="1"
              value={slabLengthFt}
              onChange={(e) => setSlabLengthFt(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Width (Feet)</label>
            <input
              type="number"
              min="1"
              value={slabWidthFt}
              onChange={(e) => setSlabWidthFt(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Thickness (Inches)</label>
          <input
            type="number"
            step="0.5"
            min="1"
            max="48"
            value={slabThicknessInches}
            onChange={(e) => setSlabThicknessInches(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <div className="flex gap-2 mt-2">
            {[4, 5, 6, 8].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSlabThicknessInches(t)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {t}&quot; ({t === 4 ? 'Sidewalk / Patio' : t === 6 ? 'Driveway' : 'Foundation'})
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mix Ratio</label>
          <select
            value={concreteMixRatio}
            onChange={(e) => setConcreteMixRatio(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="1:2:4">M15 (1 : 2 : 4) - Standard Foundation & Floors</option>
            <option value="1:1.5:3">M20 (1 : 1.5 : 3) - Structural Beams & Slabs</option>
            <option value="1:1:2">M25 (1 : 1 : 2) - Heavy Load Pillars</option>
          </select>
        </div>
      </div>
    );
  }

  // Render Brick UI
  if (toolId === 'brick' || toolId === 'brick-calculator' || toolId === 'brick-cement') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Box className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span>Brick Wall Masonry Parameters</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wall Length (Feet)</label>
            <input
              type="number"
              min="1"
              value={wallLengthFt}
              onChange={(e) => setWallLengthFt(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wall Height (Feet)</label>
            <input
              type="number"
              min="1"
              value={wallHeightFt}
              onChange={(e) => setWallHeightFt(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wall Thickness</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              { val: 4.5, label: '4.5" (Single Brick Partition)' },
              { val: 9, label: '9" (Double Brick Load-Bearing)' },
            ].map((t) => (
              <button
                key={t.val}
                type="button"
                onClick={() => setWallThicknessInches(t.val)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  wallThicknessInches === t.val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price per Brick (₹)</label>
          <input
            type="number"
            step="0.5"
            min="1"
            value={brickPriceEach}
            onChange={(e) => setBrickPriceEach(Math.max(0.1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // Render Paint UI
  if (toolId === 'paint' || toolId === 'paint-calculator' || toolId === 'paint-calc') {
    return (
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          <span>Room Paint Coverage Parameters</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wall Length (Feet)</label>
            <input
              type="number"
              min="1"
              value={paintWallLengthFt}
              onChange={(e) => setPaintWallLengthFt(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ceiling Height (Feet)</label>
            <input
              type="number"
              min="1"
              value={paintWallHeightFt}
              onChange={(e) => setPaintWallHeightFt(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Number of Walls</label>
            <input
              type="number"
              min="1"
              max="12"
              value={paintNumWalls}
              onChange={(e) => setPaintNumWalls(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Coats of Paint</label>
            <select
              value={paintNumCoats}
              onChange={(e) => setPaintNumCoats(Number(e.target.value))}
              className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Coat (Touch-up / Repaint)</option>
              <option value={2}>2 Coats (Standard)</option>
              <option value={3}>3 Coats (Dark to Light Color)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Door & Window Deductions (Sq Ft)</label>
          <input
            type="number"
            min="0"
            value={paintOpeningsSqFt}
            onChange={(e) => setPaintOpeningsSqFt(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Standard single door = ~21 sq ft, window = ~15 sq ft</p>
        </div>
      </div>
    );
  }

  // Default Tile Form
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span>Room & Tile Dimensions</span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room Length (Feet)</label>
          <input
            type="number"
            min="1"
            value={roomLengthFt}
            onChange={(e) => setRoomLengthFt(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room Width (Feet)</label>
          <input
            type="number"
            min="1"
            value={roomWidthFt}
            onChange={(e) => setRoomWidthFt(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tile Size (Inches)</label>
          <select
            value={`${tileLengthInches}x${tileWidthInches}`}
            onChange={(e) => {
              const [l, w] = e.target.value.split('x').map(Number);
              setTileLengthInches(l);
              setTileWidthInches(w);
            }}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="12x12">12&quot; × 12&quot; (1 × 1 ft)</option>
            <option value="16x16">16&quot; × 16&quot; (Standard)</option>
            <option value="24x24">24&quot; × 24&quot; (2 × 2 ft Porcelain)</option>
            <option value="24x48">24&quot; × 48&quot; (Large Format GVT)</option>
            <option value="12x24">12&quot; × 24&quot; (Subway / Bathroom)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tiles per Box</label>
          <input
            type="number"
            min="1"
            value={tilesPerBox}
            onChange={(e) => setTilesPerBox(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cutting Wastage Percentage</label>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
            +{wastagePercent}% Wastage
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="20"
          value={wastagePercent}
          onChange={(e) => setWastagePercent(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>5% (Simple grid)</span>
          <span>10% (Standard cuts)</span>
          <span>20% (Diagonal / Herringbone)</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Estimated Price per Sq Ft (₹)</label>
        <input
          type="number"
          min="1"
          value={pricePerSqFt}
          onChange={(e) => setPricePerSqFt(Math.max(0, Number(e.target.value)))}
          className="w-full px-3 py-2 mt-1 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
        />
      </div>
    </div>
  );
};
