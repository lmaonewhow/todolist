import React, { useState } from 'react';
import { TodoList } from './TodoList';
import { NavigationBar } from './NavigationBar';
import { Settings } from './Settings';
import { Notes } from './Notes';
import { Focus } from './Focus';
import { Statistics } from './Statistics';
import '../styles/appLayout.css';

const PAGES = [
  { id: 'todos', title: '任务', icon: '📝', component: TodoList },
  { id: 'stats', title: '统计', icon: '📊', component: Statistics },
  { id: 'focus', title: '专注', icon: '⏱️', component: Focus },
  { id: 'notes', title: '笔记', icon: '📒', component: Notes },
  { id: 'settings', title: '设置', icon: '⚙️', component: Settings },
];

export const StandardMode: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const CurrentPageComponent = PAGES[currentPage].component;

  return (
    <div className="standard-mode">
      <div className="content-area">
        <CurrentPageComponent />
      </div>
      <NavigationBar
        items={PAGES}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
