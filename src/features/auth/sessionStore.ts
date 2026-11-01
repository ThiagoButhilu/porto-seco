import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/domain/entities';
import { sessionCookie } from '@/infra/session/sessionCookie';

interface SessionState {
  user: User | null;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user, token) => {
        sessionCookie.set(token);
        set({ user });
      },
      signOut: () => {
        sessionCookie.clear();
        set({ user: null });
      },
    }),
    { name: 'porto-seco:session' },
  ),
);
