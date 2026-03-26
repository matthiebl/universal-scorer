import { useState, useEffect } from 'react';
import type { Preset } from '../../types/preset';
import type { ScoreRow, ScoreRowType, ScoringRule } from '../../types/game';
import { BottomSheet } from '../layout/BottomSheet';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { cn } from '../../lib/cn';

type PresetRow = Omit<ScoreRow, 'id'>;

interface PresetEditSheetProps {
  preset?: Preset;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Preset) => void;
}

const ROW_TYPE_OPTIONS: { value: ScoreRowType; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'category', label: 'Category' },
  { value: 'group', label: 'Section Header' },
];

const SCORING_RULE_OPTIONS: { value: ScoringRule['type'] | 'none'; label: string }[] = [
  { value: 'none', label: 'Manual' },
  { value: 'bonus', label: 'Bonus / Formula' },
];

export function PresetEditSheet({ preset, open, onClose, onSave }: PresetEditSheetProps) {
  const isNew = !preset;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [increments, setIncrements] = useState<number[]>([]);
  const [incrementInput, setIncrementInput] = useState('');
  const [rows, setRows] = useState<PresetRow[]>([]);

  // Add row state
  const [addRowLabel, setAddRowLabel] = useState('');
  const [addRowType, setAddRowType] = useState<ScoreRowType>('category');
  const [addRowRuleType, setAddRowRuleType] = useState<ScoringRule['type'] | 'none'>('none');
  const [addRowFormula, setAddRowFormula] = useState('');

  // Edit row state
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editRowLabel, setEditRowLabel] = useState('');
  const [editRowType, setEditRowType] = useState<ScoreRowType>('category');
  const [editRowRuleType, setEditRowRuleType] = useState<ScoringRule['type'] | 'none'>('none');
  const [editRowFormula, setEditRowFormula] = useState('');

  useEffect(() => {
    if (open) {
      setName(preset?.name ?? '');
      setDescription(preset?.description ?? '');
      setIncrements(preset?.increments ?? []);
      setRows(preset?.rows ?? []);
      setIncrementInput('');
      setAddRowLabel('');
      setAddRowType('category');
      setAddRowRuleType('none');
      setAddRowFormula('');
      setEditingRowIndex(null);
    }
  }, [open, preset]);

  const handleAddIncrement = () => {
    const val = parseInt(incrementInput, 10);
    if (isNaN(val) || val === 0) return;
    if (increments.includes(val)) { setIncrementInput(''); return; }
    setIncrements((prev) => [...prev, val].sort((a, b) => a - b));
    setIncrementInput('');
  };

  const handleRemoveIncrement = (val: number) => {
    setIncrements((prev) => prev.filter((v) => v !== val));
  };

  const handleAddRow = () => {
    const label = addRowLabel.trim();
    if (!label) return;
    const scoringRule: ScoringRule | undefined =
      addRowRuleType === 'none' ? undefined : { type: addRowRuleType, formula: addRowFormula.trim() || undefined };
    const newRow: PresetRow = {
      type: addRowType,
      label,
      order: rows.length,
      parentId: null,
      ...(scoringRule && { scoringRule }),
    };
    setRows((prev) => [...prev, newRow]);
    setAddRowLabel('');
    setAddRowRuleType('none');
    setAddRowFormula('');
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, order: i })));
    if (editingRowIndex === index) setEditingRowIndex(null);
  };

  const handleMoveRow = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    setRows((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((r, i) => ({ ...r, order: i }));
    });
  };

  const handleStartEditRow = (index: number) => {
    const row = rows[index];
    setEditingRowIndex(index);
    setEditRowLabel(row.label);
    setEditRowType(row.type);
    setEditRowRuleType(row.scoringRule?.type ?? 'none');
    setEditRowFormula(row.scoringRule?.formula ?? '');
  };

  const handleSaveEditRow = () => {
    if (editingRowIndex === null) return;
    const label = editRowLabel.trim();
    if (!label) return;
    const scoringRule: ScoringRule | undefined =
      editRowRuleType === 'none' ? undefined : { type: editRowRuleType, formula: editRowFormula.trim() || undefined };
    setRows((prev) =>
      prev.map((r, i) =>
        i === editingRowIndex
          ? { ...r, label, type: editRowType, scoringRule, ...(scoringRule ? {} : { scoringRule: undefined }) }
          : r,
      ),
    );
    setEditingRowIndex(null);
  };

  const handleSave = () => {
    const id = preset?.id ?? crypto.randomUUID();
    onSave({
      id,
      name: name.trim() || 'Untitled Preset',
      description: description.trim() || undefined,
      increments: increments.length > 0 ? increments : undefined,
      rows: rows.map((r, i) => ({ ...r, order: i })),
      isBuiltIn: false,
      isPublic: preset?.isPublic ?? false,
      createdAt: preset?.createdAt ?? Date.now(),
      suggestedPlayerCount: preset?.suggestedPlayerCount,
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={isNew ? 'Create Preset' : 'Edit Preset'}>
      <div className="space-y-5">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yahtzee" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />

        {/* Increments editor */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Quick Score Buttons</p>
          {increments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {increments.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleRemoveIncrement(val)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium transition-colors',
                    val < 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                  )}
                >
                  {val > 0 ? '+' : ''}{val}
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Using defaults (−10 −5 −1 +1 +5 +10)</p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={incrementInput}
              onChange={(e) => setIncrementInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddIncrement(); }}
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddIncrement}
              disabled={!incrementInput || isNaN(parseInt(incrementInput, 10)) || parseInt(incrementInput, 10) === 0}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
          {increments.length > 0 && (
            <button type="button" onClick={() => setIncrements([])} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              Reset to defaults
            </button>
          )}
        </div>

        {/* Rows editor */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rows</p>

          {rows.length > 0 ? (
            <div className="space-y-1">
              {rows.map((row, i) => (
                <div key={i}>
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                    editingRowIndex === i
                      ? 'bg-blue-50 dark:bg-blue-900/20 rounded-b-none'
                      : row.type === 'group'
                        ? 'bg-zinc-200 dark:bg-zinc-700 font-semibold text-zinc-700 dark:text-zinc-300'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200',
                  )}>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{row.label}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {row.type}
                        {row.scoringRule && ` · ${row.scoringRule.type}`}
                        {row.scoringRule?.formula && ` · ${row.scoringRule.formula}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => handleMoveRow(i, -1)} disabled={i === 0} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30" aria-label="Move up">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <button type="button" onClick={() => handleMoveRow(i, 1)} disabled={i === rows.length - 1} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-30" aria-label="Move down">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <button type="button" onClick={() => editingRowIndex === i ? setEditingRowIndex(null) : handleStartEditRow(i)} className={cn('p-1.5 transition-colors', editingRowIndex === i ? 'text-blue-500' : 'text-zinc-400 hover:text-blue-500')} aria-label="Edit row">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" /></svg>
                      </button>
                      <button type="button" onClick={() => handleRemoveRow(i)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" aria-label="Remove row">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  {editingRowIndex === i && (
                    <div className="rounded-b-xl border border-t-0 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-2 mb-1">
                      <input
                        value={editRowLabel}
                        onChange={(e) => setEditRowLabel(e.target.value)}
                        placeholder="Row label"
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <select
                          value={editRowType}
                          onChange={(e) => setEditRowType(e.target.value as ScoreRowType)}
                          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ROW_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {editRowType !== 'group' && (
                          <select
                            value={editRowRuleType}
                            onChange={(e) => setEditRowRuleType(e.target.value as ScoringRule['type'] | 'none')}
                            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {SCORING_RULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        )}
                      </div>
                      {editRowType !== 'group' && editRowRuleType !== 'none' && (
                        <input
                          value={editRowFormula}
                          onChange={(e) => setEditRowFormula(e.target.value)}
                          placeholder="e.g. (Aces + Twos) >= 63 ? 35 : 0"
                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingRowIndex(null)}>Cancel</Button>
                        <Button size="sm" onClick={handleSaveEditRow} disabled={!editRowLabel.trim()}>Update</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-3">No rows yet. Add rows below.</p>
          )}

          {/* Add new row */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 space-y-2">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Add Row</p>
            <input
              value={addRowLabel}
              onChange={(e) => setAddRowLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddRow(); }}
              placeholder="Row label"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <select
                value={addRowType}
                onChange={(e) => setAddRowType(e.target.value as ScoreRowType)}
                className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROW_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {addRowType !== 'group' && (
                <select
                  value={addRowRuleType}
                  onChange={(e) => setAddRowRuleType(e.target.value as ScoringRule['type'] | 'none')}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SCORING_RULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
            </div>
            {addRowType !== 'group' && addRowRuleType !== 'none' && (
              <div className="space-y-1">
                <input
                  value={addRowFormula}
                  onChange={(e) => setAddRowFormula(e.target.value)}
                  placeholder="e.g. (Aces + Twos) >= 63 ? 35 : 0"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  Use row labels as variables. Spaces become underscores (e.g. "Three of a Kind" → Three_of_a_Kind).
                </p>
              </div>
            )}
            <Button size="sm" onClick={handleAddRow} disabled={!addRowLabel.trim()}>
              Add Row
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">{isNew ? 'Create' : 'Save'}</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
