'use client';

import React, { useRef } from 'react';
import { SettingsIcon, SparklesIcon, FlameIcon } from './Icons';

interface SettingsViewProps {
  targetStudyHours: number;
  onUpdateTargetHours: (hours: number) => void;
  streakDays: number;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export default function SettingsView({
  targetStudyHours,
  onUpdateTargetHours,
  streakDays,
  onExportBackup,
  onImportBackup,
}: SettingsViewProps) {
  const importFileInput = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      <div className="flex items-center gap-3 pb-4 border-b border-[#262632]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/15 text-[#DC2626]">
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
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all focus-ring ${
                targetStudyHours === hours
                  ? 'bg-gradient-to-r from-[#DC2626] to-[#991B1B] text-white shadow-lg shadow-[#DC2626]/25'
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
            <FlameIcon size={18} className="text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-white">Active Streak: {streakDays} Days</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Calculated automatically from completed study days. Your saved focus sessions and tasks are never removed by this dashboard.</p>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="rounded-2xl border border-[#DC2626]/30 bg-[#DC2626]/5 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F87171] mb-3">
          <SparklesIcon size={14} />
          <span>Backup &amp; Restore</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExportBackup}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all bg-[#DC2626]/20 border border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/30"
          >
            <SparklesIcon size={12} />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => importFileInput.current?.click()}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/30"
          >
            <SparklesIcon size={12} />
            <span>Import Backup</span>
          </button>
          <input
            ref={importFileInput}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target?.files?.[0];
              if (file) {
                onImportBackup(file);
              }
            }}
            className="hidden"
          />
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Export or restore your tasks and study sessions. Export downloads a JSON file; import replaces all current data
          with the backup contents.
        </p>
      </div>
    </div>
  );
}
