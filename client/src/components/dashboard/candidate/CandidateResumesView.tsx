'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Resume, ParsedCandidateProfile } from '@/types/resume';
import { resumeApi } from '@/lib/api-resumes';
import { ResumeUploadZone } from '@/components/resumes/ResumeUploadZone';
import { ResumeCard } from '@/components/resumes/ResumeCard';
import { ResumePreviewModal } from '@/components/resumes/ResumePreviewModal';
import { ResumeDeleteModal } from '@/components/resumes/ResumeDeleteModal';
import { CandidateAiProfileModal } from '@/components/resumes/CandidateAiProfileModal';
import {
  FileText,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FolderArchive,
  Zap,
  Star,
  Loader2,
} from 'lucide-react';

export function CandidateResumesView() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [deleteTargetResume, setDeleteTargetResume] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // AI Profile Modal state
  const [aiProfileResume, setAiProfileResume] = useState<Resume | null>(null);
  const [parsingResumeId, setParsingResumeId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resumeApi.getMyResumes();
      setResumes(data);
    } catch (err: any) {
      console.error('Failed to fetch resumes:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load your resumes. Please try refreshing.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUploadSuccess = (newResume: Resume) => {
    fetchResumes();
    setStatusMessage(`Version ${newResume.version} uploaded successfully.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSetPrimary = async (resume: Resume) => {
    if (resume.isPrimary) return;

    setIsSettingPrimary(true);
    try {
      await resumeApi.setPrimaryResume(resume.id);
      await fetchResumes();
      setStatusMessage(`Version ${resume.version}.0 is now your primary resume.`);
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update primary resume.');
    } finally {
      setIsSettingPrimary(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetResume) return;

    setIsDeleting(true);
    try {
      await resumeApi.deleteResume(deleteTargetResume.id);
      setDeleteTargetResume(null);
      await fetchResumes();
      setStatusMessage('Resume deleted successfully.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete resume.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      await resumeApi.downloadResumeFile(resume.id, resume.fileName);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download resume file.');
    }
  };

  const handleParseResume = async (resume: Resume) => {
    setParsingResumeId(resume.id);
    setError(null);
    try {
      const result = await resumeApi.parseResume(resume.id);
      await fetchResumes();
      setStatusMessage(`Resume "${resume.fileName}" parsed successfully with AI!`);
      // Open AI profile viewer
      setAiProfileResume({
        ...resume,
        parsedData: result.parsedData,
        parsingStatus: 'COMPLETED',
      });
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'AI Parsing failed. Please try again.');
      await fetchResumes();
    } finally {
      setParsingResumeId(null);
    }
  };

  const handleViewAiProfile = (resume: Resume) => {
    setAiProfileResume(resume);
  };

  const primaryResume = resumes.find((r) => r.isPrimary);
  const parsedCount = resumes.filter((r) => r.parsingStatus === 'COMPLETED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Resume Management & Parsing</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload PDF resumes, extract structured skills and work experience with AI, and manage your active application profile.
          </p>
        </div>

        <button
          onClick={fetchResumes}
          disabled={loading}
          className="self-start sm:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`}
          />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Alerts */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300 animate-fadeIn">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Versions</p>
              <p className="text-2xl font-bold text-white mt-1">{resumes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Historical version tracking</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Primary Version</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {primaryResume ? `v${primaryResume.version}.0` : 'None'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {primaryResume ? primaryResume.fileName : 'Upload a resume to set primary'}
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">AI Parsed Profiles</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {parsedCount} / {resumes.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Zod validated & normalized</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Security Check</p>
              <p className="text-base font-bold text-indigo-400 mt-1">Encrypted & Private</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Zero public exposition</p>
        </div>
      </div>

      {/* Upload Zone */}
      <ResumeUploadZone
        onUploadSuccess={handleUploadSuccess}
        existingResumesCount={resumes.length}
      />

      {/* Resumes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderArchive className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Your Uploaded Resumes</h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {resumes.length}
            </span>
          </div>
        </div>

        {loading && resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-400 mt-3">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-200">No Resumes Uploaded</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your PDF resume above to apply to engineering roles and have your qualifications extracted automatically with AI.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onPreview={(r) => setPreviewResume(r)}
                onDownload={handleDownload}
                onSetPrimary={handleSetPrimary}
                onDeleteRequest={(r) => setDeleteTargetResume(r)}
                onParseResume={handleParseResume}
                onViewAiProfile={handleViewAiProfile}
                isSettingPrimary={isSettingPrimary}
                isParsing={parsingResumeId === resume.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Resume Parsing Architecture Info Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>AI Resume Parsing Engine</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Zero-Trust AI Extraction & Normalization
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you click &ldquo;Parse with AI&rdquo;, our backend extracts raw PDF text, evaluates experience and skills with Gemini LLMs, validates model outputs through strict Zod schemas, and normalizes candidate records into PostgreSQL for instant recruiter matchmaking.
            </p>
          </div>
          <span className="self-start md:self-auto px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Engine</span>
          </span>
        </div>
      </div>

      {/* Modals */}
      <ResumePreviewModal
        resume={previewResume}
        isOpen={Boolean(previewResume)}
        onClose={() => setPreviewResume(null)}
      />

      <ResumeDeleteModal
        resume={deleteTargetResume}
        isOpen={Boolean(deleteTargetResume)}
        onClose={() => setDeleteTargetResume(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* AI Profile Modal */}
      <CandidateAiProfileModal
        profile={aiProfileResume?.parsedData as ParsedCandidateProfile || null}
        isOpen={Boolean(aiProfileResume && aiProfileResume.parsedData)}
        onClose={() => setAiProfileResume(null)}
        resumeFileName={aiProfileResume?.fileName}
        resumeVersion={aiProfileResume?.version}
      />
    </div>
  );
}
