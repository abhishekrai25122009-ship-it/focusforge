'use client';

import React, { useState } from 'react';
import { StudySession } from '../types/focus';
import { CalendarIcon, PlusIcon, PlayIcon, TrashIcon, BellIcon } from './Icons';

interface UpcomingSessionsProps {
  sessions: StudySession[];
  onToggleSessionCompleted: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenNewSessionModal: () => void;
  onStartSessionInTimer: (sessionTitle: string) => void;
}

export default function UpcomingSessions({
  sessions,
  onToggleSessionCompleted,
  onDeleteSession,
  onOpenNewSessionModal,
  onStartSessionInTimer,
}: UpcomingSessionsProps) {
  // Local state to track which sessions have notifications armed
  const [remindersArmed, setRemindersArmed] = useState<Record<string, boolean>>({
    's-1': true,
  });

  const toggleReminder = (id: string) => {
    setRemindersArmed((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getFormatBadge = (type: StudySession['type']) => {
    switch (type) {
      case 'Exam Prep':
        return (
          <span className="rounded-md border border-[#FF9F43]/40 bg-[#FF9F43]/15 px-2 py-0.5 text-[10px] font-bold text-[#FF9F43]">
            Exam Prep
          </span>
        );
      case 'Group':
        return (
          <span className="rounded-md border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 px-2 py-0.5 text-[10px] font-bold text-[#A78BFA]">
            Group
          </span>
        );
      case 'Lab':
        return (
          <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            Lab
          </span>
        );
      case 'Solo':
      default:
        return (
          <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
            Solo
          </span>
        );
    }
  };

  return (
    <div
      id="study-planner-section"
      className="flex flex-col rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#262632]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 text-[#8B5CF6]">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Upcoming Sessions</h2>
            <p className="text-xs text-zinc-400">Scheduled study blocks & collaborative sprints</p>
          </div>
        </div>

        <button
          onClick={onOpenNewSessionModal}
          className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1.5 text-xs font-bold text-[#A78BFA] hover:bg-[#8B5CF6]/30 transition-colors"
        >
          <PlusIcon size={14} />
          <span>Schedule</span>
        </button>
      </div>

      {/* Session Cards */}
      <div className="mt-4 flex flex-col gap-3">
        {sessions.map((session) => {
          const isReminded = remindersArmed[session.id];

          return (
            <div
              key={session.id}
              className={`group flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                session.completed
                  ? 'border-[#262632]/60 bg-[#121217]/50 opacity-60'
                  : 'border-[#262632] bg-[#101014] hover:border-zinc-700'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleSessionCompleted(session.id)}
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    session.completed
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-zinc-600 hover:border-[#8B5CF6]'
                  }`}
                  aria-label={session.completed ? 'Mark session incomplete' : 'Mark session complete'}
                >
                  {session.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        session.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
                      }`}
                    >
                      {session.title}
                    </span>
                    {getFormatBadge(session.type)}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">{session.subject}</span>
                    <span>•</span>
                    <span className="text-[#FF9F43]">{session.time}</span>
                    <span>•</span>
                    <span>{session.durationMinutes} mins</span>
                  </div>

                  {session.notes && (
                    <p className="mt-1 text-xs text-zinc-400 italic">“{session.notes}”</p>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center justify-end gap-2 border-t border-[#262632]/50 pt-2 sm:border-t-0 sm:pt-0">
                {/* Arm Reminder Button */}
                <button
                  onClick={() => toggleReminder(session.id)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isReminded
                      ? 'border-[#FF9F43]/40 bg-[#FF9F43]/15 text-[#FF9F43]'
                      : 'border-[#262632] bg-[#191920] text-zinc-400 hover:text-white'
                  }`}
                  title={isReminded ? 'Notification armed for this session' : 'Set reminder'}
                  aria-label="Toggle session reminder"
                >
                  <BellIcon size={14} />
                </button>

                {/* Launch into focus timer */}
                {!session.completed && (
                  <button
                    onClick={() => onStartSessionInTimer(session.title)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1.5 text-xs font-semibold text-[#A78BFA] hover:bg-[#8B5CF6]/30 transition-all"
                  >
                    <PlayIcon size={12} />
                    <span>Launch</span>
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                  title="Remove session"
                  aria-label="Remove session"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
