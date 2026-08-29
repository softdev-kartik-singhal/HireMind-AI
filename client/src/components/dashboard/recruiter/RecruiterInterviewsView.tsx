'use client';

import React, { useState } from 'react';
import { RecruiterInterviewSession } from '@/lib/dashboard-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Video, Plus, Search, Calendar, User, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Props {
  interviews: RecruiterInterviewSession[];
  isScheduleModalOpen: boolean;
  onCloseScheduleModal: () => void;
  onAddInterview: (interview: RecruiterInterviewSession) => void;
  initialCandidateName?: string;
}

export function RecruiterInterviewsView({
  interviews,
  isScheduleModalOpen,
  onCloseScheduleModal,
  onAddInterview,
  initialCandidateName = '',
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidateName, setCandidateName] = useState(initialCandidateName);
  const [jobTitle, setJobTitle] = useState('Senior Backend Engineer');
  const [interviewerName, setInterviewerName] = useState('Sarah Jenkins (Tech Lead)');
  const [scheduledTime, setScheduledTime] = useState('Sep 4, 2026 at 2:00 PM EST');
  const [interviewType, setInterviewType] = useState<'Live Coding' | 'System Design' | 'AI Screening'>('Live Coding');
  const { success } = useToast();

  const filteredInterviews = interviews.filter((item) =>
    item.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName) return;

    const newSession: RecruiterInterviewSession = {
      id: `int-${Date.now()}`,
      candidateName,
      jobTitle,
      interviewerName,
      scheduledTime,
      type: interviewType,
      status: 'Confirmed',
    };

    onAddInterview(newSession);
    onCloseScheduleModal();
    setCandidateName('');
    success(`Interview confirmed with ${candidateName} for ${scheduledTime}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Interview Schedules & Rooms</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate live coding assessments, panel interviews, and automated screenings
          </p>
        </div>
        <Button onClick={() => onCloseScheduleModal()} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <Input
          placeholder="Search by candidate or job..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      {/* Interviews Grid */}
      {filteredInterviews.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No interview sessions found"
          description="Schedule a technical coding or system design evaluation for your candidates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((session) => (
            <Card
              key={session.id}
              className="border-slate-800/80 bg-slate-900/60 hover:border-purple-500/30 transition-all backdrop-blur-xl flex flex-col justify-between"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="role" roleType="RECRUITER">
                    {session.type}
                  </Badge>
                  <Badge variant={session.status === 'Confirmed' ? 'success' : 'default'} className="text-[10px]">
                    {session.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-white leading-tight">
                  {session.candidateName}
                </CardTitle>
                <CardDescription className="text-xs text-purple-300 font-medium">
                  {session.jobTitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Panel: {session.interviewerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{session.scheduledTime}</span>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                  <Video className="h-3.5 w-3.5 text-purple-400" />
                  Enter Interview Chamber
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Dialog
        isOpen={isScheduleModalOpen}
        onClose={onCloseScheduleModal}
        title="Schedule Technical Interview"
        description="Configure round type, candidate assignment, and interviewer panel."
      >
        <form onSubmit={handleSchedule} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              placeholder="e.g. Alex Rivera"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="jobTitle">Position</Label>
            <Input
              id="jobTitle"
              placeholder="e.g. Senior Backend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="panel">Assigned Interviewer</Label>
            <Input
              id="panel"
              placeholder="e.g. Sarah Jenkins (Tech Lead)"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Interview Format</Label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as any)}
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Live Coding">Live Coding</option>
                <option value="System Design">System Design</option>
                <option value="AI Screening">AI Screening</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="schedule">Scheduled Time</Label>
              <Input
                id="schedule"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" type="button" onClick={onCloseScheduleModal}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-purple-600 hover:bg-purple-500 text-white">
              Confirm & Send Invite
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
