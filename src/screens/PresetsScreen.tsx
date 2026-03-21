import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { Preset } from '../types/preset';
import { BUILT_IN_PRESETS } from '../presets';
import { loadSavedPresets, savePreset, deletePreset } from '../services/storage';
import { publishPreset, unpublishPreset, loadCommunityPresets } from '../services/presetService';
import { PresetEditSheet } from '../components/presets/PresetEditSheet';
import { cn } from '../lib/cn';

type Tab = 'mine' | 'community';

// ---------- PresetCard ----------

interface PresetCardProps {
  preset: Preset;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onUse?: () => void;
  publishing?: boolean;
}

function PresetCard({ preset, onEdit, onDelete, onPublish, onUnpublish, onUse, publishing }: PresetCardProps) {
  const isPublished = (preset as Preset & { publishedAt?: number }).publishedAt != null;

  return (
    <div className={cn(
      'rounded-xl border p-4 space-y-2',
      preset.isBuiltIn
        ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
        : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20',
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{preset.name}</p>
            {preset.isBuiltIn && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                Built-in
              </span>
            )}
            {isPublished && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                Published
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

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {onUse && (
            <button
              onClick={onUse}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              Use
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" aria-label="Edit preset">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
              </svg>
            </button>
          )}
          {onPublish && !isPublished && (
            <button onClick={onPublish} disabled={publishing} className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-40" aria-label="Publish preset">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
          )}
          {onUnpublish && isPublished && (
            <button onClick={onUnpublish} disabled={publishing} className="p-1.5 text-green-500 hover:text-zinc-400 transition-colors disabled:opacity-40" aria-label="Unpublish preset">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" aria-label="Delete preset">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const [publishing, setPublishing] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  const refreshSaved = () => setSavedPresets(loadSavedPresets());

  const handleDelete = (id: string) => {
    deletePreset(id);
    refreshSaved();
  };

  const handleEdit = (updated: Preset) => {
    savePreset(updated);
    refreshSaved();
  };

  const handlePublish = async (preset: Preset) => {
    setPublishing(preset.id);
    try {
      const withTimestamp = { ...preset, publishedAt: Date.now() };
      await publishPreset(withTimestamp);
      savePreset(withTimestamp);
      refreshSaved();
    } catch {
      // silently ignore — user will see no "Published" badge
    } finally {
      setPublishing(null);
    }
  };

  const handleUnpublish = async (preset: Preset) => {
    setPublishing(preset.id);
    try {
      await unpublishPreset(preset.id);
      const { publishedAt: _, ...withoutTimestamp } = preset as Preset & { publishedAt?: number };
      savePreset(withoutTimestamp);
      refreshSaved();
    } catch {
      // silently ignore
    } finally {
      setPublishing(null);
    }
  };

  const loadCommunity = useCallback(async () => {
    setCommunityLoading(true);
    setCommunityError(null);
    try {
      const presets = await loadCommunityPresets();
      setCommunityPresets(presets);
    } catch {
      setCommunityError('Failed to load community presets. Check your connection.');
    } finally {
      setCommunityLoading(false);
    }
  }, []);

  const handleSwitchTab = (t: Tab) => {
    setTab(t);
    if (t === 'community' && communityPresets === null) loadCommunity();
  };

  const handleUse = (preset: Preset) => {
    const local: Preset = { ...preset, id: crypto.randomUUID(), isBuiltIn: false, isPublic: false, createdAt: Date.now() };
    savePreset(local);
    setSavedPresets(loadSavedPresets());
    setTab('mine');
  };

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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Built-in</h2>
                <div className="space-y-2">
                  {BUILT_IN_PRESETS.map((preset) => (
                    <PresetCard key={preset.id} preset={preset} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Saved</h2>
                {savedPresets.length === 0 ? (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                    No saved presets yet. Save a game's rows as a preset from game settings.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedPresets.map((preset) => (
                      <PresetCard
                        key={preset.id}
                        preset={preset}
                        onEdit={() => setEditingPreset(preset)}
                        onDelete={() => handleDelete(preset.id)}
                        onPublish={() => handlePublish(preset)}
                        onUnpublish={() => handleUnpublish(preset)}
                        publishing={publishing === preset.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Community tab */}
          {tab === 'community' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Browse presets shared by others. Tap Use to copy to your saved presets.</p>
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
                  No community presets yet. Be the first to publish one!
                </p>
              )}

              {communityPresets && !communityLoading && (
                <div className="space-y-2">
                  {communityPresets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={{ ...preset, isBuiltIn: false }}
                      onUse={() => handleUse(preset)}
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
    </>
  );
}
