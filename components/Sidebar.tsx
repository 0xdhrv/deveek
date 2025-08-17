

import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { ViewMode } from '../types';
import { CalendarDays, Clock, Trello, List, Settings, X, Sparkles } from 'lucide-react';

interface SidebarProps {
    onSettingsOpen: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const views: { id: ViewMode, name: string, icon: React.ElementType}[] = [
    { id: 'weekly', name: 'Weekly', icon: CalendarDays },
    { id: 'calendar', name: 'Calendar', icon: Clock },
    { id: 'kanban', name: 'Kanban', icon: Trello },
    { id: 'list', name: 'List', icon: List },
];

const NavItem: React.FC<{view: typeof views[0], activeView: ViewMode, setView: (view: ViewMode) => void, closeSidebar: () => void}> = ({ view, activeView, setView, closeSidebar }) => {
    const isActive = activeView === view.id;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setView(view.id);
                    closeSidebar();
                }}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive 
                        ? 'text-slate-900 dark:text-slate-50 bg-slate-200/60 dark:bg-gray-800/80' 
                        : 'text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-gray-800/60'
                }`}
                aria-current={isActive}
            >
                {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-slate-800 dark:bg-slate-200 rounded-r-full"></div>}
                <view.icon className="w-5 h-5" />
                <span>{view.name}</span>
            </a>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ onSettingsOpen, isSidebarOpen, setIsSidebarOpen }) => {
    const { settings, setView } = useContext(SettingsContext);

    const closeSidebar = () => {
        if(window.innerWidth < 768) { // md breakpoint
            setIsSidebarOpen(false);
        }
    };

    const handleSettingsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onSettingsOpen();
        closeSidebar();
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-800 h-16">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">DevWeek</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-800">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {views.map(view => (
                        <NavItem key={view.id} view={view} activeView={settings.view} setView={setView} closeSidebar={closeSidebar} />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-gray-800">
                 <a
                    href="#"
                    onClick={handleSettingsClick}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-colors text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-gray-800/60"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </a>
            </div>
        </div>
    );
    
    return (
        <>
             {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity ${
                isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`w-64 flex-shrink-0 bg-white dark:bg-gray-950 backdrop-blur-lg border-r border-slate-200 dark:border-gray-800 fixed md:relative inset-y-0 left-0 z-40 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
               {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;