import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'success' | 'warning';
  title?: string;
}

export function Alert({
  className,
  variant = 'default',
  title,
  children,
  ...props
}: AlertProps) {
  const icons = {
    default: Info,
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertTriangle,
  };

  const variants = {
    default: 'border-zinc-800 bg-zinc-900/60 text-zinc-300',
    error: 'border-red-900/50 bg-red-950/30 text-red-300',
    success: 'border-emerald-900/50 bg-emerald-950/30 text-emerald-300',
    warning: 'border-amber-900/50 bg-amber-950/30 text-amber-300',
  };

  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-lg border p-3 text-xs leading-relaxed',
        variants[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="space-y-0.5">
        {title && <p className="font-semibold tracking-tight">{title}</p>}
        <div className="text-[11px] opacity-90">{children}</div>
      </div>
    </div>
  );
}
