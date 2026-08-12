import { useSyncExternalStore } from 'react';

import { getAlbumDetailBySlug } from '../data/albumDetails';
import { albums } from '../data/albums';

const cartStorageKey = 'vinyl-vault:cart-items';
const cartChangeEventName = 'vinyl-vault:cart-items-change';
const emptyCartItems: CartItem[] = [];
let cachedCartRawValue: string | null = null;
let cachedCartItems: CartItem[] = emptyCartItems;

export interface CartItem {
  albumId: string;
  quantity: number;
  selectedFormat: string;
  unitPrice: number;
}

export interface CartAlbumItem extends CartItem {
  album: (typeof albums)[number];
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function getAlbumProduct(albumId: string) {
  const album = albums.find((currentAlbum) => currentAlbum.id === albumId);

  if (!album) {
    return null;
  }

  const detail = getAlbumDetailBySlug(album.slug);

  return {
    album,
    selectedFormat: detail?.product.format.toUpperCase() ?? 'VINYL',
    unitPrice: detail?.product.price ?? 45,
  };
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (typeof value !== 'object' || value === null || !('albumId' in value)) {
    return null;
  }

  const rawItem = value as Partial<CartItem>;
  const albumId = rawItem.albumId;
  const quantity = rawItem.quantity;

  if (typeof albumId !== 'string' || typeof quantity !== 'number') {
    return null;
  }

  const product = getAlbumProduct(albumId);

  if (!product) {
    return null;
  }

  return {
    albumId,
    quantity: Math.max(1, Math.floor(quantity)),
    selectedFormat:
      typeof rawItem.selectedFormat === 'string'
        ? rawItem.selectedFormat.toUpperCase()
        : product.selectedFormat,
    unitPrice:
      typeof rawItem.unitPrice === 'number' ? rawItem.unitPrice : product.unitPrice,
  };
}

export function readCartItems(): CartItem[] {
  if (!isBrowser()) {
    return emptyCartItems;
  }

  try {
    const rawValue = window.localStorage.getItem(cartStorageKey);

    if (rawValue === cachedCartRawValue) {
      return cachedCartItems;
    }

    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : [];

    cachedCartRawValue = rawValue;
    cachedCartItems = Array.isArray(parsedValue)
      ? parsedValue
          .map(normalizeCartItem)
          .filter((item): item is CartItem => Boolean(item))
      : emptyCartItems;

    return cachedCartItems;
  } catch {
    cachedCartRawValue = null;
    cachedCartItems = emptyCartItems;

    return cachedCartItems;
  }
}

export function writeCartItems(items: CartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  window.dispatchEvent(new Event(cartChangeEventName));
}

export function addCartItem(albumId: string) {
  const product = getAlbumProduct(albumId);

  if (!product) {
    return;
  }

  const currentItems = readCartItems();
  const existingItem = currentItems.find((item) => item.albumId === albumId);
  const nextItems = existingItem
    ? currentItems.map((item) =>
        item.albumId === albumId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    : [
        ...currentItems,
        {
          albumId,
          quantity: 1,
          selectedFormat: product.selectedFormat,
          unitPrice: product.unitPrice,
        },
      ];

  writeCartItems(nextItems);
}

export function increaseCartItem(albumId: string) {
  writeCartItems(
    readCartItems().map((item) =>
      item.albumId === albumId ? { ...item, quantity: item.quantity + 1 } : item,
    ),
  );
}

export function decreaseCartItem(albumId: string) {
  writeCartItems(
    readCartItems()
      .map((item) =>
        item.albumId === albumId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
      .filter((item) => item.quantity > 0),
  );
}

export function getCartAlbumItems(items: CartItem[]): CartAlbumItem[] {
  return items
    .map((item) => {
      const album = albums.find((currentAlbum) => currentAlbum.id === item.albumId);

      return album ? { ...item, album } : null;
    })
    .filter((item): item is CartAlbumItem => Boolean(item));
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );
}

function subscribeToCart(callback: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(cartChangeEventName, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(cartChangeEventName, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useCartItems() {
  return useSyncExternalStore(subscribeToCart, readCartItems, () => emptyCartItems);
}
