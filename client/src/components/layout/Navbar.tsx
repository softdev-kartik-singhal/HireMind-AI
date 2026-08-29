'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { BrainCircuit, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();

  // On dashboard routes, dashboard has its own custom TopNav & Sidebar
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BrainCircuit className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              HireMind <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          {!isLoading && isAuthenticated && user ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex items-center gap-1.5 text-slate-300">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <div className="hidden md:flex items-center">
                <Badge variant="role" roleType={user.role} />
              </div>

              {/* User Dropdown / Profile Link */}
              <Link href="/profile" className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-800/60 transition-colors">
                <Avatar name={user.name} src={user.avatar} size="sm" />
                <span className="hidden sm:inline-block text-sm font-medium text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="text-slate-300 hover:text-rose-400 hover:border-rose-500/40 p-2 sm:px-3 sm:py-2"
                title="Log out"
              >
                <LogOut className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : !isLoading ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
