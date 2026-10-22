'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  UploadCloud, 
  FileCheck2, 
  Sparkles,
  Settings
} from 'lucide-react';
import { KenlySymbol } from '@/components/brand/logo';
import { UserNav } from '@/components/layout/user-nav';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Subjects',
    href: '/subjects',
    icon: FolderKanban,
  },
  {
    label: 'Upload Materials',
    href: '/upload',
    icon: UploadCloud,
  },
  {
    label: 'Mock Exams',
    href: '/exams',
    icon: FileCheck2,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/80">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors p-1">
              <KenlySymbol size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">KenlyLearn</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">WORKSPACE</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 font-medium border border-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-zinc-500')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto">
        {/* User Account State */}
        <UserNav />

        {/* Model & System Status */}
        <div className="p-4 border-t border-zinc-800/80">
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-zinc-300">NVIDIA Nemotron-3</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Ultra 550B • 1M context</p>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400">40 RPM limit guard active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
