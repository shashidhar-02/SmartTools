/**
 * Comprehensive Unit Conversion Registry
 * Structured TypeScript registry containing conversion factors for Length, Mass, and Temperature,
 * built for full compatibility with the math.js dimension and unit calculation engine.
 */

import * as math from 'mathjs';

export type ConverterCategory =
  | 'length'
  | 'mass'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  mathjsUnit: string;
  category: ConverterCategory;
  /** Factor to convert 1 unit of this to the SI base unit (meter for length, kilogram for mass) */
  factorToBase: number;
  /** Alias for factorToBase for backward compatibility */
  baseFactor?: number;
  description: string;
}

export interface CategoryMetadata {
  id: ConverterCategory;
  name: string;
  baseUnit: string;
  defaultFrom: string;
  defaultTo: string;
  description: string;
  units: UnitDefinition[];
}

// ----------------------------------------------------------------------
// 1. LENGTH CONVERSION REGISTRY (Base: Meter [m])
// ----------------------------------------------------------------------
export const LENGTH_UNITS: UnitDefinition[] = [
  { id: 'meter', name: 'Meters', symbol: 'm', mathjsUnit: 'm', category: 'length', factorToBase: 1, baseFactor: 1, description: 'SI base unit of length (1 m)' },
  { id: 'kilometer', name: 'Kilometers', symbol: 'km', mathjsUnit: 'km', category: 'length', factorToBase: 1000, baseFactor: 1000, description: '1,000 meters' },
  { id: 'centimeter', name: 'Centimeters', symbol: 'cm', mathjsUnit: 'cm', category: 'length', factorToBase: 0.01, baseFactor: 0.01, description: '1/100 meter (0.01 m)' },
  { id: 'millimeter', name: 'Millimeters', symbol: 'mm', mathjsUnit: 'mm', category: 'length', factorToBase: 0.001, baseFactor: 0.001, description: '1/1,000 meter (0.001 m)' },
  { id: 'micrometer', name: 'Micrometers', symbol: 'µm', mathjsUnit: 'um', category: 'length', factorToBase: 1e-6, baseFactor: 1e-6, description: '10^-6 meters (microns)' },
  { id: 'nanometer', name: 'Nanometers', symbol: 'nm', mathjsUnit: 'nm', category: 'length', factorToBase: 1e-9, baseFactor: 1e-9, description: '10^-9 meters' },
  { id: 'mile', name: 'Miles', symbol: 'mi', mathjsUnit: 'mi', category: 'length', factorToBase: 1609.344, baseFactor: 1609.344, description: 'Statute mile (5,280 ft = 1,609.344 m)' },
  { id: 'yard', name: 'Yards', symbol: 'yd', mathjsUnit: 'yd', category: 'length', factorToBase: 0.9144, baseFactor: 0.9144, description: '3 feet (0.9144 m)' },
  { id: 'foot', name: 'Feet', symbol: 'ft', mathjsUnit: 'ft', category: 'length', factorToBase: 0.3048, baseFactor: 0.3048, description: '12 inches (0.3048 m)' },
  { id: 'inch', name: 'Inches', symbol: 'in', mathjsUnit: 'inch', category: 'length', factorToBase: 0.0254, baseFactor: 0.0254, description: '1/12 foot (25.4 mm = 0.0254 m)' },
  { id: 'nauticalmile', name: 'Nautical Miles', symbol: 'NM', mathjsUnit: 'nauticalmile', category: 'length', factorToBase: 1852, baseFactor: 1852, description: 'Exact international maritime standard (1,852 m)' },
  { id: 'fathom', name: 'Fathoms', symbol: 'ftm', mathjsUnit: 'fathom', category: 'length', factorToBase: 1.8288, baseFactor: 1.8288, description: '6 feet nautical depth (1.8288 m)' },
  { id: 'rod', name: 'Rods / Perches', symbol: 'rd', mathjsUnit: 'rd', category: 'length', factorToBase: 5.0292, baseFactor: 5.0292, description: '16.5 feet land surveying (5.0292 m)' },
];

