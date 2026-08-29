'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Job, Application } from '@/types/job';
import { JobApi } from '@/lib/api-jobs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Send,
  Building,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  onApplicationSubmitted?: () => void;
}

export function CandidateJobsView({ onApplicationSubmitted }: Props) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Job Details Dialog
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Apply Modal Dialog
  const [jobToApply, setJobToApply] = useState<Job | null>(null);
  const [resumeUrl, setResumeUrl] = useState('https://hiremind.ai/resumes/my-cv.pdf');
  const [coverLetter, setCoverLetter] = useState('');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await JobApi.getJobs({
        search: searchQuery,
        department: departmentFilter,
        status: 'ACTIVE',
      });
      setJobs(res.jobs);
    } catch {
      error('Failed to load job openings');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, departmentFilter, error]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobToApply) return;
    try {
      setIsSubmitting(true);
      await JobApi.applyForJob({
        jobId: jobToApply.id,
        resumeUrl,
        coverLetter,
        phone,
      });

      // Mark applied in local list
      setJobs((prev) =>
        prev.map((j) => (j.id === jobToApply.id ? { ...j, hasApplied: true } : j))
      );

      success(`Application submitted for "${jobToApply.title}"! Recruiter notified.`);
      setJobToApply(null);
      setCoverLetter('');
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err: any) {
      error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Explore Open Engineering & Tech Roles</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse verified AI and distributed systems roles with transparent salary ranges and direct interview tracks
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Engineering', 'Data & AI', 'DevOps', 'Product'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                departmentFilter === dept
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            placeholder="Search by title, stack (Go, Rust), skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Jobs Listing */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open roles found"
          description="Try broadening your search query or selecting a different department."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-indigo-500/40 transition-all backdrop-blur-xl flex flex-col justify-between shadow-xl"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="role" roleType="CANDIDATE">
                      {job.department}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {job.experienceLevel}
                    </span>
                  </div>
                  {job.hasApplied ? (
                    <Badge variant="success" className="gap-1 py-0.5">
                      <CheckCircle2 className="h-3 w-3" /> APPLIED
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Active Opening
                    </span>
                  )}
                </div>

                <div>
                  <CardTitle
                    className="text-base font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    {job.title}
                  </CardTitle>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    {job.salaryRange || 'Competitive'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {job.employmentType.replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-medium text-slate-300 border border-slate-700/50"
                    >
                      {sk}
                    </span>
                  ))}
                  {job.requiredSkills.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-500">
                      +{job.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    className="text-xs"
                  >
                    View Role Specs
                  </Button>

                  {job.hasApplied ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="text-xs gap-1.5 opacity-80"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Application Submitted
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setJobToApply(job)}
                      className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Apply Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. VIEW JOB DETAILS MODAL                               */}
      {/* ======================================================== */}
      {selectedJob && (
        <Dialog
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          description={`${selectedJob.department} • ${selectedJob.location} • ${selectedJob.salaryRange || 'Competitive'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs text-slate-300">
            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <Badge variant="role" roleType="CANDIDATE">{selectedJob.department}</Badge>
              <Badge variant="default">{selectedJob.experienceLevel} Level</Badge>
              <Badge variant="secondary">{selectedJob.employmentType.replace('_', ' ')}</Badge>
              <span className="text-emerald-400 font-bold ml-auto">{selectedJob.salaryRange || 'Competitive'}</span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Position Summary
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">{selectedJob.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="space-y-1.5">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Key Responsibilities
              </span>
              <p className="text-slate-300 leading-relaxed text-xs whitespace-pre-line">{selectedJob.responsibilities}</p>
            </div>

            {/* Required Skills */}
            <div className="space-y-1.5">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Required Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {selectedJob.preferredSkills && selectedJob.preferredSkills.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                  Preferred / Bonus Qualifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.preferredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
              Close
            </Button>
            {!selectedJob.hasApplied && (
              <Button
                size="sm"
                onClick={() => {
                  const j = selectedJob;
                  setSelectedJob(null);
                  setJobToApply(j);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Apply for this Position
              </Button>
            )}
          </DialogFooter>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* 2. APPLY FOR JOB DIALOG MODAL                           */}
      {/* ======================================================== */}
      {jobToApply && (
        <Dialog
          isOpen={!!jobToApply}
          onClose={() => setJobToApply(null)}
          title={`Apply: ${jobToApply.title}`}
          description="Submit your application and portfolio for recruiter evaluation."
          maxWidth="lg"
        >
          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label htmlFor="candName">Candidate Name</Label>
              <Input id="candName" value={user?.name || ''} disabled className="opacity-70" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="candEmail">Email Address</Label>
              <Input id="candEmail" value={user?.email || ''} disabled className="opacity-70" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="candPhone">Phone Number</Label>
              <Input
                id="candPhone"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="resume">Resume / CV Link</Label>
              <Input
                id="resume"
                placeholder="https://myportfolio.dev/resume.pdf or LinkedIn URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cover">Brief Note to Hiring Team (Optional)</Label>
              <textarea
                id="cover"
                rows={3}
                placeholder="Describe your background and why you are interested in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" type="button" onClick={() => setJobToApply(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </div>
  );
}
