'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProctoringApi } from '@/lib/api-proctoring';
import {
  ProctoringTimelineSummary,
  ProctoringEventType,
  ProctoringEvent,
} from '@/types/proctoring';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Users,
  CameraOff,
  Layout,
  Maximize,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  interviewTitle: string;
  candidateName: string;
}

const EVENT_CONFIG: Record<
  ProctoringEventType,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  NO_FACE_DETECTED: {
    label: 'Face Not Detected',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: EyeOff,
  },
  MULTIPLE_FACES: {
    label: 'Multiple Faces',
    color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    icon: Users,
  },
  LOOKING_AWAY: {
    label: 'Significant Looking Away',
    color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    icon: Eye,
  },
  CAMERA_DISCONNECTED: {
    label: 'Camera Disconnected',
    color: 'bg-red-500/15 text-red-300 border-red-500/30',
    icon: CameraOff,
  },
  TAB_HIDDEN: {
    label: 'Tab Visibility Lost',
    color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    icon: Layout,
  },
  FULLSCREEN_EXIT: {
    label: 'Fullscreen Exited',
    color: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    icon: Maximize,
  },
};

export function ProctoringTimelineModal({
  isOpen,
  onClose,
  interviewId,
  interviewTitle,
  candidateName,
}: Props) {
  const [timeline, setTimeline] = useState<ProctoringTimelineSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const { error: toastError } = useToast();

  const fetchTimeline = useCallback(async () => {
    if (!interviewId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await ProctoringApi.getTimeline(interviewId);
      setTimeline(data);
    } catch (err: any) {
      console.error('Failed to fetch proctoring timeline:', err);
      setError(err.response?.data?.message || 'Failed to load proctoring timeline.');
    } finally {
      setIsLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    if (isOpen) {
      fetchTimeline();
    }
  }, [isOpen, fetchTimeline]);

  if (!isOpen) return null;

  const filteredEvents = (timeline?.events || []).filter((ev) => {
    if (filterType === 'ALL') return true;
    return ev.eventType === filterType;
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Interview Integrity & Proctoring Timeline"
      maxWidth="2xl"
    >
      <div className="space-y-5 overflow-y-auto max-h-[75vh] pr-1 text-xs">
        {/* Ethical Non-Accusatory Guardrail Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-3 text-indigo-200">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white block">
              Objective Timeline Context Notice
            </span>
            <p className="text-[11px] leading-relaxed text-indigo-200/90">
              {timeline?.disclaimer ||
                'Integrity signals provide objective timeline context (such as tab switching, temporary absence, or multi-face presence) for human review. They do NOT prove cheating or establish malicious intent.'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading proctoring timeline signals...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !error && timeline && (
          <>
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Integrity Rating */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Integrity Rating
                </span>
                <span className="text-xl font-extrabold text-white mt-1 block">
                  {timeline.integrityScore}%
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] mt-1.5 ${
                    timeline.integrityRating === 'HIGH'
                      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                      : timeline.integrityRating === 'MODERATE'
                      ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                      : 'text-rose-300 border-rose-500/30 bg-rose-500/10'
                  }`}
                >
                  {timeline.integrityRating.replace('_', ' ')}
                </Badge>
              </div>

              {/* Clean Focus Time */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Clean Focus Time
                </span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                  {timeline.cleanTimePercentage}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Active in session
                </span>
              </div>

              {/* Total Away Time */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Camera Absence
                </span>
                <span className="text-xl font-extrabold text-amber-300 mt-1 block">
                  {timeline.totalAwayTimeSeconds}s
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {timeline.eventCounts.NO_FACE_DETECTED} absence events
                </span>
              </div>

              {/* Tab Visibility Lost */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Tab Switches
                </span>
                <span className="text-xl font-extrabold text-blue-400 mt-1 block">
                  {timeline.eventCounts.TAB_HIDDEN}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {timeline.totalTabHiddenTimeSeconds}s hidden total
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({timeline.totalEvents})
              </button>
              {(Object.keys(EVENT_CONFIG) as ProctoringEventType[]).map((type) => {
                const count = timeline.eventCounts[type] || 0;
                if (count === 0 && filterType !== type) return null;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      filterType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {EVENT_CONFIG[type].label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Chronological Event Log */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Timeline Event Feed</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Showing {filteredEvents.length} of {timeline.totalEvents} signal(s)
                </span>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 space-y-1">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">
                    No suspicious events or integrity signals recorded
                  </p>
                  <p className="text-[11px]">
                    Candidate maintained uninterrupted focus in this view.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredEvents.map((ev, idx) => {
                    const cfg =
                      EVENT_CONFIG[ev.eventType] || {
                        label: ev.eventType,
                        color: 'bg-slate-800 text-slate-300 border-slate-700',
                        icon: Activity,
                      };
                    const Icon = cfg.icon;

                    return (
                      <div
                        key={ev.id || idx}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg border ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(ev.timestamp)} •{' '}
                              {new Date(ev.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {ev.durationMs ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono text-slate-300 border-slate-700 bg-slate-900"
                            >
                              Duration: {(ev.durationMs / 1000).toFixed(1)}s
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Instant trigger
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <DialogFooter className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
        <span className="text-[10px] text-slate-500">
          HireMind AI Integrity Engine • Client-Side Computer Vision
        </span>
        <Button
          size="sm"
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4"
        >
          Close Timeline
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export default ProctoringTimelineModal;
