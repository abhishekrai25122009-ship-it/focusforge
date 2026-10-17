'use client';

import React, { useEffect, useRef, useState } from 'react';
import { XIcon, PlusIcon, CalendarIcon } from './Icons';
import { StudySession } from '../types/focus';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (session: Omit<StudySession, 'id' | 'completed'>) => void;
}

export default function NewSessionModal({ isOpen, onClose, onAddSession }: NewSessionModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [time, setTime] = useState('Today, 6:30 PM');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [type, setType] = useState<StudySession['type']>('Group');
  const [notes, setNotes] = useState('');
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

    onAddSession({
      title: title.trim(),
      subject,
      time,
      durationMinutes,
      type,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setNotes('');
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
        <div className="flex items-center justify-between pb-4 border-b border-[#262632]">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-[#DC2626]" />
            <h2 className="text-lg font-bold text-white">Schedule Study Session</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-[#101014] hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Session Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              placeholder="e.g. Distributed Systems Paper Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#DC2626] transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as StudySession['type'])}
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
              >
                <option value="Solo">Solo Focus</option>
                <option value="Group">Group Study</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Lab">Lab Session</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Scheduled Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. Today, 7:00 PM"
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Duration (min)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring formula sheet, Discord room #study-a"
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2 text-sm text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
            />
          </div>

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
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#991B1B] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#DC2626]/30 hover:brightness-110 transition-all focus-ring"
            >
              <PlusIcon size={16} />
              <span>Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
