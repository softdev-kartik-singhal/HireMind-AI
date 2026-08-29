'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CandidateApplication,
  CandidateInterview,
  CandidateTest,
} from '@/lib/dashboard-data';
import {
  Video,
  FileText,
  Code2,
  Award,
  Calendar,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface Props {
  applications: CandidateApplication[];
  interviews: CandidateInterview[];
  tests: CandidateTest[];
  onNavigateTab: (tab: string) => void;
}

export function CandidateDashboardView({
  applications,
  interviews,
  tests,
  onNavigateTab,
}: Props) {
  const nextInterview = interviews[0];
  const pendingTests = tests.filter((t) => t.status === 'Pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Active Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{applications.length}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">+2</span> advanced this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Upcoming Rounds
              </CardTitle>
              <Video className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{interviews.length}</div>
            <p className="text-xs text-slate-400 mt-1">Live technical interviews</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Coding Tests
              </CardTitle>
              <Code2 className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{pendingTests.length}</div>
            <p className="text-xs text-slate-400 mt-1">Pending assessment</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Assessment Average
              </CardTitle>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">93%</div>
            <p className="text-xs text-slate-400 mt-1">Top 5% candidate percentile</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Row: Next Live Interview & Pending Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Scheduled Interview Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-indigo-500/30 bg-slate-900/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Next Milestone
                </span>
                <CardTitle className="text-xl mt-1 text-white">Upcoming Live Interview</CardTitle>
              </div>
              <Badge variant="default" className="gap-1.5 py-1">
                <Clock className="h-3 w-3" />
                {nextInterview?.scheduledAt || 'None scheduled'}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {nextInterview ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white">{nextInterview.role}</h4>
                      <p className="text-xs text-slate-300 font-medium">{nextInterview.company} • {nextInterview.round}</p>
                      <p className="text-xs text-slate-400 mt-1">Interviewer: {nextInterview.interviewer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={nextInterview.meetingLink} target="_blank" rel="noreferrer">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-md">
                          <Video className="h-4 w-4" />
                          Join Live Room
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-500 block">Format:</span>
                      <span className="font-semibold text-slate-200">Live Code Execution</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-500 block">Environment:</span>
                      <span className="font-semibold text-slate-200">TypeScript / Node.js</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-slate-500 block">Duration:</span>
                      <span className="font-semibold text-slate-200">{nextInterview.duration}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No upcoming interviews at the moment.</p>
              )}
            </CardContent>
          </Card>

          {/* Applications Tracker */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Application Statuses</CardTitle>
                <CardDescription>Track your hiring pipeline and next interview stages</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('applications')}
                className="text-xs text-indigo-400 hover:text-indigo-300 gap-1"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-colors gap-3"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-white">{app.jobTitle}</h5>
                      <p className="text-xs text-slate-400 font-medium">{app.company} • {app.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-emerald-400">{app.matchScore}% Match</span>
                        <span className="text-[10px] text-slate-500 block">Applied {app.appliedDate}</span>
                      </div>
                      <Badge variant="default">{app.stage}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Coding Assessments */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4 text-amber-400" />
                Assigned Coding Tests
              </CardTitle>
              <CardDescription>Timed technical screening challenges</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-white leading-tight">{test.title}</h5>
                    <Badge
                      variant={test.status === 'Completed' ? 'success' : 'warning'}
                      className="text-[10px]"
                    >
                      {test.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{test.durationMinutes} mins • {test.difficulty}</span>
                    {test.score ? (
                      <span className="font-bold text-emerald-400">{test.score}/100</span>
                    ) : (
                      <span className="text-amber-400 font-medium">Due {test.dueDate}</span>
                    )}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('tests')}
                className="w-full mt-2 text-xs text-indigo-400"
              >
                Go to Test Center
              </Button>
            </CardContent>
          </Card>

          {/* Competency Readiness Radar */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Technical Competency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Data Structures & Algorithms</span>
                  <span className="text-indigo-400 font-bold">96%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">System Design & Scaling</span>
                  <span className="text-purple-400 font-bold">91%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-300">Full Stack & API Architecture</span>
                  <span className="text-emerald-400 font-bold">94%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
