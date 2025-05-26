import React from 'react';
import { useSettingsStore } from '../store/settingsStore';
import '../styles/settings.css';

export const Settings: React.FC = () => {
  const { uiMode, setUIMode } = useSettingsStore();

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h3>界面模式</h3>
        <div className="setting-item">
          <div className="setting-label">选择您喜欢的界面风格</div>
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
        <h3>主题设置</h3>
        <div className="setting-item">
          <div className="setting-label">应用主题</div>
          <div className="theme-selector">
            <div className="theme-option active">
              <div className="theme-color" style={{backgroundColor: '#3498db'}}></div>
              <div className="theme-name">默认蓝</div>
            </div>
            <div className="theme-option">
              <div className="theme-color" style={{backgroundColor: '#2ecc71'}}></div>
              <div className="theme-name">清新绿</div>
            </div>
            <div className="theme-option">
              <div className="theme-color" style={{backgroundColor: '#9b59b6'}}></div>
              <div className="theme-name">优雅紫</div>
            </div>
            <div className="theme-option">
              <div className="theme-color" style={{backgroundColor: '#e74c3c'}}></div>
              <div className="theme-name">活力红</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>关于</h3>
        <div className="setting-item about-item">
          <div className="app-logo">📝</div>
          <div className="app-title">Todo清单</div>
          <div className="app-version">版本 1.0.0</div>
          <div className="app-copyright">© 2023 Todo清单团队</div>
        </div>
      </div>
    </div>
  );
}; 