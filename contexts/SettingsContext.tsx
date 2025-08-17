import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Settings, ViewMode } from '../types';

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setView: (view: ViewMode) => void;
}

const defaultSettings: Settings = {
  darkMode: true,
  hideWeekends: false,
  view: 'weekly',
  showInbox: true,
  notificationsEnabled: false,
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
  setView: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('devweek-settings');
      if (storedSettings) {
        return { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error("Could not parse settings from localStorage", error);
    }
    // Default settings, also checking system preference for dark mode
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { ...defaultSettings, darkMode: prefersDark };
  });

  useEffect(() => {
    try {
      localStorage.setItem('devweek-settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
    
    // Apply dark mode class to root element
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0d1117');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
  }, [settings]);
  
  const setView = (view: ViewMode) => {
    // @ts-ignore - document.startViewTransition is a new API
    if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(() => {
            setSettings(s => ({ ...s, view }));
        });
    } else {
        setSettings(s => ({ ...s, view }));
    }
  };

  const value = useMemo(() => ({ settings, setSettings, setView }), [settings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};