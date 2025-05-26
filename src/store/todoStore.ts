import { create } from 'zustand'

interface Todo {
  id: string
  content: string
  completed: boolean
  createdAt: number
  completedAt?: number // 记录任务完成的时间
}

interface TodoStore {
  todos: Todo[]
  isLoading: boolean
  error: string | null
  loadTodos: () => Promise<void>
  addTodo: (content: string) => Promise<void>
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
}

// 检查API是否可用
const checkElectronAPI = () => {
  if (!window.electronAPI) {
    console.error('electronAPI 未定义，可能是预加载脚本未正确加载')
    throw new Error('电子API不可用，无法与主进程通信')
  }
  return true
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  // 初始状态
  todos: [],
  isLoading: false,
  error: null,

  // 添加 todo
  addTodo: async (content: string) => {
    try {
      if (!checkElectronAPI()) {
        throw new Error('无法添加任务，API不可用')
      }
      
      const newTodo: Todo = {
        id: Date.now().toString(),
        content,
        completed: false,
        createdAt: Date.now()
      }
      
      const updatedTodos = [...get().todos, newTodo]
      set({ todos: updatedTodos })
      await window.electronAPI.saveTodos(updatedTodos)
    } catch (error) {
      console.error('添加任务失败:', error)
      set({ error: (error as Error).message })
      throw error
    }
  },

  // 切换 todo 完成状态
  toggleTodo: (id: string) => {
    try {
      const todo = get().todos.find(todo => todo.id === id);
      const updatedTodos = get().todos.map((todo) =>
        todo.id === id
          ? { 
              ...todo, 
              completed: !todo.completed,
              completedAt: !todo.completed ? Date.now() : undefined // 设置完成时间或清除
            }
          : todo
      )
      set({ todos: updatedTodos })
      window.electronAPI.saveTodos(updatedTodos)
        .catch(error => {
          console.error('保存任务状态失败:', error)
          set({ error: (error as Error).message })
        })
    } catch (error) {
      console.error('切换任务状态失败:', error)
      set({ error: (error as Error).message })
    }
  },

  // 删除 todo
  deleteTodo: (id: string) => {
    try {
      const updatedTodos = get().todos.filter((todo) => todo.id !== id)
      set({ todos: updatedTodos })
      window.electronAPI.saveTodos(updatedTodos)
        .catch(error => {
          console.error('保存删除操作失败:', error)
          set({ error: (error as Error).message })
        })
    } catch (error) {
      console.error('删除任务失败:', error)
      set({ error: (error as Error).message })
    }
  },

  // 加载 todos
  loadTodos: async () => {
    try {
      console.log('开始加载数据...')
      set({ isLoading: true, error: null })
      
      if (!checkElectronAPI()) {
        throw new Error('无法加载数据，API不可用')
      }
      
      const todos = await window.electronAPI.loadTodos()
      console.log('获取到的数据:', todos)
      set({ todos, isLoading: false })
    } catch (error) {
      console.error('加载数据失败:', error)
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  // 保存 todos
  saveTodos: async () => {
    try {
      set({ error: null })
      const { todos } = get()
      await window.electronAPI.saveTodos(todos)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
})) 