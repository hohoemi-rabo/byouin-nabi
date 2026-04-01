import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LocationState {
  cachedLocation: { lat: number; lng: number } | null;
  setLocation: (location: { lat: number; lng: number }) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      cachedLocation: null,
      setLocation: (location) => set({ cachedLocation: location }),
      clearLocation: () => set({ cachedLocation: null }),
    }),
    {
      name: 'byouin-nabi-location',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
