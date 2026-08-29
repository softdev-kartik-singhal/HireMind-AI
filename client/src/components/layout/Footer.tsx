'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BrainCircuit } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 py-8 text-slate-500 text-xs">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-4 w-4 text-indigo-500" />
          <span className="font-semibold text-slate-300">HireMind AI</span>
          <span>© {new Date().getFullYear()} — AI-Powered Technical Recruitment Platform</span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="hover:text-slate-300 cursor-pointer">Security</span>
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
