

import React, { useRef, useEffect } from 'react';
import { Task, DayIdentifier, Project } from '../types';
import DayColumn, { hours, HOUR_HEIGHT_REM } from './DayColumn';
import { useAppStore } from '../stores/appStore';

interface CalendarViewProps {
  currentDate: Date;
  tasks: Task[];
  projects: Project[];
  onTaskDrop: (taskId: string, dayId: DayIdentifier, startTime?: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
}

const getWeekDays = (date: Date): Date[] => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day); 
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(dayDate.getDate() + i);
    week.push(dayDate);
  }
  return week;
};

const CurrentTimeIndicator: React.FC<{ scrollRef: React.RefObject<HTMLDivElement> }> = ({ scrollRef }) => {
    const [top, setTop] = React.useState(0);
  
    useEffect(() => {
      const updatePosition = () => {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
  
        const totalMinutes = (now.getTime() - startOfDay.getTime()) / 60000;
        const topPosition = (totalMinutes / (24 * 60)) * (24 * HOUR_HEIGHT_REM * 16); // rem to px
        setTop(topPosition);
      };
  
      updatePosition();
      const interval = setInterval(updatePosition, 60000); // Update every minute
      return () => clearInterval(interval);
    }, []);
  
    // Scroll to current time on initial render
    useEffect(() => {
      const now = new Date();
      if (now.toDateString() === new Date().toDateString()) {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
          const hour = now.getHours();
          const targetScroll = (hour - 1) * HOUR_HEIGHT_REM * 16;
          scrollContainer.scrollTop = targetScroll;
        }
      }
    }, [scrollRef]);

  return (
    <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: `${top}px` }}>
        <div className="w-16 text-right pr-2">
             <div className="text-xs font-semibold text-red-500 -mt-2.5">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
        </div>
        <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shadow-md"></div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
    </div>
  );
};


const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, tasks, projects, onTaskDrop, onTaskClick, onAddTask }) => {
  const settings = useAppStore((state) => state.settings);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  let weekDays = getWeekDays(currentDate);

  if (settings.hideWeekends) {
      weekDays = weekDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
  }
  
  const todayId = new Date().toISOString().split('T')[0];

  const getGridTemplateColumns = () => {
    return weekDays.map(() => 'minmax(180px, 1fr)').join(' ');
  };


  return (
    <div className="flex h-full bg-white dark:bg-neutral-950">
        {settings.showInbox && (
            <div className="w-[250px] flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800">
                <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-center min-h-[65px]">
                    <h3 className="font-semibold text-sm text-neutral-600 dark:text-neutral-400">All-day</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <DayColumn
                        key="inbox"
                        dayId="inbox"
                        tasks={tasks.filter(t => t.status === 'inbox' || !t.startTime)}
                        projects={projects}
                        onTaskDrop={onTaskDrop}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                        isInbox
                    />
                </div>
            </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 flex border-b border-neutral-200 dark:border-neutral-800">
                <div className="w-16 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800"></div>
                <div className="flex-1 grid" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
                     {weekDays.map(day => {
                        const dayId = day.toISOString().split('T')[0];
                        const isToday = todayId === dayId;
                        const headerDateColor = isToday ? 'text-white' : 'text-neutral-500 dark:text-neutral-400';
                        const headerDateBg = isToday ? 'bg-red-500' : 'bg-transparent';

                        return (
                            <div key={dayId} className="p-2 text-center border-l border-neutral-200 dark:border-neutral-800 min-h-[65px]">
                                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">{day.toLocaleString('default', { weekday: 'short' })}</p>
                                <span className={`text-2xl font-bold ${headerDateColor} ${headerDateBg} w-8 h-8 flex items-center justify-center rounded-full mx-auto mt-1`}>
                                    {day.getDate()}
                                </span>
                            </div>
                        );
                     })}
                </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
                <div className="flex">
                    <div className="w-16 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 relative" style={{ height: `${hours.length * HOUR_HEIGHT_REM}rem` }}>
                        {hours.map(hour => (
                            <div key={hour} className="h-full text-right pr-2" style={{ height: `${HOUR_HEIGHT_REM}rem`}}>
                                <span className="text-xs text-neutral-400 dark:text-neutral-500 relative -top-2">{String(hour).padStart(2,'0')}:00</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
                        {weekDays.map(day => {
                            const dayId = day.toISOString().split('T')[0];
                            const dayTasks = tasks.filter(t => t.date && t.date.toISOString().split('T')[0] === dayId);
                            return (
                                <DayColumn
                                    key={dayId}
                                    dayId={dayId}
                                    tasks={dayTasks}
                                    projects={projects}
                                    onTaskDrop={onTaskDrop}
                                    onTaskClick={onTaskClick}
                                    onAddTask={onAddTask}
                                />
                            );
                        })}
                    </div>
                </div>
                {weekDays.some(d => d.toISOString().split('T')[0] === todayId) && <CurrentTimeIndicator scrollRef={scrollRef} />}
            </div>
        </div>
    </div>
  );
};

export default CalendarView;