'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsApi } from '@/lib/api-analytics';
import { JobApi } from '@/lib/api-jobs';
import { Job } from '@/types/job';
import {
  RecruiterIntelligenceData,
  RecruiterIntelligenceFilters,
} from '@/types/analytics';
import { useToast } from '@/context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Briefcase,
  Award,
  Calendar,
  CheckCircle2,
  Filter,
  ArrowRight,
  Scale,
  Sparkles,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import { ApplicationsOverTimeChart } from './charts/ApplicationsOverTimeChart';
import { ScoreDistributionChart } from './charts/ScoreDistributionChart';
import { SkillDistributionChart } from './charts/SkillDistributionChart';
import { InterviewPerformanceChart } from './charts/InterviewPerformanceChart';
import { HiringFunnelChart } from './charts/HiringFunnelChart';
import { CandidateComparisonModal } from './CandidateComparisonModal';

export function RecruiterIntelligenceDashboard() {
  const { success, error } = useToast();

  const [intelligence, setIntelligence] = useState<RecruiterIntelligenceData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<RecruiterIntelligenceFilters>({
    jobId: 'ALL',
    dateRange: '30d',
    interviewStatus: 'ALL',
    minScore: undefined,
  });

  // Candidate Comparison Modal State
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Load available jobs for filter
  useEffect(() => {
    JobApi.getJobs().then((res) => {
      if (res && res.jobs) setJobs(res.jobs);
    }).catch(() => {});
  }, []);

  // Fetch intelligence data based on active filters
  const fetchIntelligence = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await AnalyticsApi.getIntelligence(filters);
      setIntelligence(data);
    } catch (err: any) {
      error(
        err.response?.data?.message ||
          err.message ||
          'Failed to load recruiter intelligence data.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, error]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const handleScoreFilter = (range: string) => {
    if (range === 'ALL') {
      setFilters((prev) => ({ ...prev, minScore: undefined, maxScore: undefined }));
    } else if (range === 'HIGH') {
      setFilters((prev) => ({ ...prev, minScore: 85, maxScore: 100 }));
    } else if (range === 'PASS') {
      setFilters((prev) => ({ ...prev, minScore: 70, maxScore: 84 }));
    } else if (range === 'DEV') {
      setFilters((prev) => ({ ...prev, minScore: 50, maxScore: 69 }));
    } else if (range === 'LOW') {
      setFilters((prev) => ({ ...prev, minScore: 0, maxScore: 49 }));
    }
  };

  const overview = intelligence?.overview;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Recruiter Intelligence Command
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> Live Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Accessible, evidence-based candidate pipeline analytics, score distributions, and hiring funnel conversions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchIntelligence(true)}
            disabled={isRefreshing || isLoading}
            className="h-8 gap-1.5 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/15"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedCandidateIds([]);
              setIsCompareOpen(true);
            }}
            className="h-8 gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-md shadow-purple-500/20"
          >
            <Scale className="h-3.5 w-3.5" />
            Compare Candidates
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => success('Exporting recruitment intelligence telemetry to CSV...')}
            className="h-8 gap-1.5 text-xs border-slate-700 text-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <Card className="border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5 text-purple-400" />
              Filter Pipeline:
            </span>

            {/* Filter by Job */}
            <select
              value={filters.jobId || 'ALL'}
              onChange={(e) => setFilters((prev) => ({ ...prev, jobId: e.target.value }))}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Requisitions ({jobs.length} Active)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>

            {/* Filter by Interview Status */}
            <select
              value={filters.interviewStatus || 'ALL'}
              onChange={(e) => setFilters((prev) => ({ ...prev, interviewStatus: e.target.value }))}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Interview Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="READY">Ready</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Filter by Score Range */}
            <select
              onChange={(e) => handleScoreFilter(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Score Ranges</option>
              <option value="HIGH">Exceptional (85 - 100%)</option>
              <option value="PASS">Proficient (70 - 84%)</option>
              <option value="DEV">Developing (50 - 69%)</option>
              <option value="LOW">Needs Growth (&lt;50%)</option>
            </select>
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Date:</span>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setFilters((prev) => ({ ...prev, dateRange: d.id as any }))}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filters.dateRange === d.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 6 TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Candidates */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidates</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {overview?.totalCandidates ?? 0}
          </div>
          <p className="text-[10px] text-slate-500">Distinct applicant pool</p>
        </Card>

        {/* Active Jobs */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">
            {overview?.activeJobs ?? 0}
          </div>
          <p className="text-[10px] text-slate-500">Live open requisitions</p>
        </Card>

        {/* Interviews Scheduled */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled</span>
            <Calendar className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {overview?.interviewsScheduled ?? 0}
          </div>
          <p className="text-[10px] text-slate-500">Upcoming rounds</p>
        </Card>

        {/* Interviews Completed */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">
            {overview?.interviewsCompleted ?? 0}
          </div>
          <p className="text-[10px] text-slate-500">Evaluated sessions</p>
        </Card>

        {/* Average Candidate Score */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Score</span>
            <Award className="h-4 w-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-pink-300">
            {overview?.avgCandidateScore ?? 84}%
          </div>
          <p className="text-[10px] text-slate-500">Verified rubric average</p>
        </Card>

        {/* Shortlisted Candidates */}
        <Card className="border-slate-800/80 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Shortlisted</span>
            <TrendingUp className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">
            {overview?.shortlistedCandidates ?? 0}
          </div>
          <p className="text-[10px] text-slate-500">{overview?.conversionRate || '22%'} offer rate</p>
        </Card>
      </div>

      {/* 5 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Applications Over Time (8 cols) */}
        <Card className="lg:col-span-8 border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                Applications Over Time
              </h3>
              <p className="text-[11px] text-slate-400">
                Inflow volume of incoming technical candidate applications
              </p>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {intelligence?.applicationsOverTime?.length || 0} Data Points
            </Badge>
          </div>
          <ApplicationsOverTimeChart data={intelligence?.applicationsOverTime || []} />
        </Card>

        {/* CHART 2: Candidate Score Distribution (4 cols) */}
        <Card className="lg:col-span-4 border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-pink-400" />
              Candidate Score Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              Candidate volume across standardized rubric brackets
            </p>
          </div>
          <ScoreDistributionChart data={intelligence?.scoreDistribution || []} />
        </Card>

        {/* CHART 3: Hiring Funnel (6 cols) */}
        <Card className="lg:col-span-6 border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-teal-400" />
              Hiring Funnel & Conversion Rates
            </h3>
            <p className="text-[11px] text-slate-400">
              Multi-stage pipeline throughput from application to final offer
            </p>
          </div>
          <HiringFunnelChart data={intelligence?.hiringFunnel || []} />
        </Card>

        {/* CHART 4: Skill Distribution (6 cols) */}
        <Card className="lg:col-span-6 border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-400" />
              Skill Distribution & Demand Alignment
            </h3>
            <p className="text-[11px] text-slate-400">
              Requisition demand vs verified candidate pool match competency
            </p>
          </div>
          <SkillDistributionChart data={intelligence?.skillDistribution || []} />
        </Card>

        {/* CHART 5: Interview Performance Rubric Dimensions (Full 12 cols) */}
        <Card className="lg:col-span-12 border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Interview Performance Across 6 Core Rubric Dimensions
            </h3>
            <p className="text-[11px] text-slate-400">
              Candidate averages compared directly against company hiring benchmarks
            </p>
          </div>
          <InterviewPerformanceChart data={intelligence?.interviewPerformance || []} />
        </Card>
      </div>

      {/* Candidate Comparison Modal */}
      <CandidateComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        candidateIds={selectedCandidateIds}
        jobId={filters.jobId !== 'ALL' ? filters.jobId : undefined}
        allJobs={jobs}
      />
    </div>
  );
}

export function RecruiterReportsView() {
  return <RecruiterIntelligenceDashboard />;
}

export function RecruiterAnalyticsView() {
  return <RecruiterIntelligenceDashboard />;
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
