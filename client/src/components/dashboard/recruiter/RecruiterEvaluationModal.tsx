'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Interview } from '@/types/interview';
import {
  InterviewEvaluationData,
  EvaluationRecommendation,
} from '@/types/evaluation';
import { EvaluationApi } from '@/lib/api-evaluations';
import { useToast } from '@/context/ToastContext';
import {
  ShieldAlert,
  Award,
  CheckCircle2,
  AlertCircle,
  Code2,
  MessageSquare,
  TrendingUp,
  RotateCcw,
  UserCheck,
  Briefcase,
  User,
  Clock,
  Sparkles,
  Save,
  Tag,
  Info,
} from 'lucide-react';

interface RecruiterEvaluationModalProps {
  interview: Interview | null;
  isOpen: boolean;
  onClose: () => void;
  onEvaluationUpdated?: () => void;
}

export const RecruiterEvaluationModal: React.FC<RecruiterEvaluationModalProps> = ({
  interview,
  isOpen,
  onClose,
  onEvaluationUpdated,
}) => {
  const { success, error } = useToast();

  const [evaluation, setEvaluation] = useState<InterviewEvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  // Recruiter override form states
  const [overrideRecommendation, setOverrideRecommendation] =
    useState<EvaluationRecommendation>('MAYBE');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  const fetchEvaluation = useCallback(
    async (force: boolean = false) => {
      if (!interview) return;
      if (force) setIsGenerating(true);
      else setIsLoading(true);

      try {
        const data = await EvaluationApi.getEvaluation(interview.id, force);
        setEvaluation(data);
        setOverrideRecommendation(
          data.recruiterRecommendation || data.recommendation || 'MAYBE'
        );
        setOverrideNotes(data.recruiterNotes || '');
        if (data.isOverridden) {
          setShowOverrideForm(true);
        }
      } catch (err: any) {
        error(
          err.response?.data?.message ||
            err.message ||
            'Failed to load interview evaluation'
        );
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    },
    [interview, error]
  );

  useEffect(() => {
    if (isOpen && interview) {
      fetchEvaluation(false);
    } else {
      setEvaluation(null);
      setShowOverrideForm(false);
    }
  }, [isOpen, interview, fetchEvaluation]);

  const handleSaveOverride = async () => {
    if (!interview) return;
    setIsSavingOverride(true);
    try {
      const updated = await EvaluationApi.overrideEvaluation(interview.id, {
        recommendation: overrideRecommendation,
        recruiterNotes: overrideNotes,
      });
      setEvaluation(updated);
      success('Recruiter override and hiring decision notes saved successfully.');
      if (onEvaluationUpdated) onEvaluationUpdated();
    } catch (err: any) {
      error(
        err.response?.data?.message ||
          err.message ||
          'Failed to save recruiter override'
      );
    } finally {
      setIsSavingOverride(false);
    }
  };

  const getRecBadge = (rec: EvaluationRecommendation) => {
    switch (rec) {
      case 'STRONG_HIRE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            Strong Hire
          </span>
        );
      case 'HIRE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Hire
          </span>
        );
      case 'MAYBE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Maybe / Consider
          </span>
        );
      case 'NO_HIRE':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            No Hire
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-indigo-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getBarGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 65) return 'from-indigo-500 to-purple-500';
    if (score >= 50) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-red-400';
  };

  const rubricDimensions = [
    {
      label: 'Technical Knowledge',
      score: evaluation?.technicalScore ?? 0,
      desc: 'Demonstrated grasp of required system concepts and domain frameworks',
    },
    {
      label: 'Problem Solving',
      score: evaluation?.problemSolvingScore ?? 0,
      desc: 'Analytical reasoning, algorithmic trade-offs, and boundary handling',
    },
    {
      label: 'Coding Performance',
      score: evaluation?.codingScore ?? evaluation?.codeQualityScore ?? 0,
      desc: 'Code modularity, test case execution, and idiomatic syntax',
    },
    {
      label: 'Communication',
      score: evaluation?.communicationScore ?? 0,
      desc: 'Verbal clarity, concise technical taxonomy, and steady delivery pace',
    },
    {
      label: 'Answer Relevance',
      score: evaluation?.answerRelevanceScore ?? 0,
      desc: 'Direct alignment between candidate answers and question rubrics',
    },
    {
      label: 'Job Skill Alignment',
      score: evaluation?.skillAlignmentScore ?? 0,
      desc: 'Coverage of required and preferred skills specified for this role',
    },
    {
      label: 'Interview Performance',
      score: evaluation?.overallScore ?? 0,
      desc: 'Holistic performance across all prompts, live code, and telemetry',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title="Candidate Interview Evaluation Scorecard"
      description="Multi-dimensional AI assessment, skill alignment, and recruiter decision support."
    >
      <div className="space-y-6 pt-2 text-slate-100">
        {/* Candidate & Job Meta Bar */}
        {interview && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <User className="h-3.5 w-3.5 text-purple-400" />
                {interview.candidate?.name || 'Candidate'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                {interview.job?.title || 'Engineering Role'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                {interview.durationMins}m Duration
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchEvaluation(true)}
                disabled={isGenerating || isLoading}
                className="h-8 gap-1.5 text-[11px] border-purple-500/30 text-purple-300 hover:bg-purple-500/15"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Analyzing...' : 'Re-evaluate with AI'}
              </Button>
            </div>
          </div>
        )}

        {/* DECISION SUPPORT DISCLAIMER BANNER (MANDATORY) */}
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-indigo-200/90 leading-relaxed">
            <span className="font-semibold text-white block">
              Recruiter Decision Support System:
            </span>
            <p>
              {evaluation?.decisionSupportDisclaimer ||
                'This evaluation is an AI-assisted decision-support summary designed to assist human recruiters and hiring managers. It does not constitute an automated or irreversible hiring decision.'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !evaluation && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <p className="text-xs text-slate-400">
              Synthesizing verbal transcripts, coding submissions, and rubric criteria...
            </p>
          </div>
        )}

        {/* Evaluation Content */}
        {evaluation && (
          <div className="space-y-6">
            {/* HERO CARD: Overall Score & Recommendation */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/20 border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Overall Recommendation
                  </span>
                  {getRecBadge(
                    (evaluation.isOverridden && evaluation.recruiterRecommendation)
                      ? evaluation.recruiterRecommendation
                      : evaluation.recommendation
                  )}
                  {evaluation.isOverridden && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Overridden by Recruiter
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {evaluation.summary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center shrink-0 min-w-[140px]">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Holistic Score
                </span>
                <span className={`text-4xl font-black block mt-0.5 ${getScoreColor(evaluation.overallScore)}`}>
                  {evaluation.overallScore}%
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Weighted 7-Metric Index
                </span>
              </div>
            </div>

            {/* 7-DIMENSION SCORECARD GRID */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-purple-400" />
                7 Core Rubric Dimensions
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rubricDimensions.map((dim, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{dim.label}</span>
                      <span className={`text-sm font-black ${getScoreColor(dim.score)}`}>
                        {dim.score}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getBarGradient(dim.score)} rounded-full transition-all duration-500`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight">
                      {dim.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* QUALITATIVE FEEDBACK: Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-emerald-500/20 space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Key Demonstrated Strengths
                </h4>
                <ul className="space-y-2">
                  {evaluation.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Growth Areas */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-amber-500/20 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Observed Weaknesses & Gaps
                </h4>
                <ul className="space-y-2">
                  {(evaluation.weaknesses || []).map((w, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* MISSING SKILLS CHIPS */}
            {evaluation.missingSkills && evaluation.missingSkills.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-rose-400" />
                  Missing or Undemonstrated Required Job Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {evaluation.missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* NARRATIVE SUMMARIES: Technical & Communication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-purple-400" />
                  Technical Assessment Summary
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation.technicalSummary}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  Communication & Verbal Summary
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation.communicationSummary}
                </p>
              </div>
            </div>

            {/* AREAS FOR IMPROVEMENT */}
            {evaluation.improvementAreas && evaluation.improvementAreas.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
                  Recommended Areas for Improvement
                </span>
                <ul className="space-y-1.5">
                  {evaluation.improvementAreas.map((area, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-teal-400 font-bold">→</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* RECRUITER OVERRIDE SECTION */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-purple-400" />
                    Recruiter Manual Override & Private Panel Notes
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    As the human reviewer, you can supersede the AI recommendation and record hiring rationale.
                  </p>
                </div>
                {!showOverrideForm && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowOverrideForm(true)}
                    className="text-xs border-purple-500/30 text-purple-300"
                  >
                    Edit Decision
                  </Button>
                )}
              </div>

              {showOverrideForm && (
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">
                      Final Human Recommendation
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE'] as EvaluationRecommendation[]).map(
                        (rec) => (
                          <button
                            key={rec}
                            type="button"
                            onClick={() => setOverrideRecommendation(rec)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                              overrideRecommendation === rec
                                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/30'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {rec.replace('_', ' ')}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">
                      Private Hiring Rationale & Panel Notes
                    </Label>
                    <textarea
                      rows={3}
                      value={overrideNotes}
                      onChange={(e) => setOverrideNotes(e.target.value)}
                      placeholder="Add specific comments on candidate architecture, communication, team fit, or why the recommendation was adjusted..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowOverrideForm(false)}
                      className="text-xs text-slate-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveOverride}
                      disabled={isSavingOverride}
                      className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {isSavingOverride ? 'Saving...' : 'Save Recruiter Decision'}
                    </Button>
                  </div>
                </div>
              )}

              {/* If overridden and form not open, show current notes */}
              {!showOverrideForm && evaluation.isOverridden && (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">Overridden Recommendation:</span>
                    {getRecBadge(evaluation.recruiterRecommendation || evaluation.recommendation)}
                  </div>
                  {evaluation.recruiterNotes && (
                    <p className="text-slate-400 italic mt-1">
                      &ldquo;{evaluation.recruiterNotes}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} size="sm" className="text-xs">
            Close Scorecard
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
