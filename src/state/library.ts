import { useSyncExternalStore } from 'react';

const savedAlbumsStorageKey = 'vinyl-vault:saved-albums';
const savedAlbumsChangeEventName = 'vinyl-vault:saved-albums-change';
const emptySavedAlbumIds: string[] = [];
let cachedSavedRawValue: string | null = null;
let cachedSavedAlbumIds: string[] = emptySavedAlbumIds;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function readSavedAlbumIds() {
  if (!isBrowser()) {
    return emptySavedAlbumIds;
  }

  try {
    const rawValue = window.localStorage.getItem(savedAlbumsStorageKey);

    if (rawValue === cachedSavedRawValue) {
      return cachedSavedAlbumIds;
    }

    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : [];

    cachedSavedRawValue = rawValue;
    cachedSavedAlbumIds = Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === 'string')
      : emptySavedAlbumIds;

    return cachedSavedAlbumIds;
  } catch {
    cachedSavedRawValue = null;
    cachedSavedAlbumIds = emptySavedAlbumIds;

    return cachedSavedAlbumIds;
  }
}

export function writeSavedAlbumIds(albumIds: string[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(savedAlbumsStorageKey, JSON.stringify(albumIds));
  window.dispatchEvent(new Event(savedAlbumsChangeEventName));
}

export function toggleSavedAlbum(albumId: string) {
  const savedAlbumIds = readSavedAlbumIds();
  const nextSavedAlbumIds = savedAlbumIds.includes(albumId)
    ? savedAlbumIds.filter((currentAlbumId) => currentAlbumId !== albumId)
    : [...savedAlbumIds, albumId];

  writeSavedAlbumIds(nextSavedAlbumIds);
}

function subscribeToSavedAlbums(callback: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(savedAlbumsChangeEventName, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(savedAlbumsChangeEventName, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useSavedAlbumIds() {
  return useSyncExternalStore(
    subscribeToSavedAlbums,
    readSavedAlbumIds,
    () => emptySavedAlbumIds,
  );
}
