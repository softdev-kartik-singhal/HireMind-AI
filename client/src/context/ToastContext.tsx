'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, title, type, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, title, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'success' });
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'error' });
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'info' });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'warning' });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
      {/* Toast container floating bottom right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-right-8',
              t.type === 'success' && 'bg-slate-900/95 border-emerald-500/30 text-slate-100',
              t.type === 'error' && 'bg-slate-900/95 border-rose-500/30 text-slate-100',
              t.type === 'warning' && 'bg-slate-900/95 border-amber-500/30 text-slate-100',
              t.type === 'info' && 'bg-slate-900/95 border-indigo-500/30 text-slate-100'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1 space-y-0.5">
              {t.title && <h5 className="font-semibold text-xs text-white uppercase tracking-wider">{t.title}</h5>}
              <p className="text-xs text-slate-300 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
