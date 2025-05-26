import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import '../styles/settings.css';

export const Settings: React.FC = () => {
  const { uiMode, setUIMode } = useSettingsStore();

  return (
    <div className="settings-container">
      <h2>设置</h2>
      
      <div className="settings-section">
        <h3>界面模式</h3>
        <div className="setting-item">
          <div className="setting-label">界面模式选择</div>
          <div className="mode-selector">
            <div 
              className={`mode-option ${uiMode === 'standard' ? 'active' : ''}`}
              onClick={() => setUIMode('standard')}
            >
              <div className="mode-icon">📱</div>
              <div className="mode-name">标准模式</div>
              <div className="mode-description">底部导航栏，点击切换页面</div>
            </div>
            
            <div 
              className={`mode-option ${uiMode === 'simple' ? 'active' : ''}`}
              onClick={() => setUIMode('simple')}
            >
              <div className="mode-icon">✨</div>
              <div className="mode-name">简洁模式</div>
              <div className="mode-description">滑动切换页面，底部圆点导航</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>关于</h3>
        <div className="setting-item">
          <div className="setting-label">版本</div>
          <div className="setting-value">1.0.0</div>
        </div>
      </div>
    </div>
  );
}; 