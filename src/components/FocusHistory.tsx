import React from 'react';
import { useFocusStore } from '../store/focusStore';
import '../styles/focus-history.css';

export const FocusHistory: React.FC = () => {
  const { focusHistory } = useFocusStore();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!focusHistory || focusHistory.length === 0) {
    return (
      <div className="focus-history empty">
        <p>还没有专注记录，开始你的第一次专注吧！</p>
      </div>
    );
  }

  return (
    <div className="focus-history">
      <div className="history-header">
        <h2>专注记录</h2>
      </div>
      <div className="history-list">
        {focusHistory.map((session, index) => (
          <div key={index} className="history-item">
            <div className="history-task">
              <span className="task-name">{session.task || '未命名任务'}</span>
              <span className="task-duration">{Math.round(session.duration / 60000)} 分钟</span>
            </div>
            <div className="history-time">
              {formatDate(session.startTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 