import React from 'react';
import { StandardMode } from './StandardMode';
import { SimpleMode } from './SimpleMode';
import { useSettingsStore } from '../store/settingsStore';
import '../styles/appLayout.css';

export const AppLayout: React.FC = () => {
  const { uiMode, setUIMode } = useSettingsStore();
  
  // 可以添加一个隐藏的开关，双击顶部区域切换模式
  const handleDoubleClick = (e: React.MouseEvent) => {
    // 只有在头部区域双击才切换模式
    if (e.clientY < 100) {
      setUIMode(uiMode === 'standard' ? 'simple' : 'standard');
      console.log('模式已切换为:', uiMode === 'standard' ? 'simple' : 'standard');
    }
  };
  
  return (
    <div 
      className={`app-layout ${uiMode}-layout`} 
      onDoubleClick={handleDoubleClick}
    >
      {uiMode === 'standard' ? <StandardMode /> : <SimpleMode />}
    </div>
  );
}; 