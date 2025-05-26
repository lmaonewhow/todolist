import { contextBridge, ipcRenderer } from 'electron'

// 添加调试日志
const log = (...args: any[]) => {
  console.log('[Preload]', ...args)
}

// 错误处理包装器
const wrapIpcCall = async (channel: string, ...args: any[]) => {
  try {
    const result = await ipcRenderer.invoke(channel, ...args)
    log(`${channel} 调用成功:`, result)
    return result
  } catch (error) {
    log(`${channel} 调用失败:`, error)
    throw error
  }
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

interface MenuItem {
  label: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  click?: () => void;
  enabled?: boolean;
}

type IpcCallback = (...args: any[]) => void;

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 数据操作
  loadTodos: () => wrapIpcCall('load-todos'),
  saveTodos: (todos: any[]) => wrapIpcCall('save-todos', todos),
  
  // 窗口控制
  hideWindow: () => wrapIpcCall('hide-window'),
  showWindow: () => wrapIpcCall('show-window'),
  
  // 上下文菜单
  showContextMenu: (template: any[]) => wrapIpcCall('show-context-menu', template)
})

// 暴露 ipcRenderer
contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel: string, func: IpcCallback) => {
    const subscription = (_event: any, ...args: any[]) => func(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  once: (channel: string, func: IpcCallback) => {
    ipcRenderer.once(channel, (_event: any, ...args: any[]) => func(...args))
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  }
})

// 添加就绪状态日志
log('预加载脚本已加载')
