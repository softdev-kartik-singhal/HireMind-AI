'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { DashboardApi, LiveInterview } from '@/lib/api-dashboard';
import { JobApi } from '@/lib/api-jobs';
import { Job } from '@/types/job';
import {
  Briefcase,
  Users,
  Video,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  onNavigateTab: (tab: string) => void;
  onOpenCreateJob: () => void;
  onOpenScheduleInterview: () => void;
}

export function RecruiterDashboardView({
  onNavigateTab,
  onOpenCreateJob,
  onOpenScheduleInterview,
}: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    totalJobsCount: 0,
    totalApplicationsCount: 0,
    scheduledInterviewsCount: 0,
    avgMatchScore: 94,
    conversionRate: '22%',
  });
  const [interviews, setInterviews] = useState<LiveInterview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLiveRecruiterDashboard() {
      try {
        setIsLoading(true);
        const [liveStats, liveInterviews, liveJobs] = await Promise.all([
          DashboardApi.getRecruiterAnalytics(),
          DashboardApi.getInterviews(),
          JobApi.getJobs(),
        ]);

        if (liveStats) setStats(liveStats);
        setInterviews(liveInterviews);
        setJobs(liveJobs.jobs);
      } catch (err) {
        console.error('Failed to load recruiter live data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLiveRecruiterDashboard();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/50 via-slate-900/60 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold tracking-wide border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Live Hiring Workspace (Supabase Connected)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Recruitment Command Center, <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400 bg-clip-text text-transparent">{user?.name || 'Recruiter'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track real-time candidate pipelines, schedule technical rounds, and calibrate skill rubric scores backed by Supabase PostgreSQL.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onOpenCreateJob}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25"
            >
              <Plus className="h-4 w-4" />
              Create Requisition
            </Button>
            <Button
              variant="outline"
              onClick={onOpenScheduleInterview}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              Schedule Round
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-slate-800 bg-slate-900/60 hover:border-purple-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Requisitions
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.activeJobsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Open positions accepting talent</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Applicants
            </CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.totalApplicationsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Conversion Velocity: {stats.conversionRate}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Scheduled Rounds
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Video className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {stats.scheduledInterviewsCount}
            </div>
            <p className="text-xs text-slate-400 mt-1">Upcoming live chamber sessions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 hover:border-pink-500/40 transition-all backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Skill Match
            </CardTitle>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {stats.avgMatchScore}%
            </div>
            <p className="text-xs text-slate-400 mt-1">AI Verified Skill Calibration</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Requisitions & Today's Interview Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-white">Live Job Requisitions</CardTitle>
              <CardDescription>Open positions and pipeline applicant counters</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab('jobs')} className="text-xs text-purple-400">
              Manage All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-purple-500/30 transition-colors">
                <div>
                  <h4 className="font-bold text-white text-xs">{job.title}</h4>
                  <span className="text-[11px] text-slate-400">{job.department} • {job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="role" roleType="RECRUITER">
                    {job._count?.applications || 0} Applicants
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Interview Chambers */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base text-white">Upcoming Panel Interviews</CardTitle>
              <CardDescription>Live WebRTC rooms and candidate slots</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigateTab('interviews')} className="text-xs text-purple-400">
              View Calendar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {interviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No panel interviews scheduled today.</p>
            ) : (
              interviews.slice(0, 3).map((int) => (
                <div key={int.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-purple-500/30 transition-colors">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white text-xs">{int.candidate?.name}</h4>
                    <p className="text-[11px] text-slate-400">{int.title} • {formatDate(int.scheduledAt)}</p>
                  </div>
                  <Badge variant="success">
                    {int.durationMins}m Round
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
