import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '@/domain/entities';
import { sessionCookie } from '@/infra/session/sessionCookie';

interface SessionState {
  usuario: Usuario | null;
  entrar: (usuario: Usuario, token: string) => void;
  sair: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      usuario: null,
      entrar: (usuario, token) => {
        sessionCookie.set(token);
        set({ usuario });
      },
      sair: () => {
        sessionCookie.clear();
        set({ usuario: null });
      },
    }),
    { name: 'porto-seco:sessao' },
  ),
);
