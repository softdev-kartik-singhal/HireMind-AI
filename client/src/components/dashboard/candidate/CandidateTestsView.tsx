'use client';

import React, { useState } from 'react';
import { CandidateTest } from '@/lib/dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Code2, Clock, CheckCircle2, Play, AlertTriangle, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Props {
  tests: CandidateTest[];
}

export function CandidateTestsView({ tests }: Props) {
  const [selectedTest, setSelectedTest] = useState<CandidateTest | null>(null);
  const { info } = useToast();

  const handleStartTest = (test: CandidateTest) => {
    setSelectedTest(test);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Coding Assessments</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Take-home coding challenges and automated algorithm benchmarks
          </p>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all backdrop-blur-xl flex flex-col justify-between"
          >
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    test.difficulty === 'Hard'
                      ? 'destructive'
                      : test.difficulty === 'Medium'
                      ? 'warning'
                      : 'secondary'
                  }
                  className="text-[10px]"
                >
                  {test.difficulty}
                </Badge>
                <Badge
                  variant={test.status === 'Completed' ? 'success' : 'default'}
                  className="text-[10px]"
                >
                  {test.status}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold text-white leading-snug">
                {test.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {test.category}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {test.durationMinutes} minutes
                </span>
                {test.score ? (
                  <span className="font-bold text-emerald-400">Score: {test.score}/100</span>
                ) : (
                  <span className="text-amber-400">Due: {test.dueDate}</span>
                )}
              </div>

              {test.status === 'Pending' ? (
                <Button
                  onClick={() => handleStartTest(test)}
                  className="w-full gap-2 text-xs"
                >
                  <Play className="h-3.5 w-3.5" />
                  Begin Assessment
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => info(`Detailed rubric breakdown for "${test.title}" loaded.`)}
                  className="w-full text-xs text-slate-300"
                >
                  View Solution & Feedback
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Start Test Confirmation Modal */}
      {selectedTest && (
        <Dialog
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          title={`Start: ${selectedTest.title}`}
          description="Please review the rules before launching the test environment."
        >
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Once started, the {selectedTest.durationMinutes}-minute countdown will begin immediately.
              </span>
            </div>

            <ul className="space-y-2 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Full unit test runner available in-browser
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Multiple submissions allowed until time runs out
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Auto-save enabled on every keystroke
              </li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTest(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const title = selectedTest.title;
                setSelectedTest(null);
                info(`Launching sandbox environment for ${title}... (Coding Sandbox active in Phase 3)`);
              }}
            >
              Confirm & Launch
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
