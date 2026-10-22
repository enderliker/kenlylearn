'use client';

import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your study activity and retention progress' },
  '/subjects': { title: 'Subjects', subtitle: 'Academic domains and organized study materials' },
  '/upload': { title: 'Upload Materials', subtitle: 'Import PDFs, images, or notes for AI synthesis' },
  '/exams': { title: 'Mock Exams', subtitle: 'Interactive practice assessments and active recall' },
};

export function Header() {
  const pathname = usePathname();
  const current = routeTitles[pathname] || {
    title: 'StudyAI',
    subtitle: 'AI-Powered Deep Learning Companion',
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-zinc-100 tracking-tight">{current.title}</h1>
        <p className="text-xs text-zinc-500">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local SQLite Synced</span>
        </div>
      </div>
    </header>
  );
}
