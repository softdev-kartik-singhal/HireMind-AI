'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  FileUp,
  Video,
  Code2,
  Award,
  UserCheck,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Activity,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();

  // Navigation Items per role
  const getNavItems = (): NavItem[] => {
    if (user?.role === 'CANDIDATE') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'jobs', label: 'Explore Tech Jobs', icon: Briefcase },
        { id: 'resumes', label: 'My Resumes', icon: FileUp },
        { id: 'applications', label: 'My Applications', icon: FileText },
        { id: 'interviews', label: 'Interviews', icon: Video },
        { id: 'tests', label: 'Coding Tests', icon: Code2 },
        { id: 'results', label: 'Results', icon: Award },
        { id: 'profile', label: 'Profile', icon: UserCheck },
      ];
    }

    if (user?.role === 'RECRUITER') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'candidates', label: 'Candidates', icon: Users },
        { id: 'interviews', label: 'Interviews', icon: Video },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    // Default: ADMIN
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'jobs', label: 'Jobs', icon: Briefcase },
      { id: 'interviews', label: 'Interviews', icon: Video },
      { id: 'analytics', label: 'System Analytics', icon: Activity },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 lg:static',
          isCollapsed ? 'w-20' : 'w-64',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
          <Link href="/" className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                HireMind <span className="text-indigo-400">AI</span>
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Role Badge Indicator */}
        {!isCollapsed && user?.role && (
          <div className="px-4 py-3 border-b border-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Workspace
              </span>
              <Badge variant="role" roleType={user.role} />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 group',
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200',
                    !isCollapsed && 'mr-3'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile Mini Footer */}
        <div className="border-t border-slate-800 p-3">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
