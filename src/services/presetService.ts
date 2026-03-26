import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Preset } from '../types/preset';

const PRESETS_COL = 'ScorerPresets';

/** Submit a preset for community review. Stores in Firestore with submittedAt. */
export async function submitPreset(preset: Preset): Promise<void> {
  console.log("submit")
  const res = await setDoc(doc(firestore, PRESETS_COL, preset.id), {
    ...preset,
    isPublic: true,
    submittedAt: Date.now(),
  });
  console.log(res)
}

/** Withdraw a submitted preset from Firestore. */
export async function withdrawPreset(id: string): Promise<void> {
  await deleteDoc(doc(firestore, PRESETS_COL, id));
}

/**
 * Fetch approved community presets from Firestore.
 * Only presets that have been manually approved (approvedAt set) are returned.
 */
export async function loadCommunityPresets(): Promise<Preset[]> {
  const q = query(
    collection(firestore, PRESETS_COL),
    where('isPublic', '==', true),
  );
  const snap = await getDocs(q);
  const presets = snap.docs
    .map((d) => d.data() as Preset)
    .filter((p) => p.approvedAt != null);
  return presets.sort((a, b) => (b.approvedAt ?? 0) - (a.approvedAt ?? 0));
}

/**
 * Fetch the current Firestore state of submitted presets by their IDs.
 * Returns only the ones that exist in Firestore (i.e. still submitted/approved).
 */
export async function fetchSubmittedPresetStatuses(ids: string[]): Promise<Partial<Preset>[]> {
  if (ids.length === 0) return [];
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(firestore, PRESETS_COL, id))));
  return snaps.filter((s) => s.exists()).map((s) => s.data() as Partial<Preset>);
}

/** Fetch a single approved community preset by its Firestore document ID. */
export async function getPresetById(id: string): Promise<Preset | null> {
  const snap = await getDoc(doc(firestore, PRESETS_COL, id));
  if (!snap.exists()) return null;
  const data = snap.data() as Preset;
  if (!data.isPublic || !data.approvedAt) return null;
  return { ...data, id: snap.id };
}

// Legacy exports for backward compatibility
export const publishPreset = submitPreset;
export const unpublishPreset = withdrawPreset;
