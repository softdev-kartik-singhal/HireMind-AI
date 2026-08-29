'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardApi, LiveAssessmentResult } from '@/lib/api-dashboard';
import { Award, CheckCircle2, Star, TrendingUp, User, Briefcase, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function CandidateResultsView() {
  const [results, setResults] = useState<LiveAssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await DashboardApi.getAssessmentResults();
      setResults(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Interview Evaluations & Technical Rubrics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed breakdown of computational complexity, code modularity, architecture design, and hiring panel feedback
        </p>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No evaluation scorecards yet"
          description="Once your technical interviews and coding challenges are reviewed by interviewers, your rubrics will be published here."
        />
      ) : (
        <div className="space-y-6">
          {results.map((res) => (
            <Card
              key={res.id}
              className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">EVALUATION COMPLETE</Badge>
                    <Badge variant="role" roleType="CANDIDATE">{res.recommendation.replace('_', ' ')}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {res.application?.job?.title || 'Technical Assessment Round'}
                  </h3>
                  <span className="text-xs text-slate-400 block">
                    Evaluated by {res.evaluator?.name} • Published {formatDate(res.createdAt)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center sm:text-right shrink-0">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block">
                    Overall Rubric Score
                  </span>
                  <span className="text-3xl font-black text-emerald-400 block mt-0.5">
                    {res.overallScore}%
                  </span>
                </div>
              </div>

              {/* Rubric Criteria Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">Asymptotic Complexity</span>
                  <div className="flex items-center justify-between">
                    <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden mr-3">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${res.complexityScore}%` }} />
                    </div>
                    <span className="text-sm font-bold text-white">{res.complexityScore}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Optimal Big-O time and space trade-offs</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">Code Modularity & Cleanliness</span>
                  <div className="flex items-center justify-between">
                    <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden mr-3">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${res.modularityScore}%` }} />
                    </div>
                    <span className="text-sm font-bold text-white">{res.modularityScore}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Separation of concerns & type safety</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">System Architecture & Scalability</span>
                  <div className="flex items-center justify-between">
                    <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden mr-3">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${res.systemDesignScore}%` }} />
                    </div>
                    <span className="text-sm font-bold text-white">{res.systemDesignScore}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Resilient partitioning & failure handling</span>
                </div>
              </div>

              {/* Rubric Summary & Interviewer Notes */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Panel Evaluation Summary
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                    {res.rubricSummary}
                  </p>
                </div>

                {res.interviewerNotes && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Interviewer Internal Notes
                    </h4>
                    <p className="text-xs text-slate-400 italic p-3 rounded-lg bg-slate-950/30 border border-slate-800/80">
                      &ldquo;{res.interviewerNotes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
