'use client';

import React from 'react';
import {
  LayoutDashboardIcon,
  CheckSquareIcon,
  TimerIcon,
  BookOpenIcon,
  SettingsIcon,
  FlameIcon,
  XIcon,
} from './Icons';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  completedTasksCount: number;
  totalTasksCount: number;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  completedTasksCount,
  totalTasksCount,
}: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquareIcon,
      badge: `${completedTasksCount}/${totalTasksCount}`,
    },
    { id: 'timer', label: 'Focus Timer', icon: TimerIcon, pill: '25m' },
    { id: 'planner', label: 'Study Planner', icon: BookOpenIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#262632] bg-[#101014] p-5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#FF9F43] p-0.5 shadow-lg shadow-[#8B5CF6]/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#101014]">
                  <FlameIcon className="text-[#FF9F43]" size={22} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">
                    Focus<span className="text-[#8B5CF6]">Forge</span>
                  </span>
                  <span className="rounded bg-[#8B5CF6]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#8B5CF6] border border-[#8B5CF6]/30">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Student Productivity OS</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-[#191920] hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#191920] text-white shadow-sm border border-[#8B5CF6]/40'
                      : 'text-zinc-400 hover:bg-[#191920]/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                          : 'bg-[#191920] text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="rounded-full bg-[#262632] px-2 py-0.5 text-xs font-semibold text-zinc-300">
                      {item.badge}
                    </span>
                  )}

                  {item.pill && (
                    <span className="rounded-full bg-[#FF9F43]/15 border border-[#FF9F43]/30 px-2 py-0.5 text-[11px] font-bold text-[#FF9F43]">
                      {item.pill}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-[#8B5CF6]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Status */}
        <div className="flex flex-col gap-3 pt-6 border-t border-[#262632]">
          {/* Quick Streak Widget */}
          <div className="rounded-xl border border-[#262632] bg-[#191920]/70 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Daily Target</span>
              <span className="font-semibold text-[#FF9F43]">85%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#262632]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#FF9F43]"
                style={{ width: '85%' }}
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#191920]">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#7C3AED] text-sm font-bold text-white shadow-md">
                AR
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#101014] bg-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-medium text-white">Alex Rivera</span>
              <span className="truncate text-xs text-zinc-400">CS & Math • Year 3</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
