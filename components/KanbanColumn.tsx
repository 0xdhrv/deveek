
import React, { useState } from 'react';
import { Task, TaskPriority, Project } from '../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
    priority: TaskPriority;
    tasks: Task[];
    projects: Project[];
    onTaskClick: (task: Task) => void;
    onPriorityChange: (taskId: string, priority: TaskPriority) => void;
}

const priorityConfig = {
    urgent: { title: 'Urgent', borderColor: 'border-rose-400' },
    high: { title: 'High', borderColor: 'border-orange-400' },
    medium: { title: 'Medium', borderColor: 'border-teal-400' },
    low: { title: 'Low', borderColor: 'border-slate-400' },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ priority, tasks, projects, onTaskClick, onPriorityChange }) => {
    const [isOver, setIsOver] = useState(false);
    const { title, borderColor } = priorityConfig[priority];

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
            onPriorityChange(taskId, priority);
        }
        setIsOver(false);
    };

    return (
        <div 
            className={`flex flex-col h-full rounded-lg bg-slate-100 dark:bg-slate-800/30 transition-colors ${isOver ? 'bg-slate-200 dark:bg-slate-700/40' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`p-3 sticky top-0 rounded-t-lg flex items-center gap-3 border-t-4 ${borderColor}`}>
                <h3 className="font-bold uppercase text-sm text-slate-700 dark:text-slate-200 tracking-wider">{title}</h3>
                <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700/50 px-2 rounded-full">{tasks.length}</span>
            </div>
            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} projects={projects} onClick={() => onTaskClick(task)} />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;
