import React from 'react';
import '../styles/navigationBar.css';

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
}

interface NavigationBarProps {
  items: NavigationItem[];
  currentPage: number;
  onPageChange: (index: number) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  items,
  currentPage,
  onPageChange
}) => {
  return (
    <div className="navigation-bar">
      {items.map((item, index) => (
        <div 
          key={item.id}
          className={`nav-item ${currentPage === index ? 'active' : ''}`}
          onClick={() => onPageChange(index)}
        >
          <div className="nav-icon">{item.icon}</div>
          <div className="nav-title">{item.title}</div>
        </div>
      ))}
    </div>
  );
}; 