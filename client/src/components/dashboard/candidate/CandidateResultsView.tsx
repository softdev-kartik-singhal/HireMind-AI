'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export function CandidateResultsView() {
  const completedEvaluations = [
    {
      id: 'eval-1',
      round: 'Dynamic Graph Traversal & Rate Limiter',
      company: 'Stripe',
      date: 'Aug 26, 2026',
      totalScore: 95,
      rubrics: [
        { name: 'Time & Space Complexity (Big-O)', score: 98, max: 100 },
        { name: 'Edge Case Resilience', score: 92, max: 100 },
        { name: 'Code Modularity & Readability', score: 96, max: 100 },
        { name: 'Live Problem-Solving Velocity', score: 94, max: 100 },
      ],
      interviewerSummary:
        'Outstanding approach to token bucket algorithm and sliding window rate limiting. Demonstrated deep understanding of lock-free concurrency and distributed key eviction.',
    },
    {
      id: 'eval-2',
      round: 'Multi-Tenant PostgreSQL Index Tuning',
      company: 'Cloudflare',
      date: 'Aug 22, 2026',
      totalScore: 91,
      rubrics: [
        { name: 'Query Plan Analysis (EXPLAIN ANALYZE)', score: 95, max: 100 },
        { name: 'BRIN vs B-Tree Selection', score: 90, max: 100 },
        { name: 'Partitioning Strategy', score: 88, max: 100 },
      ],
      interviewerSummary:
        'Great clarity on partial index mechanics and zero-downtime schema migrations. Highly recommended for Senior Distributed Systems roles.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Interview Evaluations & Scorecards</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed rubric feedback and benchmark scores across technical rounds
        </p>
      </div>

      {/* Scorecards Grid */}
      <div className="space-y-6">
        {completedEvaluations.map((item) => (
          <Card
            key={item.id}
            className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="role" roleType="CANDIDATE">{item.company}</Badge>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <CardTitle className="text-lg text-white">{item.round}</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{item.totalScore}/100</span>
                    <span className="text-[10px] text-slate-400 block">Overall Score</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Rubric Breakdown Progress Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.rubrics.map((r, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{r.name}</span>
                      <span className="text-indigo-400">{r.score}/{r.max}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Summary */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Interviewer Evaluation Summary</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{item.interviewerSummary}&rdquo;
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
