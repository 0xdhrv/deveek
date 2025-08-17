

import React, { useState } from 'react';
import { Project } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface ProjectManagementProps {
    projects: Project[];
    onAddProject: (project: Omit<Project, 'id'>) => void;
    onUpdateProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
}

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6'];

const ProjectManagement: React.FC<ProjectManagementProps> = ({ projects, onAddProject, onUpdateProject, onDeleteProject }) => {
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectColor, setNewProjectColor] = useState(COLORS[0]);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingProjectName, setEditingProjectName] = useState('');

    const handleAddProject = () => {
        if (newProjectName.trim()) {
            onAddProject({ name: newProjectName.trim(), color: newProjectColor });
            setNewProjectName('');
            setNewProjectColor(COLORS[0]);
        }
    };

    const handleStartEdit = (project: Project) => {
        setEditingProjectId(project.id);
        setEditingProjectName(project.name);
    }

    const handleSaveEdit = (project: Project) => {
        if (editingProjectName.trim()) {
            onUpdateProject({ ...project, name: editingProjectName.trim() });
        }
        setEditingProjectId(null);
        setEditingProjectName('');
    }


    return (
        <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-neutral-200 dark:border-neutral-700 pb-2">Manage Projects</h3>
            <div className="space-y-2">
                {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-2 rounded-md bg-slate-100 dark:bg-neutral-900">
                        <div className="flex items-center gap-3 flex-1">
                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }}></span>
                            {editingProjectId === project.id ? (
                                <input
                                    type="text"
                                    value={editingProjectName}
                                    onChange={(e) => setEditingProjectName(e.target.value)}
                                    onBlur={() => handleSaveEdit(project)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(project)}
                                    className="bg-transparent w-full outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 rounded-sm"
                                    autoFocus
                                />
                            ) : (
                                <span onDoubleClick={() => handleStartEdit(project)} className="font-medium text-slate-700 dark:text-slate-300 flex-1 cursor-pointer">
                                    {project.name}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onDeleteProject(project.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                <input
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                    placeholder="New project name"
                    className="flex-1 bg-transparent p-1 outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 rounded"
                />
                <div className="flex gap-1">
                    {COLORS.map(color => (
                        <button key={color} onClick={() => setNewProjectColor(color)} className={`w-6 h-6 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 ${newProjectColor === color ? 'ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-950' : ''}`} style={{ backgroundColor: color }}></button>
                    ))}
                </div>
                <button onClick={handleAddProject} className="p-2 bg-slate-200 text-slate-800 dark:bg-neutral-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ProjectManagement;