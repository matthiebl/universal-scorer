import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Preset } from '../types/preset';
import { BUILT_IN_PRESETS } from '../presets';
import { loadSavedPresets, deletePreset } from '../services/storage';
import { cn } from '../lib/cn';

function PresetCard({
  preset,
  onDelete,
}: {
  preset: Preset;
  onDelete?: () => void;
}) {
  return (
    <div className={cn(
      'rounded-xl border p-4',
      preset.isBuiltIn
        ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{preset.name}</p>
            {preset.isBuiltIn && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                Built-in
              </span>
            )}
          </div>
          {preset.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{preset.description}</p>
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {preset.rows.filter((r) => r.type !== 'group').length} rows
            {preset.suggestedPlayerCount && ` · ${preset.suggestedPlayerCount.min}–${preset.suggestedPlayerCount.max} players`}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
            aria-label="Delete preset"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function PresetsScreen() {
  const navigate = useNavigate();
  const [savedPresets, setSavedPresets] = useState<Preset[]>(loadSavedPresets);

  const handleDelete = (id: string) => {
    deletePreset(id);
    setSavedPresets(loadSavedPresets());
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Presets</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Built-in
          </h2>
          <div className="space-y-2">
            {BUILT_IN_PRESETS.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        </div>

        {savedPresets.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Saved
            </h2>
            <div className="space-y-2">
              {savedPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onDelete={() => handleDelete(preset.id)}
                />
              ))}
            </div>
          </div>
        )}

        {savedPresets.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
            No saved presets yet. Save a game's rows as a preset from game settings.
          </p>
        )}
      </main>
    </div>
  );
}
