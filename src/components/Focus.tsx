import React, { useState, useEffect } from 'react';
import { useFocusStore } from '../store/focusStore';
import { FocusHistory } from './FocusHistory';
import '../styles/focus.css';

export const Focus: React.FC = () => {
  const { addFocusRecord } = useFocusStore();
  const [task, setTask] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!task.trim()) {
      alert('请输入专注任务');
      return;
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(25 * 60);
  };

  const handleComplete = () => {
    if (task.trim()) {
      addFocusRecord({
        task: task.trim(),
        duration: 25,
        completedAt: new Date().toISOString(),
      });
    }
    setIsActive(false);
    setTask('');
    setTimeLeft(25 * 60);
  };

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