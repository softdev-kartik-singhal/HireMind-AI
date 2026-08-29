'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Search,
  Sun,
  Moon,
  User,
  KeyRound,
  LogOut,
  Shield,
  Check,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '@/types/auth';

interface TopNavProps {
  onOpenMobile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function TopNav({ onOpenMobile, searchQuery, onSearchChange }: TopNavProps) {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchRoleDemo = (newRole: UserRole) => {
    updateUser({ role: newRole });
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="p-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800/80"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidates, jobs, interviews, assessments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors focus:outline-none"
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white max-w-[100px] truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">{user?.role?.toLowerCase()}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in zoom-in-95 duration-150 text-slate-100 space-y-2">
              <div className="px-3 py-2 border-b border-slate-800/60">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-2">
                  <Badge variant="role" roleType={user?.role} />
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  Account Profile
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                >
                  <KeyRound className="h-4 w-4 text-purple-400" />
                  Security & Password
                </Link>
              </div>

              {/* Quick Role Switcher for Showcase/Demo */}
              <div className="pt-2 border-t border-slate-800/60">
                <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Preview Role Experience
                </span>
                <div className="grid grid-cols-3 gap-1 px-1">
                  {(['CANDIDATE', 'RECRUITER', 'ADMIN'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchRoleDemo(r)}
                      className={`text-[10px] py-1 rounded font-semibold transition-colors ${
                        user?.role === r
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {r.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
