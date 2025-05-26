import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FocusSession {
  task: string;
  startTime: number; // 会话开始的时间戳
  duration: number; // 持续时间（毫秒）
  completed: boolean; // 会话是否已完成
}

type FocusStatus = 'idle' | 'running' | 'paused' | 'completed';

interface FocusStore {
  // 专注会话历史记录
  focusHistory: FocusSession[];
  
  // 当前会话状态
  currentSession: FocusSession | null;
  status: FocusStatus;
  timeLeft: number; // 剩余时间（秒）
  
  // 专注设置
  focusDuration: number; // 默认专注时长（秒）
  
  // 方法
  startFocus: (task: string) => void;
  pauseFocus: () => void;
  resetFocus: () => void;
  completeFocus: () => void;
  
  // 添加历史记录
  addFocusHistory: (session: FocusSession) => void;
  
  // 更新计时器
  updateTimeLeft: () => void;
}

const FOCUS_DURATION = 25 * 60; // 25分钟，单位：秒

// 存储全局计时器ID
let timerId: number | null = null;

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      focusHistory: [],
      currentSession: null,
      status: 'idle',
      timeLeft: FOCUS_DURATION,
      focusDuration: FOCUS_DURATION,
      
      startFocus: (task) => {
        const { status, currentSession } = get();
        
        if (status === 'paused' && currentSession) {
          // 如果是暂停状态，继续当前会话
          set({ 
            status: 'running',
          });
          
          // 启动计时器
          if (timerId === null) {
            timerId = window.setInterval(() => {
              get().updateTimeLeft();
            }, 1000);
          }
          
          return;
        }
        
        // 开始新会话
        const newSession: FocusSession = {
          task,
          startTime: Date.now(),
          duration: 0,
          completed: false,
        };
        
        set({ 
          currentSession: newSession,
          status: 'running',
          timeLeft: get().focusDuration,
        });
        
        // 启动计时器
        if (timerId === null) {
          timerId = window.setInterval(() => {
            get().updateTimeLeft();
          }, 1000);
        }
      },
      
      pauseFocus: () => {
        // 只有在运行状态才能暂停
        if (get().status !== 'running') return;
        
        set({ status: 'paused' });
        
        // 暂停时清除计时器
        if (timerId !== null) {
          window.clearInterval(timerId);
          timerId = null;
        }
        
        // 暂停时更新当前会话的持续时间
        const { currentSession, focusDuration, timeLeft } = get();
        if (currentSession) {
          const duration = (focusDuration - timeLeft) * 1000; // 转换为毫秒
          set({
            currentSession: {
              ...currentSession,
              duration: currentSession.duration + duration,
            }
          });
        }
      },
      
      resetFocus: () => {
        // 清除计时器
        if (timerId !== null) {
          window.clearInterval(timerId);
          timerId = null;
        }
        
        set({
          status: 'idle',
          timeLeft: get().focusDuration,
          currentSession: null,
        });
      },
      
      completeFocus: () => {
        // 清除计时器
        if (timerId !== null) {
          window.clearInterval(timerId);
          timerId = null;
        }
        
        const { currentSession } = get();
        if (!currentSession) return;
        
        // 标记当前会话为已完成
        const completedSession: FocusSession = {
          ...currentSession,
          completed: true,
          duration: currentSession.duration + (get().focusDuration - get().timeLeft) * 1000, // 添加最后一段时间
        };
        
        // 添加到历史记录
        get().addFocusHistory(completedSession);
        
        // 重置状态
        set({
          status: 'completed',
          currentSession: null,
          timeLeft: get().focusDuration,
        });
      },
      
      addFocusHistory: (session) => set((state) => ({
        focusHistory: [session, ...state.focusHistory],
      })),
      
      updateTimeLeft: () => {
        const { timeLeft, status } = get();
        
        if (status === 'running' && timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        } else if (status === 'running' && timeLeft <= 0) {
          // 时间到，自动完成
          get().completeFocus();
        }
      },
    }),
    {
      name: 'focus-storage',
    }
  )
); 