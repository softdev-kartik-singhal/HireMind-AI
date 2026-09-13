'use client';

import React, { useState } from 'react';
import { Resume } from '@/types/resume';
import {
  FileText,
  Eye,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  Cpu,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface ResumeCardProps {
  resume: Resume;
  onPreview: (resume: Resume) => void;
  onDownload: (resume: Resume) => void;
  onSetPrimary: (resume: Resume) => Promise<void>;
  onDeleteRequest: (resume: Resume) => void;
  onParseResume: (resume: Resume) => Promise<void>;
  onViewAiProfile: (resume: Resume) => void;
  isSettingPrimary?: boolean;
  isParsing?: boolean;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onPreview,
  onDownload,
  onSetPrimary,
  onDeleteRequest,
  onParseResume,
  onViewAiProfile,
  isSettingPrimary = false,
  isParsing = false,
}) => {
  const [downloading, setDownloading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadClick = async () => {
    setDownloading(true);
    try {
      await onDownload(resume);
    } finally {
      setDownloading(false);
    }
  };

  const parsingStatus = resume.parsingStatus || 'PENDING';

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 p-5 ${
        resume.isPrimary
          ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-500/10 hover:border-indigo-400'
          : 'bg-slate-900/60 backdrop-blur-md border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 shadow-lg'
      }`}
    >
      {/* Primary indicator ribbon */}
      {resume.isPrimary && (
        <div className="absolute top-0 right-0 -mt-2.5 mr-4 flex items-center space-x-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
          <span>Active Primary</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & File Info */}
        <div className="flex items-start space-x-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-inner ${
              resume.isPrimary
                ? 'bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-500/40 text-indigo-400'
                : 'bg-slate-800/80 border border-slate-700/80 text-slate-400'
            }`}
          >
            <FileText className="w-7 h-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md group-hover:text-indigo-300 transition-colors">
                {resume.fileName}
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                v{resume.version}.0
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1.5 flex-wrap gap-y-1">
              <span className="font-mono text-slate-300">{formatFileSize(resume.fileSize)}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500 inline" />
                <span>{formatDate(resume.createdAt)}</span>
              </span>
            </div>

            {/* AI Parsing status badges & interactive triggers */}
            <div className="mt-2.5 flex items-center space-x-2 flex-wrap gap-y-1">
              {parsingStatus === 'COMPLETED' ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>AI Parsed & Normalized</span>
                </span>
              ) : parsingStatus === 'PROCESSING' || isParsing ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 animate-pulse">
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  <span>Parsing with AI...</span>
                </span>
              ) : parsingStatus === 'FAILED' ? (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span>Parsing Failed</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Cpu className="w-3 h-3 text-indigo-400" />
                  <span>AI Parser Ready</span>
                </span>
              )}

              <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400/90 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Signature Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions toolbar */}
        <div className="flex items-center space-x-2 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 w-full sm:w-auto justify-end flex-wrap gap-y-2">
          {/* AI Profile Viewer Button (if completed) */}
          {parsingStatus === 'COMPLETED' && (
            <button
              type="button"
              onClick={() => onViewAiProfile(resume)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              title="View structured AI extracted profile"
            >
              <UserCheck className="w-4 h-4" />
              <span>View AI Profile</span>
            </button>
          )}

          {/* AI Parse Button */}
          {parsingStatus !== 'COMPLETED' && (
            <button
              type="button"
              onClick={() => onParseResume(resume)}
              disabled={isParsing || parsingStatus === 'PROCESSING'}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
              title="Extract structured profile with AI"
            >
              {isParsing || parsingStatus === 'PROCESSING' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>{parsingStatus === 'FAILED' ? 'Retry Parse' : 'Parse with AI'}</span>
                </>
              )}
            </button>
          )}

          {/* Set Primary Button */}
          {!resume.isPrimary ? (
            <button
              type="button"
              onClick={() => onSetPrimary(resume)}
              disabled={isSettingPrimary}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 text-xs font-medium transition-all"
              title="Make this your primary resume for job applications"
            >
              <Star className="w-4 h-4" />
              <span className="hidden md:inline">Make Primary</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center space-x-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Primary</span>
            </div>
          )}

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(resume)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-medium transition-all cursor-pointer"
            title="Preview resume PDF"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden lg:inline">Preview</span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={downloading}
            className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
            title="Download PDF"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDeleteRequest(resume)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-500/10 border border-slate-700/60 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete this version"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
