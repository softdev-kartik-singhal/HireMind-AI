'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Interview, InterviewQuestion, QuestionCategory, InterviewDifficulty } from '@/types/interview';
import { InterviewApi } from '@/lib/api-interviews';
import { useToast } from '@/context/ToastContext';
import {
  Sparkles,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Save,
  X,
  Code2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview;
  onQuestionsUpdated?: () => void;
}

const CATEGORIES: QuestionCategory[] = [
  'Fundamentals',
  'Technical',
  'Scenario-based',
  'Problem-solving',
  'Project-based',
  'Behavioral',
];

export function RecruiterQuestionReviewModal({
  isOpen,
  onClose,
  interview,
  onQuestionsUpdated,
}: Props) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<QuestionCategory>('Technical');
  const [editDifficulty, setEditDifficulty] = useState<InterviewDifficulty>('MEDIUM');
  const [editExpectedTopics, setEditExpectedTopics] = useState('');
  const [editEvaluationCriteria, setEditEvaluationCriteria] = useState('');
  const [editStarterCode, setEditStarterCode] = useState('');

  // Add new question form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<QuestionCategory>('Technical');
  const [newDifficulty, setNewDifficulty] = useState<InterviewDifficulty>('MEDIUM');
  const [newExpectedTopics, setNewExpectedTopics] = useState('');
  const [newEvaluationCriteria, setNewEvaluationCriteria] = useState('');
  const [newStarterCode, setNewStarterCode] = useState('');

  const { success, error, info } = useToast();

  // Load questions (persisted from PostgreSQL)
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const loaded = await InterviewApi.getQuestions(interview.id);
      setQuestions(loaded);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load interview questions');
    } finally {
      setIsLoading(false);
    }
  }, [interview.id, error]);

  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, fetchQuestions]);

  // Start editing a question
  const handleStartEdit = (q: InterviewQuestion) => {
    setEditingId(q.id);
    setEditTitle(q.title);
    setEditDescription(q.description);
    setEditCategory((q.category as QuestionCategory) || 'Technical');
    setEditDifficulty(q.difficulty || 'MEDIUM');
    setEditExpectedTopics((q.expectedTopics || []).join(', '));
    setEditEvaluationCriteria((q.evaluationCriteria || []).join('\n'));
    setEditStarterCode(q.starterCode || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Save edited question
  const handleSaveEdit = async (questionId: string) => {
    try {
      setIsSubmitting(true);
      const topics = editExpectedTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const criteria = editEvaluationCriteria
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);

      const updated = await InterviewApi.updateQuestion(interview.id, questionId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        difficulty: editDifficulty,
        expectedTopics: topics.length > 0 ? topics : ['Core concepts'],
        evaluationCriteria: criteria.length > 0 ? criteria : ['Technical clarity'],
        starterCode: editStarterCode.trim() || undefined,
      });

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...updated } : q))
      );
      setEditingId(null);
      success('Question updated successfully!');
      onQuestionsUpdated?.();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? The remaining questions will be re-indexed.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await InterviewApi.deleteQuestion(interview.id, questionId);
      setQuestions((prev) => {
        const remaining = prev.filter((q) => q.id !== questionId);
        return remaining.map((q, idx) => ({ ...q, orderIndex: idx + 1 }));
      });
      success('Question deleted successfully!');
      onQuestionsUpdated?.();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move Question Up/Down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setQuestions(newQuestions.map((q, idx) => ({ ...q, orderIndex: idx + 1 })));

    try {
      const questionIds = newQuestions.map((q) => q.id);
      const reordered = await InterviewApi.reorderQuestions(interview.id, questionIds);
      setQuestions(reordered);
      success('Question order updated.');
      onQuestionsUpdated?.();
    } catch (err: any) {
      error('Failed to save new question order. Reverting...');
      fetchQuestions();
    }
  };

  // Add Custom Question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const topics = newExpectedTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const criteria = newEvaluationCriteria
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);

      const added = await InterviewApi.addQuestion(interview.id, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        difficulty: newDifficulty,
        expectedTopics: topics.length > 0 ? topics : ['Core concepts'],
        evaluationCriteria: criteria.length > 0 ? criteria : ['Technical clarity'],
        starterCode: newStarterCode.trim() || undefined,
      });

      setQuestions((prev) => [...prev, added]);
      setIsAddingNew(false);
      setNewTitle('');
      setNewDescription('');
      setNewExpectedTopics('');
      setNewEvaluationCriteria('');
      setNewStarterCode('');
      success('Custom question added to interview chamber!');
      onQuestionsUpdated?.();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Regenerate with AI (force refresh)
  const handleRegenerateQuestions = async () => {
    if (
      !confirm(
        'Are you sure you want to regenerate questions with AI? This will replace all existing unsubmitted questions with freshly generated ones.'
      )
    ) {
      return;
    }

    try {
      setIsRegenerating(true);
      const result = await InterviewApi.generateQuestions(interview.id, true);
      setQuestions(result.questions);
      success(`Generated ${result.questions.length} new tailored questions with AI!`);
      onQuestionsUpdated?.();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to regenerate questions');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Fundamentals':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Technical':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Scenario-based':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Problem-solving':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Project-based':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Behavioral':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Interview Question Review Studio"
      description="Review, customize, reorder, or add questions before candidate enters the live chamber."
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-slate-200">
        {/* Header Metadata Bar */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{interview.title}</h3>
              <Badge variant="role" roleType="RECRUITER">
                {interview.type}
              </Badge>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {interview.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Candidate: <span className="text-slate-200 font-medium">{interview.candidate?.name}</span> | Job:{' '}
              <span className="text-purple-300 font-medium">{interview.job?.title}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isRegenerating || isLoading}
              onClick={handleRegenerateQuestions}
              className="gap-1.5 border-purple-500/30 hover:bg-purple-500/15 text-purple-300 text-xs"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate with AI
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Question
            </Button>
          </div>
        </div>

        {/* Add Question Inline Form */}
        {isAddingNew && (
          <form
            onSubmit={handleAddQuestion}
            className="p-5 rounded-xl bg-slate-900 border border-purple-500/40 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                Add New Question
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[11px] text-slate-400">Question Title</Label>
                <Input
                  required
                  placeholder="e.g. Distributed Consensus in Distributed KV Stores"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
                  className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 text-xs text-white px-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-slate-400">Question Prompt / Scenario</Label>
              <textarea
                required
                rows={3}
                placeholder="Describe the challenge, scenario, or technical inquiry..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Expected Topics (Comma-separated)</Label>
                <Input
                  placeholder="Raft algorithm, Quorum writes, Split-brain recovery"
                  value={newExpectedTopics}
                  onChange={(e) => setNewExpectedTopics(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-400">Difficulty</Label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as InterviewDifficulty)}
                  className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 text-xs text-white px-2"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-slate-400">Evaluation Criteria (One per line)</Label>
              <textarea
                rows={2}
                placeholder="Explains leader election timeouts&#10;Differentiates strongly consistent reads vs eventual consistency"
                value={newEvaluationCriteria}
                onChange={(e) => setNewEvaluationCriteria(e.target.value)}
                className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                {isSubmitting ? 'Adding...' : 'Save Question'}
              </Button>
            </div>
          </form>
        )}

        {/* Questions List */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/50 rounded-xl border border-slate-800">
            <HelpCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No questions found</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Regenerate with AI&quot; to populate questions using our intelligent engine.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {questions.map((q, index) => {
              const isEditing = editingId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isEditing
                      ? 'bg-slate-900 border-purple-500/50 shadow-lg'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Editing Mode */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-purple-300">
                          Editing Question #{q.orderIndex}
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-[11px] text-slate-400">Title</Label>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-400">Category</Label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as QuestionCategory)}
                            className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 text-xs text-white px-2"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-slate-400">Question Description / Prompt</Label>
                        <textarea
                          rows={3}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-400">Expected Topics (Comma-separated)</Label>
                          <Input
                            value={editExpectedTopics}
                            onChange={(e) => setEditExpectedTopics(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-slate-400">Difficulty</Label>
                          <select
                            value={editDifficulty}
                            onChange={(e) => setEditDifficulty(e.target.value as InterviewDifficulty)}
                            className="w-full h-8 rounded-md bg-slate-950 border border-slate-800 text-xs text-white px-2"
                          >
                            <option value="EASY">EASY</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HARD">HARD</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-slate-400">Evaluation Criteria (One per line)</Label>
                        <textarea
                          rows={2}
                          value={editEvaluationCriteria}
                          onChange={(e) => setEditEvaluationCriteria(e.target.value)}
                          className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-xs text-slate-400"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleSaveEdit(q.id)}
                          className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-slate-800 text-purple-300 font-mono font-bold flex items-center justify-center text-xs border border-slate-700">
                            #{q.orderIndex}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(q.category)}`}>
                            {q.category}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {q.difficulty}
                          </span>
                          {q.isAiGenerated && (
                            <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              <Sparkles className="h-3 w-3" />
                              AI Generated
                            </span>
                          )}
                        </div>

                        {/* Actions (Reorder, Edit, Delete) */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMove(index, 'up')}
                            title="Move Up"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={index === questions.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            title="Move Down"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            title="Edit Question"
                            className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-slate-800 ml-1"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            title="Delete Question"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Title & Description */}
                      <div>
                        <h4 className="text-sm font-semibold text-white">{q.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                          {q.description}
                        </p>
                      </div>

                      {/* Expected Topics */}
                      {q.expectedTopics && q.expectedTopics.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Layers className="h-3 w-3 text-purple-400" />
                            Expected Topics:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {q.expectedTopics.map((topic, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/80"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evaluation Criteria */}
                      {q.evaluationCriteria && q.evaluationCriteria.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            Evaluation Criteria:
                          </span>
                          <ul className="space-y-0.5 text-[11px] text-slate-400 pl-3">
                            {q.evaluationCriteria.map((crit, i) => (
                              <li key={i} className="list-disc">
                                {crit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Starter Code Preview if present */}
                      {q.starterCode && (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                            <Code2 className="h-3 w-3" /> Starter Template
                          </div>
                          <pre className="line-clamp-3">{q.starterCode}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter className="mt-5 border-t border-slate-800 pt-3">
        <Button size="sm" onClick={onClose} className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
          Done & Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
