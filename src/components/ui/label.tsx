import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-medium text-zinc-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-400 font-mono text-[10px]">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';
