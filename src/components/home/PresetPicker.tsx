import { useState, useEffect } from 'react';
import type { Preset } from '../../types/preset';
import { loadCommunityPresets } from '../../services/presetService';
import { cn } from '../../lib/cn';

type PresetOrigin = 'custom' | 'community';

interface TaggedPreset {
  preset: Preset;
  origin: PresetOrigin;
}

interface PresetPickerProps {
  savedPresets: Preset[];
  selected: Preset | null;
  onSelect: (preset: Preset | null) => void;
}

const originColors: Record<PresetOrigin, string> = {
  custom: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  community: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
};

export function PresetPicker({ savedPresets, selected, onSelect }: PresetPickerProps) {
  const [communityPresets, setCommunityPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadCommunityPresets()
      .then((presets) => { if (!cancelled) setCommunityPresets(presets); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const tagged: TaggedPreset[] = [
    ...savedPresets.map((p) => ({ preset: p, origin: 'custom' as const })),
    ...communityPresets.map((p) => ({ preset: p, origin: 'community' as const })),
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Preset (optional)</p>
      {loading && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-2">Loading community presets…</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {tagged.map(({ preset, origin }) => {
          const isSelected = selected?.id === preset.id;
          return (
            <button
              key={`${origin}-${preset.id}`}
              type="button"
              onClick={() => onSelect(isSelected ? null : preset)}
              className={cn(
                'text-left p-3 rounded-xl border transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600',
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className={cn('text-sm font-semibold truncate', isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100')}>
                  {preset.name}
                </p>
                <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0', originColors[origin])}>
                  {origin === 'custom' ? 'Custom' : 'Community'}
                </span>
              </div>
              {preset.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                  {preset.description}
                </p>
              )}
              {preset.suggestedPlayerCount && (
                <p className={cn('text-[10px] font-medium mt-1', isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500')}>
                  {preset.suggestedPlayerCount.min}–{preset.suggestedPlayerCount.max} players
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
