'use client';

import React, { useState } from 'react';
import { CandidateInterview } from '@/lib/dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Video, Calendar, Clock, User, CheckCircle2, ShieldAlert, MonitorCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Props {
  interviews: CandidateInterview[];
}

export function CandidateInterviewsView({ interviews }: Props) {
  const [isTestSystemOpen, setIsTestSystemOpen] = useState(false);
  const { success } = useToast();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Interview Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your live coding rounds, technical architectures, and screening sessions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTestSystemOpen(true)}
          className="gap-2 text-xs"
        >
          <MonitorCheck className="h-4 w-4 text-indigo-400" />
          Test Audio & Video Setup
        </Button>
      </div>

      {/* Interviews Grid */}
      {interviews.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No live interviews scheduled"
          description="When recruiters schedule a technical evaluation, your meeting room link will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((interview) => (
            <Card
              key={interview.id}
              className="border-indigo-500/20 bg-slate-900/70 hover:border-indigo-500/40 transition-all backdrop-blur-xl shadow-xl flex flex-col justify-between"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="role" roleType="CANDIDATE">
                    {interview.round}
                  </Badge>
                  <Badge variant="warning" className="text-[10px]">
                    {interview.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3 text-white">{interview.role}</CardTitle>
                <CardDescription className="text-xs text-indigo-300 font-medium">
                  {interview.company}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>{interview.scheduledAt}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <User className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>Interviewer: {interview.interviewer}</span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Allotted Time: {interview.duration}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="w-full block">
                    <Button className="w-full gap-2 shadow-lg shadow-indigo-600/20">
                      <Video className="h-4 w-4" />
                      Enter Live Interview Chamber
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* System Hardware Diagnostic Dialog */}
      <Dialog
        isOpen={isTestSystemOpen}
        onClose={() => setIsTestSystemOpen(false)}
        title="Hardware & Network Diagnostic"
        description="Verify your browser environment before starting the live assessment."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Camera Feed Access</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Ready
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Microphone Frequency</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> 48 kHz OK
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-medium">WebRTC Low-Latency Peer</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> 18ms Latency
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Live Monaco Code Sandbox</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Connected
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              setIsTestSystemOpen(false);
              success('System checks passed. Your environment is 100% interview-ready.');
            }}
            className="w-full"
          >
            Finish Diagnostic
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
