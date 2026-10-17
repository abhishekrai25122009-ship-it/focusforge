'use client';

import React, { useEffect, useRef, useState } from 'react';
import { XIcon, PlusIcon } from './Icons';
import { Priority, Task } from '../types/focus';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

const SUBJECT_OPTIONS = [
  { name: 'Computer Science', color: '#DC2626' },
  { name: 'Applied Mathematics', color: '#F59E0B' },
  { name: 'Physics & Signals', color: '#38BDF8' },
  { name: 'Human-Computer Interaction', color: '#34D399' },
  { name: 'Algorithms & Data Structures', color: '#F43F5E' },
];

// Build a readable dueTime string for display from the optional ISO dueDate.
// Parses the date locally (year, month, day) to avoid UTC timezone shifts that
// can occur with new Date('YYYY-MM-DD').
function formatDueTime(isoDate: string): string {
  if (!isoDate) return 'No due date';
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `Due ${d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export default function NewTaskModal({ isOpen, onClose, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [examDate, setExamDate] = useState<string | null>(null);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('none');
  const [recurrenceError, setRecurrenceError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (!modalRef.current) return;
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter(el => !el.hasAttribute('disabled'));

        if (focusableElements.length === 0) return;

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        if (currentIndex === -1) {
          focusableElements[0].focus();
          return;
        }

        if (e.shiftKey) {
          const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[nextIndex].focus();
        } else {
          const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          focusableElements[nextIndex].focus();
        }
      }
    };

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    titleInputRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current) {
        const el = previousFocusRef.current;
        setTimeout(() => {
          if (document.body.contains(el)) {
            el.focus();
          }
        }, 0);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate: recurring tasks require a due date.
    if ((recurrence === 'daily' || recurrence === 'weekly') && !dueDate) {
      setRecurrenceError('A due date is required for recurring tasks.');
      return;
    }
    setRecurrenceError('');

    const selectedSub = SUBJECT_OPTIONS[subjectIndex];
    onAddTask({
      title: title.trim(),
      subject: selectedSub.name,
      subjectColor: selectedSub.color,
      priority,
      dueTime: formatDueTime(dueDate),
      estimatedPomodoros,
      dueDate: dueDate || undefined,
      examDate: examDate || null,
      recurrence: recurrence === 'none' ? undefined : recurrence,
    });

    setTitle('');
    setRecurrence('none');
    setRecurrenceError('');
    onClose();
  };

  return (
    <div
      ref={modalRef}
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
              ref={titleInputRef}
              type="text"
              required
              placeholder="e.g. Solve Dynamic Programming Set 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#DC2626] transition-colors"
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
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
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
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
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
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
            />
          </div>

          {/* Exam Date (optional) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate || ''}
              onChange={(e) => setExamDate(e.target.value || null)}
              placeholder="Optional exam date"
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Recurrence
            </label>
            <select
              value={recurrence}
              onChange={(e) =>
                setRecurrence(e.target.value as 'none' | 'daily' | 'weekly')
              }
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            {recurrenceError && (
              <p className="mt-1 text-xs text-red-400">{recurrenceError}</p>
            )}
          </div>

          {/* Submit Actions */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-[#262632]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-[#101014] hover:text-white transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#991B1B] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#DC2626]/30 hover:brightness-110 transition-all"
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
