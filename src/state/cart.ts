import { useSyncExternalStore } from 'react';
import {
  addCartProduct,
  deleteCartItem,
  getCart,
  updateCartItem,
} from '../api/cart.api';
import type { CartDto, CartItemDto } from '../api/api.types';
const empty: CartItemDto[] = [];
let cart: CartDto = { items: empty, total: '0.00' };
let pendingMutation: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((listener) => listener());
}
function setCart(next: CartDto) {
  cart = next;
  notify();
}
export async function refreshCart() {
  try {
    setCart(await getCart());
  } catch {
    setCart({ items: empty, total: '0.00' });
  }
}
export function clearCartState() {
  setCart({ items: empty, total: '0.00' });
}
export async function addCartItem(productId: number | string) {
  return queueCartMutation(async () => {
    const existing = cart.items.find(
      (item) => String(item.product.id) === String(productId),
    );
    if (existing) {
      if (existing.quantity < existing.product.stock_quantity)
        await updateCartItem(existing.id, existing.quantity + 1);
    } else await addCartProduct(productId);
    await refreshCart();
  });
}
export async function increaseCartItem(item: CartItemDto) {
  return queueCartMutation(async () => {
    const current = cart.items.find(
      (cartItem) => String(cartItem.id) === String(item.id),
    );
    if (current && current.quantity < current.product.stock_quantity)
      await updateCartItem(current.id, current.quantity + 1);
    await refreshCart();
  });
}
export async function decreaseCartItem(item: CartItemDto) {
  return queueCartMutation(async () => {
    const current = cart.items.find(
      (cartItem) => String(cartItem.id) === String(item.id),
    );
    if (!current) return;
    if (current.quantity <= 1) {
      await deleteCartItem(current.id);
    } else await updateCartItem(current.id, current.quantity - 1);
    await refreshCart();
  });
}
function queueCartMutation(operation: () => Promise<void>) {
  const nextMutation = pendingMutation.then(operation, operation);
  pendingMutation = nextMutation.then(
    () => undefined,
    () => undefined,
  );
  return nextMutation;
}
export function getCartItemCount(items: CartItemDto[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
export function useCartItems() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => cart.items,
    () => empty,
  );
}
export function useCart() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => cart,
    () => ({ items: empty, total: '0.00' }),
  );
}
