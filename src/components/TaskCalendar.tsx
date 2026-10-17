'use client';

import React, { useMemo, useState } from 'react';
import { Task } from '../types/focus';
import { CalendarIcon, PlusIcon, TrashIcon } from './Icons';

interface TaskCalendarProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isValidISODate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseLocalDate(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function startOfMonthWeekday(year: number, month: number): number {
  return new Date(year, month - 1, 1, 12, 0, 0, 0).getDay();
}

export default function TaskCalendar({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenNewTaskModal,
}: TaskCalendarProps) {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [viewYear, setViewYear] = useState<number>(now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);

  // Group valid tasks by their local dueDate (YYYY-MM-DD).
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!isValidISODate(task.dueDate)) continue;
      const parsed = parseLocalDate(task.dueDate);
      if (!parsed) continue;
      const key = `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`;
      const existing = map.get(key);
      if (existing) existing.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [tasks]);

  const daysInViewMonth = daysInMonth(viewYear, viewMonth);
  const firstWeekday = startOfMonthWeekday(viewYear, viewMonth);

  const gridCells: Array<{
    day: number;
    dateKey: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    taskCount: number;
  }> = [];

  // Padding from previous month.
  const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
  const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
  const prevDays = daysInMonth(prevYear, prevMonth);
  for (let i = firstWeekday - 1; i >= 0; i--) {
    gridCells.push({
      day: prevDays - i,
      dateKey: '',
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      taskCount: 0,
    });
  }

  // Current month days.
  for (let day = 1; day <= daysInViewMonth; day++) {
    const dateKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    gridCells.push({
      day,
      dateKey,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isSelected: selectedDate === dateKey,
      taskCount: tasksByDate.get(dateKey)?.length ?? 0,
    });
  }

  // Padding from next month.
  const totalCells = Math.ceil((firstWeekday + daysInViewMonth) / 7) * 7;
  for (let i = gridCells.length; i < totalCells; i++) {
    gridCells.push({
      day: i - firstWeekday - daysInViewMonth + 1,
      dateKey: '',
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      taskCount: 0,
    });
  }

  const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) ?? [] : [];

  const handlePrevMonth = () => {
    setViewMonth((m) => (m === 1 ? 12 : m - 1));
    setViewYear((y) => (viewMonth === 1 ? y - 1 : y));
  };

  const handleNextMonth = () => {
    setViewMonth((m) => (m === 12 ? 1 : m + 1));
    setViewYear((y) => (viewMonth === 12 ? y + 1 : y));
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-white">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#262632] bg-[#101014] text-zinc-400 hover:text-white hover:bg-[#191920] transition-all focus-ring"
          >
            <CalendarIcon size={14} />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#262632] bg-[#101014] text-zinc-400 hover:text-white hover:bg-[#191920] transition-all focus-ring"
          >
            <CalendarIcon size={14} />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold text-zinc-400 uppercase mb-2">
        {WEEKDAY_SHORT.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {gridCells.map((cell) => (
          <button
            key={cell.dateKey || `pad-${cell.day}`}
            onClick={() => (cell.isCurrentMonth ? setSelectedDate(cell.dateKey) : undefined)}
            disabled={!cell.isCurrentMonth}
            aria-label={cell.dateKey ? `Select ${cell.dateKey}` : undefined}
            className={`flex flex-col items-center justify-center h-10 rounded-lg transition-colors ${cell.isCurrentMonth ? 'text-white hover:bg-[#191920]' : 'text-zinc-500 hover:text-zinc-400'} ${cell.isSelected ? 'bg-[#DC2626]' : ''} ${cell.isToday ? 'ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-[#191920]' : ''}`}
          >
            <span className="text-[11px]">{cell.day}</span>
            {cell.isCurrentMonth && cell.taskCount > 0 && (
              <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-[#DC2626]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                {cell.taskCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (
        <div className="mt-6 border border-[#262632] rounded-xl bg-[#101014] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">{selectedDate}</h3>
            <button
              onClick={onOpenNewTaskModal}
              aria-label="Add task for this date"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/20 transition-all focus-ring"
            >
              <PlusIcon size={12} />
              <span>Add Task</span>
            </button>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No tasks due on this date.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border p-2 ${task.completed ? 'border-[#262632]/60 bg-[#14141a]/40 opacity-60' : 'border-[#262632] bg-[#101014]'}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all focus-ring ${task.completed ? 'border-[#DC2626] bg-[#DC2626] text-white' : 'border-[#383848] bg-[#191920] hover:border-[#DC2626]'}`}
                      aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                    >
                      {task.completed && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-xs font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="rounded-md px-1 py-0.5 text-[9px] font-semibold"
                          style={{
                            backgroundColor: `${task.subjectColor}20`,
                            color: task.subjectColor,
                            border: `1px solid ${task.subjectColor}40`,
                          }}
                        >
                          {task.subject}
                        </span>
                        <span
                          className="rounded-md px-1 py-0.5 text-[9px] font-semibold"
                          style={{ backgroundColor: '#191920', border: '1px solid #262632', color: '#F59E0B' }}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[9px] text-zinc-400">{task.dueTime}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-all focus-ring"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
