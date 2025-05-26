import React, { useEffect, useState, useRef } from 'react';
import { useTodoStore } from '../store/todoStore';
import '../styles/todo.css';

// 测试数据，当API加载失败时使用
const TEST_TODOS = [
  { id: '1', content: '测试任务 1', completed: false, createdAt: Date.now() },
  { id: '2', content: '测试任务 2', completed: true, createdAt: Date.now() - 86400000, completedAt: Date.now() - 3600000 },
  { id: '3', content: '测试任务 3', completed: true, createdAt: Date.now() - 172800000, completedAt: Date.now() - 90000000 },
];

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

// 修改为命名导出
export const TodoList: React.FC = () => {
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [useTestData, setUseTestData] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: 待办任务, 1: 已完成任务
  const slideRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const { todos, addTodo, toggleTodo, deleteTodo, loadTodos, isLoading } = useTodoStore();

  // 组件挂载时执行
  useEffect(() => {
    console.log('TodoList组件已挂载');
    console.log('Window API:', !!window.electronAPI);

    const initApp = async () => {
      try {
        console.log('尝试加载数据...');
        await loadTodos();
        console.log('Todos loaded:', todos);
      } catch (err) {
        console.error('Failed to load todos:', err);
        setError((err as Error).message);
        setUseTestData(true); // 使用测试数据
      }
    };

    initApp();
  }, [loadTodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        await addTodo(newTodo.trim());
        setNewTodo('');
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteTodo(id);
    } catch (err) {
      console.error('删除失败:', err);
      setError((err as Error).message);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, todo: { id: string, content: string }) => {
    e.preventDefault();
    try {
      window.electronAPI.showContextMenu([
        { label: todo.content, enabled: false },
        { label: '分隔线', type: 'separator' },
        { label: '删除', click: () => handleDelete(todo.id) }
      ]);
    } catch (err) {
      console.error('上下文菜单错误:', err);
    }
  };

  // 处理滑动开始
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  // 处理滑动结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startXRef.current - endX;

    // 向左滑动 (正数差值)
    if (diffX > 50 && activeTab === 0) {
      setActiveTab(1);
    }
    // 向右滑动 (负数差值)
    else if (diffX < -50 && activeTab === 1) {
      setActiveTab(0);
    }
  };

  // 处理鼠标滑动（桌面端）
  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 计算当前偏移量
      if (slideRef.current) {
        const offset = Math.max(Math.min(0, startXRef.current - moveEvent.clientX), -300);
        slideRef.current.style.transform = `translateX(${offset}px)`;
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const diffX = startXRef.current - upEvent.clientX;

      // 向左滑动 (正数差值)
      if (diffX > 50 && activeTab === 0) {
        setActiveTab(1);
      }
      // 向右滑动 (负数差值)
      else if (diffX < -50 && activeTab === 1) {
        setActiveTab(0);
      } else {
        // 恢复原位
        if (slideRef.current) {
          slideRef.current.style.transform = activeTab === 0 ? 'translateX(0)' : 'translateX(-300px)';
        }
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 切换到对应标签页
  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  // 渲染的todos数据
  const allTodos = useTestData ? TEST_TODOS : todos;

  // 根据完成状态过滤任务
  const currentTodos = allTodos.filter(todo => !todo.completed);
  const completedTodos = allTodos.filter(todo => todo.completed);

  // 对完成的任务按日期分组
  const completedGroups = groupCompletedTodos(completedTodos);

  // 获取已完成数量
  const completedCount = allTodos.filter(t => t.completed).length;

  return (
    <div className="app">
      <div className="title-bar">
        <div className="tabs">
          <div
            className={`tab ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => handleTabClick(0)}
          >
            待办任务
          </div>
          <div
            className={`tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => handleTabClick(1)}
          >
            已完成 ({completedCount})
          </div>
        </div>
      </div>

      <div
        className="sliding-container"
        ref={slideRef}
        style={{ transform: activeTab === 0 ? 'translateX(0)' : 'translateX(-300px)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* 当前任务页 */}
        <div className="todo-container">
          {error && (
            <div className="error-message">
              出错了：{error}
            </div>
          )}

          <form className="add-todo" onSubmit={handleSubmit}>
            <input
              type="text"
              className="add-todo-input"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="添加新任务..."
            />
            <button type="submit" className="add-todo-button">添加</button>
          </form>

          <div className="todo-list">
            {isLoading && !useTestData ? (
              <div className="todo-loading">加载中...</div>
            ) : currentTodos.length === 0 ? (
              <div className="todo-empty">
                <p>暂无待办任务</p>
                <button
                  className="add-todo-button"
                  onClick={() => addTodo('示例任务')}
                >
                  添加示例任务
                </button>
              </div>
            ) : (
              currentTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                  onContextMenu={(e) => handleContextMenu(e, todo)}
                >
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className="todo-content">{todo.content}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 已完成任务页 */}
        <div className="todo-container">
          {/*<h3 className="completed-title">已完成任务</h3>*/}

          <div className="todo-list">
            {completedTodos.length === 0 ? (
              <div className="todo-empty">
                <p>暂无已完成任务</p>
              </div>
            ) : (
              <>
                {completedGroups.map((group) => (
                  <div key={group.dateStr} className="todo-group">
                    <div className="date-divider">
                      <span className="date-label">{group.label}</span>
                    </div>
                    {group.todos.map(todo => (
                      <div
                        key={todo.id}
                        className="todo-item completed"
                        onContextMenu={(e) => handleContextMenu(e, todo)}
                      >
                        <input
                          type="checkbox"
                          className="todo-checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                        />
                        <span className="todo-content">{todo.content}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="todo-stats">
        共 {allTodos.length} 项任务，已完成 {completedCount} 项
      </div>
    </div>
  );
};

// 保持默认导出以兼容可能的其他导入方式
export default TodoList;
