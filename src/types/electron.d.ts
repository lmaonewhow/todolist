interface Todo {
  id: string;
  content: string;
  completed: boolean;
  createdAt: number;
}

interface MenuTemplate {
  label?: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  click?: () => void;
  enabled?: boolean;
  submenu?: MenuTemplate[];
}

interface ElectronAPI {
  loadTodos: () => Promise<Todo[]>;
  saveTodos: (todos: Todo[]) => Promise<void>;
  hideWindow: () => Promise<void>;
  showWindow: () => Promise<void>;
  showContextMenu: (template: MenuTemplate[]) => Promise<void>;
}

interface Window {
  electronAPI: ElectronAPI;
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => void;
    once: (channel: string, func: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer: {
      on: (channel: string, func: (...args: any[]) => void) => void;
      once: (channel: string, func: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
} 