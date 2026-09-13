'use client';

import React from 'react';
import { Resume } from '@/types/resume';
import {
  AlertTriangle,
  X,
  Trash2,
  Loader2,
} from 'lucide-react';

interface ResumeDeleteModalProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const ResumeDeleteModal: React.FC<ResumeDeleteModalProps> = ({
  resume,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !resume) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 animate-scaleUp">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Delete Resume Version?</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Are you sure you want to permanently delete{' '}
          <span className="text-white font-medium">&ldquo;{resume.fileName}&rdquo; (v{resume.version})</span>?
          {resume.isPrimary && (
            <span className="block mt-2 text-amber-400 font-medium">
              ⚠️ This is your active primary resume. Deleting it will automatically promote your next most recent resume to primary.
            </span>
          )}
        </p>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Resume</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
