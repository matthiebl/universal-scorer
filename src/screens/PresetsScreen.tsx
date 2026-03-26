import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Preset } from '../types/preset';
import { loadSavedPresets, savePreset, deletePreset } from '../services/storage';
import { submitPreset, withdrawPreset, loadCommunityPresets, fetchSubmittedPresetStatuses } from '../services/presetService';
import { PresetEditSheet } from '../components/presets/PresetEditSheet';
import { BottomSheet } from '../components/layout/BottomSheet';
import { Modal } from '../components/layout/Modal';
import { Button } from '../components/shared/Button';
import { cn } from '../lib/cn';

type Tab = 'mine' | 'community';

// ---------- Tag helpers ----------

type PresetTag = 'custom' | 'submitted' | 'approved' | 'community';

function getPresetTag(preset: Preset, context: 'mine' | 'community'): PresetTag {
  if (context === 'community') return 'community';
  if (preset.approvedAt) return 'approved';
  if (preset.submittedAt) return 'submitted';
  return 'custom';
}

const tagStyles: Record<PresetTag, { label: string; className: string }> = {
  custom: { label: 'Custom', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  submitted: { label: 'Pending Review', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  approved: { label: 'Published', className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  community: { label: 'Community', className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
};

// ---------- PresetCard ----------

interface PresetCardProps {
  preset: Preset;
  tag?: PresetTag;
  onView?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onSubmit?: () => void;
  onWithdraw?: () => void;
  submitting?: boolean;
}

function PresetCard({ preset, tag, onView, onEdit, onCopy, onDelete, onSubmit, onWithdraw, submitting }: PresetCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-2',
      preset.isBuiltIn
        ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{preset.name}</p>
            {tag && (
              <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', tagStyles[tag].className)}>
                {tagStyles[tag].label}
              </span>
            )}
          </div>
          {preset.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{preset.description}</p>
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {preset.rows.filter((r) => r.type !== 'group').length} rows
            {preset.suggestedPlayerCount && ` · ${preset.suggestedPlayerCount.min}–${preset.suggestedPlayerCount.max} players`}
            {preset.increments && ` · custom increments`}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onView && (
            <button onClick={onView} className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" aria-label="View preset">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          {onCopy && (
            <button onClick={onCopy} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors" aria-label="Copy preset">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" aria-label="Edit preset">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
              </svg>
            </button>
          )}
          {onSubmit && (
            <button onClick={onSubmit} disabled={submitting} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-40" aria-label="Submit to community">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
          )}
          {onWithdraw && (
            <button onClick={onWithdraw} disabled={submitting} className="p-2 text-amber-500 hover:text-zinc-400 transition-colors disabled:opacity-40" aria-label="Withdraw submission">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" aria-label="Delete preset">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- PresetsScreen ----------

export function PresetsScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('mine');
  const [savedPresets, setSavedPresets] = useState<Preset[]>(loadSavedPresets);
  const [communityPresets, setCommunityPresets] = useState<Preset[] | null>(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [viewingPreset, setViewingPreset] = useState<Preset | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmSubmitPreset, setConfirmSubmitPreset] = useState<Preset | null>(null);

  const refreshSaved = () => setSavedPresets(loadSavedPresets());

  // On mount, sync approval status for any submitted presets from Firestore.
  useEffect(() => {
    const submitted = loadSavedPresets().filter((p) => p.submittedAt != null);
    if (submitted.length === 0) return;
    let cancelled = false;
    fetchSubmittedPresetStatuses(submitted.map((p) => p.id)).then((statuses) => {
      if (cancelled) return;
      let changed = false;
      for (const status of statuses) {
        if (!status.id || !status.approvedAt) continue;
        const local = submitted.find((p) => p.id === status.id);
        if (local && !local.approvedAt) {
          savePreset({ ...local, approvedAt: status.approvedAt });
          changed = true;
        }
      }
      if (changed) refreshSaved();
    }).catch(() => {});
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    deletePreset(id);
    refreshSaved();
  };

  const handleEdit = (updated: Preset) => {
    savePreset(updated);
    refreshSaved();
  };

  const handleCreate = (newPreset: Preset) => {
    savePreset(newPreset);
    refreshSaved();
  };

  const handleCopy = (preset: Preset) => {
    const local: Preset = {
      ...preset,
      id: crypto.randomUUID(),
      isBuiltIn: false,
      isPublic: false,
      submittedAt: undefined,
      approvedAt: undefined,
      publishedAt: undefined,
      createdAt: Date.now(),
    };
    savePreset(local);
    setSavedPresets(loadSavedPresets());
    setTab('mine');
  };

  const handleSubmit = async (preset: Preset) => {
    setSubmitting(preset.id);
    try {
      const submitted: Preset = { ...preset, submittedAt: Date.now(), isPublic: true };
      await submitPreset(submitted);
      savePreset(submitted);
      refreshSaved();
    } catch {
      // silently ignore
    } finally {
      setSubmitting(null);
      setConfirmSubmitPreset(null);
    }
  };

  const handleWithdraw = async (preset: Preset) => {
    setSubmitting(preset.id);
    try {
      await withdrawPreset(preset.id);
      const withdrawn: Preset = {
        ...preset,
        submittedAt: undefined,
        approvedAt: undefined,
        publishedAt: undefined,
        isPublic: false,
      };
      savePreset(withdrawn);
      refreshSaved();
    } catch {
      // silently ignore
    } finally {
      setSubmitting(null);
    }
  };

  const loadCommunity = useCallback(async () => {
    setCommunityLoading(true);
    setCommunityError(null);
    try {
      const presets = await loadCommunityPresets();
      setCommunityPresets(presets);
    } catch (err) {
      console.error('[Presets] loadCommunityPresets failed:', err);
      setCommunityError('Failed to load community presets. Check your connection.');
    } finally {
      setCommunityLoading(false);
    }
  }, []);

  const handleSwitchTab = (t: Tab) => {
    setTab(t);
    if (t === 'community' && communityPresets === null) loadCommunity();
  };

  /** Preset is locked for editing once submitted (pending or approved). */
  const isLocked = (p: Preset) => p.submittedAt != null;
  /** Preset can be withdrawn only while pending review (submitted but not yet approved). */
  const canWithdraw = (p: Preset) => p.submittedAt != null && p.approvedAt == null;

  return (
    <>
      <div className="min-h-dvh flex flex-col">
        <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Presets</h1>
          </div>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-4">
          {/* Tab bar */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
            {(['mine', 'community'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleSwitchTab(t)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all',
                  tab === t
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
                )}
              >
                {t === 'mine' ? 'My Presets' : 'Community'}
              </button>
            ))}
          </div>

          {/* Mine tab */}
          {tab === 'mine' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Saved</h2>
                  <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-1 text-xs text-blue-500 font-semibold hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Preset
                  </button>
                </div>
                {savedPresets.length === 0 ? (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                    No saved presets yet. Create one or save a game's rows as a preset from game settings.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedPresets.map((preset) => {
                      const locked = isLocked(preset);
                      const tag = getPresetTag(preset, 'mine');
                      return (
                        <PresetCard
                          key={preset.id}
                          preset={preset}
                          tag={tag}
                          onEdit={!locked ? () => setEditingPreset(preset) : undefined}
                          onCopy={locked ? () => handleCopy(preset) : undefined}
                          onDelete={() => handleDelete(preset.id)}
                          onSubmit={!locked ? () => setConfirmSubmitPreset(preset) : undefined}
                          onWithdraw={canWithdraw(preset) ? () => handleWithdraw(preset) : undefined}
                          submitting={submitting === preset.id}
                        />
                      );
                    })}
                  </div>
                )}
            </div>
          )}

          {/* Community tab */}
          {tab === 'community' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Browse presets shared by others.</p>
                <button onClick={loadCommunity} className="text-xs text-blue-500 font-medium shrink-0 ml-2">Refresh</button>
              </div>

              {communityLoading && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8">Loading…</p>
              )}

              {communityError && (
                <p className="text-sm text-red-500 text-center py-4">{communityError}</p>
              )}

              {communityPresets !== null && !communityLoading && communityPresets.length === 0 && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8">
                  No community presets yet. Be the first to submit one!
                </p>
              )}

              {communityPresets && !communityLoading && (
                <div className="space-y-2">
                  {communityPresets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={{ ...preset, isBuiltIn: false }}
                      tag="community"
                      onView={() => setViewingPreset(preset)}
                      onCopy={() => handleCopy(preset)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Edit sheet */}
      {editingPreset && (
        <PresetEditSheet
          preset={editingPreset}
          open={editingPreset !== null}
          onClose={() => setEditingPreset(null)}
          onSave={handleEdit}
        />
      )}

      {/* Create sheet */}
      <PresetEditSheet
        open={creating}
        onClose={() => setCreating(false)}
        onSave={handleCreate}
      />

      {/* View preset sheet (read-only) */}
      <BottomSheet open={viewingPreset !== null} onClose={() => setViewingPreset(null)} title={viewingPreset?.name ?? 'Preset'}>
        {viewingPreset && (
          <div className="space-y-4">
            {viewingPreset.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{viewingPreset.description}</p>
            )}
            {viewingPreset.increments && viewingPreset.increments.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Quick Score Buttons</p>
                <div className="flex flex-wrap gap-2">
                  {viewingPreset.increments.map((val) => (
                    <span
                      key={val}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-sm font-medium',
                        val < 0
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                      )}
                    >
                      {val > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rows ({viewingPreset.rows.filter((r) => r.type !== 'group').length})</p>
              {viewingPreset.rows.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">No rows defined.</p>
              ) : (
                <div className="space-y-1">
                  {viewingPreset.rows.map((row, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                        row.type === 'group'
                          ? 'bg-zinc-200 dark:bg-zinc-700 font-semibold text-zinc-700 dark:text-zinc-300'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200',
                      )}
                    >
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0',
                        row.type === 'group'
                          ? 'bg-zinc-300 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300'
                          : row.type === 'round'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
                      )}>
                        {row.type === 'group' ? 'section' : row.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate">{row.label}</span>
                        {row.scoringRule?.formula && (
                          <span className="block text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">{row.scoringRule.formula}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => { handleCopy(viewingPreset); setViewingPreset(null); }} className="w-full">
              Copy to My Presets
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* Submit confirmation modal */}
      {confirmSubmitPreset && (
        <Modal
          open={confirmSubmitPreset !== null}
          onClose={() => setConfirmSubmitPreset(null)}
          title="Submit to Community"
        >
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You're about to submit <strong>"{confirmSubmitPreset.name}"</strong> for community review.
            </p>
            <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <p>Once submitted:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your preset will be reviewed before appearing in the community library</li>
                <li>You won't be able to edit the preset while it's submitted</li>
                <li>You can withdraw the submission at any time</li>
                <li>You can make a copy if you want to continue editing a version locally</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="ghost" onClick={() => setConfirmSubmitPreset(null)} className="flex-1">Cancel</Button>
              <Button
                onClick={() => handleSubmit(confirmSubmitPreset)}
                disabled={submitting === confirmSubmitPreset.id}
                className="flex-1"
              >
                {submitting === confirmSubmitPreset.id ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
