

import React from 'react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import PomodoroTimer, { PomodoroControls } from './PomodoroTimer';
import { useAppStore } from '../stores/appStore';

interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  pomodoroControls: PomodoroControls;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentDate, setCurrentDate, pomodoroControls, onMenuClick }) => {
  const settings = useAppStore((state) => state.settings);
  
  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
      setCurrentDate(new Date());
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex-shrink-0 z-10">
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
          <Menu className="w-6 h-6" />
        </button>
         { (settings.view === 'weekly' || settings.view === 'calendar') && (
            <div className="flex items-center gap-2">
              <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToToday} className="px-3 py-1.5 rounded-md text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">Today</button>
               <span className="hidden sm:block text-md font-medium w-32 text-center text-slate-700 dark:text-slate-200">{monthName} {year}</span>
              <button onClick={() => changeWeek(1)} className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <PomodoroTimer {...pomodoroControls} />
      </div>
    </header>
  );
};

export default Header;