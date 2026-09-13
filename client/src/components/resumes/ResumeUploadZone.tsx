'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { resumeApi } from '@/lib/api-resumes';
import { Resume } from '@/types/resume';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Star,
  Loader2,
} from 'lucide-react';

interface ResumeUploadZoneProps {
  onUploadSuccess: (newResume: Resume) => void;
  existingResumesCount?: number;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const ResumeUploadZone: React.FC<ResumeUploadZoneProps> = ({
  onUploadSuccess,
  existingResumesCount = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [setPrimary, setSetPrimary] = useState(existingResumesCount === 0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check MIME or extension
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return 'Only PDF documents (.pdf) are allowed.';
    }

    if (file.size > MAX_SIZE_BYTES) {
      return `File size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is ${MAX_SIZE_MB} MB.`;
    }

    if (file.size === 0) {
      return 'The selected file is empty.';
    }

    return null;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccessMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await resumeApi.uploadResume(selectedFile, {
        setPrimary: setPrimary || existingResumesCount === 0,
        onProgress: (pct) => {
          setProgress(pct);
        },
      });

      setSuccessMessage(
        `Resume "${result.fileName}" (Version ${result.version}) uploaded successfully!`
      );
      setSelectedFile(null);
      setProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = '';

      onUploadSuccess(result);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload resume. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <UploadCloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Upload New Resume
            </h3>
            <p className="text-xs text-slate-400">
              PDF format only • Max {MAX_SIZE_MB}MB • Automatic versioning
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1.5 rounded-full font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>AI Parser Ready</span>
        </div>
      </div>

      {/* Drag and drop box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer text-center group ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01] shadow-xl shadow-indigo-500/10'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center space-y-3 w-full max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-center w-full">
              <p className="text-sm font-semibold text-white truncate max-w-xs mx-auto">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
              </p>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedFile();
                }}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center space-x-1 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10"
              >
                <X className="w-3.5 h-3.5" />
                <span>Choose another file</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:scale-105 transition-all shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your PDF resume here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                or <span className="text-indigo-400 underline font-medium">browse your files</span>
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                PDF
              </span>
              <span>•</span>
              <span>Max {MAX_SIZE_MB}MB</span>
              <span>•</span>
              <span>Secure & Private</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload settings & action buttons */}
      {selectedFile && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={setPrimary || existingResumesCount === 0}
              disabled={existingResumesCount === 0 || uploading}
              onChange={(e) => setSetPrimary(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <span className="flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
              <span>Set as primary resume for applications</span>
            </span>
          </label>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading ({progress}%)...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload progress bar */}
      {uploading && (
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading & validating security signatures...</span>
            <span className="font-mono text-indigo-400 font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-300">Upload Failed</p>
            <p className="mt-0.5 text-red-400/90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success alert banner */}
      {successMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3 text-emerald-400 text-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
          <div className="flex-1">
            <p className="font-medium text-emerald-300">Success</p>
            <p className="mt-0.5 text-emerald-400/90">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
