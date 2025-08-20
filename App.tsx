

import React, { useCallback, useEffect } from 'react';
import { Task, DayIdentifier, TaskPriority, Project, TaskStatus } from './types';
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
import { useAppStore, initializeApp } from './stores/appStore';


const App: React.FC = () => {
  // Use Zustand store instead of individual useState calls
  const {
    currentDate,
    setCurrentDate,
    tasks,
    setTasks,
    projects,
    setProjects,
    selectedTask,
    setSelectedTask,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isCommandKOpen,
    setIsCommandKOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    settings,
    setView,
    toastMessage,
    setToastMessage,
  } = useAppStore();

  const pomodoroControls = usePomodoro({ 
    notificationsEnabled: settings.notificationsEnabled 
  });

  const showToast = useCallback((message: string, duration = 4000) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), duration);
  }, [setToastMessage]);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Load legacy data from local storage and show initial toast
  useEffect(() => {
    showToast("Pro-Tip: Press 'd' then a key for shortcuts (e.g., d+k for menu).", 5000);
  }, [showToast]);

  // App shortcuts
  useEffect(() => {
    let keySequence: string[] = [];
    let sequenceTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
        const isModalOpen = isTaskModalOpen || isSettingsOpen || isCommandKOpen;
        
        if (isEditing || isModalOpen) return;
        
        // Command+K listener
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setIsCommandKOpen(prev => !prev);
            return;
        }

        // D-key sequence listener
        if (event.key === 'd' && keySequence.length === 0) {
            keySequence.push('d');
            
            if (sequenceTimeout) clearTimeout(sequenceTimeout);
            sequenceTimeout = setTimeout(() => {
                keySequence = [];
            }, 2000);
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
                case 's': setIsSettingsOpen(true); toastMsg = "Opened Settings"; break;
                case 'p': pomodoroControls.toggleTimer(); toastMsg = "Toggled Pomodoro Timer"; break;
                case 't': setCurrentDate(new Date()); toastMsg = "Navigated to Today"; break;
                case 'n': setSelectedTask(null); setIsTaskModalOpen(true); toastMsg = "Opened New Task modal"; break;
                case ',': setIsCommandKOpen(true); toastMsg = "Opened Command Menu"; break; // d+, as a nod to sublime/vscode
                default:
                  setToastMessage(""); // Clear any active toast message
                  return;
            }
            showToast(toastMsg);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isSettingsOpen, isCommandKOpen, setView, pomodoroControls.toggleTimer, showToast]);


  const handleSaveTask = useCallback((taskToSave: Task | Omit<Task, 'id'>) => {
    setTasks(prevTasks => {
      if ('id' in taskToSave && taskToSave.id) {
        // This is an update
        return prevTasks.map(task => (task.id === taskToSave.id ? taskToSave as Task : task));
      } else {
        // This is a new task
        const newTask: Task = {
          ...taskToSave,
          id: Date.now().toString(),
          status: taskToSave.date ? 'todo' : 'inbox',
        };
        return [newTask, ...prevTasks];
      }
    });
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleTaskDrop = useCallback((taskId: string, dayId: DayIdentifier, startTime?: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newDate = dayId === 'inbox' ? null : new Date(dayId);
          const newStatus = dayId === 'inbox' ? 'inbox' : task.status === 'inbox' ? 'todo' : task.status;
          
          const newStartTime = startTime === '' ? undefined : (startTime ?? task.startTime);
          
          return { ...task, date: newDate, status: newStatus, startTime: newStartTime };
        }
        return task;
      })
    );
  }, []);

  const handlePriorityChange = useCallback((taskId: string, priority: TaskPriority) => {
    setTasks(prevTasks =>
      prevTasks.map(task => 
        task.id === taskId ? { ...task, priority } : task
      )
    );
  }, []);
  
  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: `proj-${Date.now()}`};
    setProjects(prev => [...prev, newProject]);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Also remove project from tasks
    setTasks(prevTasks => prevTasks.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t));
  };
  
  const handleBulkUpdateTasks = useCallback((taskIds: Set<string>, updates: Partial<Pick<Task, 'status' | 'priority' | 'projectId'>>) => {
      setTasks(prevTasks => prevTasks.map(task => 
          taskIds.has(task.id) ? { ...task, ...updates } : task
      ));
  }, []);

  const handleBulkDeleteTasks = useCallback((taskIds: Set<string>) => {
      if (window.confirm(`Are you sure you want to delete ${taskIds.size} tasks? This action cannot be undone.`)) {
          setTasks(prevTasks => prevTasks.filter(task => !taskIds.has(task.id)));
      }
  }, []);

  const handleExportData = useCallback(() => {
    try {
        const dataToExport = {
            tasks,
            projects,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataToExport, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `devweek-backup-${date}.json`;
        link.click();
    } catch (error) {
        console.error("Failed to export data", error);
        alert("Error exporting data. See console for details.");
    }
  }, [tasks, projects]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text !== 'string') {
              alert("Error reading file.");
              return;
          }
          try {
              const importedData = JSON.parse(text);
              if (!importedData.tasks || !importedData.projects || !Array.isArray(importedData.tasks) || !Array.isArray(importedData.projects)) {
                  throw new Error("Invalid file format. Must contain 'tasks' and 'projects' arrays.");
              }

              if (window.confirm("Are you sure? This will overwrite all current tasks and projects.")) {
                  const tasksWithDates = importedData.tasks.map((task: any) => ({
                      ...task,
                      date: task.date ? new Date(task.date) : null,
                  }));
                  setTasks(tasksWithDates);
                  setProjects(importedData.projects);
                  alert("Data imported successfully!");
              }
          } catch (error) {
              console.error("Failed to import data", error);
              alert(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
              event.target.value = ''; // Reset file input
          }
      };
      reader.onerror = () => {
          alert("Error reading file.");
          event.target.value = '';
      };
      reader.readAsText(file);
  }, []);

  const renderActiveView = () => {
      switch(settings.view) {
          case 'calendar':
            return <CalendarView currentDate={currentDate} tasks={tasks} projects={projects} onTaskDrop={handleTaskDrop} onTaskClick={handleOpenTaskModal} onAddTask={handleSaveTask} />;
          case 'kanban':
            return <KanbanView tasks={tasks} projects={projects} onTaskClick={handleOpenTaskModal} onPriorityChange={handlePriorityChange} />;
          case 'list':
            return <ListView tasks={tasks} projects={projects} onTaskClick={handleOpenTaskModal} onBulkUpdate={handleBulkUpdateTasks} onBulkDelete={handleBulkDeleteTasks} />;
          case 'weekly':
          default:
            return <SimpleWeeklyView currentDate={currentDate} tasks={tasks} projects={projects} onTaskDrop={handleTaskDrop} onTaskClick={handleOpenTaskModal} onAddTask={handleSaveTask} />;
      }
  };

  return (
    <div className="flex h-screen font-sans bg-white dark:bg-neutral-950 text-slate-800 dark:text-slate-300 transition-colors duration-300">
      <Sidebar onSettingsOpen={() => setIsSettingsOpen(true)} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          pomodoroControls={pomodoroControls}
          onMenuClick={() => setIsSidebarOpen(true)}
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
          onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
          onSave={handleSaveTask}
          onDelete={handleTaskDelete}
        />
      )}
      {isSettingsOpen && (
          <SettingsModal 
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onClose={() => setIsSettingsOpen(false)} 
            onExport={handleExportData}
            onImport={handleImportData}
          />
      )}
      {isCommandKOpen && (
        <CommandKMenu 
          tasks={tasks}
          projects={projects}
          onClose={() => setIsCommandKOpen(false)}
          onOpenTask={handleOpenTaskModal}
          onOpenSettings={() => setIsSettingsOpen(true)}
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