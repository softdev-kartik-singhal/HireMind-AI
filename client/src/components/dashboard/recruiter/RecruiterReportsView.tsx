'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function RecruiterReportsView() {
  const { success } = useToast();

  const reports = [
    {
      id: 'rep-1',
      title: 'Q3 Technical Assessment Performance Report',
      dateRange: 'Jul 1 - Aug 28, 2026',
      totalEvaluated: 142,
      avgScore: '89.2%',
      topSkills: 'TypeScript, PostgreSQL, Distributed Systems',
    },
    {
      id: 'rep-2',
      title: 'Engineering Hiring Velocity & Conversion Funnel',
      dateRange: 'Last 30 Days',
      totalEvaluated: 86,
      avgScore: '92.4%',
      topSkills: 'Go, Kubernetes, LLM Deployment',
    },
    {
      id: 'rep-3',
      title: 'Live Coding Rubric Consistency Audit',
      dateRange: 'Aug 2026',
      totalEvaluated: 34,
      avgScore: '94.0%',
      topSkills: 'Algorithm Optimization, Clean Code',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Hiring & Assessment Reports</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export structured hiring audit trails, candidate score distributions, and panel feedback
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((rep) => (
          <Card
            key={rep.id}
            className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700 transition-all p-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="role" roleType="RECRUITER">Export Ready</Badge>
                  <span className="text-xs text-slate-500">{rep.dateRange}</span>
                </div>
                <h3 className="text-base font-bold text-white">{rep.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>Evaluated: <strong className="text-slate-200">{rep.totalEvaluated} candidates</strong></span>
                  <span>Avg Quality: <strong className="text-emerald-400">{rep.avgScore}</strong></span>
                  <span>Core Focus: <strong className="text-purple-300">{rep.topSkills}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => success(`Exported "${rep.title}" (CSV/PDF generated)`)}
                  className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Report
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RecruiterAnalyticsView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">Recruitment & Hiring Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Metrics on time-to-hire, pass rates, sourcing channels, and interview efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-500/20 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Time to Fill (Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">14.2 Days</div>
            <p className="text-xs text-emerald-400 mt-1">42% faster than industry benchmark</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/20 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Technical Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">38.5%</div>
            <p className="text-xs text-slate-400 mt-1">High bar calibrated across rubrics</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-slate-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Offer Acceptance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">91.7%</div>
            <p className="text-xs text-emerald-400 mt-1">11/12 offers accepted this quarter</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Channel Quality Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Direct Inbound AI Platform</span>
              <span className="text-indigo-400 font-bold">54% (96% avg rating)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: '54%' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Internal Employee Referrals</span>
              <span className="text-purple-400 font-bold">32% (98% avg rating)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: '32%' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Outbound Talent Sourcing</span>
              <span className="text-emerald-400 font-bold">14% (89% avg rating)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '14%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function RecruiterSettingsView() {
  const { success } = useToast();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">Recruitment Workspace Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure interview rubric standards, notifications, and candidate feedback policies
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white">Evaluation Standards</CardTitle>
          <CardDescription>Default weighting for automated scoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Auto-Invite for 90%+ Matches</span>
              <span className="text-slate-400">Instantly trigger technical screening when candidate passes threshold</span>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded bg-slate-800 text-purple-600" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Shared Live IDE Sandboxes</span>
              <span className="text-slate-400">Allow candidates to execute live unit test runners in browser</span>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded bg-slate-800 text-purple-600" />
          </div>

          <Button
            size="sm"
            onClick={() => success('Recruitment preferences saved')}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
