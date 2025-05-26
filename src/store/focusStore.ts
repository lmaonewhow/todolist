import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface FocusRecord {
  id: string;
  task: string;
  duration: number;
  completedAt: string;
}

interface FocusStore {
  records: FocusRecord[];
  addFocusRecord: (record: Omit<FocusRecord, 'id'>) => void;
  clearRecords: () => void;
}

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      records: [],
      addFocusRecord: (record) =>
        set((state) => ({
          records: [
            {
              ...record,
              id: Date.now().toString(),
            },
            ...state.records,
          ],
        })),
      clearRecords: () => set({ records: [] }),
    }),
    {
      name: 'focus-storage',
    }
  )
); 