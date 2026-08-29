'use client';

import React, { useState } from 'react';
import { RecruiterCandidate } from '@/lib/dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Search, Sparkles, Mail, FileText, Video, CheckCircle2, ChevronRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Props {
  candidates: RecruiterCandidate[];
  onOpenScheduleInterview: (candidateName?: string) => void;
}

export function RecruiterCandidatesView({
  candidates,
  onOpenScheduleInterview,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidate | null>(null);
  const { success, info } = useToast();

  const stages = ['All', 'New', 'Screening', 'Interviewing', 'Offered'];

  const filteredCandidates = candidates.filter((cand) => {
    const matchesStage = stageFilter === 'All' || cand.stage === stageFilter;
    const matchesSearch =
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Candidate Pool</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review applicant profiles, technical match benchmarks, and schedule evaluations
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {stages.map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                stageFilter === st
                  ? 'bg-purple-600 text-white'
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
            placeholder="Search candidates or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Candidate Table Card */}
      <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/40 uppercase text-slate-400">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Target Role</th>
                  <th className="p-4">Match %</th>
                  <th className="p-4">Top Skills</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <Avatar name={cand.name} size="sm" />
                      <div>
                        <span>{cand.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal block">{cand.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {cand.role}
                      <span className="text-[10px] text-slate-500 block">{cand.experienceYears} yrs experience</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {cand.matchScore}%
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {cand.topSkills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="role" roleType="RECRUITER">
                        {cand.stage}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-500 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Profile Details Dialog */}
      {selectedCandidate && (
        <Dialog
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Candidate Profile: ${selectedCandidate.name}`}
          description={`Applied for ${selectedCandidate.role}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar name={selectedCandidate.name} size="lg" />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedCandidate.name}</h4>
                  <p className="text-slate-400">{selectedCandidate.email}</p>
                  <p className="text-purple-300 font-semibold mt-0.5">{selectedCandidate.experienceYears} Years Experience</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">{selectedCandidate.matchScore}%</span>
                <span className="text-[10px] text-slate-400 block">AI Match Score</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Verified Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.topSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200 space-y-1">
              <span className="font-bold block">Current Recruitment Stage: {selectedCandidate.stage}</span>
              <p className="text-slate-400 text-[11px]">
                Applicant submitted profile on {selectedCandidate.appliedDate}. Ready for technical panel assignment.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                info(`Opening resume for ${selectedCandidate.name}`);
              }}
              className="gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              View Resume
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const name = selectedCandidate.name;
                setSelectedCandidate(null);
                onOpenScheduleInterview(name);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white gap-1.5"
            >
              <Video className="h-3.5 w-3.5" />
              Schedule Interview
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
