

import React from 'react';
import { Task, TaskPriority, Project } from '../types';
import { Check } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  projects: Project[];
  onClick: () => void;
  style?: React.CSSProperties;
  isTimed?: boolean;
}

const priorityStyles: Record<TaskPriority, string> = {
    urgent: 'bg-rose-500/90 dark:bg-rose-600/70',
    high: 'bg-orange-500/90 dark:bg-orange-600/70',
    medium: 'bg-teal-500/90 dark:bg-teal-600/70',
    low: 'bg-slate-500/90 dark:bg-slate-600/70',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, projects, onClick, style, isTimed }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const isCompleted = task.status === 'completed';

  const cardClasses = `relative p-3 bg-white dark:bg-neutral-800/80 rounded-lg border border-neutral-200 dark:border-neutral-700/50 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/80 transition-all group ${isCompleted ? 'opacity-60' : ''} ${style ? 'w-[calc(100%-1rem)]' : 'shadow-sm'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900`;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      className={cardClasses}
      style={style}
      aria-label={`Task: ${task.title}`}
    >
      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${priorityStyles[task.priority]}`}></div>
      
      <div className="pl-3">
        <div className="flex justify-between items-start">
            <p className={`font-medium text-sm mb-1 text-slate-800 dark:text-slate-200`}>
                {isTimed && task.startTime ? `${task.startTime} - ` : ''}{task.title}
            </p>
            {isCompleted && <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
        </div>
        
        {project && !isTimed && (
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }}></span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{project.name}</span>
            </div>
        )}
        
        {task.tags && task.tags.length > 0 && !isTimed && (
            <div className="flex flex-wrap gap-1.5 mt-1">
                {task.tags.map(tag => (
                    <span key={tag} className="text-xs text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-neutral-700/60 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;