import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type FontSize = 'medium' | 'large' | 'xlarge';

interface UIState {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      fontSize: 'medium',
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'byouin-nabi-ui',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
