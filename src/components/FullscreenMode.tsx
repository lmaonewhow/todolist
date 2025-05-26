import React, { useState, useEffect } from 'react';
import { useTodoStore } from '../store/todoStore';
import { useFocusStore } from '../store/focusStore';
import { useNotesStore, Note } from '../store/notesStore';
import '../styles/fullscreen-mode.css';

// 图标组件
const Icon = ({ name }: { name: string }) => <span className="fs-nav-icon">{name}</span>;

// 日期格式化工具函数
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) {
    return '今天';
  } else if (date >= yesterday) {
    return '昨天';
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 对完成任务按日期分组
const groupCompletedTodos = (todos: any[]) => {
  const groups: { [key: string]: any[] } = {};

  todos.forEach(todo => {
    if (!todo.completed || !todo.completedAt) return;

    const date = new Date(todo.completedAt);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString();

    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(todo);
  });

  // 转换为数组并排序
  const sortedGroups = Object.entries(groups)
    .map(([dateStr, todos]) => ({
      dateStr,
      date: new Date(dateStr),
      label: formatDate(new Date(dateStr).getTime()),
      todos
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // 最近日期在前

  return sortedGroups;
};

export const FullscreenMode: React.FC = () => {
  // 页面状态
  const [activePage, setActivePage] = useState('todos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [activeTab, setActiveTab] = useState('content'); // content or insights
  const [focusTask, setFocusTask] = useState('');
  
  // 获取数据存储
  const { todos, addTodo, toggleTodo, deleteTodo, isLoading } = useTodoStore();
  const { focusHistory, startFocus, pauseFocus, resetFocus, status, timeLeft } = useFocusStore();
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  
  // 计算分钟和秒
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // 计算环形进度条的偏移量
  const circumference = 2 * Math.PI * 45;
  const progressOffset = circumference * (1 - timeLeft / (25 * 60));
  
  // 当活动笔记变化时更新表单内容
  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find((n: Note) => n.id === activeNoteId);
      if (note) {
        setNoteTitle(note.title);
        setNoteContent(activeTab === 'content' ? note.content : note.reflection || '');
      }
    } else if (notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, notes, activeTab]);
  
  // 处理笔记保存
  const handleNoteSave = () => {
    if (activeNoteId) {
      const note = notes.find((n: Note) => n.id === activeNoteId);
      if (note) {
        updateNote(
          activeNoteId,
          noteTitle,
          activeTab === 'content' ? noteContent : note.content,
          activeTab === 'insights' ? noteContent : (note.reflection || '')
        );
      }
    }
  };
  
  // 处理笔记创建
  const handleCreateNote = () => {
    addNote('新建笔记', '', '');
    if (notes.length > 0) {
      setActiveNoteId(notes[0].id);
    }
  };
  
  // 处理笔记标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (activeNoteId) {
      const note = notes.find((n: Note) => n.id === activeNoteId);
      if (note) {
        setNoteContent(tab === 'content' ? note.content : note.reflection || '');
      }
    }
  };
  
  // 处理添加任务
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };
  
  // 导航项定义
  const navItems = [
    { id: 'todos', title: '待办任务', icon: '📝', count: todos.filter(t => !t.completed).length },
    { id: 'stats', title: '统计', icon: '📊' },
    { id: 'focus', title: '专注', icon: '⏱️' },
    { id: 'notes', title: '笔记', icon: '📒', count: notes.length },
    { id: 'settings', title: '设置', icon: '⚙️' },
  ];
  
  // 切换侧边栏
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // 完成和未完成任务
  const currentTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  // 对完成的任务按日期分组
  const completedGroups = groupCompletedTodos(completedTodos);
  
  // 获取专注统计数据
  const totalFocusSessions = focusHistory.length;
  const totalFocusMinutes = focusHistory.reduce((total, session) => total + session.duration / 60, 0);
  const averageFocusMinutes = totalFocusSessions > 0 ? Math.round(totalFocusMinutes / totalFocusSessions) : 0;
  
  // 获取任务统计数据
  const totalTasks = todos.length;
  const completedTasksCount = todos.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  
  // 获取最近7天的数据用于图表
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();

  const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  // 计算各天的专注时间
  const focusDurationByDay = last7Days.map(day => {
    const sessionsOnDay = focusHistory.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate.toDateString() === day.toDateString();
    });
    return Math.round(sessionsOnDay.reduce((total, session) => total + session.duration / 60, 0));
  });
  
  return (
    <div className="fullscreen-container">
      {/* 侧边栏 */}
      <div className={`fs-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="fs-logo">
          <h2>效率清单</h2>
        </div>
        
        <nav className="fs-nav">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`fs-nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon name={item.icon} />
              <span className="fs-nav-text">{item.title}</span>
              {item.count && <span className="fs-nav-count">{item.count}</span>}
            </div>
          ))}
        </nav>
      </div>
      
      {/* 主内容区 */}
      <div className="fs-main">
        {/* 顶部导航 */}
        <header className="fs-header">
          <div className="fs-header-left">
            <button className="fs-menu-toggle" onClick={toggleSidebar}>
              ☰
            </button>
            <h1 className="fs-header-title">
              {navItems.find(item => item.id === activePage)?.title}
            </h1>
          </div>
          
          <div className="fs-header-right">
            <div className="fs-search">
              <span className="fs-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="搜索..." 
                className="fs-search-input" 
              />
            </div>
            
            <div className="fs-user">
              <div className="fs-avatar">U</div>
              <span className="fs-user-name">用户</span>
            </div>
          </div>
        </header>
        
        {/* 内容区 */}
        <main className="fs-content">
          {activePage === 'todos' && (
            <div className="fs-todos">
              {/* 待办任务列 */}
              <div className="fs-todo-column">
                <div className="fs-todo-header">
                  <h2 className="fs-todo-title">
                    待办任务 <span className="fs-todo-count">{currentTodos.length}</span>
                  </h2>
                </div>
                
                <form className="fs-add-todo" onSubmit={handleAddTodo}>
                  <input 
                    type="text"
                    className="fs-add-todo-input"
                    placeholder="添加新任务..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                  />
                  <button type="submit" className="fs-add-todo-btn">添加</button>
                </form>
                
                <div className="fs-todo-items">
                  {isLoading ? (
                    <div>加载中...</div>
                  ) : currentTodos.length === 0 ? (
                    <div>暂无待办任务</div>
                  ) : (
                    currentTodos.map(todo => (
                      <div key={todo.id} className="fs-todo-item">
                        <input 
                          type="checkbox" 
                          className="fs-todo-checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                        />
                        <div className="fs-todo-content">
                          <div>{todo.content}</div>
                          <div className="fs-todo-date">
                            {formatDate(todo.createdAt)}
                          </div>
                        </div>
                        <div className="fs-todo-actions">
                          <button 
                            className="fs-todo-btn"
                            onClick={() => deleteTodo(todo.id)}
                          >✕</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* 已完成任务列 */}
              <div className="fs-todo-column">
                <div className="fs-todo-header">
                  <h2 className="fs-todo-title">
                    已完成 <span className="fs-todo-count">{completedTodos.length}</span>
                  </h2>
                </div>
                
                <div className="fs-todo-items">
                  {completedTodos.length === 0 ? (
                    <div>暂无已完成任务</div>
                  ) : (
                    completedGroups.map((group, groupIndex) => (
                      <div key={groupIndex}>
                        <h3>{group.label}</h3>
                        {group.todos.map(todo => (
                          <div key={todo.id} className="fs-todo-item completed">
                            <input 
                              type="checkbox" 
                              className="fs-todo-checkbox"
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                            />
                            <div className="fs-todo-content">
                              <div>{todo.content}</div>
                              <div className="fs-todo-date">
                                {formatDate(todo.createdAt)}
                              </div>
                            </div>
                            <div className="fs-todo-actions">
                              <button 
                                className="fs-todo-btn"
                                onClick={() => deleteTodo(todo.id)}
                              >✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 专注页面 */}
          {activePage === 'focus' && (
            <div className="fs-focus">
              {/* 专注计时器部分 */}
              <div className="fs-focus-timer-card">
                <h2>专注计时器</h2>
                
                <div className="fs-timer-circle">
                  <svg width="300" height="300" viewBox="0 0 100 100">
                    <circle
                      className="fs-timer-bg"
                      cx="50"
                      cy="50"
                      r="45"
                    />
                    <circle
                      className="fs-timer-progress"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeDasharray={circumference}
                      strokeDashoffset={progressOffset}
                    />
                  </svg>
                  <div className="fs-timer-text">
                    {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                  </div>
                </div>
                
                <input
                  type="text"
                  className="fs-focus-input"
                  placeholder="输入专注任务..."
                  value={focusTask}
                  onChange={(e) => setFocusTask(e.target.value)}
                  disabled={status === 'running'}
                />
                
                <div className="fs-focus-actions">
                  {status === 'idle' && (
                    <button 
                      className="fs-focus-btn fs-focus-start-btn"
                      onClick={() => startFocus(focusTask)}
                    >
                      开始专注
                    </button>
                  )}
                  
                  {status === 'running' && (
                    <>
                      <button 
                        className="fs-focus-btn fs-focus-control-btn"
                        onClick={pauseFocus}
                      >
                        暂停
                      </button>
                      <button 
                        className="fs-focus-btn fs-focus-control-btn"
                        onClick={resetFocus}
                      >
                        重置
                      </button>
                    </>
                  )}
                  
                  {status === 'paused' && (
                    <>
                      <button 
                        className="fs-focus-btn fs-focus-start-btn"
                        onClick={() => startFocus(focusTask)}
                      >
                        继续
                      </button>
                      <button 
                        className="fs-focus-btn fs-focus-control-btn"
                        onClick={resetFocus}
                      >
                        重置
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* 专注记录部分 */}
              <div className="fs-focus-records">
                <div className="fs-focus-records-header">
                  <h3 className="fs-focus-records-title">专注记录</h3>
                </div>
                
                <div className="fs-focus-records-list">
                  {focusHistory.length === 0 ? (
                    <div>暂无专注记录</div>
                  ) : (
                    focusHistory.slice(0, 10).map((record, index) => (
                      <div key={index} className="fs-focus-record">
                        <div className="fs-focus-record-task">
                          {record.task || '未命名任务'}
                        </div>
                        <div className="fs-focus-record-info">
                          <span>{Math.round(record.duration / 60)}分钟</span>
                          <span>{formatDate(record.startTime)} {new Date(record.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="fs-focus-tips">
                  <h4 className="fs-focus-tips-title">专注提示</h4>
                  <ul className="fs-focus-tips-list">
                    <li className="fs-focus-tips-item">找一个安静的环境</li>
                    <li className="fs-focus-tips-item">把手机调至勿扰模式</li>
                    <li className="fs-focus-tips-item">准备一杯温水</li>
                    <li className="fs-focus-tips-item">设定明确的目标</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* 统计页面 */}
          {activePage === 'stats' && (
            <div className="fs-stats-grid">
              {/* 专注统计卡片 */}
              <div className="fs-card fs-stat-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">专注统计</h3>
                </div>
                
                <div className="fs-stat-card-body">
                  <div className="fs-stat-row">
                    <div className="fs-stat-number">
                      <span className="fs-stat-value">{totalFocusSessions}</span>
                      <span className="fs-stat-label">专注次数</span>
                    </div>
                    <div className="fs-stat-number">
                      <span className="fs-stat-value">{Math.round(totalFocusMinutes)}</span>
                      <span className="fs-stat-label">总专注时间(分钟)</span>
                    </div>
                    <div className="fs-stat-number">
                      <span className="fs-stat-value">{averageFocusMinutes}</span>
                      <span className="fs-stat-label">平均时长(分钟)</span>
                    </div>
                  </div>
                  
                  <div className="fs-chart-container">
                    <h4>近7天专注时间</h4>
                    <div className="fs-bar-chart">
                      {dayLabels.map((day, i) => {
                        const height = focusDurationByDay[i] > 0 
                          ? Math.max(10, Math.min(100, (focusDurationByDay[i] / 60) * 100)) 
                          : 0;
                        
                        return (
                          <div key={i} className="fs-bar-column">
                            <div className="fs-bar-wrap">
                              <div 
                                className="fs-bar" 
                                style={{ height: `${height}%` }}
                                data-value={`${focusDurationByDay[i]}分钟`}
                              ></div>
                            </div>
                            <div className="fs-bar-label">{day}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 任务统计卡片 */}
              <div className="fs-card fs-stat-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">任务统计</h3>
                </div>
                
                <div className="fs-stat-card-body">
                  <div className="fs-stat-row">
                    <div className="fs-stat-number">
                      <span className="fs-stat-value">{totalTasks}</span>
                      <span className="fs-stat-label">总任务数</span>
                    </div>
                    <div className="fs-stat-number">
                      <span className="fs-stat-value">{completedTasksCount}</span>
                      <span className="fs-stat-label">已完成</span>
                    </div>
                    <div className="fs-stat-number">
                      <span className="fs-stat-value">{completionRate}%</span>
                      <span className="fs-stat-label">完成率</span>
                    </div>
                  </div>
                  
                  <div className="fs-progress-container">
                    <h4>任务完成情况</h4>
                    <div className="fs-progress">
                      <div 
                        className="fs-progress-bar" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="fs-progress-labels">
                      <span>待完成: {todos.length - completedTasksCount}</span>
                      <span>已完成: {completedTasksCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 笔记页面 */}
          {activePage === 'notes' && (
            <div className="fs-notes-container">
              {/* 笔记侧边栏 */}
              <div className="fs-notes-sidebar">
                <div className="fs-notes-search">
                  <div className="fs-search">
                    <span className="fs-search-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="搜索笔记..." 
                      className="fs-search-input" 
                    />
                  </div>
                </div>
                
                <button 
                  className="fs-notes-create-btn"
                  onClick={handleCreateNote}
                >
                  新建笔记
                </button>
                
                <ul className="fs-notes-list">
                  {notes.length === 0 ? (
                    <li>暂无笔记</li>
                  ) : (
                    notes.map((note) => (
                      <li 
                        key={note.id} 
                        className={`fs-note-item ${note.id === activeNoteId ? 'active' : ''}`}
                        onClick={() => setActiveNoteId(note.id)}
                      >
                        <div className="fs-note-item-title">
                          {note.title}
                        </div>
                        <div className="fs-note-item-excerpt">
                          {note.content.slice(0, 50)}
                        </div>
                        <div className="fs-note-item-date">
                          {formatDate(note.updatedAt)} {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              
              {/* 笔记编辑器 */}
              {activeNoteId ? (
                <div className="fs-note-editor">
                  <div className="fs-note-editor-header">
                    <input 
                      type="text" 
                      className="fs-editor-title-input"
                      placeholder="笔记标题"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      onBlur={handleNoteSave}
                    />
                    
                    <div className="fs-note-actions">
                      <button 
                        className="fs-note-action-btn"
                        onClick={handleNoteSave}
                        title="保存笔记"
                      >💾</button>
                      <button 
                        className="fs-note-action-btn"
                        onClick={() => deleteNote(activeNoteId)}
                        title="删除笔记"
                      >🗑️</button>
                    </div>
                  </div>
                  
                  <div className="fs-editor-tabs">
                    <div 
                      className={`fs-editor-tab ${activeTab === 'content' ? 'active' : ''}`}
                      onClick={() => handleTabChange('content')}
                    >
                      内容
                    </div>
                    <div 
                      className={`fs-editor-tab ${activeTab === 'insights' ? 'active' : ''}`}
                      onClick={() => handleTabChange('insights')}
                    >
                      感悟
                    </div>
                  </div>
                  
                  <div className="fs-editor-content">
                    <textarea 
                      className="fs-editor-textarea"
                      placeholder={activeTab === 'content' ? "开始编写笔记内容..." : "写下您的感悟..."}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      onBlur={handleNoteSave}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="fs-note-editor-empty">
                  <div className="fs-note-empty-message">
                    <h3>没有选择笔记</h3>
                    <p>请从左侧列表选择一个笔记或创建新笔记</p>
                    <button 
                      className="fs-notes-create-btn"
                      onClick={handleCreateNote}
                    >
                      创建第一篇笔记
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 设置页面以及其他页面 */}
          {activePage === 'settings' && (
            <div className="fs-settings-container">
              <div className="fs-card fs-settings-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">界面设置</h3>
                </div>
                
                <div className="fs-settings-content">
                  <div className="fs-settings-section">
                    <h4 className="fs-settings-section-title">显示模式</h4>
                    <p className="fs-settings-description">
                      您可以在应用窗口顶部双击调出模式选择菜单，切换应用模式。自动适配模式会根据您的屏幕尺寸自动选择最合适的布局。
                    </p>
                    <div className="fs-settings-options">
                      <div className="fs-settings-option-card">
                        <div className="fs-settings-option-icon">📱</div>
                        <div className="fs-settings-option-label">标准模式</div>
                        <div className="fs-settings-option-info">小屏幕 (&lt; 768px)</div>
                      </div>
                      <div className="fs-settings-option-card">
                        <div className="fs-settings-option-icon">📊</div>
                        <div className="fs-settings-option-label">简约模式</div>
                        <div className="fs-settings-option-info">中屏幕 (768px ~ 1024px)</div>
                      </div>
                      <div className="fs-settings-option-card active">
                        <div className="fs-settings-option-icon">🖥️</div>
                        <div className="fs-settings-option-label">全屏模式</div>
                        <div className="fs-settings-option-info">大屏幕 (&gt; 1024px)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="fs-card fs-settings-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">专注设置</h3>
                </div>
                
                <div className="fs-settings-content">
                  <div className="fs-settings-section">
                    <h4 className="fs-settings-section-title">专注时间</h4>
                    <div className="fs-settings-input-group">
                      <label htmlFor="focus-duration">默认专注时长 (分钟)</label>
                      <input 
                        type="number" 
                        id="focus-duration" 
                        className="fs-settings-input" 
                        min="1" 
                        max="120" 
                        defaultValue="25"
                      />
                    </div>
                    
                    <div className="fs-settings-toggle-group">
                      <label htmlFor="auto-start-breaks">专注结束后自动开始休息</label>
                      <div className="fs-toggle-switch">
                        <input type="checkbox" id="auto-start-breaks" />
                        <span className="fs-toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="fs-settings-input-group">
                      <label htmlFor="break-duration">休息时长 (分钟)</label>
                      <input 
                        type="number" 
                        id="break-duration" 
                        className="fs-settings-input" 
                        min="1" 
                        max="30" 
                        defaultValue="5"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="fs-card fs-settings-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">通知设置</h3>
                </div>
                
                <div className="fs-settings-content">
                  <div className="fs-settings-section">
                    <div className="fs-settings-toggle-group">
                      <label htmlFor="enable-notifications">启用桌面通知</label>
                      <div className="fs-toggle-switch">
                        <input type="checkbox" id="enable-notifications" defaultChecked />
                        <span className="fs-toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="fs-settings-toggle-group">
                      <label htmlFor="sound-notifications">启用声音提醒</label>
                      <div className="fs-toggle-switch">
                        <input type="checkbox" id="sound-notifications" defaultChecked />
                        <span className="fs-toggle-slider"></span>
                      </div>
                    </div>
                    
                    <div className="fs-settings-select-group">
                      <label htmlFor="notification-sound">提醒音效</label>
                      <select id="notification-sound" className="fs-settings-select">
                        <option value="bell">清脆铃声</option>
                        <option value="chime">风铃声</option>
                        <option value="digital">数字提示音</option>
                        <option value="gentle">柔和提示音</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="fs-card fs-settings-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">数据与备份</h3>
                </div>
                
                <div className="fs-settings-content">
                  <div className="fs-settings-section">
                    <div className="fs-settings-button-group">
                      <button className="fs-settings-button">
                        <span className="fs-settings-btn-icon">💾</span>
                        导出数据
                      </button>
                      
                      <button className="fs-settings-button">
                        <span className="fs-settings-btn-icon">📤</span>
                        导入数据
                      </button>
                      
                      <button className="fs-settings-button danger">
                        <span className="fs-settings-btn-icon">🗑️</span>
                        清除所有数据
                      </button>
                    </div>
                    
                    <p className="fs-settings-description">
                      数据存储在您的浏览器本地存储中。导出功能可以帮助您备份数据，以便在需要时恢复。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="fs-card fs-settings-card">
                <div className="fs-card-header">
                  <h3 className="fs-card-title">关于</h3>
                </div>
                
                <div className="fs-settings-content">
                  <div className="fs-settings-about">
                    <div className="fs-app-logo">效率清单</div>
                    <div className="fs-app-version">版本 1.0.0</div>
                    <p className="fs-app-description">
                      一个简洁高效的任务管理和专注工具，帮助您提高工作效率和时间管理能力。
                    </p>
                    <div className="fs-app-links">
                      <a href="#" className="fs-app-link">帮助文档</a>
                      <a href="#" className="fs-app-link">建议反馈</a>
                      <a href="#" className="fs-app-link">隐私政策</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}; 