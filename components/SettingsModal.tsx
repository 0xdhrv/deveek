

import React, { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { X, Settings as SettingsIcon, UploadCloud, DownloadCloud } from 'lucide-react';
import { Settings, Project } from '../types';
import ProjectManagement from './ProjectManagement';
import { useFocusTrap } from '../hooks/usePomodoro';

interface SettingsModalProps {
  onClose: () => void;
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, projects, onAddProject, onUpdateProject, onDeleteProject, onExport, onImport }) => {
  const { settings, setSettings } = useContext(SettingsContext);
  const modalRef = useFocusTrap(true);

  const handleToggleChange = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setSettings(prev => ({ ...prev, notificationsEnabled: true }));
        }
      }
    } else {
      setSettings(prev => ({ ...prev, notificationsEnabled: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-[modal-fade-in_0.2s_ease-out]">
      <div ref={modalRef} className="bg-white dark:bg-neutral-950 rounded-lg shadow-2xl w-full max-w-2xl border border-neutral-300 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-neutral-200 dark:border-neutral-700 pb-2">Display Options</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
            <button
              onClick={() => handleToggleChange('darkMode')}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 ${settings.darkMode ? 'bg-neutral-700' : 'bg-neutral-200 dark:bg-neutral-700'}`}
              aria-pressed={settings.darkMode}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Hide Weekends</span>
            <button
              onClick={() => handleToggleChange('hideWeekends')}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 ${settings.hideWeekends ? 'bg-neutral-700' : 'bg-neutral-200 dark:bg-neutral-700'}`}
               aria-pressed={settings.hideWeekends}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.hideWeekends ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Show Inbox in Weekly View</span>
            <button
              onClick={() => handleToggleChange('showInbox')}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 ${settings.showInbox ? 'bg-neutral-700' : 'bg-neutral-200 dark:bg-neutral-700'}`}
               aria-pressed={settings.showInbox}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.showInbox ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
           <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Desktop Notifications</span>
            <button
              onClick={handleNotificationToggle}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 ${settings.notificationsEnabled ? 'bg-neutral-700' : 'bg-neutral-200 dark:bg-neutral-700'}`}
               aria-pressed={settings.notificationsEnabled}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>

          <ProjectManagement 
                projects={projects}
                onAddProject={onAddProject}
                onUpdateProject={onUpdateProject}
                onDeleteProject={onDeleteProject}
            />
          
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-neutral-200 dark:border-neutral-700 pb-2 pt-4">Data Management</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950"
            >
              <DownloadCloud className="w-5 h-5" />
              Export Data
            </button>
            <label
              htmlFor="import-file"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950"
            >
              <UploadCloud className="w-5 h-5" />
              Import Data
              <input
                type="file"
                id="import-file"
                className="hidden"
                accept=".json"
                onChange={onImport}
              />
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export your tasks and projects to a JSON file for backup. Import a previously exported file to restore your data.
            <strong>Warning:</strong> Importing will overwrite all current tasks and projects.
          </p>

        </div>
        <div className="p-4 bg-slate-50 dark:bg-neutral-900/40 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-transparent rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950 transition-colors">
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;