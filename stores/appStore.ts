import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Project, Settings, ViewMode } from '../types';

interface AppState {
  // Data state
  tasks: Task[];
  projects: Project[];
  
  // UI state
  currentDate: Date;
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  isSettingsOpen: boolean;
  isCommandKOpen: boolean;
  isSidebarOpen: boolean;
  toastMessage: string;
  
  // Settings state
  settings: Settings;
  
  // Actions
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedTask: (task: Task | null) => void;
  setIsTaskModalOpen: (isOpen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsCommandKOpen: (isOpen: boolean) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setToastMessage: (message: string) => void;
  setSettings: (settings: Settings | ((prev: Settings) => Settings)) => void;
  setView: (view: ViewMode) => void;
  
  // Initialize with default data
  initializeDefaultData: () => void;
}

const defaultSettings: Settings = {
  darkMode: true,
  hideWeekends: false,
  view: 'weekly',
  showInbox: true,
  notificationsEnabled: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      projects: [],
      currentDate: new Date(),
      selectedTask: null,
      isTaskModalOpen: false,
      isSettingsOpen: false,
      isCommandKOpen: false,
      isSidebarOpen: false,
      toastMessage: '',
      settings: defaultSettings,
      
      // Actions
      setTasks: (tasks) => set((state) => ({
        tasks: typeof tasks === 'function' ? tasks(state.tasks) : tasks
      })),
      
      setProjects: (projects) => set((state) => ({
        projects: typeof projects === 'function' ? projects(state.projects) : projects
      })),
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      setSelectedTask: (task) => set({ selectedTask: task }),
      
      setIsTaskModalOpen: (isOpen) => set({ isTaskModalOpen: isOpen }),
      
      setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      
      setIsCommandKOpen: (isOpen) => set({ isCommandKOpen: isOpen }),
      
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      
      setToastMessage: (message) => set({ toastMessage: message }),
      
      setSettings: (settings) => set((state) => ({
        settings: typeof settings === 'function' ? settings(state.settings) : settings
      })),
      
      setView: (view) => {
        // @ts-ignore - document.startViewTransition is a new API
        if (document.startViewTransition) {
          // @ts-ignore
          document.startViewTransition(() => {
            set((state) => ({ settings: { ...state.settings, view } }));
          });
        } else {
          set((state) => ({ settings: { ...state.settings, view } }));
        }
      },
      
      initializeDefaultData: () => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        set({
          tasks: [
            { id: '1', title: 'Setup project structure', description: 'Initialize repository and configure tooling.', date: today, status: 'completed', estimatedHours: 2, startTime: '09:00', priority: 'high', tags: ['setup', 'config'], projectId: 'proj-1' },
            { id: '2', title: 'Design component library', description: 'Create base components for the UI.', date: today, status: 'active', estimatedHours: 4, startTime: '11:00', priority: 'high', tags: ['design', 'ui'], projectId: 'proj-1' },
            { id: '3', title: 'Implement drag and drop', description: 'Use HTML5 Drag and Drop API for task movement.', date: tomorrow, status: 'todo', estimatedHours: 3, startTime: '10:00', priority: 'medium', tags: ['feature', 'core'], projectId: 'proj-2' },
            { id: '4', title: 'Refactor state management', description: 'Consider using a context or reducer for complex state.', date: null, status: 'inbox', estimatedHours: 5, priority: 'low', tags: ['refactor', 'tech-debt'] },
            { id: '5', title: 'Deploy to production', description: 'Setup CI/CD pipeline and deploy.', date: today, status: 'todo', estimatedHours: 2, startTime: '16:00', priority: 'urgent', tags: ['devops', 'release'], projectId: 'proj-2' },
          ],
          projects: [
            { id: 'proj-1', name: 'Phoenix Project', color: '#6366f1' },
            { id: 'proj-2', name: 'Titan Initiative', color: '#10b981' },
          ]
        });
      }
    }),
    {
      name: 'devweek-app-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        settings: state.settings,
      }),
      // Custom storage to maintain compatibility with existing localStorage keys
      storage: {
        getItem: (name) => {
          try {
            // Try to get from the new unified storage first
            const item = localStorage.getItem(name);
            if (item) {
              return JSON.parse(item);
            }
            
            // Fall back to legacy keys for migration
            const tasks = localStorage.getItem('devweek-tasks');
            const projects = localStorage.getItem('devweek-projects');
            const settings = localStorage.getItem('devweek-settings');
            
            if (tasks || projects || settings) {
              const data: any = {};
              
              if (tasks) {
                const parsedTasks = JSON.parse(tasks);
                data.tasks = parsedTasks.map((task: any) => ({
                  ...task,
                  date: task.date ? new Date(task.date) : null,
                }));
              }
              
              if (projects) {
                data.projects = JSON.parse(projects);
              }
              
              if (settings) {
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                data.settings = { ...defaultSettings, darkMode: prefersDark, ...JSON.parse(settings) };
              }
              
              // Save to new format and clean up old keys
              localStorage.setItem(name, JSON.stringify(data));
              localStorage.removeItem('devweek-tasks');
              localStorage.removeItem('devweek-projects');
              localStorage.removeItem('devweek-settings');
              
              return data;
            }
            
            return null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply dark mode class to root element
          if (state.settings.darkMode) {
            document.documentElement.classList.add('dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d1117');
          } else {
            document.documentElement.classList.remove('dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
          }
        }
      },
    }
  )
);

// Initialize store with settings and default data
export const initializeApp = () => {
  const store = useAppStore.getState();
  
  // If no data exists, initialize with defaults
  if (store.tasks.length === 0 && store.projects.length === 0) {
    store.initializeDefaultData();
  }
  
  // Apply initial dark mode
  if (store.settings.darkMode) {
    document.documentElement.classList.add('dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d1117');
  } else {
    document.documentElement.classList.remove('dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
  }
};