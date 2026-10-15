'use client';

import React from 'react';
import { SettingsIcon, SparklesIcon, FlameIcon } from './Icons';

interface SettingsViewProps {
  targetStudyHours: number;
  onUpdateTargetHours: (hours: number) => void;
  streakDays: number;
  onResetStreak: () => void;
}

export default function SettingsView({
  targetStudyHours,
  onUpdateTargetHours,
  streakDays,
  onResetStreak,
}: SettingsViewProps) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      <div className="flex items-center gap-3 pb-4 border-b border-[#262632]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 text-[#8B5CF6]">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Student Dashboard Settings</h2>
          <p className="text-xs text-zinc-400">Manage targets, study intervals, and account preferences</p>
        </div>
      </div>

      {/* Target Settings */}
      <div className="rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Daily Study Goal</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Adjust your daily focus target. Your dashboard stat cards and progress bars update in real time.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {[2, 3, 4, 5, 6].map((hours) => (
            <button
              key={hours}
              onClick={() => onUpdateTargetHours(hours)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                targetStudyHours === hours
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/25'
                  : 'border border-[#262632] bg-[#101014] text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {hours} Hours / Day
            </button>
          ))}
        </div>
      </div>

      {/* Profile & University Info */}
      <div className="rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Student Profile</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-400">Display Name</label>
            <input
              type="text"
              readOnly
              value="Alex Rivera"
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400">Major / Degree</label>
            <input
              type="text"
              readOnly
              value="B.S. Computer Science & Applied Mathematics"
              className="mt-1.5 w-full rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-sm text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Streak Management */}
      <div className="flex items-center justify-between rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FlameIcon size={18} className="text-[#FF9F43]" />
            <h3 className="text-sm font-bold text-white">Active Streak: {streakDays} Days</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Streak increments automatically with daily completed sessions.</p>
        </div>

        <button
          onClick={onResetStreak}
          className="rounded-xl border border-[#262632] bg-[#101014] px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-rose-800 hover:text-rose-400 transition-colors"
        >
          Reset Streak
        </button>
      </div>

      {/* Tech Stack Info */}
      <div className="rounded-2xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/5 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A78BFA]">
          <SparklesIcon size={14} />
          <span>Hackathon Environment Ready</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          FocusForge is operating in offline-first state mode using Next.js App Router, React 19, and Tailwind CSS.
        </p>
      </div>
    </div>
  );
}
