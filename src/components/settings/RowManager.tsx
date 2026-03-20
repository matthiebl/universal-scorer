import { useState } from 'react';
import type { ScoreRow } from '../../types/game';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { cn } from '../../lib/cn';

interface RowManagerProps {
  rows: ScoreRow[];
  onUpdate: (rowId: string, label: string) => void;
  onRemove: (rowId: string) => void;
  onMoveUp: (rowId: string) => void;
  onMoveDown: (rowId: string) => void;
}

function buildSections(rows: ScoreRow[]) {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  const result: { row: ScoreRow; isGroupHeader: boolean; groupLabel?: string }[] = [];
  let currentGroup: ScoreRow | null = null;

  for (const row of sorted) {
    if (row.type === 'group') {
      currentGroup = row;
      result.push({ row, isGroupHeader: true });
    } else {
      result.push({ row, isGroupHeader: false, groupLabel: currentGroup?.label });
    }
  }
  return result;
}

export function RowManager({ rows, onUpdate, onRemove, onMoveUp, onMoveDown }: RowManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const flat = buildSections(rows);

  if (flat.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
        No rows yet. Add rounds or categories from the score sheet.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {flat.map(({ row, isGroupHeader }, i) => (
        <div
          key={row.id}
          className={cn(
            'rounded-xl border overflow-hidden',
            isGroupHeader
              ? 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800'
              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900',
          )}
        >
          {editingId === row.id ? (
            <div className="p-3 flex gap-2">
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editLabel.trim()) {
                    onUpdate(row.id, editLabel.trim());
                    setEditingId(null);
                  }
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => { if (editLabel.trim()) { onUpdate(row.id, editLabel.trim()); setEditingId(null); } }}
                disabled={!editLabel.trim()}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>✕</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => onMoveUp(row.id)}
                  disabled={i === 0}
                  className={cn('p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200', i === 0 && 'opacity-20')}
                  aria-label="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMoveDown(row.id)}
                  disabled={i === flat.length - 1}
                  className={cn('p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200', i === flat.length - 1 && 'opacity-20')}
                  aria-label="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Type badge */}
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                isGroupHeader
                  ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300'
                  : row.type === 'round'
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
              )}>
                {isGroupHeader ? 'group' : row.type}
              </span>

              <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {row.label}
              </span>

              <button
                onClick={() => { setEditingId(row.id); setEditLabel(row.label); }}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
                aria-label="Rename"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(row.id)}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Delete row"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