// ----------------------------------------------------------------------
// 2. MASS & WEIGHT CONVERSION REGISTRY (Base: Kilogram [kg])
// ----------------------------------------------------------------------
export const MASS_UNITS: UnitDefinition[] = [
  { id: 'kilogram', name: 'Kilograms', symbol: 'kg', mathjsUnit: 'kg', category: 'mass', factorToBase: 1, baseFactor: 1, description: 'SI base unit of mass (1 kg)' },
  { id: 'gram', name: 'Grams', symbol: 'g', mathjsUnit: 'g', category: 'mass', factorToBase: 0.001, baseFactor: 0.001, description: '1/1,000 kilogram (0.001 kg)' },
  { id: 'milligram', name: 'Milligrams', symbol: 'mg', mathjsUnit: 'mg', category: 'mass', factorToBase: 1e-6, baseFactor: 1e-6, description: '1/1,000,000 kilogram (10^-6 kg)' },
  { id: 'microgram', name: 'Micrograms', symbol: 'µg', mathjsUnit: 'ug', category: 'mass', factorToBase: 1e-9, baseFactor: 1e-9, description: '10^-9 kilograms' },
  { id: 'metric_ton', name: 'Metric Tonnes', symbol: 't', mathjsUnit: 'tonne', category: 'mass', factorToBase: 1000, baseFactor: 1000, description: '1,000 kilograms (1 megagram)' },
  { id: 'pound', name: 'Pounds (Avoirdupois)', symbol: 'lbs', mathjsUnit: 'lbm', category: 'mass', factorToBase: 0.45359237, baseFactor: 0.45359237, description: 'Exact international avoirdupois pound (0.45359237 kg)' },
  { id: 'ounce', name: 'Ounces (Avoirdupois)', symbol: 'oz', mathjsUnit: 'oz', category: 'mass', factorToBase: 0.028349523125, baseFactor: 0.028349523125, description: '1/16 of a pound (~28.3495 g)' },
  { id: 'stone', name: 'Stones (UK)', symbol: 'st', mathjsUnit: 'stone', category: 'mass', factorToBase: 6.35029318, baseFactor: 6.35029318, description: '14 pounds (6.35029 kg)' },
  { id: 'carat', name: 'Carats (Metric)', symbol: 'ct', mathjsUnit: 'carat', category: 'mass', factorToBase: 0.0002, baseFactor: 0.0002, description: '200 milligrams (0.0002 kg) for gemstones' },
  { id: 'grain', name: 'Grains', symbol: 'gr', mathjsUnit: 'grain', category: 'mass', factorToBase: 0.00006479891, baseFactor: 0.00006479891, description: '1/7,000 pound (~64.79891 mg)' },
  { id: 'short_ton', name: 'Short Tons (US)', symbol: 'sh tn', mathjsUnit: 'ton', category: 'mass', factorToBase: 907.18474, baseFactor: 907.18474, description: '2,000 pounds (907.185 kg)' },
  { id: 'long_ton', name: 'Long Tons (Imperial)', symbol: 'long tn', mathjsUnit: 'ton', category: 'mass', factorToBase: 1016.0469088, baseFactor: 1016.0469088, description: '2,240 pounds (1,016.047 kg)' },
];

/** Alias for MASS_UNITS for weight terminology compatibility */
export const WEIGHT_UNITS = MASS_UNITS;

