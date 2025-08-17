

import React, { useState } from 'react';
import { Task } from '../types';
import { generateTasksFromGoal } from '../services/geminiService';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useFocusTrap } from '../hooks/usePomodoro';

interface AIAssistantModalProps {
  onClose: () => void;
  onTasksGenerated: (tasks: Omit<Task, 'id' | 'date' | 'status'>[]) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose, onTasksGenerated }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useFocusTrap(true);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError("Please enter a goal.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const tasks = await generateTasksFromGoal(goal);
      onTasksGenerated(tasks);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div ref={modalRef} className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl w-full max-w-2xl border border-neutral-300 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Task Assistant</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Enter a high-level goal or feature idea
            </label>
            <textarea
              name="goal"
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={5}
              placeholder="e.g., 'Build a login page with email/password and Google sign-in'"
              className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-600 rounded-md p-3 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        </div>
        <div className="p-6 bg-slate-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900 transition-colors" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-neutral-800 dark:text-neutral-950 dark:bg-neutral-200 rounded-lg shadow-md hover:bg-neutral-700 dark:hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generating...
              </>
            ) : (
             <>
               <Sparkles className="w-4 h-4"/>
               Generate Tasks
             </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;