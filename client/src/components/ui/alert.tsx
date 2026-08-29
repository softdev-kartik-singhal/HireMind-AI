import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title?: string;
}

export function Alert({
  variant = 'default',
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const icons = {
    default: <Info className="h-5 w-5 text-indigo-400 shrink-0" />,
    destructive: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
  };

  const variants = {
    default: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
    destructive: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
    success: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
    warning: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-4 text-sm leading-relaxed backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight text-white">{title}</h5>}
        <div className="text-xs opacity-90">{children}</div>
      </div>
    </div>
  );
}
