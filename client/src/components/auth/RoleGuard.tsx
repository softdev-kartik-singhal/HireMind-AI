'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showErrorBanner?: boolean;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback,
  showErrorBanner = true,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showErrorBanner) {
      return null;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-rose-500/20 bg-rose-950/20 text-center max-w-lg mx-auto my-8">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-400 mb-6">
          Your current role (<span className="text-rose-300 font-semibold">{user?.role || 'Guest'}</span>) does not have permission to view or manage this section.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