// ----------------------------------------------------------------------
// 3. TEMPERATURE CONVERSION REGISTRY (Base: Kelvin [K] / Celsius [°C])
// ----------------------------------------------------------------------
export const TEMPERATURE_UNITS: UnitDefinition[] = [
  { id: 'celsius', name: 'Celsius', symbol: '°C', mathjsUnit: 'degC', category: 'temperature', factorToBase: 1, baseFactor: 1, description: 'Metric centigrade scale (Water freezes: 0°C, Boils: 100°C)' },
  { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', mathjsUnit: 'degF', category: 'temperature', factorToBase: 5 / 9, baseFactor: 5 / 9, description: 'US customary scale (Water freezes: 32°F, Boils: 212°F)' },
  { id: 'kelvin', name: 'Kelvin', symbol: 'K', mathjsUnit: 'K', category: 'temperature', factorToBase: 1, baseFactor: 1, description: 'SI base thermodynamic absolute temperature scale (0 K = -273.15°C)' },
  { id: 'rankine', name: 'Rankine', symbol: '°R', mathjsUnit: 'degR', category: 'temperature', factorToBase: 5 / 9, baseFactor: 5 / 9, description: 'Absolute Fahrenheit scale (0 °R = -459.67°F)' },
];

// ----------------------------------------------------------------------
// 4. VOLUME & CAPACITY REGISTRY (Base: Liter [l])
// ----------------------------------------------------------------------
export const VOLUME_UNITS: UnitDefinition[] = [
  { id: 'liter', name: 'Liters', symbol: 'L', mathjsUnit: 'l', category: 'volume', factorToBase: 1, baseFactor: 1, description: '1 cubic decimeter (dm³)' },
  { id: 'milliliter', name: 'Milliliters', symbol: 'mL', mathjsUnit: 'ml', category: 'volume', factorToBase: 0.001, baseFactor: 0.001, description: '1 cubic centimeter (cc)' },
  { id: 'cubic_meter', name: 'Cubic Meters', symbol: 'm³', mathjsUnit: 'm3', category: 'volume', factorToBase: 1000, baseFactor: 1000, description: 'SI derived volume unit (1,000 liters)' },
  { id: 'cubic_centimeter', name: 'Cubic Centimeters', symbol: 'cm³', mathjsUnit: 'cm3', category: 'volume', factorToBase: 0.001, baseFactor: 0.001, description: '1 mL' },
  { id: 'gallon', name: 'US Gallons', symbol: 'gal', mathjsUnit: 'gal', category: 'volume', factorToBase: 3.785411784, baseFactor: 3.785411784, description: '231 cubic inches (~3.785 L)' },
  { id: 'quart', name: 'US Quarts', symbol: 'qt', mathjsUnit: 'qt', category: 'volume', factorToBase: 0.946352946, baseFactor: 0.946352946, description: '1/4 US gallon (~946 mL)' },
  { id: 'pint', name: 'US Pints', symbol: 'pt', mathjsUnit: 'pt', category: 'volume', factorToBase: 0.473176473, baseFactor: 0.473176473, description: '1/8 US gallon (~473 mL)' },
  { id: 'cup', name: 'US Cups', symbol: 'cup', mathjsUnit: 'cup', category: 'volume', factorToBase: 0.2365882365, baseFactor: 0.2365882365, description: '8 fluid ounces (~236.6 mL)' },
  { id: 'fluid_ounce', name: 'US Fluid Ounces', symbol: 'fl oz', mathjsUnit: 'floz', category: 'volume', factorToBase: 0.0295735295625, baseFactor: 0.0295735295625, description: '1/128 US gallon (~29.57 mL)' },
];

// ----------------------------------------------------------------------
// 5. SPEED & VELOCITY REGISTRY (Base: m/s)
// ----------------------------------------------------------------------
export const SPEED_UNITS: UnitDefinition[] = [
  { id: 'kmh', name: 'Kilometers per Hour', symbol: 'km/h', mathjsUnit: 'km / h', category: 'speed', factorToBase: 0.277777778, baseFactor: 0.277777778, description: 'Standard metric road speed' },
  { id: 'mps', name: 'Meters per Second', symbol: 'm/s', mathjsUnit: 'm / s', category: 'speed', factorToBase: 1, baseFactor: 1, description: 'SI base unit of speed' },
  { id: 'mph', name: 'Miles per Hour', symbol: 'mph', mathjsUnit: 'mi / h', category: 'speed', factorToBase: 0.44704, baseFactor: 0.44704, description: 'Standard US/UK road speed' },
  { id: 'knot', name: 'Knots', symbol: 'kn', mathjsUnit: 'knot', category: 'speed', factorToBase: 0.514444444, baseFactor: 0.514444444, description: '1 nautical mile per hour' },
  { id: 'fps', name: 'Feet per Second', symbol: 'ft/s', mathjsUnit: 'ft / s', category: 'speed', factorToBase: 0.3048, baseFactor: 0.3048, description: 'Feet per second' },
];

// ----------------------------------------------------------------------
// 6. TIME DURATION REGISTRY (Base: Second [s])
// ----------------------------------------------------------------------
export const TIME_UNITS: UnitDefinition[] = [
  { id: 'second', name: 'Seconds', symbol: 's', mathjsUnit: 'second', category: 'time', factorToBase: 1, baseFactor: 1, description: 'SI base unit of time' },
  { id: 'millisecond', name: 'Milliseconds', symbol: 'ms', mathjsUnit: 'ms', category: 'time', factorToBase: 0.001, baseFactor: 0.001, description: '1/1,000 second' },
  { id: 'minute', name: 'Minutes', symbol: 'min', mathjsUnit: 'minute', category: 'time', factorToBase: 60, baseFactor: 60, description: '60 seconds' },
  { id: 'hour', name: 'Hours', symbol: 'hr', mathjsUnit: 'hour', category: 'time', factorToBase: 3600, baseFactor: 3600, description: '60 minutes' },
  { id: 'day', name: 'Days', symbol: 'd', mathjsUnit: 'day', category: 'time', factorToBase: 86400, baseFactor: 86400, description: '24 hours' },
  { id: 'week', name: 'Weeks', symbol: 'wk', mathjsUnit: 'week', category: 'time', factorToBase: 604800, baseFactor: 604800, description: '7 days' },
  { id: 'month', name: 'Months (Average 30.44d)', symbol: 'mo', mathjsUnit: 'month', category: 'time', factorToBase: 2629800, baseFactor: 2629800, description: '1/12 Julian year' },
  { id: 'year', name: 'Years (365.25d)', symbol: 'yr', mathjsUnit: 'year', category: 'time', factorToBase: 31557600, baseFactor: 31557600, description: 'Julian year' },
];

// ----------------------------------------------------------------------
// 7. DATA STORAGE REGISTRY (Base: Byte [B])
// ----------------------------------------------------------------------
export const DATA_UNITS: UnitDefinition[] = [
  { id: 'bit', name: 'Bits', symbol: 'b', mathjsUnit: 'b', category: 'data', factorToBase: 0.125, baseFactor: 0.125, description: 'Single binary digit (0 or 1)' },
  { id: 'byte', name: 'Bytes', symbol: 'B', mathjsUnit: 'B', category: 'data', factorToBase: 1, baseFactor: 1, description: '8 bits' },
  { id: 'kilobyte', name: 'Kilobytes', symbol: 'KB', mathjsUnit: 'kB', category: 'data', factorToBase: 1000, baseFactor: 1000, description: '1,000 bytes (decimal)' },
  { id: 'megabyte', name: 'Megabytes', symbol: 'MB', mathjsUnit: 'MB', category: 'data', factorToBase: 1e6, baseFactor: 1e6, description: '1,000,000 bytes' },
  { id: 'gigabyte', name: 'Gigabytes', symbol: 'GB', mathjsUnit: 'GB', category: 'data', factorToBase: 1e9, baseFactor: 1e9, description: '1,000,000,000 bytes' },
  { id: 'terabyte', name: 'Terabytes', symbol: 'TB', mathjsUnit: 'TB', category: 'data', factorToBase: 1e12, baseFactor: 1e12, description: '10^12 bytes' },
  { id: 'petabyte', name: 'Petabytes', symbol: 'PB', mathjsUnit: 'PB', category: 'data', factorToBase: 1e15, baseFactor: 1e15, description: '10^15 bytes' },
];

// ----------------------------------------------------------------------
// CATEGORY REGISTRY & METADATA
// ----------------------------------------------------------------------
export const CONVERSION_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    baseUnit: 'meter',
    defaultFrom: 'meter',
    defaultTo: 'foot',
    description: 'Convert between metric (meters, km, cm) and imperial (feet, inches, miles) distances.',
    units: LENGTH_UNITS,
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    baseUnit: 'kilogram',
    defaultFrom: 'kilogram',
    defaultTo: 'pound',
    description: 'Convert kilograms, grams, metric tonnes, pounds, ounces, and carats.',
    units: MASS_UNITS,
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'kelvin',
    defaultFrom: 'celsius',
    defaultTo: 'fahrenheit',
    description: 'Accurate thermal conversion across Celsius, Fahrenheit, Kelvin, and Rankine scales.',
    units: TEMPERATURE_UNITS,
  },
  {
    id: 'volume',
    name: 'Volume & Capacity',
    baseUnit: 'liter',
    defaultFrom: 'liter',
    defaultTo: 'gallon',
    description: 'Liquid and dry capacity measurements including liters, gallons, cubic meters, and cups.',
    units: VOLUME_UNITS,
  },
  {
    id: 'speed',
    name: 'Speed & Velocity',
    baseUnit: 'mps',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    description: 'Speed rates across kilometers/hour, miles/hour, knots, and meters/second.',
    units: SPEED_UNITS,
  },
  {
    id: 'time',
    name: 'Time Duration',
    baseUnit: 'second',
    defaultFrom: 'hour',
    defaultTo: 'minute',
    description: 'Duration conversions from milliseconds and seconds up to hours, weeks, and years.',
    units: TIME_UNITS,
  },
  {
    id: 'data',
    name: 'Data Storage',
    baseUnit: 'byte',
    defaultFrom: 'gigabyte',
    defaultTo: 'megabyte',
    description: 'Digital storage sizing across bits, bytes, KB, MB, GB, TB, and PB.',
    units: DATA_UNITS,
  },
];

