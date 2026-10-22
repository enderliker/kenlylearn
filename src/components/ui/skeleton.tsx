import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading content"
      className={cn('animate-pulse rounded-md bg-zinc-800/60', className)}
      {...props}
    />
  );
}
