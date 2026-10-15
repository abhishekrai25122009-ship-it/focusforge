'use client';

import React, { useState } from 'react';
import { XIcon, PlusIcon } from './Icons';
import { Priority, Task } from '../types/focus';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

const SUBJECT_OPTIONS = [
  { name: 'Computer Science', color: '#8B5CF6' },
  { name: 'Applied Mathematics', color: '#FF9F43' },
  { name: 'Physics & Signals', color: '#38BDF8' },
  { name: 'Human-Computer Interaction', color: '#34D399' },
  { name: 'Algorithms & Data Structures', color: '#F43F5E' },
];

export default function NewTaskModal({ isOpen, onClose, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueTime, setDueTime] = useState('Today, 5:00 PM');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedSub = SUBJECT_OPTIONS[subjectIndex];
    onAddTask({
      title: title.trim(),
      subject: selectedSub.name,
      subjectColor: selectedSub.color,
      priority,
      dueTime,
      estimatedPomodoros,
    });

    setTitle('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262632]">
          <h2 className="text-lg font-bold text-white">Add New Study Task</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-[#101014] hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Task Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solve Dynamic Programming Set 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#8B5CF6] transition-colors"
              autoFocus
            />
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Subject
            </label>
            <select
              value={subjectIndex}
              onChange={(e) => setSubjectIndex(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#8B5CF6] transition-colors"
            >
              {SUBJECT_OPTIONS.map((sub, idx) => (
                <option key={sub.name} value={idx}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Pomodoros */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#8B5CF6] transition-colors"
              >
                <option value="high">High (Urgent)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Est. Pomodoros
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={estimatedPomodoros}
                onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Due Target
            </label>
            <input
              type="text"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="e.g. Tonight, 8:00 PM"
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>

          {/* Submit Actions */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-[#262632]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-[#101014] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/30 hover:brightness-110 transition-all"
            >
              <PlusIcon size={16} />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
