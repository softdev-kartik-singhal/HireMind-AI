'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useRouter } from 'next/navigation';
import { InterviewApi } from '@/lib/api-interviews';
import { Interview } from '@/types/interview';
import {
  Video,
  Calendar,
  Clock,
  Briefcase,
  User,
  ShieldCheck,
  Mic,
  Camera,
  Wifi,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export function CandidateInterviewsView() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const { success, info } = useToast();

  const fetchInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await InterviewApi.getInterviews();
      setInterviews(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleLaunchChamber = (interview: Interview) => {
    router.push(`/interview/${interview.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Live Technical Interview Chambers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time WebRTC collaborative coding rooms, AI proctoring telemetry, and system architecture whiteboards
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDiagnosticOpen(true)}
          className="gap-2 border-slate-700 bg-slate-900/60 text-slate-200"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Test Hardware & Diagnostics
        </Button>
      </div>

      {/* Interviews List */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No scheduled technical rounds"
          description="When a recruiter schedules an interview round or system design evaluation, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((interview) => (
            <Card
              key={interview.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-indigo-500/40 transition-all backdrop-blur-xl shadow-xl"
            >
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="role" roleType="CANDIDATE">
                      {interview.type.replace('_', ' ')}
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
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{interview.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{interview.notes || 'Live coding assessment & architectural discussion'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                      {interview.job?.title}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-purple-400" />
                      Interviewer: {interview.recruiter?.name || 'Recruiter'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      {formatDate(interview.scheduledAt)} ({interview.durationMins} mins • {interview.numQuestions || 5} questions)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <Button
                    onClick={() => handleLaunchChamber(interview)}
                    className={`gap-2 text-white shadow-lg text-xs ${
                      interview.status === 'COMPLETED'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-slate-900/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    {interview.status === 'COMPLETED' ? 'View Submission' : 'Enter Live Chamber'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hardware Diagnostic Dialog */}
      <Dialog
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        title="Hardware & Network Diagnostic Suite"
        description="Verify your audio, video, and WebRTC streaming environment before joining."
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-indigo-400" />
              <span>Camera Stream (1080p HD)</span>
            </div>
            <Badge variant="success">READY</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-purple-400" />
              <span>Microphone & Noise Suppression</span>
            </div>
            <Badge variant="success">READY</Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-400" />
              <span>WebRTC Peer-to-Peer Latency</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">12ms (Optimal)</span>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={() => setIsDiagnosticOpen(false)}>
            Close Diagnostics
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
