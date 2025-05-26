import React, { useState, useEffect } from 'react';
import { useFocusStore } from '../store/focusStore';
import { FocusHistory } from './FocusHistory';
import '../styles/focus.css';

export const Focus: React.FC = () => {
  const { startFocus, pauseFocus, resetFocus, completeFocus, status, timeLeft } = useFocusStore();
  const [task, setTask] = useState('');

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 设置计时器来更新focusStore中的timeLeft
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (status === 'running') {
      timer = setInterval(() => {
        if (timeLeft <= 0) {
          completeFocus();
          setTask('');
        }
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [status, timeLeft, completeFocus]);

  // 处理开始专注
  const handleStart = () => {
    if (!task.trim()) {
      alert('请输入专注任务');
      return;
    }
    startFocus(task.trim());
  };

  // 处理暂停/继续
  const handlePause = () => {
    if (status === 'running') {
      pauseFocus();
    } else if (status === 'paused') {
      startFocus(task);
    }
  };

  // 处理重置
  const handleReset = () => {
    resetFocus();
  };

  // 判断是否正在进行专注
  const isActive = status === 'running' || status === 'paused';
  const isPaused = status === 'paused';

  return (
    <div className="focus-page">
      <div className="focus-container">
        <div className="timer-section">
          <div className="timer-display">{formatTime(timeLeft)}</div>
          <input
            type="text"
            className="task-input"
            placeholder="输入专注任务..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            disabled={isActive}
          />
          <div className="timer-controls">
            {!isActive ? (
              <button className="start-btn" onClick={handleStart}>
                开始专注
              </button>
            ) : (
              <>
                <button className="control-btn" onClick={handlePause}>
                  {isPaused ? '继续' : '暂停'}
                </button>
                <button className="control-btn" onClick={handleReset}>
                  重置
                </button>
              </>
            )}
          </div>
        </div>
        <div className="focus-tips">
          <h3>专注提示</h3>
          <ul>
            <li>找一个安静的环境</li>
            <li>把手机调至勿扰模式</li>
            <li>准备一杯温水</li>
            <li>设定明确的目标</li>
          </ul>
        </div>
      </div>
      <FocusHistory />
    </div>
  );
}; 