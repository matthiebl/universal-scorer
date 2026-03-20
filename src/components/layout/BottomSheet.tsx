import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-t-2xl bg-white dark:bg-zinc-900 shadow-2xl',
          'animate-slide-up max-h-[85vh] flex flex-col',
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
        {title && (
          <div className="px-4 pb-2 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
