'use client';

import React from 'react';
import { CheckCircleIcon, ClockIcon, FlameIcon, TargetIcon, TrendingUpIcon } from './Icons';

interface StatCardsProps {
  completedTasks: number;
  totalTasks: number;
  studyMinutes: number;
  streakDays: number;
  targetDailyMinutes: number;
}

export default function StatCards({
  completedTasks,
  totalTasks,
  studyMinutes,
  streakDays,
  targetDailyMinutes,
}: StatCardsProps) {
  // Dynamic percentages
  const taskPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Format study minutes into hours and mins
  const hours = Math.floor(studyMinutes / 60);
  const mins = studyMinutes % 60;
  const studyTimeFormatted = `${hours}h ${mins}m`;

  // Daily overall progress calculation (weighted 60% tasks, 40% study time target)
  const timeProgressRatio = Math.min(1, studyMinutes / targetDailyMinutes);
  const taskProgressRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const overallProgressPercentage = Math.round((taskProgressRatio * 0.6 + timeProgressRatio * 0.4) * 100);

  const stats = [
    {
      id: 'tasks',
      title: 'Tasks Completed',
      value: `${completedTasks} / ${totalTasks}`,
      subtext: `${taskPercentage}% completed today`,
      progress: taskPercentage,
      icon: CheckCircleIcon,
      accentColor: '#8B5CF6',
      badgeColor: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30',
      barGradient: 'from-[#8B5CF6] to-[#7C3AED]',
    },
    {
      id: 'time',
      title: 'Study Time',
      value: studyTimeFormatted,
      subtext: `Target: ${Math.floor(targetDailyMinutes / 60)}h ${targetDailyMinutes % 60}m`,
      progress: Math.min(100, Math.round(timeProgressRatio * 100)),
      icon: ClockIcon,
      accentColor: '#8B5CF6',
      badgeColor: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30',
      barGradient: 'from-[#8B5CF6] to-[#A78BFA]',
    },
    {
      id: 'streak',
      title: 'Current Streak',
      value: `${streakDays} Days`,
      subtext: 'Record: 12 days • On fire!',
      progress: (streakDays / 12) * 100,
      icon: FlameIcon,
      accentColor: '#FF9F43',
      badgeColor: 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30',
      barGradient: 'from-[#FF9F43] to-[#FB923C]',
    },
    {
      id: 'progress',
      title: 'Daily Progress',
      value: `${overallProgressPercentage}%`,
      subtext: overallProgressPercentage >= 100 ? 'Daily goal reached! 🎯' : 'On track to hit daily target',
      progress: Math.min(100, overallProgressPercentage),
      icon: TargetIcon,
      accentColor: '#FF9F43',
      badgeColor: 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/30',
      barGradient: 'from-[#8B5CF6] via-[#A78BFA] to-[#FF9F43]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#262632] bg-[#191920] p-5 shadow-sm transition-all hover:border-[#8B5CF6]/40 hover:shadow-md hover:shadow-black/40"
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{stat.title}</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.badgeColor} transition-transform group-hover:scale-105`}
              >
                <Icon size={18} />
              </div>
            </div>

            {/* Middle: Big Stat Value */}
            <div className="my-3">
              <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                {stat.id === 'time' && (
                  <TrendingUpIcon size={13} className="text-emerald-400" />
                )}
                <span>{stat.subtext}</span>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#101014]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${stat.barGradient} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(4, Math.min(100, stat.progress))}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
