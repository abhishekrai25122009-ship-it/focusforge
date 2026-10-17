'use client';

import React, { useState } from 'react';
import { ActivityDay } from '../types/focus';
import { TrendingUpIcon, FlameIcon } from './Icons';

interface ActivityChartProps {
  activityData: ActivityDay[];
}

export default function ActivityChart({ activityData }: ActivityChartProps) {
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);

  // Today is Thursday in our hackathon dataset
  const safeActivityData = Array.isArray(activityData) ? activityData : [];
  const normalizedActivityData = safeActivityData.map((item) => {
    if (item === null || typeof item !== 'object') {
      return { day: '', shortDay: '', hours: 0, targetHours: 0, sessionsCount: 0, isToday: false };
    }
    const hours =
      typeof item?.hours === 'number' && Number.isFinite(item.hours)
        ? Math.max(0, item.hours)
        : 0;
    const targetHours =
      typeof item?.targetHours === 'number' && Number.isFinite(item.targetHours) && item.targetHours >= 0
        ? item.targetHours
        : 0;
    const sessionsCount =
      typeof item?.sessionsCount === 'number' && Number.isFinite(item.sessionsCount)
        ? Math.max(0, Math.round(item.sessionsCount))
        : 0;
    return {
      ...item,
      day: typeof item?.day === 'string' ? item.day : '',
      shortDay: typeof item?.shortDay === 'string' ? item.shortDay : '',
      hours,
      targetHours,
      sessionsCount,
      isToday: Boolean(item?.isToday),
    };
  });
  const maxHours = normalizedActivityData.length > 0
    ? Math.max(...normalizedActivityData.map((d) => d.hours), 6)
    : 6;
  const totalWeeklyHours = normalizedActivityData.reduce((acc, curr) => acc + curr.hours, 0);
  const avgDailyHours = (
    normalizedActivityData.length > 0 ? totalWeeklyHours / normalizedActivityData.length : 0
  ).toFixed(1);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Weekly Focus Activity</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              <TrendingUpIcon size={12} />
              +14% vs last week
            </span>
          </div>
          <p className="text-xs text-zinc-400">Daily study hours distribution (Mon – Sun)</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-gradient-to-t from-[#DC2626] to-[#F87171]" />
            <span className="text-zinc-400">Deep Focus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#F59E0B]" />
            <span className="text-zinc-400">Peak Streak</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Area */}
      <div className="my-6">
        <div className="relative flex h-52 w-full items-end justify-between gap-2 px-2 pt-8 sm:gap-4">
          {/* Target guideline line at 4 hours */}
          <div
            className="pointer-events-none absolute left-0 right-0 border-b border-dashed border-[#DC2626]/30"
            style={{ bottom: `${(4 / maxHours) * 100}%` }}
          >
            <span className="absolute -top-4 right-2 text-[10px] font-semibold text-[#DC2626]/80">
              Daily Goal: 4.0h
            </span>
          </div>

          {/* Render 7 Days Bars */}
          {normalizedActivityData.map((item, index) => {
            const heightPercent = Math.max(0, Math.min(100, Math.round((item.hours / maxHours) * 100)));
            const isTargetMet = item.hours >= item.targetHours;

            return (
              <div
                key={item.day || `activity-day-${index}`}
                className="group relative flex flex-1 flex-col items-center h-full justify-end"
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Tooltip on hover */}
                <div
                  className={`pointer-events-none absolute -top-12 z-20 flex flex-col items-center rounded-lg border border-[#262632] bg-[#101014] px-2.5 py-1 text-center shadow-lg transition-all ${
                    hoveredDay?.day === item.day
                      ? 'opacity-100 scale-100 -translate-y-1'
                      : 'opacity-0 scale-95'
                  }`}
                >
                  <span className="text-[11px] font-bold text-white">{item.hours.toFixed(1)} hrs</span>
                  <span className="text-[9px] text-zinc-400">{item.sessionsCount} sessions</span>
                  <div className="absolute -bottom-1 h-2 w-2 rotate-45 border-r border-b border-[#262632] bg-[#101014]" />
                </div>

                {/* Bar */}
                <div className="relative flex w-full max-w-[42px] flex-col items-center justify-end rounded-xl bg-[#101014] p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ease-out ${
                      item.isToday
                        ? 'bg-gradient-to-t from-[#DC2626] via-[#F87171] to-[#F59E0B] shadow-md shadow-[#DC2626]/30'
                        : isTargetMet
                        ? 'bg-gradient-to-t from-[#DC2626] to-[#991B1B] group-hover:brightness-125'
                        : 'bg-zinc-800 group-hover:bg-zinc-700'
                    }`}
                    style={{ height: `${Math.max(item.hours > 0 ? 12 : 0, heightPercent)}%` }}
                  />
                </div>

                {/* Day Label */}
                <div className="mt-2.5 flex flex-col items-center">
                  <span
                    className={`text-xs font-semibold ${
                      item.isToday ? 'text-[#F59E0B]' : 'text-zinc-400'
                    }`}
                  >
                    {item.shortDay}
                  </span>
                  {item.isToday && (
                    <span className="h-1 w-1 rounded-full bg-[#F59E0B] mt-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#262632] pt-4 text-center">
        <div>
          <span className="text-[11px] font-medium text-zinc-400">Total Hours</span>
          <p className="text-sm font-bold text-white mt-0.5">{totalWeeklyHours.toFixed(1)} hrs</p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400">Daily Average</span>
          <p className="text-sm font-bold text-[#DC2626] mt-0.5">{avgDailyHours} hrs/day</p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400">Peak Streak</span>
          <p className="flex items-center justify-center gap-1 text-sm font-bold text-[#F59E0B] mt-0.5">
            <FlameIcon size={14} />
            <span>N/A</span>
          </p>
        </div>
      </div>
    </div>
  );
}
