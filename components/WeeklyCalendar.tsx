import React from 'react';
import { Task, DayIdentifier, Project } from '../types';
import DayColumn from './DayColumn';
import { useAppStore } from '../stores/appStore';

interface WeeklyCalendarProps {
  currentDate: Date;
  tasks: Task[];
  projects: Project[];
  onTaskDrop: (taskId: string, dayId: DayIdentifier, startTime?: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
}

const getWeekDays = (date: Date): Date[] => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  // Set to last Sunday
  startOfWeek.setDate(startOfWeek.getDate() - day); 
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(dayDate.getDate() + i);
    week.push(dayDate);
  }
  return week;
};


const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ currentDate, tasks, projects, onTaskDrop, onTaskClick, onAddTask }) => {
  const settings = useAppStore((state) => state.settings);
  
  let weekDays = getWeekDays(currentDate);

  if (settings.hideWeekends) {
      weekDays = weekDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6);
  }

  const getGridTemplateColumns = () => {
    const base = 'minmax(0, 1fr)';
    const cols = weekDays.map(() => base);
    if(settings.showInbox) {
      cols.unshift('minmax(0, 0.75fr)');
    }
    return cols.join(' ');
  };


  return (
    <div className={`grid bg-white dark:bg-slate-900`} style={{ gridTemplateColumns: getGridTemplateColumns() }}>
      {settings.showInbox && (
        <DayColumn
          key="inbox"
          dayId="inbox"
          title="Inbox"
          tasks={tasks.filter(t => t.status === 'inbox')}
          projects={projects}
          onTaskDrop={onTaskDrop}
          onTaskClick={onTaskClick}
          onAddTask={onAddTask}
          isInbox
        />
      )}
      {weekDays.map(day => {
        const dayId = day.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.date && t.date.toISOString().split('T')[0] === dayId);
        return (
          <DayColumn
            key={dayId}
            dayId={dayId}
            title={day.toLocaleString('default', { weekday: 'short' })}
            date={day.getDate()}
            isToday={new Date().toISOString().split('T')[0] === dayId}
            tasks={dayTasks}
            projects={projects}
            onTaskDrop={onTaskDrop}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;