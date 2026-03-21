import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { Preset } from '../types/preset';

const PRESETS_COL = 'presets';

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
    orderBy('publishedAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Preset);
}
