'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { DashboardApi, LiveInterview, LiveCodingTest } from '@/lib/api-dashboard';
import { JobApi } from '@/lib/api-jobs';
import { Application } from '@/types/job';
import {
  Briefcase,
  Calendar,
  Code2,
  Award,
  Video,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  FileUp,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export function CandidateDashboardView({ onNavigateTab }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applicationsCount: 0,
    upcomingInterviewsCount: 0,
    assignedTestsCount: 0,
    averageScore: 94,
  });
  const [interviews, setInterviews] = useState<LiveInterview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tests, setTests] = useState<LiveCodingTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLiveDashboard() {
      try {
        setIsLoading(true);
        const [liveStats, liveInterviews, liveApps, liveTests] = await Promise.all([
          DashboardApi.getCandidateAnalytics(),
          DashboardApi.getInterviews(),
          JobApi.getMyApplications(),
          DashboardApi.getCodingTests(),
        ]);

        if (liveStats) setStats(liveStats);
        setInterviews(liveInterviews);
        setApplications(liveApps);
        setTests(liveTests);
      } catch (err) {
        console.error('Failed to load candidate live data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveDashboard();
  }, []);

  const nextInterview = interviews[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 via-slate-900/60 to-purple-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold tracking-wide border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Live Candidate Portal (Supabase Connected)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{user?.name || 'Engineer'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your technical assessment telemetry, upcoming coding chambers, and application pipeline updates are synchronized with the live PostgreSQL database.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => onNavigateTab('jobs')}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
            >
              Explore Tech Jobs
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigateTab('resumes')}
              className="gap-2 border-indigo-500/30 bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/50 hover:text-white"
            >
              <FileUp className="h-4 w-4 text-indigo-400" />
              Manage Resumes
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigateTab('applications')}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              My Applications
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Applications
            </CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.applicationsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Live pipeline stages synced</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 hover:border-purple-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Interviews
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.upcomingInterviewsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {nextInterview ? `Next: in ${nextInterview.durationMins}m` : 'No rounds today'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 hover:border-amber-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Assessments
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Code2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.assignedTestsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Algorithm & System Design</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assessment Score
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {stats.averageScore}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Top 5% Technical Percentile</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Interview Chamber Spotlight */}
      {nextInterview ? (
        <Card className="border-indigo-500/30 bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="role" roleType="CANDIDATE">
                  {nextInterview.type.replace('_', ' ')}
                </Badge>
                <Badge variant="success">CONFIRMED ROUND</Badge>
              </div>
              <h3 className="text-lg font-bold text-white">{nextInterview.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                  {nextInterview.job.title}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-purple-400" />
                  {formatDate(nextInterview.scheduledAt)} ({nextInterview.durationMins} mins)
                </span>
              </div>
            </div>
            <Button
              onClick={() => onNavigateTab('interviews')}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-lg shadow-emerald-500/20"
            >
              <Video className="h-4 w-4" />
              Open Live Chamber
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Recent Applications & Pending Tests Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications List */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-white">Application Pipeline</CardTitle>
              <CardDescription>Live status updates from hiring managers</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab('applications')} className="text-xs text-indigo-400">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No applications submitted yet.</p>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <div>
                    <h4 className="font-bold text-white text-xs">{app.job?.title}</h4>
                    <span className="text-[11px] text-slate-400">{app.job?.department} • Applied {formatDate(app.createdAt)}</span>
                  </div>
                  <Badge variant={app.status === 'SELECTED' ? 'success' : app.status === 'INTERVIEW' ? 'role' : 'default'} roleType="CANDIDATE">
                    {app.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tests List */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-white">Assigned Technical Tests</CardTitle>
              <CardDescription>Live take-home coding challenges</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab('tests')} className="text-xs text-indigo-400">
              Open Sandbox
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No tests currently assigned.</p>
            ) : (
              tests.slice(0, 3).map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-xs">{test.title}</h4>
                    <span className="text-[11px] text-slate-400">{test.category} • {test.durationMinutes} mins</span>
                  </div>
                  <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                    {test.difficulty}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
