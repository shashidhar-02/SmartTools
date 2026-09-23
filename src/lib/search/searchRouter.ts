import { TOOLS_REGISTRY } from '../../data/toolsRegistry';
import { ToolDefinition } from '../../types';

export interface ParsedSearchIntent {
  query: string;
  isDirectMatch: boolean;
  confidence: number; // 0 to 1
  matchedTool: ToolDefinition | null;
  matchedIntent: string;
  extractedInputs?: Record<string, any>;
  suggestedTools: ToolDefinition[];
  reason: string;
}

// Intent patterns with structured input extractors
export const parseNaturalSearchQuery = (rawQuery: string): ParsedSearchIntent => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return {
      query: '',
      isDirectMatch: false,
      confidence: 0,
      matchedTool: null,
      matchedIntent: '',
      suggestedTools: TOOLS_REGISTRY.filter((t) => t.popular).slice(0, 5),
      reason: 'Empty search query',
    };
  }

  // 1. Percentage: "what is 15 percent of 800" or "25% of 400" or "15% 800"
  const percentRegex = /(?:what\s+is\s+)?(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of\s*)?(\d+(?:\.\d+)?)/i;
  const percentMatch = query.match(percentRegex);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const tool = TOOLS_REGISTRY.find((t) => t.id === 'percentage');
    if (tool) {
      return {
        query,
        isDirectMatch: true,
        confidence: 0.98,
        matchedTool: tool,
        matchedIntent: `Calculate ${percent}% of ${total}`,
        extractedInputs: { percent, total, calculated: (percent / 100) * total },
        suggestedTools: [tool],
        reason: 'Structured percentage pattern detected with inputs',
      };
    }
  }

  // 2. Tile quantity: "how much tile for 12x15 room" or "tiles for 10x12" or "how many tiles do i need"
  const tileRoomRegex = /(?:tiles?|flooring)\s*(?:for\s*)?(\d+(?:\.\d+)?)\s*(?:x|\*|by)\s*(\d+(?:\.\d+)?)/i;
  const tileRoomMatch = query.match(tileRoomRegex);
  if (tileRoomMatch) {
    const length = parseFloat(tileRoomMatch[1]);
    const width = parseFloat(tileRoomMatch[2]);
    const tool = TOOLS_REGISTRY.find((t) => t.id === 'tiles-flooring' || t.id === 'room-area');
    if (tool) {
      return {
        query,
        isDirectMatch: true,
        confidence: 0.96,
        matchedTool: tool,
        matchedIntent: `Tile flooring for ${length}ft × ${width}ft room (${length * width} sq ft)`,
        extractedInputs: { roomLengthFt: length, roomWidthFt: width, areaSqFt: length * width },
        suggestedTools: [tool],
        reason: 'Tile room dimension dimensions detected',
      };
    }
  }

  // 3. BMI: "75 kg 178 cm" or "178cm 75kg bmi" or "bmi 70 kg 1.75m"
  const bmiRegex = /(\d+(?:\.\d+)?)\s*(?:kg|kgs)\s*(\d+(?:\.\d+)?)\s*(?:cm|cms|m|meter)/i;
  const bmiRegexAlt = /(\d+(?:\.\d+)?)\s*(?:cm|cms|m|meter)\s*(\d+(?:\.\d+)?)\s*(?:kg|kgs)/i;
  const bmiMatch = query.match(bmiRegex) || query.match(bmiRegexAlt);
  if (bmiMatch || query === 'bmi' || query.startsWith('bmi ') || query.includes('body mass index')) {
    const tool = TOOLS_REGISTRY.find((t) => t.id === 'bmi');
    if (tool) {
      let extracted: Record<string, any> | undefined;
      if (bmiMatch) {
        let weight = parseFloat(bmiMatch[1]);
        let height = parseFloat(bmiMatch[2]);
        // Normalize if height was first
        if (query.match(bmiRegexAlt)) {
          height = parseFloat(bmiMatch[1]);
          weight = parseFloat(bmiMatch[2]);
        }
        if (height < 3) height = height * 100; // if in meters
        const heightM = height / 100;
        const calculatedBmi = weight / (heightM * heightM);
        extracted = { weightKg: weight, heightCm: height, bmi: calculatedBmi.toFixed(1) };
      }
      return {
        query,
        isDirectMatch: true,
        confidence: 0.98,
        matchedTool: tool,
        matchedIntent: extracted ? `BMI for ${extracted.weightKg}kg and ${extracted.heightCm}cm` : 'Body Mass Index calculation',
        extractedInputs: extracted,
        suggestedTools: [tool],
        reason: 'Direct BMI intent match',
      };
    }
  }

  // 4. Loan EMI with Indian / Western inputs: "loan 30 lakh 8.2 20 years" or "emi 500000 9% 5 years"
  const loanRegex = /(?:loan|emi)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|lac|k|m|million)?\s*(\d+(?:\.\d+)?)\s*(?:%|percent)?\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?|months?)?/i;
  const loanMatch = query.match(loanRegex);
  if (loanMatch && (query.includes('lakh') || query.includes('emi') || query.includes('loan'))) {
    let principal = parseFloat(loanMatch[1]);
    if (query.includes('lakh') || query.includes('lac')) principal = principal * 100000;
    const rate = parseFloat(loanMatch[2]);
    const tenureYears = parseFloat(loanMatch[3]);
    const tool = TOOLS_REGISTRY.find((t) => t.id === 'emi');
    if (tool) {
      return {
        query,
        isDirectMatch: true,
        confidence: 0.95,
        matchedTool: tool,
        matchedIntent: `EMI for Loan ₹${principal.toLocaleString()} at ${rate}% for ${tenureYears} years`,
        extractedInputs: { principal, rate, tenureYears },
        suggestedTools: [tool],
        reason: 'Loan parameters recognized in natural language query',
      };
    }
  }

  // 5. Download Time: "how long to download 20GB at 100Mbps" or "download 50gb 50mbps"
  const downloadRegex = /(?:download\s*(?:time\s*)?)?(\d+(?:\.\d+)?)\s*(?:gb|mb|tb)\s*(?:at\s*)?(\d+(?:\.\d+)?)\s*(?:mbps|gbps|kbps)/i;
  const downloadMatch = query.match(downloadRegex);
  if (downloadMatch && (query.includes('download') || query.includes('mbps') || query.includes('gb'))) {
    const sizeGb = parseFloat(downloadMatch[1]);
    const speedMbps = parseFloat(downloadMatch[2]);
    const tool = TOOLS_REGISTRY.find((t) => t.id === 'download-time');
    if (tool) {
      const sizeBits = sizeGb * 1024 * 8; // Mb
      const seconds = sizeBits / speedMbps;
      return {
        query,
        isDirectMatch: true,
        confidence: 0.97,
        matchedTool: tool,
        matchedIntent: `Download ${sizeGb}GB at ${speedMbps}Mbps (${Math.round(seconds / 60)} min)`,
        extractedInputs: { sizeGb, speedMbps, durationSec: Math.round(seconds) },
        suggestedTools: [tool],
        reason: 'Data size and bandwidth download query matched',
      };
    }
  }

  // 6. Direct Intent Dictionary (High Confidence exact routing)
  const DIRECT_INTENT_MAP: Record<string, { toolId: string; intent: string }> = {
    'emi': { toolId: 'emi', intent: 'Equated Monthly Installment calculation' },
    'emi calculator': { toolId: 'emi', intent: 'Equated Monthly Installment calculation' },
    'home loan emi': { toolId: 'emi', intent: 'Home Loan monthly repayment calculation' },
    'car loan emi': { toolId: 'emi', intent: 'Automobile vehicle loan EMI' },
    'personal loan emi': { toolId: 'emi', intent: 'Personal loan EMI schedule' },
    'sip': { toolId: 'sip', intent: 'Systematic Investment Plan compounding returns' },
    'sip calculator': { toolId: 'sip', intent: 'Mutual fund SIP future value' },
    'tdee': { toolId: 'bmr-tdee', intent: 'Total Daily Energy Expenditure' },
    'tdee calculator': { toolId: 'bmr-tdee', intent: 'Maintenance calories and daily burn' },
    'bmr': { toolId: 'bmr-tdee', intent: 'Basal Metabolic Rate calculation' },
    'bmr calculator': { toolId: 'bmr-tdee', intent: 'Resting energy expenditure' },
    'calorie deficit': { toolId: 'calorie-deficit', intent: 'Target fat loss calorie deficit' },
    '1rm': { toolId: 'one-rep-max', intent: 'One Rep Maximum strength test' },
    'one rep max': { toolId: 'one-rep-max', intent: 'One Rep Maximum strength test' },
    'plate calculator': { toolId: 'plate-calculator', intent: 'Olympic barbell plate loading math' },
    'running pace': { toolId: 'running-pace', intent: 'Pace in min/km and min/mile' },
    'tile calculator': { toolId: 'tiles-flooring', intent: 'Room tiles and boxes needed' },
    'how many tiles do i need': { toolId: 'tiles-flooring', intent: 'Floor tile quantity with wastage' },
    'tile cost': { toolId: 'tiles-flooring', intent: 'Floor and wall tile material pricing' },
    'concrete': { toolId: 'concrete', intent: 'Concrete volume and cement bags' },
    'concrete calculator': { toolId: 'concrete', intent: 'Slab and footing concrete cubic yards' },
    'paint calculator': { toolId: 'paint-calc', intent: 'Wall painting coverage in liters' },
    'brick calculator': { toolId: 'brick-cement', intent: 'Masonry wall bricks and mortar count' },
    'percentage': { toolId: 'percentage', intent: 'Percentage difference and increase' },
    'percentage calculator': { toolId: 'percentage', intent: 'Percentage difference and increase' },
    'cgpa': { toolId: 'cgpa', intent: 'CGPA to percentage and GPA conversion' },
    'attendance': { toolId: 'attendance', intent: 'Required lecture attendance percentage' },
    'fuel cost': { toolId: 'fuel-cost', intent: 'Trip fuel cost and vehicle mileage' },
    'download time': { toolId: 'download-time', intent: 'File download ETA and speed' },
    'mean median mode': { toolId: 'statistics', intent: 'Statistical central tendency' },
    'age': { toolId: 'age', intent: 'Exact chronological age calculator' },
    'age calculator': { toolId: 'age', intent: 'Exact chronological age calculator' },
    'gst': { toolId: 'gst', intent: 'Goods & Services Tax inclusive/exclusive' },
    'gst calculator': { toolId: 'gst', intent: 'GST tax breakdown' },
    'salary hike': { toolId: 'salary-hike', intent: 'Appraisal increment percentage' },
    'ctc to in hand': { toolId: 'ctc-to-in-hand', intent: 'Take-home salary after PF and tax' },
    'scientific': { toolId: 'scientific', intent: 'Trigonometric and logarithmic calculations' },
  };

  if (DIRECT_INTENT_MAP[query]) {
    const match = DIRECT_INTENT_MAP[query];
    const tool = TOOLS_REGISTRY.find((t) => t.id === match.toolId);
    if (tool) {
      return {
        query,
        isDirectMatch: true,
        confidence: 1.0,
        matchedTool: tool,
        matchedIntent: match.intent,
        suggestedTools: [tool],
        reason: 'Exact alias / query match in intent dictionary',
      };
    }
  }

  // 7. Keyword Fuzzy Matching & Confidence Scoring
  const ranked = TOOLS_REGISTRY.map((tool) => {
    let score = 0;
    const nameLower = tool.name.toLowerCase();
    const shortLower = (tool.shortName || '').toLowerCase();
    const slugLower = (tool.slug || '').toLowerCase();
    const descLower = tool.description.toLowerCase();

    if (nameLower === query || shortLower === query || slugLower === query) {
      score += 1.0;
    } else if (nameLower.startsWith(query) || shortLower.startsWith(query)) {
      score += 0.85;
    } else if (nameLower.includes(query)) {
      score += 0.7;
    }

    // Keyword match
    tool.keywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      if (kwLower === query) score = Math.max(score, 0.95);
      else if (query.includes(kwLower)) score = Math.max(score, 0.75);
      else if (kwLower.includes(query)) score = Math.max(score, 0.6);
    });

    // Word token overlap
    const queryTokens = query.split(/\s+/).filter(Boolean);
    let tokenHits = 0;
    queryTokens.forEach((token) => {
      if (nameLower.includes(token) || descLower.includes(token) || tool.keywords.some((k) => k.toLowerCase().includes(token))) {
        tokenHits++;
      }
    });
    if (queryTokens.length > 0) {
      const tokenScore = (tokenHits / queryTokens.length) * 0.7;
      score = Math.max(score, tokenScore);
    }

    return { tool, score };
  })
    .filter((item) => item.score > 0.3)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    const best = ranked[0];
    const isDirect = best.score >= 0.85;
    return {
      query,
      isDirectMatch: isDirect,
      confidence: best.score,
      matchedTool: best.tool,
      matchedIntent: best.tool.description,
      suggestedTools: ranked.slice(0, 5).map((r) => r.tool),
      reason: isDirect ? 'High confidence keyword score' : 'Ranked relevance matches',
    };
  }

  // 8. No Matching Tool
  return {
    query,
    isDirectMatch: false,
    confidence: 0,
    matchedTool: null,
    matchedIntent: 'No matching calculator discovered yet',
    suggestedTools: TOOLS_REGISTRY.filter((t) => t.popular).slice(0, 4),
    reason: 'Query does not match any current calculator intent. Logged for demand discovery.',
  };
};
