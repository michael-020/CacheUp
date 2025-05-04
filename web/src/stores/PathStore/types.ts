export interface PathState {
  userLastPath: string | null;
  adminLastPath: string | null;
}

export interface PathActions {
  setUserLastPath: (path: string | null) => void;
  setAdminLastPath: (path: string | null) => void;
  clearPaths: () => void;
}
