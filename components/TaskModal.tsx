

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, Project } from '../types';
import { X, Trash2 } from 'lucide-react';
import { useFocusTrap } from '../hooks/usePomodoro';

interface TaskModalProps {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onSave: (task: Task | Omit<Task, 'id'>) => void;
  onDelete: (taskId: string) => void;
}

const createDefaultTask = (): Omit<Task, 'id'> => ({
    title: '',
    description: '',
    date: new Date(),
    status: 'todo',
    priority: 'medium',
    tags: [],
    estimatedHours: 1,
});

const TaskModal: React.FC<TaskModalProps> = ({ task, projects, onClose, onSave, onDelete }) => {
  const [editedTask, setEditedTask] = useState<Task | Omit<Task, 'id'>>(() => task || createDefaultTask());
  const [tagInput, setTagInput] = useState('');
  const modalRef = useFocusTrap(true);

  useEffect(() => {
    const currentTask = task || createDefaultTask();
    setEditedTask(currentTask);
    setTagInput(currentTask.tags ? currentTask.tags.join(', ') : '');
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "estimatedHours") {
      setEditedTask(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
      return;
    }
    
    if (name === "projectId") {
      setEditedTask(prev => ({ ...prev, projectId: value === "" ? undefined : value }));
      return;
    }

    setEditedTask(prev => ({ ...prev, [name]: value as TaskStatus | TaskPriority }));
  };
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleSave = () => {
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
    onSave({ ...editedTask, tags });
  };

  const handleDelete = () => {
    if (task?.id && window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id);
    }
  };
  
  const isNewTask = !('id' in editedTask) || !editedTask.id;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-[modal-fade-in_0.2s_ease-out]">
      <div ref={modalRef} className="bg-white dark:bg-gray-950 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-300 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{isNewTask ? 'Create Task' : 'Edit Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={editedTask.title}
              onChange={handleChange}
              className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              name="description"
              id="description"
              value={editedTask.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Project</label>
                <select 
                    name="projectId" 
                    id="project" 
                    value={editedTask.projectId || ''} 
                    onChange={handleChange}
                    className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
            </div>
             <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                <select 
                    name="priority" 
                    id="priority" 
                    value={editedTask.priority} 
                    onChange={handleChange}
                    className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={tagInput}
              onChange={handleTagChange}
              className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                <select 
                    name="status" 
                    id="status" 
                    value={editedTask.status} 
                    onChange={handleChange}
                    className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                >
                  <option value="inbox">Inbox</option>
                  <option value="todo">To Do</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  id="estimatedHours"
                  value={editedTask.estimatedHours || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                />
              </div>
               <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  value={editedTask.startTime || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                />
              </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <button 
            onClick={handleDelete} 
            disabled={isNewTask}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-500 rounded-md hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-gray-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Trash2 className="w-4 h-4"/>
            Delete
          </button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-950 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-2 text-sm font-semibold text-white bg-gray-800 dark:text-gray-950 dark:bg-gray-200 rounded-md shadow-sm hover:bg-gray-700 dark:hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 transition-all">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;