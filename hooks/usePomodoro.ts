import { useState, useEffect, useCallback, useRef } from 'react';

// --- usePomodoro hook ---

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  notificationsEnabled?: boolean;
}

const DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

export const usePomodoro = ({
  workDuration = DURATIONS.work,
  shortBreakDuration = DURATIONS.shortBreak,
  longBreakDuration = DURATIONS.longBreak,
  notificationsEnabled = false,
}: PomodoroSettings = {}) => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(workDuration * 60);
  const [workCycles, setWorkCycles] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durations = useRef({
    work: workDuration * 60,
    shortBreak: shortBreakDuration * 60,
    longBreak: longBreakDuration * 60,
  });

  const showNotification = useCallback((message: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('DevWeek Pomodoro', {
        body: message,
        icon: '/manifest-icon-192.png', // Assuming this icon exists from manifest
      });
    }
  }, [notificationsEnabled]);

  const changeMode = useCallback((newMode: PomodoroMode, autoStart = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setMode(newMode);
    setTime(durations.current[newMode]);
    setIsActive(autoStart);
  }, []);

  const advanceToNextMode = useCallback(() => {
    if (mode === 'work') {
      const newWorkCycles = workCycles + 1;
      setWorkCycles(newWorkCycles);
      const nextMode = newWorkCycles > 0 && newWorkCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
      showNotification(nextMode === 'longBreak' ? 'Time for a long break!' : 'Time for a short break!');
      changeMode(nextMode, true);
    } else {
      showNotification('Time to get back to work!');
      changeMode('work', true);
    }
  }, [mode, workCycles, showNotification, changeMode]);
  
  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (isActive && time === 0) {
      advanceToNextMode();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, time, advanceToNextMode]);

  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(durations.current[mode]);
  }, [mode]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return { minutes, seconds, isActive, mode, toggleTimer, resetTimer, changeMode };
};


// --- useFocusTrap hook ---

/**
 * A custom hook to trap focus within a designated container element when it's open.
 * Returns a ref to be attached to the container element.
 * @param isOpen - A boolean indicating whether the container (e.g., a modal) is open.
 */
export const useFocusTrap = (isOpen: boolean) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastFocusedElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Save the last focused element when the modal opens
            lastFocusedElement.current = document.activeElement as HTMLElement;

            const container = containerRef.current;
            if (!container) return;

            // Find all focusable elements within the container
            const focusableElements = container.querySelectorAll<HTMLElement>(
                'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                // Focus the first focusable element
                focusableElements[0].focus();
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    if (focusableElements.length === 0) {
                        e.preventDefault();
                        return;
                    }
                    
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                // Restore focus to the last focused element when the modal closes
                lastFocusedElement.current?.focus();
            };

        }
    }, [isOpen]);

    return containerRef;
};