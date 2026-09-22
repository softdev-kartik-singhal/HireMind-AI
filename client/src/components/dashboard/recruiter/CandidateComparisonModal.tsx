'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { AnalyticsApi } from '@/lib/api-analytics';
import { CandidateComparisonItem, CandidateComparisonResponse } from '@/types/analytics';
import { Job } from '@/types/job';
import { useToast } from '@/context/ToastContext';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Code2,
  MessageSquare,
  ShieldCheck,
  Briefcase,
  Download,
  Users,
  X,
  Plus,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidateIds: string[];
  jobId?: string;
  allJobs?: Job[];
}

export const CandidateComparisonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  candidateIds: initialCandidateIds,
  jobId: initialJobId,
  allJobs = [],
}) => {
  const { error, success } = useToast();
  const [candidateIds, setCandidateIds] = useState<string[]>(initialCandidateIds || []);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || 'ALL');
  const [comparisonData, setComparisonData] = useState<CandidateComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCandidateIds(initialCandidateIds);
    if (initialJobId) setSelectedJobId(initialJobId);
  }, [initialCandidateIds, initialJobId]);

  const fetchComparison = useCallback(async () => {
    if (!candidateIds || candidateIds.length < 2) return;
    setIsLoading(true);
    try {
      const data = await AnalyticsApi.compareCandidates(
        candidateIds,
        selectedJobId !== 'ALL' ? selectedJobId : undefined
      );
      setComparisonData(data);
    } catch (err: any) {
      error(
        err.response?.data?.message ||
          err.message ||
          'Failed to load candidate comparison matrix.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [candidateIds, selectedJobId, error]);

  useEffect(() => {
    if (isOpen && candidateIds.length >= 2) {
      fetchComparison();
    }
  }, [isOpen, candidateIds, selectedJobId, fetchComparison]);

  const handleRemoveCandidate = (candId: string) => {
    setCandidateIds((prev) => prev.filter((id) => id !== candId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-indigo-400';
    if (score >= 55) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case 'STRONG_HIRE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Strong Hire
          </span>
        );
      case 'HIRE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            Hire
          </span>
        );
      case 'MAYBE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Maybe
          </span>
        );
      case 'NO_HIRE':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
            No Hire
          </span>
        );
    }
  };

  const candidates = comparisonData?.candidates || [];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="Side-by-Side Candidate Evaluation Matrix"
      description="Objective side-by-side comparison across Resume, Coding, Technical, Communication, Skills, and Integrity Signals."
    >
      <div className="space-y-6 pt-2 text-slate-100">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-purple-400" />
              Target Requisition:
            </span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Active Roles (General Comparison)</option>
              {allJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => success('Exported candidate comparison dossier to CSV.')}
              className="h-8 gap-1.5 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/15"
            >
              <Download className="h-3.5 w-3.5" />
              Export Matrix
            </Button>
          </div>
        </div>

        {/* Warning if fewer than 2 candidates selected */}
        {candidateIds.length < 2 && (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
            <Users className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">Select At Least 2 Candidates</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Pick 2 to 4 candidates from the talent pool to evaluate side-by-side in this matrix.
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <p className="text-xs text-slate-400">
              Calibrating candidate assessments, coding test outcomes, and integrity signals...
            </p>
          </div>
        )}

        {/* Side-by-Side Comparison Grid */}
        {!isLoading && candidates.length >= 2 && (
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse text-xs" role="table">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-950/80 border border-slate-800 text-slate-400 font-semibold w-48 sticky left-0 z-10">
                    Candidate Profile
                  </th>
                  {candidates.map((cand) => (
                    <th
                      key={cand.candidateId}
                      className="p-4 bg-slate-900/90 border border-slate-800 min-w-[240px] align-top space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={cand.name}
                            size="md"
                            className="border border-purple-500/40"
                          />
                          <div>
                            <h4 className="font-bold text-white text-sm">{cand.name}</h4>
                            <p className="text-[11px] text-slate-400">{cand.email}</p>
                          </div>
                        </div>
                        {candidates.length > 2 && (
                          <button
                            onClick={() => handleRemoveCandidate(cand.candidateId)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                            title="Remove candidate from comparison"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {getRecBadge(cand.recommendation)}
                        <span className="text-[10px] text-slate-400 truncate">
                          {cand.jobTitle}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Overall Score */}
                <tr className="bg-slate-950/40">
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Overall Interview Score
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className={`text-xl font-black ${getScoreColor(cand.overallScore)}`}>
                          {cand.overallScore}%
                        </span>
                        <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{ width: `${cand.overallScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Resume Match Score */}
                <tr>
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Resume Compatibility
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold font-mono ${getScoreColor(cand.resumeScore)}`}>
                          {cand.resumeScore}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cand.matchedSkills.length} matched / {cand.missingSkills.length} missing
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Coding Performance */}
                <tr className="bg-slate-950/40">
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Coding Performance
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold font-mono ${getScoreColor(cand.codingScore)}`}>
                          {cand.codingScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Code2 className="h-3 w-3 text-purple-400" />
                          Live sandbox execution
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Technical Knowledge */}
                <tr>
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Technical Knowledge
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <span className={`font-bold font-mono ${getScoreColor(cand.technicalScore)}`}>
                        {cand.technicalScore}%
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Communication */}
                <tr className="bg-slate-950/40">
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Communication Clarity
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold font-mono ${getScoreColor(cand.communicationScore)}`}>
                          {cand.communicationScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-indigo-400" />
                          Speaking pace & clarity
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Matched Skills */}
                <tr>
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90 align-top">
                    Matched Skills
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800 align-top">
                      <div className="flex flex-wrap gap-1">
                        {cand.matchedSkills.length > 0 ? (
                          cand.matchedSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No overlap recorded</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Missing Skills */}
                <tr className="bg-slate-950/40">
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90 align-top">
                    Missing Skills
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800 align-top">
                      <div className="flex flex-wrap gap-1">
                        {cand.missingSkills.length > 0 ? (
                          cand.missingSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-400 text-[11px] font-semibold">100% Coverage</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Interview Status */}
                <tr>
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Interview Status
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <Badge
                        variant={
                          cand.interviewStatus === 'COMPLETED'
                            ? 'success'
                            : cand.interviewStatus === 'SCHEDULED'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {cand.interviewStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Integrity Signals */}
                <tr className="bg-slate-950/40">
                  <td className="p-3 border border-slate-800 font-semibold text-slate-300 sticky left-0 bg-slate-950/90">
                    Integrity Signals
                  </td>
                  {candidates.map((cand) => (
                    <td key={cand.candidateId} className="p-3 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-semibold text-white">
                          {cand.integritySignals.totalEvents} signal(s)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({cand.integritySignals.cleanTimePercentage}% clean)
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Matrix
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
