import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UIMode = 'standard' | 'simple';

interface SettingsState {
  uiMode: UIMode;
  setUIMode: (mode: UIMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      uiMode: 'standard', // 默认使用标准模式
      setUIMode: (mode) => set({ uiMode: mode }),
    }),
    {
      name: 'todo-settings', // localStorage 的键名
    }
  )
); 