'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Users,
  Activity,
  Database,
  ArrowRight,
  Server,
  Zap,
  Lock,
} from 'lucide-react';

interface Props {
  usersCount: number;
  systemHealth: any;
  onNavigateTab: (tab: string) => void;
}

export function AdminDashboardView({
  usersCount,
  systemHealth,
  onNavigateTab,
}: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Platform Accounts
              </CardTitle>
              <Users className="h-4 w-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white">{usersCount}</div>
            <p className="text-xs text-slate-400 mt-1">Across all workspace roles</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Database Status
              </CardTitle>
              <Database className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">PostgreSQL Ready</div>
            <p className="text-xs text-slate-400 mt-1">Latency: {systemHealth?.database?.latency || '<3ms'}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-300">
                REST API Health
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Operational</div>
            <p className="text-xs text-slate-400 mt-1">Uptime: {systemHealth?.uptime || '99.99%'}</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Security Enforced
              </CardTitle>
              <Lock className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">RBAC Active</div>
            <p className="text-xs text-slate-400 mt-1">HTTP-Only Tokens & bcrypt</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-rose-500/30 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">User Administration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View, edit permissions, and manage user accounts across Candidates, Recruiters, and Administrators.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigateTab('users')}
            className="mt-6 w-full gap-2 bg-rose-600 hover:bg-rose-500 text-white"
          >
            Manage Directory
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-purple-500/30 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">System Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor active connections, JWT token rotation logs, query response latencies, and server load.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigateTab('analytics')}
            className="mt-6 w-full gap-2 text-purple-300"
          >
            Open Telemetry
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Platform Postings Monitor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supervise all company job boards, interview session concurrency, and database integrity.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigateTab('jobs')}
            className="mt-6 w-full gap-2 text-indigo-300"
          >
            Platform Postings
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
