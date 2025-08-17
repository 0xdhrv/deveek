

import React, { useState, useRef } from 'react';
import { Task, DayIdentifier, Project } from '../types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface DayColumnProps {
  dayId: DayIdentifier;
  title: string;
  date?: number;
  isToday?: boolean;
  tasks: Task[];
  projects: Project[];
  onTaskDrop: (taskId: string, dayId: DayIdentifier, startTime?: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
  isInbox?: boolean;
}

export const HOUR_HEIGHT_REM = 3.5; // 14 * 4 = 56px per hour
export const hours = Array.from({ length: 24 }, (_, i) => i);

const DayColumn: React.FC<DayColumnProps> = ({ dayId, title, date, isToday, tasks, projects, onTaskDrop, onTaskClick, onAddTask, isInbox }) => {
  const [isOver, setIsOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState<string>('');
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

  const handleConfirmAddTask = () => {
    if (newTitle.trim()) {
      onAddTask({
        title: newTitle.trim(),
        description: "",
        date: isInbox ? null : new Date(dayId),
        startTime: isInbox ? undefined : '09:00',
        estimatedHours: 1,
        priority: 'medium',
        tags: [],
        projectId: newProjectId || undefined,
      });
      setIsAdding(false);
      setNewTitle('');
      setNewProjectId('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleConfirmAddTask();
    }
    if (e.key === 'Escape') {
        setIsAdding(false);
        setNewTitle('');
    }
  };
  
  const untimedTasks = tasks.filter(t => !t.startTime || isInbox);
  const timedTasks = tasks.filter(t => t.startTime && !isInbox);

  const headerDateColor = isToday ? 'text-white' : 'text-gray-400';
  const headerDateBg = isToday ? 'bg-red-500' : 'bg-transparent';

  return (
    <div 
      className={`flex flex-col border-l border-gray-200 dark:border-gray-800 transition-colors ${isOver ? 'bg-gray-500/5' : ''}`}
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 min-h-[110px]">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h3 className={`font-semibold text-xs tracking-wider text-gray-500 dark:text-gray-400`}>{title.toUpperCase()}</h3>
          {date && (
            <span className={`font-semibold text-2xl ${headerDateColor} ${headerDateBg} w-8 h-8 flex items-center justify-center rounded-full`}>
              {date}
            </span>
          )}
        </div>
        {isAdding ? (
            <div className="flex flex-col gap-2">
                <textarea
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="New task title..."
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:border-transparent resize-none"
                    rows={2} autoFocus
                />
                 <select 
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:border-transparent"
                >
                    <option value="">No Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setIsAdding(false)} className="px-2 py-1 text-xs rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={handleConfirmAddTask} className="px-2 py-1 text-xs text-white bg-gray-800 dark:text-gray-950 dark:bg-gray-200 rounded-md hover:bg-gray-700 dark:hover:bg-gray-300">Add</button>
                </div>
            </div>
        ) : (
            isInbox && <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 p-1.5 text-xs text-gray-500 dark:text-gray-400 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
                <Plus className="w-4 h-4" /> Add Task
            </button>
        )}
      </div>

      <div className="flex-1 relative column-content overflow-y-auto bg-white dark:bg-gray-950">
        {isInbox ? (
          <div className="p-2 space-y-2">
            {untimedTasks.map(task => <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} />)}
          </div>
        ) : (
          <>
            <div className="p-2 space-y-2 border-b border-gray-200 dark:border-gray-800 min-h-[50px]">
                {untimedTasks.map(task => <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} />)}
            </div>
            <div 
              ref={timelineRef}
              className="relative"
              style={{ height: `${hours.length * HOUR_HEIGHT_REM}rem` }}
            >
              <div className="absolute inset-0 grid grid-cols-1" style={{gridTemplateRows: `repeat(${hours.length}, ${HOUR_HEIGHT_REM}rem)`}}>
                {hours.map(hour => (
                  <div key={hour} className="h-full border-b border-gray-200/70 dark:border-gray-800/70"></div>
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
    </div>
  );
};

export default DayColumn;