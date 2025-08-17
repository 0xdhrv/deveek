

import React from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import { Play, Pause, TimerReset } from 'lucide-react';

export type PomodoroControls = ReturnType<typeof usePomodoro>;

const PomodoroTimer: React.FC<PomodoroControls> = ({ minutes, seconds, isActive, mode, toggleTimer, resetTimer, changeMode }) => {

  const getModeColor = (m: typeof mode, selected: boolean) => {
    if (!selected) return 'bg-transparent hover:bg-slate-200/60 dark:hover:bg-neutral-800/60 text-slate-600 dark:text-slate-400';
    return 'bg-slate-200/60 dark:bg-neutral-800 text-slate-800 dark:text-slate-200';
  };

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-lg">
          <button onClick={() => changeMode('work')} className={`px-2 py-1 text-xs font-semibold rounded-md ${getModeColor('work', mode==='work')}`}>Work</button>
          <button onClick={() => changeMode('shortBreak')} className={`px-2 py-1 text-xs font-semibold rounded-md ${getModeColor('shortBreak', mode==='shortBreak')}`}>Short</button>
          <button onClick={() => changeMode('longBreak')} className={`px-2 py-1 text-xs font-semibold rounded-md ${getModeColor('longBreak', mode==='longBreak')}`}>Long</button>
      </div>
      <div className="font-mono text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 w-[70px] text-center">{formattedTime}</div>
      <div className="flex gap-1 md:gap-2">
        <button
          onClick={toggleTimer}
          aria-label={isActive ? "Pause timer" : "Start timer"}
          className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-white bg-neutral-800 dark:text-neutral-950 dark:bg-neutral-50 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={resetTimer}
           aria-label="Reset timer"
          className="hidden md:flex w-10 h-10 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400 bg-transparent rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
        >
          <TimerReset className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;