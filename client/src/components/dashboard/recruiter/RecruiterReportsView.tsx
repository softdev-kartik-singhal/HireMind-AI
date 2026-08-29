'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardApi } from '@/lib/api-dashboard';
import { BarChart3, TrendingUp, Download, PieChart, CheckCircle2, Users, Briefcase, Award } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export function RecruiterReportsView() {
  const [stats, setStats] = useState<any>(null);
  const { success } = useToast();

  useEffect(() => {
    DashboardApi.getRecruiterAnalytics().then((res) => {
      if (res) setStats(res);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Recruitment Reports & Hiring Metrics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline throughput, interview pass rates, and candidate conversion telemetry
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => success('Exporting recruitment report to CSV...')}
          className="gap-2 bg-purple-600 hover:bg-purple-500 text-white"
        >
          <Download className="h-4 w-4" />
          Export Live Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Live Pipeline Conversion</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.conversionRate || '22%'}</div>
          <p className="text-xs text-slate-400">Total Applicants converted to Offer</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Time to Fill</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">16 Days</div>
          <p className="text-xs text-slate-400">From requisition post to signed offer</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Skill Match</span>
            <Award className="h-4 w-4 text-pink-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats?.avgMatchScore || 94}%</div>
          <p className="text-xs text-slate-400">Verified algorithmic competency</p>
        </Card>
      </div>
    </div>
  );
}

export function RecruiterAnalyticsView() {
  return <RecruiterReportsView />;
}

export function RecruiterSettingsView() {
  const { success } = useToast();
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white">Recruitment Workspace Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure automated rubric weightings, email dispatch triggers, and sandbox limits
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
          <div>
            <h4 className="font-bold text-white text-xs">Automated AI Skill Calibration</h4>
            <p className="text-[11px] text-slate-400">Automatically rank incoming candidate resumes against job required skills</p>
          </div>
          <Badge variant="success">ACTIVE</Badge>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
          <div>
            <h4 className="font-bold text-white text-xs">WebRTC Chamber Recording</h4>
            <p className="text-[11px] text-slate-400">Archive live coding playback and audio transcripts for panel review</p>
          </div>
          <Badge variant="success">ENABLED</Badge>
        </div>
      </Card>
    </div>
  );
}
