import type { Preset } from '../../types/preset';
import { BUILT_IN_PRESETS } from '../../presets';
import { cn } from '../../lib/cn';

interface PresetPickerProps {
  savedPresets: Preset[];
  selected: Preset | null;
  onSelect: (preset: Preset | null) => void;
}

export function PresetPicker({ savedPresets, selected, onSelect }: PresetPickerProps) {
  const allPresets = [...BUILT_IN_PRESETS, ...savedPresets];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Preset (optional)</p>
      <div className="grid grid-cols-2 gap-2">
        {allPresets.map((preset) => {
          const isSelected = selected?.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : preset)}
              className={cn(
                'text-left p-3 rounded-xl border transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600',
              )}
            >
              <p className={cn('text-sm font-semibold truncate', isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100')}>
                {preset.name}
              </p>
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
