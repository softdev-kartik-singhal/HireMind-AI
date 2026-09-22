'use client';

import React from 'react';
import { SkillDistributionItem } from '@/types/analytics';

interface Props {
  data: SkillDistributionItem[];
}

export const SkillDistributionChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500">
        No skill distribution telemetry available.
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Skill Distribution and Demand Comparison">
      <div className="space-y-3">
        {data.slice(0, 7).map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{item.skill}</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-400">
                  Demand: <strong className="text-purple-300 font-mono">{item.demandCount}</strong> jobs
                </span>
                <span className="text-slate-400">
                  Pool Match: <strong className="text-emerald-400 font-mono">{item.matchPercentage}%</strong>
                </span>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${item.matchPercentage}%` }}
                title={`${item.skill}: ${item.matchPercentage}% candidate competency match`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span>Verified candidate profile & resume skills</span>
        <span className="text-emerald-400 font-semibold">High Competency Alignment</span>
      </div>

      <table className="sr-only">
        <caption>Skills demanded across requisitions and candidate match percentages</caption>
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Job Demand</th>
            <th>Candidate Match %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={i}>
              <td>{s.skill}</td>
              <td>{s.demandCount}</td>
              <td>{s.matchPercentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
