import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// 设置 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 全局变量
let win: BrowserWindow | null = null
let tray: Tray | null = null
const STORAGE_PATH = path.join(app.getPath('userData'), 'todos.json')
const isDev = process.env.NODE_ENV === 'development'

// 创建窗口
function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    backgroundColor: '#fffde7',
    transparent: false,
    opacity: 1,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 窗口配置
  win.setMovable(true)
  
  // 确保窗口可拖动
  win.on('ready-to-show', () => {
    console.log('窗口准备好显示')
    if (win) {
      win.show()
      win.focus()
    }
  })
  
  // 开发环境打开开发工具
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  // 加载应用
  if (isDev) {
    // 开发环境：等待开发服务器启动
    const tryLoadDevServer = async () => {
      try {
        console.log('尝试连接开发服务器...')
        await win?.loadURL('http://localhost:5173')
        console.log('开发服务器连接成功')
      } catch (e) {
        console.log('等待开发服务器启动...')
        setTimeout(tryLoadDevServer, 1000)
      }
    }
    tryLoadDevServer()
  } else {
    // 生产环境：加载打包后的文件
    const indexPath = path.join(__dirname, '../dist/index.html')
    if (fs.existsSync(indexPath)) {
      win.loadFile(indexPath)
      console.log('加载本地文件:', indexPath)
    } else {
      console.error('找不到构建文件:', indexPath)
    }
  }

  // 添加错误处理
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('页面加载失败:', errorCode, errorDescription)
  })
  
  win.webContents.on('did-finish-load', () => {
    console.log('页面加载完成')
  })
  
  win.webContents.on('dom-ready', () => {
    console.log('DOM 准备就绪')
  })
}

// 创建托盘
function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(process.env.VITE_PUBLIC || '', 'todo-icon.png')
  )
  
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        if (!win) {
          createWindow()
          return
        }
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
          win.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('Todo 便签')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    if (!win) {
      createWindow()
      return
    }
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })
}

// 应用生命周期
app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!win) {
    createWindow()
  }
})

// IPC 通信处理
// 数据操作
ipcMain.handle('load-todos', async () => {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const data = await fs.promises.readFile(STORAGE_PATH, 'utf-8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading todos:', error)
    return []
  }
})

ipcMain.handle('save-todos', async (_, todos) => {
  try {
    await fs.promises.writeFile(STORAGE_PATH, JSON.stringify(todos, null, 2))
  } catch (error) {
    console.error('Error saving todos:', error)
  }
})

// 窗口控制
ipcMain.handle('hide-window', () => {
  win?.hide()
})

ipcMain.handle('show-window', () => {
  if (win) {
    win.show()
    win.focus()
  }
})

// 上下文菜单
ipcMain.handle('show-context-menu', (event, template) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    const menu = Menu.buildFromTemplate(template)
    menu.popup({ window: win })
  }
})
