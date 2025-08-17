import React, { useState, useEffect } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import CalendarView from './components/CalendarView';
import KanbanView from './components/KanbanView';
import ListView from './components/ListView';
import SimpleWeeklyView from './components/SimpleWeeklyView';
import CommandKMenu from './components/CommandKMenu';
import Footer from './components/Footer';
import { usePomodoro } from './hooks/usePomodoro';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    tasks,
    projects,
    settings,
    transient,
    handleTaskDrop,
    handlePriorityChange,
    bulkUpdateTasks,
    bulkDeleteTasks,
    addTask,
    updateTask,
    deleteTask,
    addProject,
    updateProject,
    deleteProject,
    exportData,
    importData,
    setView,
  } = useStore();

  const {
    isTaskModalOpen,
    isSettingsOpen,
    isCommandKOpen,
    isSidebarOpen,
    selectedTask,
    toastMessage,
    openTaskModal,
    closeTaskModal,
    toggleSettingsModal,
    toggleCommandKMenu,
    toggleSidebar,
    showToast,
  } = transient;

  const pomodoroControls = usePomodoro({ 
    notificationsEnabled: settings.notificationsEnabled 
  });

  useEffect(() => {
    showToast("Pro-Tip: Press 'd' then a key for shortcuts (e.g., d+k for menu).", 5000);

    let keySequence: string[] = [];
    let sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
        const isModalOpen = isTaskModalOpen || isSettingsOpen || isCommandKOpen;
        
        if (isEditing || isModalOpen) return;
        
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            toggleCommandKMenu();
            return;
        }

        if (event.key === 'd' && keySequence.length === 0) {
            keySequence.push('d');
            if (sequenceTimeout) clearTimeout(sequenceTimeout);
            sequenceTimeout = setTimeout(() => { keySequence = []; }, 2000);
            return;
        }

        if (keySequence[0] === 'd') {
            event.preventDefault();
            const actionKey = event.key.toLowerCase();
            keySequence = [];
            if (sequenceTimeout) clearTimeout(sequenceTimeout);

            let toastMsg = '';
            switch(actionKey) {
                case 'w': setView('weekly'); toastMsg = "Switched to Weekly View"; break;
                case 'c': setView('calendar'); toastMsg = "Switched to Calendar View"; break;
                case 'k': setView('kanban'); toastMsg = "Switched to Kanban View"; break;
                case 'l': setView('list'); toastMsg = "Switched to List View"; break;
                case 's': toggleSettingsModal(); toastMsg = "Opened Settings"; break;
                case 'p': pomodoroControls.toggleTimer(); toastMsg = "Toggled Pomodoro Timer"; break;
                case 't': setCurrentDate(new Date()); toastMsg = "Navigated to Today"; break;
                case 'n': openTaskModal(null); toastMsg = "Opened New Task modal"; break;
                case ',': toggleCommandKMenu(); toastMsg = "Opened Command Menu"; break;
                default: return;
            }
            showToast(toastMsg);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isSettingsOpen, isCommandKOpen, setView, pomodoroControls.toggleTimer, showToast, toggleCommandKMenu, toggleSettingsModal, openTaskModal]);

  const handleSaveTask = (task: any) => {
    if ('id' in task && task.id) {
      updateTask(task);
    } else {
      addTask(task);
    }
  };

  const renderActiveView = () => {
      switch(settings.view) {
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

  return (
    <div className="flex h-screen font-sans bg-white dark:bg-neutral-950 text-slate-800 dark:text-slate-300 transition-colors duration-300">
      <Sidebar onSettingsOpen={toggleSettingsModal} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          pomodoroControls={pomodoroControls}
          onMenuClick={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
          <div data-view-transition>
              {renderActiveView()}
          </div>
        </main>
        <Footer />
      </div>

      {isTaskModalOpen && (
        <TaskModal
          task={selectedTask}
          projects={projects}
          onClose={closeTaskModal}
          onSave={handleSaveTask}
          onDelete={deleteTask}
        />
      )}
      {isSettingsOpen && (
          <SettingsModal 
            projects={projects}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onClose={toggleSettingsModal}
            onExport={exportData}
            onImport={importData}
          />
      )}
      {isCommandKOpen && (
        <CommandKMenu 
          tasks={tasks}
          projects={projects}
          onClose={toggleCommandKMenu}
          onOpenTask={openTaskModal}
          onOpenSettings={toggleSettingsModal}
          onAddTask={handleSaveTask}
          pomodoroControls={pomodoroControls}
        />
      )}
       {toastMessage && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-md text-sm shadow-lg animate-modal-fade-in z-50">
            {toastMessage}
          </div>
       )}
    </div>
  );
};

export default App;