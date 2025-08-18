import React, { useState } from 'react';
import useStore from './store/useStore';
import Header from './components/Header';
import TaskModal from './components/TaskModal';
import SettingsModal from './components/SettingsModal';
import CommandKMenu from './components/CommandKMenu';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import ActiveViewRenderer from './components/ActiveViewRenderer';
import { usePomodoro } from './hooks/usePomodoro';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const {
    settings,
    transient,
  } = useStore();

  const {
    isTaskModalOpen,
    isSettingsOpen,
    isCommandKOpen,
    isSidebarOpen,
    toastMessage,
    toggleSettingsModal,
    toggleSidebar,
  } = transient;

  const pomodoroControls = usePomodoro({ 
    notificationsEnabled: settings.notificationsEnabled 
  });

  useKeyboardShortcuts({ pomodoroControls, setCurrentDate });

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
              <ActiveViewRenderer currentDate={currentDate} />
          </div>
        </main>
        <Footer />
      </div>

      {isTaskModalOpen && <TaskModal />}
      {isSettingsOpen && <SettingsModal />}
      {isCommandKOpen && <CommandKMenu pomodoroControls={pomodoroControls} />}

       {toastMessage && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-md text-sm shadow-lg animate-modal-fade-in z-50">
            {toastMessage}
          </div>
       )}
    </div>
  );
};

export default App;