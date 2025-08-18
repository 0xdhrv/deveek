import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, Project, Settings, ViewMode, TaskPriority, TaskStatus } from '../types';

// Define a part of the state that should not be persisted
interface TransientState {
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  isSettingsOpen: boolean;
  isCommandKOpen: boolean;
  isSidebarOpen: boolean;
  toastMessage: string;

  openTaskModal: (task: Task | null) => void;
  closeTaskModal: () => void;
  toggleSettingsModal: () => void;
  toggleCommandKMenu: () => void;
  toggleSidebar: () => void;
  showToast: (message: string) => void;
}

interface AppState {
  tasks: Task[];
  projects: Project[];
  settings: Settings;
  transient: TransientState;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  handleTaskDrop: (taskId: string, dayId: string, startTime?: string) => void;
  handlePriorityChange: (taskId: string, priority: TaskPriority) => void;
  bulkUpdateTasks: (taskIds: Set<string>, updates: Partial<Pick<Task, 'status' | 'priority' | 'projectId'>>) => void;
  bulkDeleteTasks: (taskIds: Set<string>) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;

  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => void;
  setView: (view: ViewMode) => void;

  // Data Actions
  importData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  exportData: () => void;
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Persisted State
      tasks: [],
      projects: [],
      settings: {
        darkMode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true,
        hideWeekends: false,
        view: 'weekly',
        showInbox: true,
        notificationsEnabled: false,
      },

      // Transient (Non-Persisted) State
      transient: {
        selectedTask: null,
        isTaskModalOpen: false,
        isSettingsOpen: false,
        isCommandKOpen: false,
        isSidebarOpen: false,
        toastMessage: '',

        openTaskModal: (task) => set(state => ({ transient: { ...state.transient, selectedTask: task, isTaskModalOpen: true }})),
        closeTaskModal: () => set(state => ({ transient: { ...state.transient, selectedTask: null, isTaskModalOpen: false }})),
        toggleSettingsModal: () => set(state => ({ transient: { ...state.transient, isSettingsOpen: !state.transient.isSettingsOpen }})),
        toggleCommandKMenu: () => set(state => ({ transient: { ...state.transient, isCommandKOpen: !state.transient.isCommandKOpen }})),
        toggleSidebar: () => set(state => ({ transient: { ...state.transient, isSidebarOpen: !state.transient.isSidebarOpen }})),
        showToast: (message: string, duration = 4000) => {
            set(state => ({ transient: { ...state.transient, toastMessage: message }}));
            setTimeout(() => set(state => ({ transient: { ...state.transient, toastMessage: '' }})), duration);
        },
      },

