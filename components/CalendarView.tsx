

import React, { useContext, useState, useEffect } from 'react';
import { Task, DayIdentifier, Project } from '../types';
import DayColumn, { hours, HOUR_HEIGHT_REM } from './DayColumn';
import { SettingsContext } from '../contexts/SettingsContext';

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

const CurrentTimeIndicator = () => {
  const [top, setTop] = useState('0px');

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const percentage = totalMinutes / (24 * 60);
      const totalHeight = 24 * HOUR_HEIGHT_REM; 
      // The 110px is an estimate for the header height. A more robust solution might use a ref.
      const offset = 110; 
      setTop(`${percentage * totalHeight * 16 + offset}px`); // rem to px
    };

    updatePosition();
    const timer = setInterval(updatePosition, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top }}>
        <div className="w-16 text-right pr-2">
             <div className="text-xs font-semibold text-red-500 -mt-2.5">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
        </div>
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1"></div>
        <div className="flex-1 h-0.5 bg-red-500"></div>
    </div>
  );
};


const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, tasks, projects, onTaskDrop, onTaskClick, onAddTask }) => {
  const { settings } = useContext(SettingsContext);
  
  let weekDays = getWeekDays(currentDate);

  if (settings.hideWeekends) {
      weekDays = weekDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
  }

  const getGridTemplateColumns = () => {
    let columns = weekDays.map(() => 'minmax(180px, 1fr)');
    if (settings.showInbox) {
      columns.unshift('minmax(250px, 0.75fr)');
    }
    return columns.join(' ');
  };


  return (
    <div className="relative overflow-x-auto h-full flex">
        {settings.showInbox && (
            <div className="flex-shrink-0 w-[250px]">
                <DayColumn
                    key="inbox"
                    dayId="inbox"
                    title="All-day"
                    tasks={tasks.filter(t => t.status === 'inbox')}
                    projects={projects}
                    onTaskDrop={onTaskDrop}
                    onTaskClick={onTaskClick}
                    onAddTask={onAddTask}
                    isInbox
                />
            </div>
        )}
        <div className="flex-shrink-0 w-16 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="h-[110px] border-b border-gray-200 dark:border-gray-800"></div>
            <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT_REM}rem` }}>
                {hours.map(hour => (
                  <div key={hour} className="h-full" style={{ height: `${HOUR_HEIGHT_REM}rem`}}>
                    <span className="text-xs text-gray-400 dark:text-gray-600 -mt-2.5 ml-1 absolute">{String(hour).padStart(2,'0')}:00</span>
                  </div>
                ))}
            </div>
        </div>
        <div className="flex-1 overflow-x-auto">
            <div className="grid min-h-full" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
                {weekDays.map(day => {
                    const dayId = day.toISOString().split('T')[0];
                    const dayTasks = tasks.filter(t => t.date && t.date.toISOString().split('T')[0] === dayId);
                    return (
                        <DayColumn
                            key={dayId}
                            dayId={dayId}
                            title={day.toLocaleString('default', { weekday: 'short' })}
                            date={day.getDate()}
                            isToday={new Date().toISOString().split('T')[0] === dayId}
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
        <CurrentTimeIndicator />
    </div>
  );
};

export default CalendarView;