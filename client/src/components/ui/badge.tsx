import * as React from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'role';
  roleType?: UserRole;
}

function Badge({ className, variant = 'default', roleType, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    secondary: 'bg-slate-800 text-slate-300 border border-slate-700',
    destructive: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    outline: 'text-slate-300 border border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    role: '',
  };

  let roleClass = '';
  if (roleType === 'ADMIN') {
    roleClass = 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
  } else if (roleType === 'RECRUITER') {
    roleClass = 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
  } else if (roleType === 'CANDIDATE') {
    roleClass = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variant === 'role' ? roleClass : variantStyles[variant],
        className
      )}
      {...props}
    >
      {children || roleType}
    </div>
  );
}

export { Badge };
