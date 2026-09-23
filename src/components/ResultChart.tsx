import React from 'react';

interface ResultChartProps {
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
  };
  title?: string;
}

export const ResultChart: React.FC<ResultChartProps> = ({ data, title }) => {
  const { labels, values, colors } = data;
  const total = values.reduce((sum, val) => sum + (isNaN(val) ? 0 : Math.max(0, val)), 0);

  if (total <= 0 || values.length === 0) return null;

  const defaultPalette = [
    '#2563eb', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
  ];

  const chartColors = colors && colors.length === values.length ? colors : defaultPalette;

  // Calculate SVG donut segments
  let cumulativeAngle = 0;
  const radius = 60;
  const strokeWidth = 28;
  const center = 80;
  const circumference = 2 * Math.PI * radius;

  const segments = values.map((val, idx) => {
    const safeVal = Math.max(0, val);
    const fraction = safeVal / total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      label: labels[idx],
      value: safeVal,
      fraction,
      percentage: (fraction * 100).toFixed(1),
      color: chartColors[idx % chartColors.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700/80 text-white">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          {title}
        </h4>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#334155"
              strokeWidth={strokeWidth}
            />
            {/* Value segments */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500 ease-out"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
            <span className="text-xs font-extrabold text-white">100%</span>
          </div>
        </div>

        {/* Legend with percentages and amounts */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-md shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-300 font-medium">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white">{seg.percentage}%</span>
                <span className="text-[10px] text-slate-400 ml-1.5">
                  ({seg.value.toLocaleString()})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
