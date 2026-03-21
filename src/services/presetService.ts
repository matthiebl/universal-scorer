import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Preset } from '../types/preset';

const PRESETS_COL = 'ScorerPresets';

/** Publish a preset to Firestore so others can browse and use it. */
export async function publishPreset(preset: Preset): Promise<void> {
  await setDoc(doc(firestore, PRESETS_COL, preset.id), {
    ...preset,
    isPublic: true,
    publishedAt: Date.now(),
  });
}

/** Remove a preset from Firestore. */
export async function unpublishPreset(id: string): Promise<void> {
  await deleteDoc(doc(firestore, PRESETS_COL, id));
}

/** Fetch all public presets from Firestore. */
export async function loadCommunityPresets(): Promise<Preset[]> {
  const q = query(
    collection(firestore, PRESETS_COL),
    where('isPublic', '==', true),
  );
  const snap = await getDocs(q);
  const presets = snap.docs.map((d) => d.data() as Preset);
  // Sort client-side to avoid needing a Firestore composite index.
  return presets.sort((a, b) => ((b as Preset & { publishedAt?: number }).publishedAt ?? 0) - ((a as Preset & { publishedAt?: number }).publishedAt ?? 0));
}
