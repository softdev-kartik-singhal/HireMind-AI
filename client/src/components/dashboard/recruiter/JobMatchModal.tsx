'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { JobMatchAnalysis, MatchRecommendation } from '@/types/jobMatch';
import { JobMatchApi } from '@/lib/api-job-match';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Award,
  ShieldCheck,
  Briefcase,
  Layers,
  GraduationCap,
  FolderGit2,
  Cpu,
  Info,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface JobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateAvatar?: string | null;
  candidateHeadline?: string | null;
  jobTitle?: string;
  jobDepartment?: string;
  jobExperienceLevel?: string;
}

export const JobMatchModal: React.FC<JobMatchModalProps> = ({
  isOpen,
  onClose,
  jobId,
  candidateId,
  candidateName,
  candidateEmail,
  candidateAvatar,
  candidateHeadline,
  jobTitle,
  jobDepartment,
  jobExperienceLevel,
}) => {
  const [match, setMatch] = useState<JobMatchAnalysis | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = useCallback(
    async (forceRefresh = false) => {
      if (!jobId || !candidateId) return;

      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const res = await JobMatchApi.getCandidateMatch(jobId, candidateId, {
          forceRefresh,
        });

        setMatch(res.match);
        setIsCached(res.cached);
      } catch (err: any) {
        console.error('Failed to load candidate job match:', err);
        setError(
          err.response?.data?.message ||
            'Failed to calculate candidate compatibility score. Please try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId, candidateId]
  );

  useEffect(() => {
    if (isOpen && jobId && candidateId) {
      fetchMatch(false);
    } else {
      setMatch(null);
      setError(null);
    }
  }, [isOpen, jobId, candidateId, fetchMatch]);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 70) return 'text-cyan-400 stroke-cyan-400';
    if (score >= 50) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getScoreBadge = (rec: MatchRecommendation) => {
    switch (rec) {
      case 'STRONG_MATCH':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            STRONG MATCH
          </span>
        );
      case 'GOOD_MATCH':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            GOOD MATCH
          </span>
        );
      case 'PARTIAL_MATCH':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            PARTIAL MATCH
          </span>
        );
      case 'WEAK_MATCH':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10">
            <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            WEAK MATCH
          </span>
        );
    }
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'from-emerald-500/10 to-teal-500/5 border-emerald-500/30';
    if (score >= 70) return 'from-cyan-500/10 to-blue-500/5 border-cyan-500/30';
    if (score >= 50) return 'from-amber-500/10 to-yellow-500/5 border-amber-500/30';
    return 'from-rose-500/10 to-red-500/5 border-rose-500/30';
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const overallScore = match?.overallScore ?? 0;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-scaleUp">
        {/* Header Bar */}
        <div className="flex items-start justify-between px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  AI Resume-to-Job Compatibility
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Transparent Rubric
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Target Requisition:{' '}
                <span className="text-slate-200 font-medium">
                  {match?.job?.title || jobTitle || 'Job Opening'}
                </span>{' '}
                {jobDepartment ? `• ${jobDepartment}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMatch(true)}
              disabled={refreshing || loading}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 flex items-center space-x-1.5"
              title="Force AI re-evaluation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Re-evaluating...' : 'Re-analyze'}</span>
            </Button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <Cpu className="w-7 h-7 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-slate-200">
                  Evaluating Resume Compatibility...
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Analyzing skill overlaps, experience relevance, and project portfolio against job requirements.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3 my-8">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-semibold text-rose-300">
                Evaluation Failed
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">{error}</p>
              <Button
                onClick={() => fetchMatch(false)}
                variant="outline"
                size="sm"
                className="bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Loaded Match Content */}
          {!loading && !error && match && (
            <>
              {/* Candidate & Hero Score Row */}
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${getScoreBg(
                  match.overallScore
                )} border flex flex-col md:flex-row items-center justify-between gap-6`}
              >
                {/* Candidate Info */}
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <Avatar
                    name={match.candidate?.name || candidateName || 'User'}
                    src={match.candidate?.avatar || candidateAvatar}
                    size="lg"
                    className="rounded-2xl border-2 border-indigo-500/40 shadow-md"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-white">
                        {match.candidate?.name || candidateName || 'Candidate'}
                      </h3>
                      {getScoreBadge(match.recommendation)}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {match.candidate?.headline || candidateHeadline || candidateEmail || 'Candidate Profile'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-slate-400">
                      <span className="flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                        {isCached ? 'Stored Analysis (Cached from DB)' : 'Freshly Evaluated'}
                      </span>
                      <span>•</span>
                      <span>Target Level: {jobExperienceLevel || match.job?.experienceLevel || 'MID'}</span>
                    </div>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="flex items-center space-x-5 flex-shrink-0">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                      <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        className="stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        className={`${getScoreColor(match.overallScore)} transition-all duration-1000 ease-out`}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-white tracking-tight">
                        {match.overallScore}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Overall
                      </span>
                    </div>
                  </div>

                  <div className="text-left max-w-xs">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Executive Fit Assessment
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {match.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transparent Scoring Breakdown (5 Pillars) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Transparent Scoring System Breakdown</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Weighted 100-Point Model
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* 1. Required Skills */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                        Required Skills
                      </span>
                      <span className="text-slate-400 font-mono">35% wgt</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        {Math.round(match.requiredSkillScore)}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {match.matchedSkills.length} matched
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, match.requiredSkillScore)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight truncate">
                      {match.scoringBreakdown?.requiredSkills?.details || 'Skill overlap verified'}
                    </p>
                  </div>

                  {/* 2. Experience Relevance */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center">
                        <Briefcase className="w-3.5 h-3.5 text-blue-400 mr-1" />
                        Experience
                      </span>
                      <span className="text-slate-400 font-mono">25% wgt</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        {Math.round(match.experienceScore)}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {match.experienceMatch?.candidateYears?.toFixed(1) ?? 'N/A'} yrs
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, match.experienceScore)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight truncate">
                      {match.experienceMatch?.summary || 'Career trajectory'}
                    </p>
                  </div>

                  {/* 3. Preferred Skills */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center">
                        <Layers className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                        Preferred Skills
                      </span>
                      <span className="text-slate-400 font-mono">15% wgt</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        {Math.round(match.preferredSkillScore)}%
                      </span>
                      <span className="text-[11px] text-slate-400">Bonus stack</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(100, match.preferredSkillScore)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight truncate">
                      {match.scoringBreakdown?.preferredSkills?.details || 'Secondary tooling'}
                    </p>
                  </div>

                  {/* 4. Projects */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center">
                        <FolderGit2 className="w-3.5 h-3.5 text-purple-400 mr-1" />
                        Projects
                      </span>
                      <span className="text-slate-400 font-mono">15% wgt</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        {Math.round(match.projectScore)}%
                      </span>
                      <span className="text-[11px] text-slate-400">Portfolio</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, match.projectScore)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight truncate">
                      {match.scoringBreakdown?.projects?.details || 'Hands-on code'}
                    </p>
                  </div>

                  {/* 5. Education */}
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 flex items-center">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                        Education
                      </span>
                      <span className="text-slate-400 font-mono">10% wgt</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">
                        {Math.round(match.educationScore)}%
                      </span>
                      <span className="text-[11px] text-slate-400">Degrees</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, match.educationScore)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight truncate">
                      {match.scoringBreakdown?.education?.details || 'Academic fit'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills Analysis: Matched vs Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Matched Skills ({match.matchedSkills.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Verified in profile</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                    {match.matchedSkills.length > 0 ? (
                      match.matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{skill}</span>
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No direct required skill matches verified.
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Missing / Unverified Skills ({match.missingSkills.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">Required criteria gaps</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                    {match.missingSkills.length > 0 ? (
                      match.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center space-x-1"
                        >
                          <XCircle className="w-3 h-3 text-amber-400" />
                          <span>{skill}</span>
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>All mandatory required skills are accounted for!</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Candidate Strengths</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {match.strengths.map((str, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 flex items-start space-x-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Growth Areas */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Areas of Growth / Gaps</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {match.weaknesses.map((weak, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 flex items-start space-x-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Experience Match Highlight */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      Experience Relevance Breakdown
                    </span>
                    <span className="font-mono text-blue-400 font-bold">
                      {Math.round(match.experienceScore)} / 100 pts
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {match.experienceMatch?.summary}
                  </p>
                  {match.experienceMatch?.relevanceExplanation && (
                    <p className="text-slate-400 mt-1 italic">
                      {match.experienceMatch.relevanceExplanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Ethical AI Governance & Advisory Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
                <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">
                    Human-In-The-Loop Hiring Governance
                  </p>
                  <p className="mt-0.5 text-slate-400 leading-relaxed">
                    This AI compatibility score is an advisory decision-support tool. In accordance with HireMind AI governance policies, AI systems are strictly prohibited from making irreversible hiring or rejection decisions. Final candidate selection must be reviewed and decided by human talent evaluators.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Model: Gemini 1.5 Pro/Flash</span>
            <span>•</span>
            <span>Stored in PostgreSQL</span>
          </div>
          <Button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
