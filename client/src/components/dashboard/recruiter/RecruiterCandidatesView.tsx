'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { JobApi } from '@/lib/api-jobs';
import { Application, Job } from '@/types/job';
import {
  Users,
  Search,
  Video,
  FileText,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface Props {
  onOpenScheduleInterview?: (candidateName?: string) => void;
}

export function RecruiterCandidatesView({ onOpenScheduleInterview }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  const { success, error } = useToast();

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const jobsRes = await JobApi.getJobs();
      const allApps: Application[] = [];

      await Promise.all(
        jobsRes.jobs.map(async (job) => {
          const applicants = await JobApi.getJobApplicants(job.id);
          allApps.push(...applicants);
        })
      );

      setApplications(allApps);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filtered = applications.filter((app) => {
    const matchesStage = stageFilter === 'ALL' || app.status === stageFilter;
    const matchesSearch =
      app.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Talent Pool & Candidate Pipeline</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Review verified candidate applications, portfolio resumes, and interview eligibility across all company requisitions
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                stageFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            placeholder="Search candidate name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Candidates List */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="Candidates applying to your published job requisitions will automatically populate here."
        />
      ) : (
        <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl shadow-xl">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/90 transition-colors"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <Avatar name={app.candidate?.name || 'Applicant'} size="md" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm hover:text-purple-300 cursor-pointer" onClick={() => setSelectedCandidate(app)}>
                      {app.candidate?.name}
                    </h3>
                    <Badge variant={app.status === 'SELECTED' ? 'success' : 'role'} roleType="RECRUITER">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{app.candidate?.headline || app.candidate?.email}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>Applied for: <strong className="text-slate-300">{app.job?.title}</strong></span>
                    <span>•</span>
                    <span>{formatDate(app.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                {app.matchScore && (
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20">
                    {app.matchScore}% Match
                  </span>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCandidate(app)}
                  className="text-xs"
                >
                  View Profile
                </Button>

                {onOpenScheduleInterview && (
                  <Button
                    size="sm"
                    onClick={() => onOpenScheduleInterview(app.candidate?.name)}
                    className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Schedule Round
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile Details Dialog */}
      {selectedCandidate && (
        <Dialog
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={selectedCandidate.candidate?.name || 'Candidate Profile'}
          description={selectedCandidate.candidate?.headline || 'Technical Applicant'}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Applied Position</span>
                <span className="font-bold text-white text-sm block mt-0.5">{selectedCandidate.job?.title}</span>
              </div>
              <Badge variant="role" roleType="RECRUITER">{selectedCandidate.status}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-purple-400" />
                <span>{selectedCandidate.candidate?.email}</span>
              </div>
              {selectedCandidate.candidate?.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>{selectedCandidate.candidate?.phone}</span>
                </div>
              )}
            </div>

            {selectedCandidate.coverLetter && (
              <div className="space-y-1">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                  Cover Note / Pitch
                </span>
                <p className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 italic leading-relaxed">
                  &ldquo;{selectedCandidate.coverLetter}&rdquo;
                </p>
              </div>
            )}

            {selectedCandidate.resumeUrl && (
              <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                <span className="text-purple-300 font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Verified Portfolio / CV Link
                </span>
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(null)}>
              Close
            </Button>
            {onOpenScheduleInterview && (
              <Button
                size="sm"
                onClick={() => {
                  const name = selectedCandidate.candidate?.name;
                  setSelectedCandidate(null);
                  onOpenScheduleInterview(name);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white gap-1.5"
              >
                <Video className="h-3.5 w-3.5" />
                Schedule Interview
              </Button>
            )}
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