      // Task Actions
      addTask: (task) =>
        set((state) => {
          const newTask: Task = {
            ...task,
            id: Date.now().toString(),
            status: task.date ? 'todo' : 'inbox',
          };
          get().transient.closeTaskModal();
          return { tasks: [newTask, ...state.tasks] };
        }),
      updateTask: (taskToUpdate) =>
        set((state) => {
          get().transient.closeTaskModal();
          return {
            tasks: state.tasks.map((task) =>
              task.id === taskToUpdate.id ? taskToUpdate : task
            ),
          }
        }),
      deleteTask: (taskId) =>
        set((state) => {
          get().transient.closeTaskModal();
          return { tasks: state.tasks.filter((task) => task.id !== taskId) }
        }),
      handleTaskDrop: (taskId, dayId, startTime) =>
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              const newDate = dayId === 'inbox' ? null : new Date(dayId);
              const newStatus = dayId === 'inbox' ? 'inbox' : task.status === 'inbox' ? 'todo' : task.status;
              const newStartTime = startTime === '' ? undefined : (startTime ?? task.startTime);
              return { ...task, date: newDate, status: newStatus, startTime: newStartTime };
            }
            return task;
          })
        })),
      handlePriorityChange: (taskId, priority) =>
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, priority } : task
          )
        })),
      bulkUpdateTasks: (taskIds, updates) =>
        set(state => ({
          tasks: state.tasks.map(task =>
            taskIds.has(task.id) ? { ...task, ...updates } : task
          )
        })),
      bulkDeleteTasks: (taskIds) => {
        if (window.confirm(`Are you sure you want to delete ${taskIds.size} tasks? This action cannot be undone.`)) {
          set(state => ({
            tasks: state.tasks.filter(task => !taskIds.has(task.id))
          }));
        }
      },

      // Project Actions
      addProject: (project) =>
        set((state) => {
          const newProject = { ...project, id: `proj-${Date.now()}` };
          return { projects: [...state.projects, newProject] };
        }),
      updateProject: (projectToUpdate) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectToUpdate.id ? projectToUpdate : p
          ),
        })),
      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          tasks: state.tasks.map((t) =>
            t.projectId === projectId ? { ...t, projectId: undefined } : t
          ),
        })),

      // Settings Actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setView: (view) => {
        // @ts-ignore
        if (document.startViewTransition) {
            // @ts-ignore
            document.startViewTransition(() => {
                set(state => ({ settings: { ...state.settings, view } }));
            });
        } else {
            set(state => ({ settings: { ...state.settings, view } }));
        }
      },

      // Data Actions
      exportData: () => {
        try {
            const dataToExport = {
                tasks: get().tasks,
                projects: get().projects,
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
      },
      importData: (event) => {
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
                      set({ tasks: tasksWithDates, projects: importedData.projects });
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
      },
    }),
    {
      name: 'devweek-task-planner-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist a subset of the state
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        settings: state.settings,
      }),
      onRehydrateStorage: (state) => {
        if (state.settings.darkMode) {
          document.documentElement.classList.add('dark');
        }
      }
    }
  )
);

useStore.subscribe(
  (state) => state.settings.darkMode,
  (darkMode) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d1117');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
  }
);

// This effect handles the initial data seeding if the store is empty.
const unsub = useStore.subscribe(
  (state) => state.tasks,
  (tasks, prevState) => {
    // Only seed data if the store was empty and is now being initialized.
    if (prevState.length === 0 && tasks.length === 0 && useStore.getState().projects.length === 0) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const initialTasks: Task[] = [
        { id: '1', title: 'Setup project structure', description: 'Initialize repository and configure tooling.', date: today, status: 'completed', estimatedHours: 2, startTime: '09:00', priority: 'high', tags: ['setup', 'config'], projectId: 'proj-1' },
        { id: '2', title: 'Design component library', description: 'Create base components for the UI.', date: today, status: 'active', estimatedHours: 4, startTime: '11:00', priority: 'high', tags: ['design', 'ui'], projectId: 'proj-1' },
        { id: '3', title: 'Implement drag and drop', description: 'Use HTML5 Drag and Drop API for task movement.', date: tomorrow, status: 'todo', estimatedHours: 3, startTime: '10:00', priority: 'medium', tags: ['feature', 'core'], projectId: 'proj-2' },
        { id: '4', title: 'Refactor state management', description: 'Consider using a context or reducer for complex state.', date: null, status: 'inbox', estimatedHours: 5, priority: 'low', tags: ['refactor', 'tech-debt'] },
        { id: '5', title: 'Deploy to production', description: 'Setup CI/CD pipeline and deploy.', date: today, status: 'todo', estimatedHours: 2, startTime: '16:00', priority: 'urgent', tags: ['devops', 'release'], projectId: 'proj-2' },
      ];

      const initialProjects: Project[] = [
        { id: 'proj-1', name: 'Phoenix Project', color: '#6366f1' },
        { id: 'proj-2', name: 'Titan Initiative', color: '#10b981' },
      ];

      useStore.setState({ tasks: initialTasks, projects: initialProjects });

      unsub();
    }
  },
  { fireImmediately: true }
);

export default useStore;