// ----------------------------------------------------------------------
// MATH.JS COMPATIBILITY & CONVERSION UTILITIES
// ----------------------------------------------------------------------

/**
 * Executes unit conversion directly with math.js unit dimensions.
 * Compatible with all units declared in the registry.
 */
export function convertWithMathJS(
  value: number,
  srcMathjsUnit: string,
  targetMathjsUnit: string
): number {
  if (isNaN(value)) return 0;
  if (srcMathjsUnit === targetMathjsUnit) return value;
  try {
    const parsed = math.unit(value, srcMathjsUnit).to(targetMathjsUnit);
    return parsed.toNumber();
  } catch (err) {
    console.warn(`math.js conversion failed for ${srcMathjsUnit} -> ${targetMathjsUnit}:`, err);
    return 0;
  }
}

/**
 * Returns the list of units registered for a given category.
 * Supports normalization between 'weight' and 'mass'.
 */
export function getUnitsByCategory(category: ConverterCategory | string): UnitDefinition[] {
  const normCategory = category === 'weight' ? 'mass' : category;
  const found = CONVERSION_CATEGORIES.find((c) => c.id === normCategory);
  return found ? found.units : LENGTH_UNITS;
}

/**
 * Returns the category metadata definition by ID.
 */
export function getCategoryMetadata(category: ConverterCategory | string): CategoryMetadata {
  const normCategory = category === 'weight' ? 'mass' : category;
  const found = CONVERSION_CATEGORIES.find((c) => c.id === normCategory);
  return found || CONVERSION_CATEGORIES[0];
}

