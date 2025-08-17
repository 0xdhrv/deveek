

import React, { useState, useMemo } from 'react';
import { Task, DayIdentifier, Project, SortBy, TaskPriority } from '../types';
import TaskCard from './TaskCard';
import { Plus, ArrowDownAZ } from 'lucide-react';

interface SimpleDayColumnProps {
  dayId: DayIdentifier;
  title: string;
  date?: number;
  isToday?: boolean;
  tasks: Task[];
  projects: Project[];
  onTaskDrop: (taskId: string, dayId: DayIdentifier) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
}

const priorityOrder: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
};


const SimpleDayColumn: React.FC<SimpleDayColumnProps> = ({ dayId, title, date, isToday, tasks, projects, onTaskDrop, onTaskClick, onAddTask }) => {
  const [isOver, setIsOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('default');

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...tasks];
    switch(sortBy) {
        case 'priority':
            return tasksCopy.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        case 'title':
            return tasksCopy.sort((a, b) => a.title.localeCompare(b.title));
        case 'default':
        default:
            return tasks;
    }
  }, [tasks, sortBy]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onTaskDrop(taskId, dayId);
    }
    setIsOver(false);
  };

  const handleConfirmAddTask = () => {
    if (newTitle.trim()) {
      onAddTask({
        title: newTitle.trim(),
        description: "",
        date: dayId === 'inbox' ? null : new Date(dayId),
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

  return (
    <div 
        className={`flex flex-col border-l border-slate-200 dark:border-neutral-800 transition-colors ${isOver ? 'bg-neutral-500/5' : ''}`}
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop}
    >
      <div className="p-3 border-b border-slate-200 dark:border-neutral-800 sticky top-0 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <h3 className={`font-semibold uppercase text-sm tracking-wider ${isToday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{title}</h3>
                <div className="relative group">
                    <ArrowDownAZ className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"/>
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-md shadow-lg p-1 hidden group-hover:block z-20 w-32">
                        <button onClick={() => setSortBy('default')} className="w-full text-left text-sm px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700">Default</button>
                        <button onClick={() => setSortBy('priority')} className="w-full text-left text-sm px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700">By Priority</button>
                        <button onClick={() => setSortBy('title')} className="w-full text-left text-sm px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700">By Title</button>
                    </div>
                </div>
            </div>
          {date && (
            <span className={`font-bold text-lg ${isToday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'} w-8 h-8 flex items-center justify-center rounded-full`}>
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
                    className="w-full bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-md p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 resize-none"
                    rows={2} autoFocus
                />
                <select 
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-md p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                >
                    <option value="">No Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setIsAdding(false)} className="px-2 py-1 text-xs rounded-md hover:bg-slate-200 dark:hover:bg-neutral-700">Cancel</button>
                    <button onClick={handleConfirmAddTask} className="px-2 py-1 text-xs text-white bg-neutral-800 dark:text-neutral-950 dark:bg-neutral-200 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-300">Add</button>
                </div>
            </div>
        ) : (
             <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 p-1.5 text-xs text-slate-500 dark:text-slate-400 rounded-md border-2 border-dashed border-slate-300 dark:border-neutral-700 hover:bg-slate-200/50 dark:hover:bg-neutral-800/50 hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
                <Plus className="w-4 h-4" /> Add Task
            </button>
        )}
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-white dark:bg-neutral-950">
        {sortedTasks.map(task => <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} />)}
      </div>
    </div>
  );
};

export default SimpleDayColumn;