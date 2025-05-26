// Todo 项的类型定义
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

// Todo 存储的类型定义
export interface TodoStore {
  // 状态
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  // 操作方法
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  
  // 数据持久化
  loadTodos: () => Promise<void>;
  saveTodos: () => Promise<void>;
}

// 声明 Electron API 类型
declare global {
  interface Window {
    electronAPI: {
      loadTodos: () => Promise<Todo[]>;
      saveTodos: (todos: Todo[]) => Promise<boolean>;
    }
  }
} 