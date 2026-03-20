import { cn } from '../../lib/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base min-h-[44px] transition-colors',
          'placeholder:text-zinc-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder:text-zinc-500',
          className,
        )}
        {...props}
      />
    </div>
  );
}
