import React, { useState, useRef, useEffect } from 'react';
import { TodoList } from './TodoList';
import { PageIndicator } from './PageIndicator';
import { Settings } from './Settings';
import '../styles/appLayout.css';

// 暂时使用空组件作为占位符
const Statistics = () => <div className="placeholder-page">统计页面</div>;
const Focus = () => <div className="placeholder-page">专注页面</div>;
const Notes = () => <div className="placeholder-page">笔记页面</div>;

const PAGES = [
  { id: 'todos', title: '任务', component: TodoList },
  { id: 'stats', title: '统计', component: Statistics },
  { id: 'focus', title: '专注', component: Focus },
  { id: 'notes', title: '笔记', component: Notes },
  { id: 'settings', title: '设置', component: Settings },
];

export const SimpleMode: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  
  // 当页面变化时更新transform
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${-currentPage * 20}%)`;
    }
  }, [currentPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = startXRef.current - endX;

    if (diffX > 50 && currentPage < PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (diffX < -50 && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止拖动过程中选中文本
    startXRef.current = e.clientX;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      if (containerRef.current) {
        // 计算移动距离（百分比）
        const moveDistance = (moveEvent.clientX - startXRef.current) / window.innerWidth * 100;
        // 限制拖动范围
        const newOffset = Math.max(
          Math.min(-currentPage * 20 + moveDistance * 0.2, 0), 
          -((PAGES.length - 1) * 20)
        );
        
        containerRef.current.style.transform = `translateX(${newOffset}%)`;
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      const diffX = startXRef.current - upEvent.clientX;
      
      if (diffX > 50 && currentPage < PAGES.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (diffX < -50 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        // 恢复原位置
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(${-currentPage * 20}%)`;
        }
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 计算相邻页面标题
  const prevPage = currentPage > 0 ? PAGES[currentPage - 1].title : '';
  const nextPage = currentPage < PAGES.length - 1 ? PAGES[currentPage + 1].title : '';

  return (
    <div className="simple-mode">
      <div className="page-header">
        {prevPage && <div className="adjacent-page prev">{prevPage}</div>}
        <div className="current-page">{PAGES[currentPage].title}</div>
        {nextPage && <div className="adjacent-page next">{nextPage}</div>}
      </div>
      
      <div 
        ref={containerRef}
        className="page-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {PAGES.map((page) => (
          <div key={page.id} className="page">
            <page.component />
          </div>
        ))}
      </div>
      
      <PageIndicator 
        totalPages={PAGES.length} 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}; 