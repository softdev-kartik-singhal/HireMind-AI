'use client';

import React from 'react';
import { InterviewPerformanceDimension } from '@/types/analytics';

interface Props {
  data: InterviewPerformanceDimension[];
}

export const InterviewPerformanceChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500">
        No completed interview evaluations recorded yet.
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-400 text-emerald-400';
    if (score >= 70) return 'from-indigo-500 to-purple-400 text-indigo-400';
    if (score >= 55) return 'from-amber-500 to-orange-400 text-amber-400';
    return 'from-rose-500 to-red-400 text-rose-400';
  };

  return (
    <div className="space-y-4" role="region" aria-label="Interview Rubric Performance Breakdown">
      <div className="space-y-3">
        {data.map((dim, idx) => {
          const colorClasses = getScoreColor(dim.score);
          const isAboveBenchmark = dim.score >= dim.benchmark;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{dim.dimension}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[11px] text-slate-400">
                    Bench: {dim.benchmark}%
                  </span>
                  <span className="font-bold text-white">
                    {dim.score}%
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      isAboveBenchmark
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {isAboveBenchmark ? `+${dim.score - dim.benchmark}%` : `${dim.score - dim.benchmark}%`}
                  </span>
                </div>
              </div>

              <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                {/* Score bar */}
                <div
                  className={`h-full bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} rounded-full transition-all duration-500`}
                  style={{ width: `${dim.score}%` }}
                />

                {/* Benchmark vertical pin line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm shadow-black pointer-events-none"
                  style={{ left: `${dim.benchmark}%` }}
                  title={`Benchmark: ${dim.benchmark}%`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
          White line represents hiring benchmark target
        </span>
        <span className="text-purple-300">Weighted Rubric Index</span>
      </div>

      <table className="sr-only">
        <caption>Interview Performance Dimensions and Benchmarks</caption>
        <thead>
          <tr>
            <th>Rubric Dimension</th>
            <th>Average Candidate Score</th>
            <th>Benchmark Target</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.dimension}</td>
              <td>{d.score}%</td>
              <td>{d.benchmark}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
