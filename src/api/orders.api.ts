import { apiGet, apiPost } from './client';
import type { CreateOrderPayload, OrderDto, PaginatedDto } from './api.types';
export const createOrder = (payload: CreateOrderPayload) =>
  apiPost<OrderDto>('/orders/', payload);
export const getOrders = () =>
  apiGet<PaginatedDto<OrderDto> | OrderDto[]>('/orders/');
export const getOrder = (number: string) =>
  apiGet<OrderDto>(`/orders/${encodeURIComponent(number)}/`);
export const cancelOrder = (number: string) =>
  apiPost<OrderDto>(`/orders/${encodeURIComponent(number)}/cancel/`);
