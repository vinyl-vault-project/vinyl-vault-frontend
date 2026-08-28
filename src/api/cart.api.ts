import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type { CartDto, CartItemResponseDto } from './api.types';
export const getCart = () => apiGet<CartDto>('/cart/');
export const addCartProduct = (product_id: number | string, quantity = 1) =>
  apiPost<CartItemResponseDto>('/cart/items/', { product_id, quantity });
export const updateCartItem = (id: number | string, quantity: number) =>
  apiPatch<CartItemResponseDto>(`/cart/items/${id}/`, { quantity });
export const deleteCartItem = (id: number | string) =>
  apiDelete(`/cart/items/${id}/`);
