

import React, { useState, useEffect } from 'react';
import { Command } from 'lucide-react';

const tips = [
    <>Press <kbd className="kbd-shortcut"><Command className="kbd-icon" /> K</kbd> to open the command menu.</>,
    <>Press <kbd className="kbd-shortcut">d</kbd> + <kbd className="kbd-shortcut">n</kbd> to create a new task.</>,
    <>Press <kbd className="kbd-shortcut">d</kbd> + <kbd className="kbd-shortcut">s</kbd> to open settings.</>,
    <>Press <kbd className="kbd-shortcut">d</kbd> + <kbd className="kbd-shortcut">p</kbd> to toggle the Pomodoro timer.</>,
    <>Press <kbd className="kbd-shortcut">d</kbd> + <kbd className="kbd-shortcut">t</kbd> to jump to today's date.</>,
    <>Double-click a project name in settings to edit it.</>,
    <>Drag and drop tasks between days or into the timeline.</>,
];

const Footer: React.FC = () => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTipIndex(prevIndex => (prevIndex + 1) % tips.length);
        }, 8000); // Change tip every 8 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="flex-shrink-0 p-2 text-center border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <style>
                {`.kbd-shortcut { 
                    padding: 0.2rem 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgb(71 85 105 / 1);
                    background-color: rgb(241 245 249 / 1);
                    border: 1px solid rgb(203 213 225 / 1);
                    border-radius: 0.25rem;
                }
                .dark .kbd-shortcut {
                    color: rgb(203 213 225 / 1);
                    background-color: rgb(30 41 59 / 1);
                    border-color: rgb(51 65 85 / 1);
                }
                .kbd-icon {
                    display: inline-block;
                    width: 0.75rem;
                    height: 0.75rem;
                    margin-top: -0.1rem;
                }
                `}
            </style>
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-opacity duration-500">
                Pro-tip: {tips[currentTipIndex]}
            </p>
        </footer>
    );
};

export default Footer;