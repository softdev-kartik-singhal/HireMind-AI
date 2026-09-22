'use client';

import React, { useState } from 'react';
import { ScoreDistributionBucket } from '@/types/analytics';

interface Props {
  data: ScoreDistributionBucket[];
}

export const ScoreDistributionChart: React.FC<Props> = ({ data }) => {
  const [hoveredBucket, setHoveredBucket] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500">
        No candidate score data available.
      </div>
    );
  }

  const height = 220;
  const width = 480;
  const paddingX = 35;
  const paddingY = 35;

  const maxCount = Math.max(...data.map((d) => d.count), 5);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case '0-49':
        return {
          fill: '#f43f5e',
          hoverFill: '#fb7185',
          border: '#e11d48',
          text: 'text-rose-400',
        };
      case '50-69':
        return {
          fill: '#f59e0b',
          hoverFill: '#fbbf24',
          border: '#d97706',
          text: 'text-amber-400',
        };
      case '70-84':
        return {
          fill: '#6366f1',
          hoverFill: '#818cf8',
          border: '#4f46e5',
          text: 'text-indigo-400',
        };
      case '85-100':
      default:
        return {
          fill: '#10b981',
          hoverFill: '#34d399',
          border: '#059669',
          text: 'text-emerald-400',
        };
    }
  };

  const barWidth = (chartWidth / data.length) * 0.55;
  const gap = chartWidth / data.length;

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden" role="region" aria-label="Candidate Score Distribution Chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Y Axis Grid lines */}
          {[0, Math.round(maxCount * 0.5), maxCount].map((tickVal, idx) => {
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

          {/* Bars */}
          {data.map((item, i) => {
            const colors = getBucketColor(item.bucket);
            const isHovered = hoveredBucket === item.bucket;
            const barHeight = Math.max((item.count / maxCount) * chartHeight, 4);
            const x = paddingX + i * gap + (gap - barWidth) / 2;
            const y = height - paddingY - barHeight;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredBucket(item.bucket)}
                onMouseLeave={() => setHoveredBucket(null)}
                className="cursor-pointer"
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={isHovered ? colors.hoverFill : colors.fill}
                  className="transition-all duration-150"
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* Count label above bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-bold ${
                    isHovered ? 'fill-white' : 'fill-slate-400'
                  }`}
                >
                  {item.count} ({item.percentage}%)
                </text>

                {/* X Axis Bucket Range Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered ? 'fill-white font-bold' : 'fill-slate-400'
                  }`}
                >
                  {item.bucket}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] pt-1">
          {data.map((item) => {
            const colors = getBucketColor(item.bucket);
            return (
              <span key={item.bucket} className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: colors.fill }}
                />
                {item.label}
              </span>
            );
          })}
        </div>
      </div>

      <table className="sr-only">
        <caption>Candidate Score Distribution Table</caption>
        <thead>
          <tr>
            <th>Score Bracket</th>
            <th>Candidate Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.bucket}>
              <td>{d.label} ({d.bucket})</td>
              <td>{d.count}</td>
              <td>{d.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
