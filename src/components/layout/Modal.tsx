import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl max-h-[85vh] flex flex-col">
        {title && (
          <div className="px-5 pt-5 pb-3 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
