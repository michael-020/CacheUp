
import {create} from 'zustand';
import { IUser } from '@/lib/utils';

interface UserState {
  currentUser: IUser | null;
  setCurrentUser: (user: IUser) => void;
  clearCurrentUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
}));