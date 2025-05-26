import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 扩展UI模式类型，添加auto模式
type UIMode = 'standard' | 'simple' | 'fullscreen' | 'auto';

interface SettingsStore {
  uiMode: UIMode;
  setUIMode: (mode: UIMode) => void;
  // 存储实际应用的布局模式（由自动模式计算得出）
  activeLayout: Exclude<UIMode, 'auto'>;
  setActiveLayout: (layout: Exclude<UIMode, 'auto'>) => void;
  // 其他设置...
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      uiMode: 'auto', // 将默认模式改为自动
      setUIMode: (mode) => set({ uiMode: mode }),
      activeLayout: 'standard', // 默认实际布局为标准模式
      setActiveLayout: (layout) => set({ activeLayout: layout }),
      // 其他设置的状态和方法...
    }),
    {
      name: 'settings-storage', // 本地存储的键名
    }
  )
); 