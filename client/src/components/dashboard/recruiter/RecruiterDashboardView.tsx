'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  RecruiterJob,
  RecruiterCandidate,
  RecruiterInterviewSession,
} from '@/lib/dashboard-data';
import {
  Briefcase,
  Users,
  Video,
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  jobs: RecruiterJob[];
  candidates: RecruiterCandidate[];
  interviews: RecruiterInterviewSession[];
  onNavigateTab: (tab: string) => void;
  onOpenCreateJob: () => void;
  onOpenScheduleInterview: () => void;
}

export function RecruiterDashboardView({
  jobs,
  candidates,
  interviews,
  onNavigateTab,
  onOpenCreateJob,
  onOpenScheduleInterview,
}: Props) {
  const activeJobs = jobs.filter((j) => j.status === 'Active');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Active Job Requisitions
              </CardTitle>
              <Briefcase className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{activeJobs.length}</div>
            <p className="text-xs text-slate-400 mt-1">4 open engineering roles</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Candidate Pipeline
              </CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{candidates.length * 15}</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">+18</span> new this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Interviews This Week
              </CardTitle>
              <Video className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{interviews.length + 5}</div>
            <p className="text-xs text-slate-400 mt-1">94% attendance rate</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Avg Skill Match
              </CardTitle>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">93.4%</div>
            <p className="text-xs text-slate-400 mt-1">High qualification index</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Pipeline Funnel + Today's Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Pipeline Funnel & Top Candidates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recruitment Funnel Visualizer */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Recruitment Funnel Velocity</CardTitle>
                <CardDescription>Real-time candidate transition through stages</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={onOpenCreateJob} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Post New Job
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Sourced</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">119</span>
                  <span className="text-[10px] text-slate-500">100% top-of-funnel</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold text-indigo-400 block uppercase">Screening</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">42</span>
                  <span className="text-[10px] text-indigo-400">35% conversion</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold text-purple-400 block uppercase">Technical</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">18</span>
                  <span className="text-[10px] text-purple-400">42% pass rate</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
                  <span className="text-[11px] font-semibold text-emerald-400 block uppercase">Offers</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">5</span>
                  <span className="text-[10px] text-emerald-400">80% acceptance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Candidates in Assessment */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">Top Evaluated Candidates</CardTitle>
                <CardDescription>Qualified talent ready for team interviews</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('candidates')}
                className="text-xs text-purple-400 hover:text-purple-300 gap-1"
              >
                View Pool
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={cand.name} size="md" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                        <p className="text-xs text-slate-400">{cand.role} • {cand.experienceYears}y exp</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">{cand.matchScore}% Match</span>
                        <span className="text-[10px] text-slate-500 block">Applied {cand.appliedDate}</span>
                      </div>
                      <Badge variant="role" roleType="RECRUITER">
                        {cand.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Live Interview Schedule */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  Scheduled Rounds
                </CardTitle>
                <CardDescription>Live sessions today & upcoming</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={onOpenScheduleInterview} className="text-xs">
                Schedule
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {interviews.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.candidateName}</span>
                    <Badge variant="default" className="text-[10px]">{item.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{item.jobTitle}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>{item.scheduledTime}</span>
                    <span className="text-indigo-300">{item.type}</span>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('interviews')}
                className="w-full text-xs text-purple-400 mt-2"
              >
                View Full Calendar
              </Button>
            </CardContent>
          </Card>

          {/* Quick Recruitment Shortcuts */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Recruitment Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <button
                onClick={() => onNavigateTab('jobs')}
                className="flex w-full items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:bg-slate-800/60 transition-colors text-slate-200"
              >
                <span>Browse Requisitions</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('analytics')}
                className="flex w-full items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:bg-slate-800/60 transition-colors text-slate-200"
              >
                <span>Hiring Velocity Analytics</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('reports')}
                className="flex w-full items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:bg-slate-800/60 transition-colors text-slate-200"
              >
                <span>Export Assessment Rubrics</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
