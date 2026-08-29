import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-400 font-medium py-1">
      <Link href="/dashboard" className="flex items-center hover:text-white transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-indigo-300 font-semibold' : ''}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
