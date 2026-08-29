'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardApi, LiveCodingTest } from '@/lib/api-dashboard';
import { Code2, Clock, CheckCircle2, Play, Layers, AlertCircle, FileCode } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function CandidateTestsView() {
  const [tests, setTests] = useState<LiveCodingTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testToStart, setTestToStart] = useState<LiveCodingTest | null>(null);
  const { info } = useToast();

  const fetchTests = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await DashboardApi.getCodingTests();
      setTests(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleLaunchTest = () => {
    if (!testToStart) return;
    info(`Starting Sandbox Assessment: ${testToStart.title}`);
    setTestToStart(null);
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'HARD':
        return <Badge variant="destructive">HARD</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM</Badge>;
      default:
        return <Badge variant="success">EASY</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Technical Coding Assessments & Sandboxes</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Standardized algorithmic, concurrency, and distributed systems evaluations with automated test suites
        </p>
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : tests.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No coding assessments assigned"
          description="When an engineering team assigns a take-home assessment or live sandbox challenge, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-amber-500/40 transition-all backdrop-blur-xl flex flex-col justify-between shadow-xl"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {test.category}
                  </span>
                  {getDifficultyBadge(test.difficulty)}
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-white">{test.title}</CardTitle>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                    {test.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    {test.durationMinutes} Minutes Allotted
                  </span>
                  <span className="text-slate-500">{test.testCasesCount} Automated Test Cases</span>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                    Passing: {test.passingScore}%
                  </Badge>

                  <Button
                    size="sm"
                    onClick={() => setTestToStart(test)}
                    className="gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs shadow-lg shadow-amber-500/20"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Start Test Confirmation Modal */}
      {testToStart && (
        <Dialog
          isOpen={!!testToStart}
          onClose={() => setTestToStart(null)}
          title={`Start Assessment: ${testToStart.title}`}
          description={`You will have ${testToStart.durationMinutes} minutes once the sandbox environment initializes.`}
        >
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-white">{testToStart.durationMinutes} mins (Strict Timer)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Passing Score:</span>
                <span className="font-bold text-emerald-400">{testToStart.passingScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sandbox Environment:</span>
                <span className="font-bold text-white">Monaco Code Editor + Node.js/Go Runtime</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setTestToStart(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleLaunchTest} className="bg-amber-600 hover:bg-amber-500 text-white gap-1.5">
              <Play className="h-3.5 w-3.5" />
              Begin Challenge
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
