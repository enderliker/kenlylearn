'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, LogIn, User } from 'lucide-react';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="p-3 border-t border-zinc-800/80">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-zinc-800 rounded w-20" />
            <div className="h-2.5 bg-zinc-800/60 rounded w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5 text-zinc-400" />
          <span>Sign In</span>
        </Link>
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <span>Create Account</span>
        </Link>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="p-3 border-t border-zinc-800/80">
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-[11px] font-semibold text-indigo-300 shrink-0">
            {initials || <User className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-200 truncate">
              {user.name || 'Student'}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Sign out of KenlyLearn"
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
