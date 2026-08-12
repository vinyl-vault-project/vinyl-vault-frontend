export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const authState: AuthState = {
  isAuthenticated: true,
  user: {
    id: 'vinyl-vault-user',
    name: 'Vinyl Vault Listener',
    email: 'listener@vinylvault.local',
  },
};