/**
 * Finds a specific unit definition by its unit ID within a category.
 */
export function findUnitById(
  category: ConverterCategory | string,
  unitId: string
): UnitDefinition | undefined {
  const units = getUnitsByCategory(category);
  return units.find((u) => u.id === unitId);
}

/**
 * Generates human-readable conversion formula string between two units.
 */
export function formatConversionFormula(
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition,
  factor: string
): string {
  if (fromUnit.category === 'temperature') {
    if (fromUnit.id === 'celsius' && toUnit.id === 'fahrenheit') return '°F = (°C × 9/5) + 32';
    if (fromUnit.id === 'fahrenheit' && toUnit.id === 'celsius') return '°C = (°F - 32) × 5/9';
    if (fromUnit.id === 'celsius' && toUnit.id === 'kelvin') return 'K = °C + 273.15';
    if (fromUnit.id === 'kelvin' && toUnit.id === 'celsius') return '°C = K - 273.15';
    if (fromUnit.id === 'fahrenheit' && toUnit.id === 'kelvin') return 'K = (°F - 32) × 5/9 + 273.15';
    if (fromUnit.id === 'rankine' && toUnit.id === 'kelvin') return 'K = °R × 5/9';
    return `${fromUnit.name} to ${toUnit.name} Thermodynamic Formula`;
  }

  return `1 ${fromUnit.symbol} = ${factor} ${toUnit.symbol}`;
}
