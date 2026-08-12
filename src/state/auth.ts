import { useSyncExternalStore } from 'react';

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

const authStorageKey = 'vinyl-vault:mock-auth-session';
export const demoAccountEmail = 'marlana08022022@gmail.com';

const demoLoginCredentials = {
  email: demoAccountEmail,
  password: 'password123',
};
const authListeners = new Set<() => void>();
const authModalListeners = new Set<() => void>();

let cachedAuthRawValue: string | null | undefined;
let cachedAuthState: AuthState | undefined;

const guestAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

let authModalState: AuthModalState = {
  context: 'default',
  isOpen: false,
  mode: 'login',
};

function getStoredAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return guestAuthState;
  }

  const rawValue = window.localStorage.getItem(authStorageKey);

  if (cachedAuthState && cachedAuthRawValue === rawValue) {
    return cachedAuthState;
  }

  cachedAuthRawValue = rawValue;

  if (!rawValue) {
    cachedAuthState = guestAuthState;
    return cachedAuthState;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as AuthUser;

    if (
      typeof parsedValue.email !== 'string' ||
      typeof parsedValue.id !== 'string' ||
      typeof parsedValue.name !== 'string'
    ) {
      cachedAuthState = guestAuthState;
      return cachedAuthState;
    }

    cachedAuthState = {
      isAuthenticated: true,
      user: parsedValue,
    };
  } catch {
    cachedAuthState = guestAuthState;
  }

  return cachedAuthState;
}

function notifyAuthListeners() {
  authListeners.forEach((listener) => listener());
}

function notifyAuthModalListeners() {
  authModalListeners.forEach((listener) => listener());
}

function subscribeAuth(listener: () => void) {
  authListeners.add(listener);

  return () => {
    authListeners.delete(listener);
  };
}

function subscribeAuthModal(listener: () => void) {
  authModalListeners.add(listener);

  return () => {
    authModalListeners.delete(listener);
  };
}

function getAuthModalSnapshot() {
  return authModalState;
}

export const authState = new Proxy(guestAuthState, {
  get(_target, property: keyof AuthState) {
    return getStoredAuthState()[property];
  },
}) as AuthState;

export function useAuthState() {
  return useSyncExternalStore(subscribeAuth, getStoredAuthState, () => guestAuthState);
}

export function useAuthModalState() {
  return useSyncExternalStore(
    subscribeAuthModal,
    getAuthModalSnapshot,
    getAuthModalSnapshot,
  );
}

export function openAuthModal({
  context = 'default',
  message,
  mode = 'login',
}: Partial<Omit<AuthModalState, 'isOpen'>> = {}) {
  authModalState = {
    context,
    isOpen: true,
    message,
    mode,
  };
  notifyAuthModalListeners();
}

export function closeAuthModal() {
  authModalState = {
    ...authModalState,
    isOpen: false,
  };
  notifyAuthModalListeners();
}

export function setAuthModalMode(mode: AuthModalMode) {
  authModalState = {
    ...authModalState,
    mode,
  };
  notifyAuthModalListeners();
}

export function isDemoAccountEmail(email: string) {
  return email.trim().toLowerCase() === demoAccountEmail;
}

export function mockLogin({ email, password }: { email: string; password: string }) {
  const trimmedEmail = email.trim().toLowerCase();

  if (
    trimmedEmail !== demoLoginCredentials.email ||
    password !== demoLoginCredentials.password
  ) {
    return false;
  }

  const user: AuthUser = {
    email: demoLoginCredentials.email,
    id: 'vinyl-vault-user',
    name: 'Marlana',
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  }

  cachedAuthRawValue = undefined;
  cachedAuthState = undefined;
  notifyAuthListeners();
  return true;
}

export function mockRegister({ email, name }: { email: string; name: string }) {
  const trimmedName = name.trim() || 'Vinyl Vault Listener';
  const user: AuthUser = {
    email: email.trim(),
    id: 'vinyl-vault-user',
    name: trimmedName,
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(authStorageKey, JSON.stringify(user));
  }

  cachedAuthRawValue = undefined;
  cachedAuthState = undefined;
  notifyAuthListeners();
}

export function mockLogout() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(authStorageKey);
  }

  cachedAuthRawValue = undefined;
  cachedAuthState = undefined;
  notifyAuthListeners();
}
