'use client';

import React, { useEffect, useState } from 'react';
import { Resume } from '@/types/resume';
import { resumeApi } from '@/lib/api-resumes';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  Star,
  Loader2,
} from 'lucide-react';

interface ResumePreviewModalProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  resume,
  isOpen,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let currentBlobUrl: string | null = null;

    if (isOpen && resume) {
      setLoading(true);
      setError(null);

      resumeApi
        .getResumeBlobUrl(resume.id)
        .then((url) => {
          currentBlobUrl = url;
          setBlobUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load resume PDF:', err);
          setError('Unable to load PDF stream. Please verify your connection.');
          setLoading(false);
        });
    } else {
      setBlobUrl(null);
    }

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [isOpen, resume]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !resume) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await resumeApi.downloadResumeFile(resume.id, resume.fileName);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-scaleUp">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-white truncate max-w-sm sm:max-w-md">
                  {resume.fileName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
                  v{resume.version}.0
                </span>
                {resume.isPrimary && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Primary</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatFileSize(resume.fileSize)} • Uploaded{' '}
                {new Date(resume.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {blobUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>New Tab</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400">Loading secure resume stream...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center p-6 max-w-sm">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Preview Unavailable</p>
              <p className="text-xs text-slate-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Download PDF File Instead
              </button>
            </div>
          )}

          {blobUrl && !loading && (
            <iframe
              src={blobUrl}
              title={resume.fileName}
              className="w-full h-full border-0 bg-slate-950"
            />
          )}
        </div>
      </div>
    </div>
  );
};
