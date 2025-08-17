

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, Project, TaskPriority, TaskStatus } from '../types';
import { Filter, ArrowUp, ArrowDown, X, Trash2, CheckSquare, Square, Folder, ChevronsUpDown, Shield } from 'lucide-react';

interface ListViewProps {
    tasks: Task[];
    projects: Project[];
    onTaskClick: (task: Task) => void;
    onBulkUpdate: (taskIds: Set<string>, updates: Partial<Pick<Task, 'status' | 'priority' | 'projectId'>>) => void;
    onBulkDelete: (taskIds: Set<string>) => void;
}

type SortKey = keyof Task | 'projectName';

const priorityOrder: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
const statusOrder: Record<TaskStatus, number> = { active: 4, todo: 3, inbox: 2, completed: 1 };

const useOutsideClick = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
};

const FilterMenu: React.FC<{
    projects: Project[];
    filters: { project: string[]; priority: TaskPriority[]; status: TaskStatus[] };
    onFilterChange: (type: 'project' | 'priority' | 'status', value: string) => void;
    onClearFilters: () => void;
}> = ({ projects, filters, onFilterChange, onClearFilters }) => {
    const hasActiveFilters = filters.project.length > 0 || filters.priority.length > 0 || filters.status.length > 0;
    return (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-4">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">By Project</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                        {projects.map(p => (
                           <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 p-1 rounded-md">
                                <input type="checkbox" checked={filters.project.includes(p.id)} onChange={() => onFilterChange('project', p.id)} className="w-4 h-4 rounded text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-gray-500" />
                                {p.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">By Priority</h4>
                    <div className="space-y-1">
                        {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map(p => (
                            <label key={p} className="flex items-center gap-2 text-sm capitalize cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 p-1 rounded-md">
                                <input type="checkbox" checked={filters.priority.includes(p)} onChange={() => onFilterChange('priority', p)} className="w-4 h-4 rounded text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-gray-500" />
                                {p}
                            </label>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-2 text-slate-600 dark:text-slate-300">By Status</h4>
                    <div className="space-y-1">
                       {(['todo', 'active', 'completed', 'inbox'] as TaskStatus[]).map(s => (
                            <label key={s} className="flex items-center gap-2 text-sm capitalize cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 p-1 rounded-md">
                                <input type="checkbox" checked={filters.status.includes(s)} onChange={() => onFilterChange('status', s)} className="w-4 h-4 rounded text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-gray-500" />
                                {s}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
             {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
                    <button onClick={onClearFilters} className="w-full text-center px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">Clear All Filters</button>
                </div>
            )}
        </div>
    );
};


const ListView: React.FC<ListViewProps> = ({ tasks, projects, onTaskClick, onBulkUpdate, onBulkDelete }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
    const [filters, setFilters] = useState<{ project: string[], priority: TaskPriority[], status: TaskStatus[] }>({ project: [], priority: [], status: [] });
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const filterMenuRef = useRef<HTMLDivElement>(null);
    useOutsideClick(filterMenuRef, () => setIsFilterMenuOpen(false));
    
    const projectsById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => {
            if (prev?.key === key && prev.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleFilterChange = (type: 'project' | 'priority' | 'status', value: string) => {
        setFilters(prev => {
            const currentFilter = prev[type] as string[];
            const newFilter = currentFilter.includes(value)
                ? currentFilter.filter(item => item !== value)
                : [...currentFilter, value];
            return { ...prev, [type]: newFilter };
        });
    };

    const onClearFilters = () => setFilters({ project: [], priority: [], status: [] });

    const processedTasks = useMemo(() => {
        let filteredTasks = [...tasks];

        if (filters.project.length) {
            filteredTasks = filteredTasks.filter(t => t.projectId && filters.project.includes(t.projectId));
        }
        if (filters.priority.length) {
            filteredTasks = filteredTasks.filter(t => filters.priority.includes(t.priority));
        }
        if (filters.status.length) {
            filteredTasks = filteredTasks.filter(t => filters.status.includes(t.status));
        }
        
        if (sortConfig !== null) {
            filteredTasks.sort((a, b) => {
                let aValue: any, bValue: any;
                if (sortConfig.key === 'projectName') {
                    aValue = a.projectId ? projectsById[a.projectId]?.name : '';
                    bValue = b.projectId ? projectsById[b.projectId]?.name : '';
                } else {
                    aValue = a[sortConfig.key as keyof Task];
                    bValue = b[sortConfig.key as keyof Task];
                }

                if (sortConfig.key === 'priority') {
                    aValue = priorityOrder[a.priority];
                    bValue = priorityOrder[b.priority];
                } else if (sortConfig.key === 'status') {
                    aValue = statusOrder[a.status];
                    bValue = statusOrder[b.status];
                }

                if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
                if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filteredTasks;
    }, [tasks, projectsById, sortConfig, filters]);
    
    useEffect(() => {
        setSelectedTaskIds(new Set());
    }, [processedTasks]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTaskIds(new Set(processedTasks.map(t => t.id)));
        } else {
            setSelectedTaskIds(new Set());
        }
    };

    const handleSelectOne = (taskId: string) => {
        const newSelection = new Set(selectedTaskIds);
        if (newSelection.has(taskId)) {
            newSelection.delete(taskId);
        } else {
            newSelection.add(taskId);
        }
        setSelectedTaskIds(newSelection);
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <button onClick={() => handleSort(sortKey)} className="flex items-center gap-1 group">
                {children}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortConfig?.key === sortKey ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                        <ArrowUp className="w-3 h-3 text-slate-400" />
                    )}
                </span>
            </button>
        </th>
    );

    const activeFilterCount = filters.project.length + filters.priority.length + filters.status.length;
    const isAllSelected = selectedTaskIds.size > 0 && selectedTaskIds.size === processedTasks.length;
    
    return (
        <div className="p-4 sm:p-6 h-full flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">All Tasks</h2>
                <div className="relative" ref={filterMenuRef}>
                    <button 
                        onClick={() => setIsFilterMenuOpen(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-900"
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                        {activeFilterCount > 0 && (
                            <span className="bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{activeFilterCount}</span>
                        )}
                    </button>
                    {isFilterMenuOpen && <FilterMenu projects={projects} filters={filters} onFilterChange={handleFilterChange} onClearFilters={onClearFilters} />}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto rounded-lg border border-slate-200 dark:border-gray-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-800">
                    <thead className="bg-slate-50 dark:bg-gray-800/50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="w-4 h-4 rounded text-gray-600 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-gray-500"/>
                            </th>
                            <SortableHeader sortKey="title">Title</SortableHeader>
                            <SortableHeader sortKey="projectName">Project</SortableHeader>
                            <SortableHeader sortKey="priority">Priority</SortableHeader>
                            <SortableHeader sortKey="status">Status</SortableHeader>
                            <SortableHeader sortKey="date">Date</SortableHeader>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-950 divide-y divide-slate-200 dark:divide-gray-800">
                        {processedTasks.map(task => {
                            const project = task.projectId ? projectsById[task.projectId] : null;
                            const isSelected = selectedTaskIds.has(task.id);
                            return (
                                <tr key={task.id} className={`transition-colors ${isSelected ? 'bg-slate-100 dark:bg-gray-800/50' : 'hover:bg-slate-50 dark:hover:bg-gray-900'}`}>
                                    <td className="px-6 py-4">
                                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(task.id)} className="w-4 h-4 rounded text-gray-600 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-gray-500"/>
                                    </td>
                                    <td onClick={() => onTaskClick(task)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">{task.title}</td>
                                    <td onClick={() => onTaskClick(task)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
                                        {project ? (
                                             <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }}></span>
                                                {project.name}
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                    <td onClick={() => onTaskClick(task)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 capitalize cursor-pointer">{task.priority}</td>
                                    <td onClick={() => onTaskClick(task)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 capitalize cursor-pointer">{task.status}</td>
                                    <td onClick={() => onTaskClick(task)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
                                        {task.date ? task.date.toLocaleDateString() : 'Inbox'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {processedTasks.length === 0 && (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                        <p className="font-semibold">No tasks found.</p>
                        <p className="text-sm">Try adjusting your filters or adding new tasks.</p>
                    </div>
                )}
            </div>
            {selectedTaskIds.size > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-full shadow-lg z-20">
                     <span className="text-sm font-semibold">{selectedTaskIds.size} selected</span>
                     <div className="w-px h-6 bg-slate-300 dark:bg-gray-600"></div>
                     {/* Bulk Actions Here */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => onBulkUpdate(selectedTaskIds, { status: 'completed' })} title="Mark as Completed" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700"><CheckSquare className="w-5 h-5 text-green-500"/></button>
                        <button onClick={() => onBulkUpdate(selectedTaskIds, { priority: 'urgent' })} title="Set Priority to Urgent" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700"><Shield className="w-5 h-5 text-red-500"/></button>
                        <button onClick={() => onBulkDelete(selectedTaskIds)} title="Delete Selected" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700"><Trash2 className="w-5 h-5 text-red-500"/></button>
                     </div>
                     <div className="w-px h-6 bg-slate-300 dark:bg-gray-600"></div>
                     <button onClick={() => setSelectedTaskIds(new Set())} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700"><X className="w-5 h-5"/></button>
                </div>
            )}
        </div>
    );
};

export default ListView;