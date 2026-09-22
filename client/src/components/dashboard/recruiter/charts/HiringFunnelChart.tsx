'use client';

import React from 'react';
import { HiringFunnelStage } from '@/types/analytics';
import { ArrowDown } from 'lucide-react';

interface Props {
  data: HiringFunnelStage[];
}

export const HiringFunnelChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-500">
        No candidate funnel telemetry available.
      </div>
    );
  }

  const stageGradients = [
    'from-purple-600 to-indigo-600',
    'from-indigo-600 to-blue-600',
    'from-blue-600 to-cyan-600',
    'from-cyan-600 to-teal-600',
    'from-teal-600 to-emerald-600',
  ];

  return (
    <div className="space-y-4" role="region" aria-label="Recruitment Hiring Funnel">
      <div className="space-y-2.5">
        {data.map((stage, idx) => {
          const gradient = stageGradients[idx % stageGradients.length];
          const prevStage = idx > 0 ? data[idx - 1] : null;
          const stageConversion = prevStage && prevStage.count > 0
            ? Math.round((stage.count / prevStage.count) * 100)
            : 100;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{stage.stage}</span>
                <div className="flex items-center gap-3 text-[11px]">
                  {idx > 0 && (
                    <span className="text-slate-400 font-mono flex items-center gap-0.5">
                      <ArrowDown className="h-2.5 w-2.5 text-slate-500" />
                      {stageConversion}% pass-through
                    </span>
                  )}
                  <span className="font-bold text-white font-mono">
                    {stage.count} <span className="text-slate-400 font-normal">({stage.percentage}%)</span>
                  </span>
                </div>
              </div>

              {/* Funnel width representation */}
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(stage.percentage, 4)}%` }}
                  title={`${stage.stage}: ${stage.count} candidates (${stage.percentage}% of applicant pool)`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span>Full-funnel pipeline conversion</span>
        <span className="text-emerald-400 font-semibold font-mono">
          {data[data.length - 1]?.percentage}% Final Offer Rate
        </span>
      </div>

      <table className="sr-only">
        <caption>Hiring funnel throughput and drop-off conversion rates</caption>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Candidate Volume</th>
            <th>% of Top-of-Funnel</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={i}>
              <td>{s.stage}</td>
              <td>{s.count}</td>
              <td>{s.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
