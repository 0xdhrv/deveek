import { useEffect } from 'react';
import useStore from '../store/useStore';
import { PomodoroControls } from '../components/PomodoroTimer';

interface useKeyboardShortcutsProps {
    pomodoroControls: PomodoroControls;
    setCurrentDate: (date: Date) => void;
}

export const useKeyboardShortcuts = ({ pomodoroControls, setCurrentDate }: useKeyboardShortcutsProps) => {
    const {
        setView,
        transient: {
            isTaskModalOpen,
            isSettingsOpen,
            isCommandKOpen,
            openTaskModal,
            toggleSettingsModal,
            toggleCommandKMenu,
            showToast,
        }
    } = useStore();

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
                switch (actionKey) {
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
    }, [isTaskModalOpen, isSettingsOpen, isCommandKOpen, setView, pomodoroControls.toggleTimer, showToast, toggleCommandKMenu, toggleSettingsModal, openTaskModal, setCurrentDate]);
};
