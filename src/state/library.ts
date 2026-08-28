import { useSyncExternalStore } from 'react';
import { deleteSaved, getSaved, saveRelease } from '../api/saved.api';
import type { SavedReleaseDto } from '../api/api.types';
const empty: SavedReleaseDto[] = [];
let saved: SavedReleaseDto[] = empty;
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((listener) => listener());
}
function setSaved(next: SavedReleaseDto[]) {
  saved = next;
  notify();
}
export async function refreshSavedAlbums() {
  const response = await getSaved();
  setSaved(Array.isArray(response) ? response : response.results);
}
export async function toggleSavedAlbum(releaseId: number | string) {
  const current = saved.find(
    (item) => String(item.release.id) === String(releaseId),
  );
  if (current) {
    await deleteSaved(current.id);
    setSaved(saved.filter((item) => item.id !== current.id));
  } else {
    const created = await saveRelease(releaseId);
    setSaved([...saved, created]);
  }
}
export function clearSavedAlbumsState() {
  setSaved(empty);
}
export function useSavedAlbums() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => saved,
    () => empty,
  );
}
export function useSavedAlbumIds() {
  return useSavedAlbums().map((item) => String(item.release.id));
}
