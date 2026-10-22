'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Academic workspace and active recall queue' },
  '/subjects': { title: 'Subjects', subtitle: 'Curated courses and organized reference materials' },
  '/upload': { title: 'Upload Materials', subtitle: 'Import lecture slides, readings, and textbooks' },
  '/exams': { title: 'Mock Exams', subtitle: 'Active recall sessions and self-assessment evaluations' },
  '/settings': { title: 'Settings', subtitle: 'Account preferences and encrypted inference keys' },
  '/login': { title: 'Sign In', subtitle: 'Access your private workspace' },
  '/register': { title: 'Create Account', subtitle: 'Set up your encrypted study workspace' },
};

export function Header() {
  const pathname = usePathname();
  const current = routeTitles[pathname] || {
    title: 'Workspace',
    subtitle: 'Active recall and structured academic mastery',
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">{current.title}</h1>
        <p className="text-xs text-zinc-400">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search Trigger */}
        <button
          type="button"
          onClick={() => {
            // Placeholder for command palette or quick filter
          }}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400">Search materials, notes...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 rounded border border-zinc-700/60 ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Primary Action Button */}
        {pathname !== '/upload' && (
          <Link
            href="/upload"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-900 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Material</span>
          </Link>
        )}
      </div>
    </header>
  );
}
