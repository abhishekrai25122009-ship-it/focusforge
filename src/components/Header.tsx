'use client';

import React from 'react';
import { MenuIcon, PlusIcon, SparklesIcon, BellIcon, PlayIcon } from './Icons';

interface HeaderProps {
  onOpenSidebar: () => void;
  onAddTask: () => void;
  onQuickFocus: () => void;
  isTimerRunning: boolean;
}

export default function Header({
  onOpenSidebar,
  onAddTask,
  onQuickFocus,
  isTimerRunning,
}: HeaderProps) {
  const todayFormatted = 'Thursday, October 24, 2026';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#262632] bg-[#101014]/85 px-4 py-4 backdrop-blur-md sm:px-8">
      {/* Left Greeting & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262632] bg-[#191920] text-zinc-300 hover:text-white lg:hidden focus-ring"
          aria-label="Open sidebar menu"
        >
          <MenuIcon size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Ready to make today count?
            </h1>
            <span className="hidden items-center gap-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2 py-0.5 text-xs font-semibold text-[#F59E0B] sm:inline-flex">
              <SparklesIcon size={12} />
              Midterms Week
            </span>
          </div>
          <p className="text-xs text-zinc-400 sm:text-sm">{todayFormatted} • 3 priority tasks scheduled</p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Focus Button */}
        <button
          onClick={onQuickFocus}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
            isTimerRunning
              ? 'border border-[#F59E0B]/40 bg-[#F59E0B]/15 text-[#F59E0B] animate-pulse'
              : 'border border-[#DC2626]/40 bg-[#DC2626]/15 text-[#F87171] hover:bg-[#DC2626]/25'
          }`}
          title="Jump to Focus Timer"
        >
          <PlayIcon size={14} className={isTimerRunning ? 'text-[#F59E0B]' : 'text-[#DC2626]'} />
          <span className="hidden sm:inline">{isTimerRunning ? 'Timer Active' : 'Quick Sprint'}</span>
        </button>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#991B1B] px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#DC2626]/25 transition-all hover:brightness-110 sm:text-sm focus-ring"
        >
          <PlusIcon size={16} />
          <span>New Task</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#262632] bg-[#191920] text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
          aria-label="Notifications"
          title="No unread alerts"
        >
          <BellIcon size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#F59E0B] ring-2 ring-[#191920]" />
        </button>
      </div>
    </header>
  );
}
