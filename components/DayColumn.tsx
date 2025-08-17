

import React, { useState, useRef } from 'react';
import { Task, DayIdentifier, Project } from '../types';
import TaskCard from './TaskCard';

interface DayColumnProps {
  dayId: DayIdentifier;
  tasks: Task[];
  projects: Project[];
  onTaskDrop: (taskId: string, dayId: DayIdentifier, startTime?: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask?: (task: Omit<Task, 'id' | 'status'>) => void;
  isInbox?: boolean;
  title?: string;
  date?: number;
  isToday?: boolean;
}

export const HOUR_HEIGHT_REM = 3.5; // 14 * 4 = 56px per hour
export const hours = Array.from({ length: 24 }, (_, i) => i);

const DayColumn: React.FC<DayColumnProps> = ({ dayId, tasks, projects, onTaskDrop, onTaskClick, onAddTask, isInbox, title, date, isToday }) => {
  const [isOver, setIsOver] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const calculateTaskPosition = (task: Task) => {
    if (!task.startTime || typeof task.estimatedHours !== 'number' || isInbox) return null;

    const [hour, minute] = task.startTime.split(':').map(Number);
    const startInHours = hour + minute / 60;
    
    const top = startInHours * HOUR_HEIGHT_REM;
    const height = task.estimatedHours * HOUR_HEIGHT_REM;

    return { top: `${top}rem`, height: `${height}rem` };
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const timeline = timelineRef.current;

    if (!isInbox && timeline) {
        const timelineRect = timeline.getBoundingClientRect();
        
        if (e.clientY >= timelineRect.top && e.clientY <= timelineRect.bottom) {
            const relativeY = e.clientY - timelineRect.top;
            const totalHeight = timelineRect.height;
            
            if (totalHeight > 0) {
                const totalMinutesInDay = 24 * 60;
                const droppedMinuteOfDay = (relativeY / totalHeight) * totalMinutesInDay;
                const snappedMinute = Math.round(droppedMinuteOfDay / 15) * 15;
                const minuteOfDay = Math.max(0, Math.min(totalMinutesInDay - 1, snappedMinute));
                
                const h = Math.floor(minuteOfDay / 60);
                const m = minuteOfDay % 60;
                
                const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                onTaskDrop(taskId, dayId, startTime);
                return;
            }
        }
    }
    
    onTaskDrop(taskId, dayId, '');
  };
  
  const untimedTasks = tasks.filter(t => !t.startTime || isInbox);
  const timedTasks = tasks.filter(t => t.startTime && !isInbox);

  const header = title ? (
    <div className="p-3 border-b border-slate-200 dark:border-neutral-800 sticky top-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center">
            <h3 className={`font-semibold uppercase text-sm tracking-wider ${isToday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{title}</h3>
            {date && (
                <span className={`font-bold text-lg ${isToday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'} w-8 h-8 flex items-center justify-center rounded-full`}>
                    {date}
                </span>
            )}
        </div>
    </div>
  ) : null;

  return (
    <div 
      className={`flex flex-col border-l border-neutral-200 dark:border-neutral-800 transition-colors ${isOver ? 'bg-neutral-500/5' : ''}`}
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
    >
        {header}
        {isInbox ? (
          <div className="p-2 space-y-2">
            {untimedTasks.map(task => <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} />)}
          </div>
        ) : (
          <>
            <div className="p-2 space-y-2 border-b border-neutral-200 dark:border-neutral-800 min-h-[50px]">
                {untimedTasks.map(task => <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} />)}
            </div>
            <div 
              ref={timelineRef}
              className="relative"
              style={{ height: `${hours.length * HOUR_HEIGHT_REM}rem` }}
            >
              <div className="absolute inset-0 grid grid-cols-1" style={{gridTemplateRows: `repeat(${hours.length}, ${HOUR_HEIGHT_REM}rem)`}}>
                {hours.map(hour => (
                  <div key={hour} className="h-full border-b border-neutral-200/70 dark:border-neutral-800/70"></div>
                ))}
              </div>
              <div className="relative p-2">
                {timedTasks.map(task => {
                  const position = calculateTaskPosition(task);
                  if (!position) return null;
                  return <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} style={position} isTimed />;
                })}
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default DayColumn;