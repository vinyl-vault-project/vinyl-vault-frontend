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
  const existing = cart.items.find(
    (item) => String(item.product.id) === String(productId),
  );
  if (existing) {
    if (existing.quantity < existing.product.stock_quantity)
      await updateCartItem(existing.id, existing.quantity + 1);
  } else await addCartProduct(productId);
  await refreshCart();
}
export async function increaseCartItem(item: CartItemDto) {
  if (item.quantity < item.product.stock_quantity)
    await updateCartItem(item.id, item.quantity + 1);
  await refreshCart();
}
export async function decreaseCartItem(item: CartItemDto) {
  if (item.quantity <= 1) {
    await deleteCartItem(item.id);
  } else await updateCartItem(item.id, item.quantity - 1);
  await refreshCart();
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
