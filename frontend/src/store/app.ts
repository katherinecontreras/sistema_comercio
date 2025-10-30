import { create } from 'zustand';

interface UserState {
  accessToken: string | null;
  dni: string | null;
}

interface ClientState {
  selectedClientId: number | null;
}


interface AppState {
  user: UserState;
  client: ClientState;
  // actions
  setToken: (token: string | null) => void;
  setDni: (dni: string | null) => void;
  selectClient: (id: number | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    accessToken: typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null,
    dni: null,
  },
  client: { selectedClientId: null },
  setToken: (token) => {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
    set((s) => ({ ...s, user: { ...s.user, accessToken: token } }));
  },
  setDni: (dni) => set((s) => ({ ...s, user: { ...s.user, dni } })),
  selectClient: (id) => set((s) => ({ ...s, client: { selectedClientId: id } })),
  logout: () =>
    set(() => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('access_token');
      return {
        user: { accessToken: null, dni: null },
        client: { selectedClientId: null }
      };
    }),
}));


