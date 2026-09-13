'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { InterviewApi } from '@/lib/api-interviews';
import { Interview, InterviewType, InterviewDifficulty } from '@/types/interview';
import { JobApi } from '@/lib/api-jobs';
import { Job } from '@/types/job';
import { useRouter } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Search,
  User,
  Briefcase,
  Play,
  CheckCircle2,
  ExternalLink,
  Users,
  ListOrdered,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { RecruiterQuestionReviewModal } from './RecruiterQuestionReviewModal';
import { ProctoringTimelineModal } from './ProctoringTimelineModal';
import { RecruiterEvaluationModal } from './RecruiterEvaluationModal';

interface Props {
  isScheduleModalOpen: boolean;
  onCloseScheduleModal: () => void;
  initialCandidateName?: string;
}

export function RecruiterInterviewsView({
  isScheduleModalOpen,
  onCloseScheduleModal,
  initialCandidateName,
}: Props) {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingInterview, setReviewingInterview] = useState<Interview | null>(null);
  const [proctoringInterview, setProctoringInterview] = useState<Interview | null>(null);
  const [evaluatingInterview, setEvaluatingInterview] = useState<Interview | null>(null);

  // Form states configured per prompt requirements
  const [candidateEmail, setCandidateEmail] = useState(initialCandidateName || 'alex.rivera@hiremind.ai');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [roundTitle, setRoundTitle] = useState('Distributed State & Architecture Technical Round');
  const [roundType, setRoundType] = useState<InterviewType>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('MEDIUM');
  const [numQuestions, setNumQuestions] = useState(5);
  const [scheduleDateTime, setScheduleDateTime] = useState('2026-09-18T15:00');
  const [durationMins, setDurationMins] = useState(60);
  const [notes, setNotes] = useState('Focus on concurrency primitives, lock-free queues, and postgres indexing.');

  const { success, error, info } = useToast();

  const fetchLiveInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const [liveInterviews, liveJobs] = await Promise.all([
        InterviewApi.getInterviews(),
        JobApi.getJobs(),
      ]);
      setInterviews(liveInterviews);
      setJobs(liveJobs.jobs);
      if (liveJobs.jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(liveJobs.jobs[0].id);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    fetchLiveInterviews();
  }, [fetchLiveInterviews]);

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];
      if (!job) throw new Error('Please select a job requisition');

      // Schedule with InterviewApi
      const created = await InterviewApi.createInterview({
        title: roundTitle,
        type: roundType,
        difficulty,
        jobId: job.id,
        candidateId: candidateEmail.trim(),
        scheduledAt: new Date(scheduleDateTime).toISOString(),
        durationMins,
        numQuestions,
        notes,
      });

      setInterviews((prev) => [created, ...prev]);
      success(`Technical round scheduled with candidate! Generated ${created.questions?.length || numQuestions} curated questions.`);
      onCloseScheduleModal();
    } catch (err: any) {
      error(err.response?.data?.message || err.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInterviews = interviews.filter(
    (int) =>
      int.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.job?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Technical Interview Coordination</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time live coding rooms, WebRTC chambers, panel assignment, and rubric telemetry
          </p>
        </div>
        <Button onClick={onCloseScheduleModal} size="sm" className="gap-2 bg-purple-600 hover:bg-purple-500 text-white">
          <Plus className="h-4 w-4" />
          Schedule Interview Round
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <Input
          placeholder="Search by candidate, role, or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      {/* Interviews List */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : filteredInterviews.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No interview chambers scheduled"
          description="Schedule a technical coding or system design round with candidates in your pipeline."
          actionLabel="Schedule First Round"
          onAction={onCloseScheduleModal}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInterviews.map((interview) => (
            <Card
              key={interview.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-purple-500/40 transition-all backdrop-blur-xl shadow-xl"
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant="role" roleType="RECRUITER">
                        {interview.type}
                      </Badge>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          interview.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : interview.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                            : interview.status === 'READY'
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : interview.status === 'EXPIRED'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {interview.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {interview.difficulty || 'MEDIUM'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20">
                        {interview.numQuestions || 5} Questions
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white hover:text-purple-300 cursor-pointer">
                        {interview.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {interview.notes || 'Curated technical interview session'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                        {interview.job?.title}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-400" />
                        Candidate: {interview.candidate?.name} ({interview.candidate?.email})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {formatDate(interview.scheduledAt)} ({interview.durationMins}m)
                      </span>
                    </div>
                  </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEvaluatingInterview(interview)}
                      className="gap-1.5 border-emerald-500/30 hover:bg-emerald-500/15 text-emerald-300 text-xs"
                    >
                      <Award className="h-3.5 w-3.5" />
                      Scorecard & Decision
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setProctoringInterview(interview)}
                      className="gap-1.5 border-indigo-500/30 hover:bg-indigo-500/15 text-indigo-300 text-xs"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Integrity Signals
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReviewingInterview(interview)}
                      className="gap-1.5 border-purple-500/30 hover:bg-purple-500/15 text-purple-300 text-xs"
                    >
                      <ListOrdered className="h-3.5 w-3.5" />
                      Review Questions ({interview.numQuestions || interview.questions?.length || 0})
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/interview/${interview.id}`)}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Open Chamber
                    </Button>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <Dialog
          isOpen={isScheduleModalOpen}
          onClose={onCloseScheduleModal}
          title="Schedule Technical Interview Round"
          description="Create a live coding room and dispatch calendar invitations to candidate."
          maxWidth="lg"
        >
          <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label>Target Job Requisition</Label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="candEmail">Candidate Email</Label>
              <Input
                id="candEmail"
                placeholder="alex.rivera@hiremind.ai"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Interview Format / Type</Label>
                <select
                  value={roundType}
                  onChange={(e) => setRoundType(e.target.value as InterviewType)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="TECHNICAL">TECHNICAL (Concepts & Architecture)</option>
                  <option value="CODING">CODING (Algorithms & Structures)</option>
                  <option value="BEHAVIORAL">BEHAVIORAL (Leadership & Ownership)</option>
                  <option value="MIXED">MIXED (Coding + System + Behavioral)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label>Difficulty Level</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="EASY">EASY (Entry / Junior)</option>
                  <option value="MEDIUM">MEDIUM (Mid / Senior Standard)</option>
                  <option value="HARD">HARD (Staff / Principal Depth)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="numQ">Number of Questions</Label>
                <Input
                  id="numQ"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                  min={1}
                  max={10}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dur">Duration (Minutes)</Label>
                <Input
                  id="dur"
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value, 10))}
                  min={15}
                  max={180}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="title">Round Title</Label>
              <Input
                id="title"
                value={roundTitle}
                onChange={(e) => setRoundTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dt">Date & Time</Label>
              <Input
                id="dt"
                type="datetime-local"
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="intNotes">Focus & Evaluation Notes (Internal Panel)</Label>
              <textarea
                id="intNotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" type="button" onClick={onCloseScheduleModal}>
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                Confirm & Generate Chamber
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {/* Review Questions Studio Modal */}
      {reviewingInterview && (
        <RecruiterQuestionReviewModal
          isOpen={!!reviewingInterview}
          onClose={() => setReviewingInterview(null)}
          interview={reviewingInterview}
          onQuestionsUpdated={fetchLiveInterviews}
        />
      )}

      {/* Proctoring Timeline Modal */}
      {proctoringInterview && (
        <ProctoringTimelineModal
          isOpen={Boolean(proctoringInterview)}
          onClose={() => setProctoringInterview(null)}
          interviewId={proctoringInterview.id}
          interviewTitle={proctoringInterview.title}
          candidateName={proctoringInterview.candidate?.name || 'Candidate'}
        />
      )}

      {/* Recruiter Evaluation Scorecard Modal */}
      {evaluatingInterview && (
        <RecruiterEvaluationModal
          isOpen={Boolean(evaluatingInterview)}
          onClose={() => setEvaluatingInterview(null)}
          interview={evaluatingInterview}
          onEvaluationUpdated={fetchLiveInterviews}
        />
      )}
    </div>
  );
}
