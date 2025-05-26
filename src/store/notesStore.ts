import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  reflection: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesStore {
  notes: Note[];
  addNote: (title: string, content: string, reflection: string) => void;
  updateNote: (id: string, title: string, content: string, reflection: string) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (title, content, reflection) =>
        set((state) => ({
          notes: [
            {
              id: Date.now().toString(),
              title,
              content,
              reflection,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.notes,
          ],
        })),
      updateNote: (id, title, content, reflection) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  title,
                  content,
                  reflection,
                  updatedAt: Date.now(),
                }
              : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
    }),
    {
      name: 'notes-storage',
    }
  )
); 