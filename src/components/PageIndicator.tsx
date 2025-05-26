import React from 'react';
import '../styles/pageIndicator.css';

interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({ 
  totalPages, 
  currentPage, 
  onPageChange 
}) => {
  return (
    <div className="page-indicator">
      {Array.from({ length: totalPages }).map((_, index) => (
        <div 
          key={index}
          className={`indicator-dot ${currentPage === index ? 'active' : ''}`}
          onClick={() => onPageChange(index)}
        />
      ))}
    </div>
  );
}; 