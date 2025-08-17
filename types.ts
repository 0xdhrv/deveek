export type TaskStatus = 'todo' | 'active' | 'completed' | 'inbox';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ViewMode = 'calendar' | 'weekly' | 'kanban' | 'list';
export type SortBy = 'default' | 'priority' | 'title';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  estimatedHours?: number;
  codeSnippet?: string;
  startTime?: string; // Format: "HH:mm"
  projectId?: string;
}

// A string representation of a date (e.g., '2023-10-27') or 'inbox'
export type DayIdentifier = string;

export interface Settings {
    darkMode: boolean;
    hideWeekends: boolean;
    view: ViewMode;
    showInbox: boolean;
    notificationsEnabled: boolean;
}

export interface CommandKAction {
  id: string;
  label: string;
  group: string;
  icon: React.ElementType;
  perform: () => void;
  keywords?: string;
  item?: Task | Project;
}