import { apiGet, apiPost } from './client';
import type { CreateOrderPayload, OrderDto, PaginatedDto } from './api.types';
export const createOrder = (payload: CreateOrderPayload) =>
  apiPost<OrderDto>('/orders/', payload, {
    headers: { 'Idempotency-Key': createIdempotencyKey() },
  });
export const getOrders = () =>
  apiGet<PaginatedDto<OrderDto> | OrderDto[]>('/orders/');
export const getOrder = (number: string) =>
  apiGet<OrderDto>(`/orders/${encodeURIComponent(number)}/`);
export const cancelOrder = (number: string) =>
  apiPost<OrderDto>(`/orders/${encodeURIComponent(number)}/cancel/`);

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
