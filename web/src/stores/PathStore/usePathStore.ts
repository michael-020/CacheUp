import { create } from 'zustand';
import { PathActions, PathState } from './types';

export const usePathStore = create<PathState & PathActions>((set) => ({
  userLastPath: null,
  adminLastPath: null,

  setUserLastPath: (path) => {
    set({ userLastPath: path });
    if (path) {
      sessionStorage.setItem('lastPath', path);
    } else {
      sessionStorage.removeItem('lastPath');
    }
  },

  setAdminLastPath: (path) => {
    set({ adminLastPath: path });
    if (path) {
      sessionStorage.setItem('adminLastPath', path);
    } else {
      sessionStorage.removeItem('adminLastPath');
    }
  },

  clearPaths: () => {
    set({ userLastPath: null, adminLastPath: null });
    sessionStorage.removeItem('lastPath');
    sessionStorage.removeItem('adminLastPath');
  }
}));