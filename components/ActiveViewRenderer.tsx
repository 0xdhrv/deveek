import React from 'react';
import useStore from '../store/useStore';
import CalendarView from './CalendarView';
import KanbanView from './KanbanView';
import ListView from './ListView';
import SimpleWeeklyView from './SimpleWeeklyView';
import { Task } from '../types';

interface ActiveViewRendererProps {
  currentDate: Date;
}

const ActiveViewRenderer: React.FC<ActiveViewRendererProps> = ({ currentDate }) => {
  const {
    tasks,
    projects,
    settings,
    handleTaskDrop,
    handlePriorityChange,
    bulkUpdateTasks,
    bulkDeleteTasks,
    addTask,
    updateTask,
    transient: { openTaskModal },
  } = useStore();

  const handleSaveTask = (task: Task | Omit<Task, 'id'>) => {
    if ('id' in task && task.id) {
      updateTask(task as Task);
    } else {
      addTask(task);
    }
  };

  switch (settings.view) {
    case 'calendar':
      return <CalendarView currentDate={currentDate} tasks={tasks} projects={projects} onTaskDrop={handleTaskDrop} onTaskClick={openTaskModal} onAddTask={handleSaveTask} />;
    case 'kanban':
      return <KanbanView tasks={tasks} projects={projects} onTaskClick={openTaskModal} onPriorityChange={handlePriorityChange} />;
    case 'list':
      return <ListView tasks={tasks} projects={projects} onTaskClick={openTaskModal} onBulkUpdate={bulkUpdateTasks} onBulkDelete={bulkDeleteTasks} />;
    case 'weekly':
    default:
      return <SimpleWeeklyView currentDate={currentDate} tasks={tasks} projects={projects} onTaskDrop={handleTaskDrop} onTaskClick={openTaskModal} onAddTask={handleSaveTask} />;
  }
};

export default ActiveViewRenderer;
