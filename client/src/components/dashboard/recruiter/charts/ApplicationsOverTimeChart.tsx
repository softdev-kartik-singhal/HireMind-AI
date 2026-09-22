'use client';

import React, { useState } from 'react';
import { ApplicationsOverTimePoint } from '@/types/analytics';

interface Props {
  data: ApplicationsOverTimePoint[];
}

export const ApplicationsOverTimeChart: React.FC<Props> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500">
        No application timeline records found for this period.
      </div>
    );
  }

  // Dimensions
  const height = 220;
  const width = 500;
  const paddingX = 40;
  const paddingY = 30;

  const maxCount = Math.max(...data.map((d) => d.count), 5);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates (guarantee zero baseline)
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = height - paddingY - (d.count / maxCount) * chartHeight;
    return { x, y, ...d };
  });

  // SVG Path strings
  const linePath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Horizontal Grid Lines (Zero baseline + intermediate steps)
  const yTicks = [0, Math.round(maxCount * 0.5), maxCount];

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden" role="region" aria-label="Applications Over Time Chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="appTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tickVal, idx) => {
            const y = height - paddingY - (tickVal / maxCount) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#appTimeGradient)" />

          {/* Line Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Nodes */}
          {points.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch target */}
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />

              {/* Visible node */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                className={`transition-all duration-150 ${
                  hoveredIndex === i
                    ? 'fill-purple-300 stroke-purple-600 stroke-2'
                    : 'fill-purple-400 stroke-slate-950 stroke-2'
                }`}
              />

              {/* Bottom Date Label */}
              <text
                x={p.x}
                y={height - paddingY + 16}
                textAnchor="middle"
                className={`text-[9px] transition-colors ${
                  hoveredIndex === i ? 'fill-purple-300 font-bold' : 'fill-slate-500'
                }`}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-purple-500/40 shadow-xl backdrop-blur-md text-[11px] font-sans"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
              marginTop: '-8px',
            }}
          >
            <span className="text-slate-400 block text-[10px]">{points[hoveredIndex].label}</span>
            <span className="text-white font-bold text-xs">{points[hoveredIndex].count} Applicants</span>
          </div>
        )}
      </div>

      {/* Screen reader fallback table for accessibility */}
      <table className="sr-only">
        <caption>Applications received over time</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Number of Applicants</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.label}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
