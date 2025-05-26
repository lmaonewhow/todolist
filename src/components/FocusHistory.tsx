import React from 'react';
import { useFocusStore } from '../store/focusStore';
import '../styles/focus-history.css';

export const FocusHistory: React.FC = () => {
  const { records, clearRecords } = useFocusStore();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (records.length === 0) {
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
        <button className="clear-btn" onClick={clearRecords}>
          清空记录
        </button>
      </div>
      <div className="history-list">
        {records.map((record) => (
          <div key={record.id} className="history-item">
            <div className="history-task">
              <span className="task-name">{record.task}</span>
              <span className="task-duration">{record.duration} 分钟</span>
            </div>
            <div className="history-time">
              {formatDate(record.completedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 