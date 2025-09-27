import { create } from 'zustand';

export const useLoadingStore = create((set, get) => ({
  count: 0,
  // commence un chargement (supporte les appels imbriqués)
  start: () => set({ count: get().count + 1 }),
  // termine un chargement (ne descend jamais sous 0)
  stop: () => set({ count: Math.max(0, get().count - 1) }),
  // utilitaire: exécuter une fonction async avec loader auto
  withLoading: async (fn) => {
    get().start();
    try {
      return await fn();
    } finally {
      get().stop();
    }
  }
}));
