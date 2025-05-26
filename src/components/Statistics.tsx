import React, { useMemo } from 'react';
import { useFocusStore } from '../store/focusStore';
import { useTodoStore } from '../store/todoStore';
import '../styles/statistics.css';

export const Statistics: React.FC = () => {
  const { records } = useFocusStore();
  const { todos } = useTodoStore();

  // 计算专注统计数据
  const focusStats = useMemo(() => {
    const totalMinutes = records.reduce((sum, record) => sum + record.duration, 0);
    const totalSessions = records.length;
    
    // 按日期分组统计
    const dailyStats = records.reduce((acc, record) => {
      const date = new Date(record.completedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          minutes: 0,
          sessions: 0,
        };
      }
      acc[date].minutes += record.duration;
      acc[date].sessions += 1;
      return acc;
    }, {} as Record<string, { minutes: number; sessions: number }>);

    // 获取最近7天的数据
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString();
    }).reverse();

    const weeklyData = last7Days.map(date => ({
      date,
      minutes: dailyStats[date]?.minutes || 0,
      sessions: dailyStats[date]?.sessions || 0,
    }));

    return {
      totalMinutes,
      totalSessions,
      weeklyData,
    };
  }, [records]);

  // 计算任务统计数据
  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
    };
  }, [todos]);

  // 渲染柱状图
  const renderBarChart = () => {
    const maxMinutes = Math.max(...focusStats.weeklyData.map(d => d.minutes));
    
    return (
      <div className="bar-chart">
        {focusStats.weeklyData.map((day, index) => (
          <div key={index} className="bar-column">
            <div className="bar-wrapper">
              <div 
                className="bar"
                style={{
                  height: maxMinutes > 0 ? `${(day.minutes / maxMinutes) * 100}%` : '0%'
                }}
              >
                <span className="bar-value">{day.minutes}分钟</span>
              </div>
            </div>
            <div className="bar-label">
              {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="statistics-page">
      <div className="stats-container">
        <div className="stats-section focus-stats">
          <h2>专注统计</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <div className="stats-value">{focusStats.totalSessions}</div>
              <div className="stats-label">专注次数</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">{focusStats.totalMinutes}</div>
              <div className="stats-label">总专注时间(分钟)</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">
                {focusStats.totalSessions > 0 
                  ? Math.round(focusStats.totalMinutes / focusStats.totalSessions) 
                  : 0}
              </div>
              <div className="stats-label">平均时长(分钟)</div>
            </div>
          </div>
          <div className="chart-section">
            <h3>近7天专注时间</h3>
            {renderBarChart()}
          </div>
        </div>

        <div className="stats-section todo-stats">
          <h2>任务统计</h2>
          <div className="stats-cards">
            <div className="stats-card">
              <div className="stats-value">{todoStats.total}</div>
              <div className="stats-label">总任务数</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">{todoStats.completed}</div>
              <div className="stats-label">已完成</div>
            </div>
            <div className="stats-card">
              <div className="stats-value">{todoStats.completionRate}%</div>
              <div className="stats-label">完成率</div>
            </div>
          </div>
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${todoStats.completionRate}%` }}
              />
            </div>
            <div className="progress-labels">
              <span>待完成: {todoStats.pending}</span>
              <span>已完成: {todoStats.completed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 