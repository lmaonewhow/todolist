import React, { useState, useEffect } from 'react';
import { StandardMode } from './StandardMode';
import { SimpleMode } from './SimpleMode';
import { FullscreenMode } from './FullscreenMode';
import { useSettingsStore } from '../store/settingsStore';
import '../styles/appLayout.css';

// 定义屏幕尺寸断点
const SCREEN_BREAKPOINTS = {
  SMALL: 768, // 小于这个值使用标准模式
  MEDIUM: 1024, // 小于这个值但大于SMALL使用简约模式
  // 大于MEDIUM使用全屏模式
};

export const AppLayout: React.FC = () => {
  const { uiMode, setUIMode, activeLayout, setActiveLayout } = useSettingsStore();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 检测当前是否处于全屏状态
  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('MSFullscreenChange', updateFullscreenState);

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
      document.removeEventListener('mozfullscreenchange', updateFullscreenState);
      document.removeEventListener('MSFullscreenChange', updateFullscreenState);
    };
  }, []);
  
  // 根据屏幕尺寸自动设置合适的布局模式
  useEffect(() => {
    const updateLayoutBasedOnScreenSize = () => {
      // 只有当用户选择了"auto"模式时才自动调整
      if (uiMode === 'auto') {
        const width = window.innerWidth;
        let newLayout: 'standard' | 'simple' | 'fullscreen' = 'standard';
        
        if (width < SCREEN_BREAKPOINTS.SMALL) {
          newLayout = 'standard';
        } else if (width < SCREEN_BREAKPOINTS.MEDIUM) {
          newLayout = 'simple';
        } else {
          newLayout = 'fullscreen';
        }
        
        setActiveLayout(newLayout);
        console.log(`自动适配模式: 屏幕宽度 ${width}px, 应用${newLayout}布局`);
      } else {
        // 如果不是auto模式，activeLayout应该等于uiMode
        setActiveLayout(uiMode as Exclude<typeof uiMode, 'auto'>);
      }
    };

    // 初始化时执行一次
    updateLayoutBasedOnScreenSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateLayoutBasedOnScreenSize);
    
    // 组件卸载时清除监听
    return () => {
      window.removeEventListener('resize', updateLayoutBasedOnScreenSize);
    };
  }, [uiMode, setActiveLayout]);

  // 切换浏览器全屏状态
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // 请求进入全屏模式
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if ((docEl as any).webkitRequestFullscreen) {
          await (docEl as any).webkitRequestFullscreen();
        } else if ((docEl as any).mozRequestFullScreen) {
          await (docEl as any).mozRequestFullScreen();
        } else if ((docEl as any).msRequestFullscreen) {
          await (docEl as any).msRequestFullscreen();
        }
      } else {
        // 退出全屏模式
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('全屏模式切换失败:', error);
    }
  };
  
  // 可以添加一个隐藏的开关，双击顶部区域切换模式
  const handleDoubleClick = (e: React.MouseEvent) => {
    // 只有在头部区域双击才显示切换模式选择器
    if (e.clientY < 100) {
      setShowModeSelector(true);
    }
  };
  
  // 切换界面模式
  const switchMode = async (mode: 'standard' | 'simple' | 'fullscreen' | 'auto') => {
    setUIMode(mode);
    setShowModeSelector(false);
    
    // 如果选择了特定模式而不是auto，直接设置activeLayout
    if (mode !== 'auto') {
      setActiveLayout(mode as Exclude<typeof mode, 'auto'>);
      
      // 如果切换到全屏模式，请求浏览器全屏
      if (mode === 'fullscreen' && !isFullscreen) {
        await toggleFullscreen();
      } 
      // 如果从全屏模式切换到其他模式，退出浏览器全屏
      else if (mode !== 'fullscreen' && isFullscreen) {
        await toggleFullscreen();
      }
    }
    
    console.log('模式已切换为:', mode);
  };
  
  // 渲染当前模式的组件
  const renderCurrentMode = () => {
    // 根据activeLayout渲染对应组件，而不是直接使用uiMode
    switch (activeLayout) {
      case 'standard':
        return <StandardMode />;
      case 'simple':
        return <SimpleMode />;
      case 'fullscreen':
        return <FullscreenMode />;
      default:
        return <StandardMode />;
    }
  };
  
  return (
    <div 
      className={`app-layout ${activeLayout}-layout`}
      onDoubleClick={handleDoubleClick}
    >
      {renderCurrentMode()}
      
      {/* 模式选择器浮层 */}
      {showModeSelector && (
        <div className="mode-selector-overlay" onClick={() => setShowModeSelector(false)}>
          <div className="mode-selector" onClick={e => e.stopPropagation()}>
            <h3>选择界面模式</h3>
            <div className="mode-options">
              <div 
                className={`mode-option ${uiMode === 'auto' ? 'active' : ''}`}
                onClick={() => switchMode('auto')}
              >
                <span className="mode-icon">🔄</span>
                <span className="mode-name">自动适配模式</span>
                <span className="mode-badge">推荐</span>
              </div>
              <div 
                className={`mode-option ${uiMode === 'standard' ? 'active' : ''}`}
                onClick={() => switchMode('standard')}
              >
                <span className="mode-icon">📱</span>
                <span className="mode-name">标准模式</span>
              </div>
              <div 
                className={`mode-option ${uiMode === 'simple' ? 'active' : ''}`}
                onClick={() => switchMode('simple')}
              >
                <span className="mode-icon">📊</span>
                <span className="mode-name">简约模式</span>
              </div>
              <div 
                className={`mode-option ${uiMode === 'fullscreen' ? 'active' : ''}`}
                onClick={() => switchMode('fullscreen')}
              >
                <span className="mode-icon">🖥️</span>
                <span className="mode-name">全屏模式</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 