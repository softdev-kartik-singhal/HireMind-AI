'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CodingQuestion,
  SupportedCodingLanguage,
  CodeExecutionResult,
  CodingSubmission,
  CodeTestCase,
} from '@/types/coding';
import { CodingApi } from '@/lib/api-coding';
import { useToast } from '@/context/ToastContext';
import {
  Play,
  Send,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  Terminal,
  History,
  ShieldCheck,
  Check,
  ChevronRight,
  Maximize2,
  Sparkles,
  Layers,
  FileCode,
} from 'lucide-react';

interface Props {
  question?: CodingQuestion | null;
  interviewId?: string;
  initialCode?: string;
  initialLanguage?: SupportedCodingLanguage;
  onCodeChange?: (code: string, language: SupportedCodingLanguage) => void;
  onSubmitted?: (submission: CodingSubmission) => void;
  className?: string;
}

const DEFAULT_STARTERS: Record<SupportedCodingLanguage, string> = {
  javascript: `function solve(nums, target) {
  // Write your solution here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  python: `def solve(nums, target):
    """
    Write your solution here
    """
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
  cpp: `#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        // Write your solution here
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (seen.find(diff) != seen.end()) {
                return {seen[diff], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
  java: `import java.util.*;

public class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your solution here
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
};

export function LiveCodingIDE({
  question,
  interviewId,
  initialCode,
  initialLanguage = 'javascript',
  onCodeChange,
  onSubmitted,
  className = '',
}: Props) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedCodingLanguage>(initialLanguage);

  // Per-language code buffer
  const [codeBuffers, setCodeBuffers] = useState<
    Record<SupportedCodingLanguage, string>
  >({
    javascript: question?.starterCode?.javascript || DEFAULT_STARTERS.javascript,
    python: question?.starterCode?.python || DEFAULT_STARTERS.python,
    cpp: question?.starterCode?.cpp || DEFAULT_STARTERS.cpp,
    java: question?.starterCode?.java || DEFAULT_STARTERS.java,
  });

  const [currentCode, setCurrentCode] = useState<string>(
    initialCode || codeBuffers[initialLanguage] || DEFAULT_STARTERS[initialLanguage]
  );

  // Execution & Submissions
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<CodeExecutionResult | null>(null);
  const [submissions, setSubmissions] = useState<CodingSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Panel state: 'testcases' | 'console' | 'history'
  const [bottomTab, setBottomTab] = useState<'testcases' | 'console' | 'history'>(
    'testcases'
  );
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // Autosave status
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { success, warning, error: toastError } = useToast();

  // Update starter code when question changes
  useEffect(() => {
    if (question?.starterCode) {
      setCodeBuffers((prev) => ({
        ...prev,
        ...question.starterCode,
      }));
      if (!initialCode) {
        setCurrentCode(
          question.starterCode[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage]
        );
      }
    }
  }, [question, selectedLanguage, initialCode]);

  // Load submissions history
  const fetchSubmissions = useCallback(async () => {
    if (!question?.id) return;
    try {
      setIsLoadingSubmissions(true);
      const hist = await CodingApi.getSubmissions(question.id, interviewId);
      setSubmissions(hist);
    } catch {
      // ignore
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [question?.id, interviewId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handle language change
  const handleLanguageChange = (newLang: SupportedCodingLanguage) => {
    // Save current buffer
    setCodeBuffers((prev) => ({
      ...prev,
      [selectedLanguage]: currentCode,
    }));

    setSelectedLanguage(newLang);
    const nextCode =
      codeBuffers[newLang] ||
      question?.starterCode?.[newLang] ||
      DEFAULT_STARTERS[newLang];
    setCurrentCode(nextCode);
    onCodeChange?.(nextCode, newLang);
  };

  // Handle code edit with debounced autosave
  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
    setCodeBuffers((prev) => ({
      ...prev,
      [selectedLanguage]: newCode,
    }));
    onCodeChange?.(newCode, selectedLanguage);

    setIsAutoSaving(true);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setIsAutoSaving(false);
      setLastAutoSave(new Date());
    }, 1500);
  };

  // Reset code to default starter
  const handleResetCode = () => {
    if (
      !confirm(
        `Reset code back to default starter template for ${selectedLanguage.toUpperCase()}? All current changes will be discarded.`
      )
    ) {
      return;
    }

    const defaultCode =
      question?.starterCode?.[selectedLanguage] || DEFAULT_STARTERS[selectedLanguage];
    setCurrentCode(defaultCode);
    setCodeBuffers((prev) => ({
      ...prev,
      [selectedLanguage]: defaultCode,
    }));
    onCodeChange?.(defaultCode, selectedLanguage);
    success('Code reset to default starter template.');
  };

  // Run Code against visible test cases
  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setBottomTab('testcases');

      const result = await CodingApi.runCode({
        questionId: question?.id,
        interviewId,
        language: selectedLanguage,
        code: currentCode,
      });

      setExecutionResult(result);

      if (result.status === 'ACCEPTED') {
        success(`All ${result.passedTests} sample test cases passed in ${result.totalExecutionTimeMs}ms!`);
      } else if (result.status === 'COMPILATION_ERROR') {
        toastError('Compilation / Syntax Error in code.');
        setBottomTab('console');
      } else {
        warning(`${result.passedTests}/${result.totalTests} sample test cases passed.`);
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution
  const handleFinalSubmit = async () => {
    if (!question?.id) {
      toastError('Cannot submit without an active question.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await CodingApi.submitSolution({
        questionId: question.id,
        interviewId,
        language: selectedLanguage,
        code: currentCode,
      });

      setExecutionResult(res.executionResult);
      setSubmissions((prev) => [res.submission, ...prev]);
      onSubmitted?.(res.submission);

      if (res.executionResult.status === 'ACCEPTED') {
        success('🎉 Solution Accepted! All test cases passed.');
      } else {
        warning(`Solution evaluated: ${res.executionResult.status} (${res.executionResult.passedTests}/${res.executionResult.totalTests} passed).`);
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load past submission back into editor
  const handleLoadSubmissionCode = (sub: CodingSubmission) => {
    setSelectedLanguage(sub.language as SupportedCodingLanguage);
    setCurrentCode(sub.code);
    setCodeBuffers((prev) => ({
      ...prev,
      [sub.language as SupportedCodingLanguage]: sub.code,
    }));
    onCodeChange?.(sub.code, sub.language as SupportedCodingLanguage);
    success(`Loaded ${sub.language} submission from ${new Date(sub.submittedAt).toLocaleTimeString()}.`);
  };

  // Test cases to display (either from execution results or question defaults)
  const displayTestCases = question?.testCases?.filter((tc) => !tc.isHidden) || [
    { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
    { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
  ];

  // Calculate line numbers
  const linesCount = Math.max(16, currentCode.split('\n').length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}
    >
      {/* IDE Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              Code Studio
            </span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
            {(['javascript', 'python', 'cpp', 'java'] as SupportedCodingLanguage[]).map(
              (lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-md transition-all ${
                    selectedLanguage === lang
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'javascript'
                    ? 'JS'
                    : lang === 'python'
                    ? 'Python'
                    : lang === 'cpp'
                    ? 'C++'
                    : 'Java'}
                </button>
              )
            )}
          </div>

          {/* Sandboxed Isolation Security Pill */}
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Isolated Sandbox
          </span>
        </div>

        {/* Right Actions: AutoSave, Reset, Run, Submit */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center text-[10px] text-slate-400 mr-1">
            {isAutoSaving ? (
              <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                <Clock className="h-3 w-3" /> Saving...
              </span>
            ) : lastAutoSave ? (
              <span className="text-slate-500 flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-400" /> Auto-saved
              </span>
            ) : null}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetCode}
            title="Reset code to default starter template"
            className="h-7 px-2 text-xs text-slate-400 hover:text-rose-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={isRunning || isSubmitting}
            onClick={handleRunCode}
            className="h-7 px-3 text-xs gap-1.5 border-slate-700 hover:bg-slate-800 text-slate-200 font-medium"
          >
            <Play className={`h-3 w-3 text-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button
            size="sm"
            disabled={isSubmitting || isRunning}
            onClick={handleFinalSubmit}
            className="h-7 px-3 text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-purple-900/20"
          >
            <Send className={`h-3 w-3 ${isSubmitting ? 'animate-spin' : ''}`} />
            {isSubmitting ? 'Submitting...' : 'Submit Solution'}
          </Button>
        </div>
      </div>

      {/* Editor Main Canvas with Line Numbers */}
      <div className="flex-1 flex overflow-hidden min-h-[340px] bg-[#0d1117]">
        {/* Line Numbers Gutter */}
        <div className="w-12 select-none py-3 text-right pr-3 bg-[#0d1117] border-r border-slate-800/80 font-mono text-[11px] text-slate-600 leading-6">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Input Area */}
        <div className="flex-1 relative overflow-hidden">
          <textarea
            value={currentCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onKeyDown={(e) => {
              // Handle tab key indentation
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newCode =
                  currentCode.substring(0, start) + '  ' + currentCode.substring(end);
                handleCodeChange(newCode);
                setTimeout(() => {
                  e.currentTarget.selectionStart = e.currentTarget.selectionEnd =
                    start + 2;
                }, 0);
              }
            }}
            className="w-full h-full p-3 font-mono text-xs text-slate-100 bg-transparent resize-none focus:outline-none leading-6 whitespace-pre tab-[2]"
          />
        </div>
      </div>

      {/* Bottom Interactive Panel (Test Cases, Console Output, Submission History) */}
      <div className="border-t border-slate-800 bg-slate-900/95 flex flex-col h-56">
        {/* Bottom Panel Navigation */}
        <div className="flex items-center justify-between px-3 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBottomTab('testcases')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                bottomTab === 'testcases'
                  ? 'text-purple-300 border-purple-500 bg-slate-900/60'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Test Cases
              {executionResult && (
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    executionResult.status === 'ACCEPTED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {executionResult.passedTests}/{executionResult.totalTests}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('console')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                bottomTab === 'console'
                  ? 'text-purple-300 border-purple-500 bg-slate-900/60'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Console Logs
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                bottomTab === 'history'
                  ? 'text-purple-300 border-purple-500 bg-slate-900/60'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Submissions ({submissions.length})
            </button>
          </div>

          {/* Execution Time Benchmark */}
          {executionResult && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pr-2">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="h-3 w-3 text-slate-500" />
                {executionResult.totalExecutionTimeMs} ms
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  executionResult.status === 'ACCEPTED'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {executionResult.status}
              </span>
            </div>
          )}
        </div>

        {/* Tab 1: Test Cases Tab */}
        {bottomTab === 'testcases' && (
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {/* Test Case Selector Pills */}
            <div className="flex items-center gap-2">
              {displayTestCases.map((tc, idx) => {
                const exec = executionResult?.results?.[idx];
                const isPassed = exec?.passed;
                const isFailed = exec && !exec.passed;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTestCaseIndex(idx)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
                      selectedTestCaseIndex === idx
                        ? 'bg-slate-800 text-white border-purple-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : isFailed ? (
                      <XCircle className="h-3 w-3 text-rose-400" />
                    ) : null}
                    Case {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Selected Test Case Details */}
            {displayTestCases[selectedTestCaseIndex] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
                    Input
                  </span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto">
                    {displayTestCases[selectedTestCaseIndex].input}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
                    Expected Output
                  </span>
                  <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                    {displayTestCases[selectedTestCaseIndex].expectedOutput}
                  </pre>
                </div>

                {/* Actual Output if executed */}
                {executionResult?.results?.[selectedTestCaseIndex] && (
                  <div className="sm:col-span-2 space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                      Actual Output
                      {executionResult.results[selectedTestCaseIndex].passed ? (
                        <span className="text-emerald-400 font-bold">(Passed)</span>
                      ) : (
                        <span className="text-rose-400 font-bold">(Failed)</span>
                      )}
                    </span>
                    <pre
                      className={`p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto border ${
                        executionResult.results[selectedTestCaseIndex].passed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {executionResult.results[selectedTestCaseIndex].actualOutput ||
                        executionResult.results[selectedTestCaseIndex].error ||
                        'null'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Console Logs */}
        {bottomTab === 'console' && (
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto bg-slate-950">
            {executionResult?.stderr ? (
              <pre className="text-rose-400 whitespace-pre-wrap">
                {executionResult.stderr}
              </pre>
            ) : executionResult?.stdout ? (
              <pre className="text-emerald-300 whitespace-pre-wrap">
                {executionResult.stdout}
              </pre>
            ) : (
              <div className="text-slate-500 text-xs">
                Console output is clear. Run or submit code to view execution logs.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Submission History */}
        {bottomTab === 'history' && (
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-950">
            {isLoadingSubmissions ? (
              <div className="flex justify-center p-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No past submissions recorded for this question yet. Click &quot;Submit Solution&quot; to test.
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        sub.status === 'ACCEPTED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="font-mono text-[11px] text-purple-300 uppercase">
                      {sub.language}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {sub.passedTests}/{sub.totalTests} tests passed
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {sub.executionTime} ms
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">
                      {new Date(sub.submittedAt).toLocaleTimeString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoadSubmissionCode(sub)}
                      className="h-6 px-2 text-[10px] text-purple-300 hover:text-white"
                    >
                      Load Code
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveCodingIDE;

