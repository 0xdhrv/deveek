

import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Task, Project, CommandKAction } from '../types';
import { SettingsContext } from '../contexts/SettingsContext';
import { 
    CalendarDays, Trello, List, Settings, Plus, Code, 
    Clock, Play, Pause, TimerReset, Coffee, ChevronLeft 
} from 'lucide-react';
import { PomodoroControls } from './PomodoroTimer';
import { useFocusTrap } from '../hooks/usePomodoro';

interface CommandKMenuProps {
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onOpenSettings: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
  pomodoroControls: PomodoroControls;
}

type CommandKLevel = 'root' | 'searchTasks' | 'searchProjects' | 'pomodoro' | 'createTask';

const CommandKMenu: React.FC<CommandKMenuProps> = ({ 
    tasks, projects, onClose, onOpenTask, onOpenSettings, onAddTask, pomodoroControls 
}) => {
  const { setView } = useContext(SettingsContext);
  const { isActive, toggleTimer, resetTimer, changeMode } = pomodoroControls;
  const [level, setLevel] = useState<CommandKLevel>('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const modalRef = useFocusTrap(true);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateTo = (newLevel: CommandKLevel) => {
    setLevel(newLevel);
    setSearchTerm('');
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const goBack = () => {
    navigateTo('root');
  };

  const levelConfig: Record<CommandKLevel, { title: string, placeholder: string }> = {
    root: { title: 'Command Menu', placeholder: 'Type a command or search...' },
    searchTasks: { title: 'Search Tasks', placeholder: 'Search tasks by title, tag, or description...' },
    searchProjects: { title: 'Search Projects', placeholder: 'Search projects by name...' },
    pomodoro: { title: 'Pomodoro Commands', placeholder: 'Search commands...' },
    createTask: { title: 'Create New Task', placeholder: 'Enter new task title and press Enter' },
  };

  const rootActions: CommandKAction[] = useMemo(() => [
    { id: 'new-task', label: 'Create New Task...', group: 'Actions', icon: Plus, perform: () => navigateTo('createTask') },
    { id: 'search-tasks', label: 'Search Tasks...', group: 'Navigation', icon: Code, perform: () => navigateTo('searchTasks') },
    { id: 'search-projects', label: 'Search Projects...', group: 'Navigation', icon: List, perform: () => navigateTo('searchProjects') },
    { id: 'pomodoro', label: 'Pomodoro Commands...', group: 'Navigation', icon: Clock, perform: () => navigateTo('pomodoro') },
    { id: 'view-weekly', label: 'Go to Weekly View', group: 'Navigation', icon: CalendarDays, perform: () => setView('weekly') },
    { id: 'view-calendar', label: 'Go to Calendar View', group: 'Navigation', icon: Clock, perform: () => setView('calendar') },
    { id: 'view-kanban', label: 'Go to Kanban View', group: 'Navigation', icon: Trello, perform: () => setView('kanban') },
    { id: 'view-list', label: 'Go to List View', group: 'Navigation', icon: List, perform: () => setView('list') },
    { id: 'settings', label: 'Open Settings', group: 'Actions', icon: Settings, perform: onOpenSettings },
  ], [setView, onOpenSettings]);
  
  const pomodoroActions: CommandKAction[] = useMemo(() => [
        { id: 'pomo-toggle', label: isActive ? 'Pause Timer' : 'Start Timer', group: 'Pomodoro', icon: isActive ? Pause : Play, perform: toggleTimer },
        { id: 'pomo-reset', label: 'Reset Timer', group: 'Pomodoro', icon: TimerReset, perform: resetTimer },
        { id: 'pomo-work', label: 'Switch to Work Mode', group: 'Pomodoro', icon: Code, perform: () => changeMode('work') },
        { id: 'pomo-short', label: 'Switch to Short Break', group: 'Pomodoro', icon: Coffee, perform: () => changeMode('shortBreak') },
        { id: 'pomo-long', label: 'Switch to Long Break', group: 'Pomodoro', icon: Coffee, perform: () => changeMode('longBreak') },
  ], [isActive, toggleTimer, resetTimer, changeMode]);

  const displayedItems: CommandKAction[] = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    const filter = (items: CommandKAction[]) => term ? items.filter(action =>
        action.label.toLowerCase().includes(term) ||
        (action.keywords && action.keywords.toLowerCase().includes(term))
    ) : items;

    switch (level) {
        case 'searchTasks':
            return filter(tasks.map(task => ({
                id: `task-${task.id}`, label: task.title, group: 'Tasks', icon: Code,
                perform: () => onOpenTask(task), keywords: [...task.tags, task.description].join(' '), item: task,
            })));
        case 'searchProjects':
            return filter(projects.map(project => ({
                id: `project-${project.id}`, label: project.name, group: 'Projects', 
                icon: () => <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></span>,
                perform: () => {}, item: project,
            })));
        case 'pomodoro':
            return filter(pomodoroActions);
        case 'root':
            return filter(rootActions);
        default:
            return [];
    }
  }, [searchTerm, level, rootActions, pomodoroActions, tasks, projects, onOpenTask]);

  useEffect(() => setActiveIndex(0), [displayedItems]);
  useEffect(() => activeItemRef.current?.scrollIntoView({ block: 'nearest' }), [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
        level === 'root' ? onClose() : goBack();
        return;
    }
    
    if (level === 'createTask') {
        if (e.key === 'Enter' && searchTerm.trim()) {
            onAddTask({ title: searchTerm.trim(), description: '', date: null, priority: 'medium', tags: [] });
            onClose();
        }
        return;
    }

    if (displayedItems.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % displayedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + displayedItems.length) % displayedItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = displayedItems[activeIndex];
      if (action) {
        action.perform();
        onClose();
      }
    }
  };
  
  const currentLevelConfig = levelConfig[level];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24 animate-[modal-fade-in_0.2s_ease-out]" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-950 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-300 dark:border-gray-700 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          {level !== 'root' && (
            <button onClick={goBack} className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800">
                <ChevronLeft className="w-5 h-5"/>
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder={currentLevelConfig.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none border-none"
            autoFocus
          />
        </div>
        
        {level !== 'createTask' && (
            <div className="max-h-[50vh] overflow-y-auto">
              {displayedItems.length > 0 && (
                 <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">{currentLevelConfig.title}</h3>
              )}
              {displayedItems.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    ref={activeIndex === index ? activeItemRef : null}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => { action.perform(); onClose(); }}
                    className={`flex items-center justify-between p-3 cursor-pointer mx-2 my-1 rounded-md ${
                      activeIndex === index ? 'bg-slate-100 dark:bg-gray-800' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${activeIndex === index ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{action.label}</span>
                    </div>
                    <span className={`text-xs ${activeIndex === index ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{action.group}</span>
                  </div>
                )
              })}
              {displayedItems.length === 0 && searchTerm && (
                <p className="p-4 text-center text-slate-500 dark:text-slate-400">No results found.</p>
              )}
            </div>
        )}
      </div>
    </div>
  );
};

export default CommandKMenu;