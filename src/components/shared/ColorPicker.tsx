import { cn } from '../../lib/cn';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#78716c',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-3 justify-items-center">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'w-8 h-8 rounded-full transition-transform',
            value === color && 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 dark:ring-offset-zinc-900 scale-110',
          )}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
}

export function getNextColor(usedColors: string[]): string {
  const available = COLORS.find((c) => !usedColors.includes(c));
  return available ?? COLORS[Math.floor(Math.random() * COLORS.length)];
}
