import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  insights?: string;
  createdAt: number;
  updatedAt: number;
}

interface NoteUpdate {
  id: string;
  title?: string;
  content?: string;
  insights?: string;
  updatedAt: number;
}

interface NotesStore {
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (update: NoteUpdate) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (note) => set((state) => ({ 
        notes: [note, ...state.notes] 
      })),
      updateNote: (update) => set((state) => {
        const updatedNotes = state.notes.map(note => {
          if (note.id === update.id) {
            return { 
              ...note,
              ...(update.title !== undefined ? { title: update.title } : {}),
              ...(update.content !== undefined ? { content: update.content } : {}),
              ...(update.insights !== undefined ? { insights: update.insights } : {}),
              updatedAt: update.updatedAt
            };
          }
          return note;
        });
        return { notes: updatedNotes };
      }),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id)
      })),
    }),
    {
      name: 'notes-storage',
    }
  )
); 