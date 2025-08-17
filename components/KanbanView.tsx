import React from 'react';
import { Task, TaskPriority, Project } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanViewProps {
    tasks: Task[];
    projects: Project[];
    onTaskClick: (task: Task) => void;
    onPriorityChange: (taskId: string, priority: TaskPriority) => void;
}

const priorities: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

const KanbanView: React.FC<KanbanViewProps> = ({ tasks, projects, onTaskClick, onPriorityChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 h-full">
            {priorities.map(priority => (
                <KanbanColumn
                    key={priority}
                    priority={priority}
                    tasks={tasks.filter(t => t.priority === priority)}
                    projects={projects}
                    onTaskClick={onTaskClick}
                    onPriorityChange={onPriorityChange}
                />
            ))}
        </div>
    );
};

export default KanbanView;