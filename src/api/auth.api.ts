import { apiGet, apiPost } from './client';
import type { AuthResponseDto, AuthTokensDto, AuthUserDto } from './api.types';
export const login = (email: string, password: string) =>
  apiPost<AuthTokensDto>('/auth/login/', { email, password });
export const register = (username: string, email: string, password: string) =>
  apiPost<AuthResponseDto>('/auth/register/', { username, email, password });
export const getCurrentUser = () => apiGet<AuthUserDto>('/auth/me/');
export const refreshToken = (refresh: string) =>
  apiPost<{ access: string }>('/auth/token/refresh/', { refresh });
export const logout = (refresh: string) =>
  apiPost<void>('/auth/logout/', { refresh });
