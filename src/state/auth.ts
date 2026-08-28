import { useSyncExternalStore } from 'react';
import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
} from '../api/auth.api';
import { configureApiAuth } from '../api/client';
export type AuthModalMode = 'login' | 'register' | 'reset-password';
export type AuthModalContext = 'default' | 'checkout' | 'account';
export interface AuthUser {
  email: string;
  id: string;
  name: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}
export interface AuthModalState {
  context: AuthModalContext;
  isOpen: boolean;
  message?: string;
  mode: AuthModalMode;
}
const accessKey = 'vinyl-vault:access-token';
const refreshKey = 'vinyl-vault:refresh-token';
const guest: AuthState = { isAuthenticated: false, user: null };
let state: AuthState = guest;
let initialized = false;
const listeners = new Set<() => void>();
const modalListeners = new Set<() => void>();
let modal: AuthModalState = {
  context: 'default',
  isOpen: false,
  mode: 'login',
};
function notify() {
  listeners.forEach((listener) => listener());
}
function notifyModal() {
  modalListeners.forEach((listener) => listener());
}
function setState(next: AuthState) {
  state = next;
  initialized = true;
  notify();
}
function toUser(user: {
  id: number | string;
  email: string;
  username: string;
}): AuthUser {
  return { id: String(user.id), email: user.email, name: user.username };
}
function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(accessKey);
    localStorage.removeItem(refreshKey);
  }
}
function getAccess() {
  return typeof window === 'undefined' ? null : localStorage.getItem(accessKey);
}
export async function refreshSession() {
  const refresh =
    typeof window === 'undefined' ? null : localStorage.getItem(refreshKey);
  if (!refresh) {
    setState(guest);
    return false;
  }
  try {
    const tokens = await refreshToken(refresh);
    localStorage.setItem(accessKey, tokens.access);
    setState({ isAuthenticated: true, user: toUser(await getCurrentUser()) });
    return true;
  } catch {
    clearTokens();
    setState(guest);
    return false;
  }
}
configureApiAuth(getAccess, refreshSession);
export async function initializeAuth() {
  if (initialized) return;
  if (!getAccess()) {
    setState(guest);
    return;
  }
  try {
    setState({ isAuthenticated: true, user: toUser(await getCurrentUser()) });
  } catch {
    await refreshSession();
  }
}
export async function loginUser(values: { email: string; password: string }) {
  const tokens = await login(values.email.trim(), values.password);
  localStorage.setItem(accessKey, tokens.access);
  localStorage.setItem(refreshKey, tokens.refresh);
  setState({ isAuthenticated: true, user: toUser(await getCurrentUser()) });
}
export async function registerUser(values: {
  username: string;
  email: string;
  password: string;
}) {
  const response = await register(
    values.username.trim(),
    values.email.trim(),
    values.password,
  );
  localStorage.setItem(accessKey, response.access);
  localStorage.setItem(refreshKey, response.refresh);
  setState({ isAuthenticated: true, user: toUser(response.user) });
}
export async function logoutUser() {
  const refresh =
    typeof window === 'undefined' ? null : localStorage.getItem(refreshKey);
  try {
    if (refresh) await logout(refresh);
  } finally {
    clearTokens();
    setState(guest);
    void Promise.all([import('./cart'), import('./library')]).then(
      ([cart, library]) => {
        cart.clearCartState();
        library.clearSavedAlbumsState();
      },
    );
    window.dispatchEvent(new Event('vinyl-vault:session-cleared'));
  }
}
export const authState = new Proxy(guest, {
  get: (_target, key: keyof AuthState) => state[key],
}) as AuthState;
export function useAuthState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => guest,
  );
}
export function useAuthModalState() {
  return useSyncExternalStore(
    (listener) => {
      modalListeners.add(listener);
      return () => modalListeners.delete(listener);
    },
    () => modal,
    () => modal,
  );
}
export function openAuthModal({
  context = 'default',
  message,
  mode = 'login',
}: Partial<Omit<AuthModalState, 'isOpen'>> = {}) {
  modal = { context, isOpen: true, message, mode };
  notifyModal();
}
export function closeAuthModal() {
  modal = { ...modal, isOpen: false };
  notifyModal();
}
export function setAuthModalMode(mode: AuthModalMode) {
  modal = { ...modal, mode };
  notifyModal();
}
