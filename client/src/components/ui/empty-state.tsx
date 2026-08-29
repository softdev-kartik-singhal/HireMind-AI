import React from 'react';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 mb-4 ring-8 ring-indigo-500/5">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
