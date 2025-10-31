import { create } from 'zustand';

interface UserState {
  nombre: string | null;
  accessToken: string | null;
  dni: string | null;
}

interface ClientState {
  selectedClientId: number | null;
}


interface AppState {
  user: UserState;
  client: ClientState;
  sidebar: {
    isOpen: boolean;
  };
  // actions
  setToken: (token: string | null) => void;
  setDni: (dni: string | null) => void;
  selectClient: (id: number | null) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    nombre: null,
    accessToken: typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null,
    dni: null,
  },
  client: { selectedClientId: null },
  sidebar: {
    isOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  },
  setToken: (token) => {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      else localStorage.removeItem('access_token');
    }
    set((s) => ({ ...s, user: { ...s.user, accessToken: token } }));
  },
  setDni: (dni) => set((s) => ({ ...s, user: { ...s.user, dni } })),
  selectClient: (id) => set((s) => ({ ...s, client: { selectedClientId: id } })),
  setSidebarOpen: (isOpen) => set((s) => ({ ...s, sidebar: { isOpen } })),
  logout: () => {
    // Limpiar localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    // Actualizar el estado
    set({
      user: { nombre: null, accessToken: null, dni: null },
      client: { selectedClientId: null },
      sidebar: { isOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true },
    });
  },
}));


