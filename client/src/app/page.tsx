'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  Users,
  Code2,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute top-96 -left-40 w-[500px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md mb-8">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Phase 1 Foundation • Production Auth & RBAC Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Next-Generation AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Technical Recruitment
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            HireMind AI empowers engineering teams, recruiters, and candidates with automated
            evaluations, live technical assessment intelligence, and enterprise-grade role security.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 gap-2">
                  Go to Dashboard ({user?.role})
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 gap-2 shadow-lg shadow-indigo-600/30">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="px-8">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Role-Based Workspaces</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dedicated interfaces with strict permission boundaries for Candidates, Recruiters, and Platform Admins.
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="role" roleType="CANDIDATE" />
                <Badge variant="role" roleType="RECRUITER" />
                <Badge variant="role" roleType="ADMIN" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Enterprise Security</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                JWT tokens with automatic rotation, bcrypt password hashing, and HTTP-only cookies preventing XSS and CSRF.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> HTTP-Only Auth Cookies
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Token Reuse Detection
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 mb-5">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Modern Monorepo Stack</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Clean Next.js 14 App Router client paired with an Express.js TypeScript REST backend and Prisma ORM on PostgreSQL.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Zod Validation Pipeline
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Standardized API Architecture
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
