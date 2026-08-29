'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Application, ApplicationStatus } from '@/types/job';
import { JobApi } from '@/lib/api-jobs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { FileText, Search, MapPin, Building, Calendar, ArrowRight, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface Props {
  onNavigateToJobs?: () => void;
}

export function CandidateApplicationsView({ onNavigateToJobs }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { info } = useToast();

  const stages = ['ALL', 'APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const apps = await JobApi.getMyApplications();
      setApplications(apps);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApps = applications.filter((app) => {
    const matchesStage = filterStage === 'ALL' || app.status === filterStage;
    const matchesSearch =
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStageBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SELECTED':
        return <Badge variant="success">OFFER EXTENDED</Badge>;
      case 'INTERVIEW':
        return <Badge variant="role" roleType="CANDIDATE">INTERVIEW ROUND</Badge>;
      case 'SHORTLISTED':
        return <Badge variant="default">SHORTLISTED</Badge>;
      case 'SCREENING':
        return <Badge variant="warning">SCREENING</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">NOT SELECTED</Badge>;
      default:
        return <Badge variant="secondary">APPLIED</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">My Submitted Applications</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your pipeline status, recruiter reviews, and interview milestones
          </p>
        </div>
        {onNavigateToJobs && (
          <Button size="sm" onClick={onNavigateToJobs} className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white">
            Explore More Jobs
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setFilterStage(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStage === stage
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications in this category"
          description="You haven't submitted applications matching the selected stage filter."
          actionLabel="Browse Open Tech Roles"
          onAction={onNavigateToJobs}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-indigo-500/30 transition-all backdrop-blur-xl"
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold text-white">{app.job?.title}</h3>
                    {getStageBadge(app.status)}
                    {app.matchScore && (
                      <span className="text-xs font-bold text-emerald-400">
                        {app.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Building className="h-3.5 w-3.5 text-indigo-400" />
                      {app.job?.department || 'Engineering'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {app.job?.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Applied on {formatDate(app.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApp(app)}
                    className="text-xs"
                  >
                    View Status Timeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Application Timeline & Details Dialog */}
      {selectedApp && (
        <Dialog
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Status: ${selectedApp.job?.title}`}
          description={`Submitted on ${formatDate(selectedApp.createdAt)}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Stage</span>
                <div className="mt-1">{getStageBadge(selectedApp.status)}</div>
              </div>
              {selectedApp.matchScore && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Skill Compatibility</span>
                  <span className="text-xl font-black text-emerald-400 mt-1 block">
                    {selectedApp.matchScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Stage Progress Roadmap */}
            <div className="space-y-2">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                Hiring Journey Roadmap
              </span>
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>1. Application Received & Verified</span>
                </div>
                <div className={`flex items-center gap-3 ${['SCREENING', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(selectedApp.status) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>2. Technical Rubric Screening</span>
                </div>
                <div className={`flex items-center gap-3 ${['SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(selectedApp.status) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>3. Shortlisted for Technical Rounds</span>
                </div>
                <div className={`flex items-center gap-3 ${['INTERVIEW', 'SELECTED'].includes(selectedApp.status) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>4. Live Coding & System Architecture Assessment</span>
                </div>
                <div className={`flex items-center gap-3 ${selectedApp.status === 'SELECTED' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>5. Final Decision & Offer</span>
                </div>
              </div>
            </div>

            {selectedApp.coverLetter && (
              <div className="space-y-1">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block">
                  Your Cover Note
                </span>
                <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 italic">
                  &ldquo;{selectedApp.coverLetter}&rdquo;
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
