'use client';

import React, { useState } from 'react';
import { Task, Priority } from '../types/focus';
import { CheckSquareIcon, PlusIcon, TrashIcon, PlayIcon, ClockIcon, SparklesIcon } from './Icons';

interface TaskSectionProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
  onSelectTaskForTimer: (taskId: string) => void;
  selectedTaskId: string | null;
}

export default function TaskSection({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onSelectTaskForTimer,
  selectedTaskId,
}: TaskSectionProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="rounded-md border border-[#FF9F43]/40 bg-[#FF9F43]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF9F43]">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Med
          </span>
        );
      case 'low':
        return (
          <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Low
          </span>
        );
    }
  };

  return (
    <div
      id="tasks-section"
      className="flex flex-col rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm"
    >
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 text-[#8B5CF6]">
            <CheckSquareIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Today&apos;s Tasks</h2>
              <span className="rounded-full bg-[#262632] px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {completedCount} / {tasks.length}
              </span>
            </div>
            <p className="text-xs text-zinc-400">Check off items to boost your daily score</p>
          </div>
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[#262632] bg-[#101014] p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-[#262632] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-[#262632] text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pending ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-[#262632] text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1.5 text-xs font-bold text-[#A78BFA] hover:bg-[#8B5CF6]/30 transition-colors"
          >
            <PlusIcon size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-5 flex flex-col gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#262632] py-12 text-center">
            <SparklesIcon size={24} className="text-zinc-500 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No tasks in this view</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {filter === 'completed' ? 'Mark a task completed to view it here.' : 'Add your first study task above!'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isAttachedToTimer = selectedTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`group relative flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                  task.completed
                    ? 'border-[#262632]/60 bg-[#14141a]/60 opacity-60'
                    : isAttachedToTimer
                    ? 'border-[#8B5CF6]/60 bg-[#1f1e29] shadow-sm'
                    : 'border-[#262632] bg-[#101014] hover:border-zinc-700'
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-start gap-3 sm:items-center">
                  {/* Custom Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all sm:mt-0 ${
                      task.completed
                        ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                        : 'border-[#383848] bg-[#191920] hover:border-[#8B5CF6]'
                    }`}
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                  >
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>

                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium transition-all ${
                        task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Metadata tags */}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {/* Subject Badge */}
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${task.subjectColor}20`,
                          color: task.subjectColor,
                          border: `1px solid ${task.subjectColor}40`,
                        }}
                      >
                        {task.subject}
                      </span>

                      {/* Priority Badge */}
                      {getPriorityBadge(task.priority)}

                      {/* Due Time */}
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <ClockIcon size={11} />
                        {task.dueTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-[#262632]/50 pt-2 sm:border-t-0 sm:pt-0">
                  {/* Focus on this task button */}
                  {!task.completed && (
                    <button
                      onClick={() => onSelectTaskForTimer(task.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                        isAttachedToTimer
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'border border-[#262632] bg-[#191920] text-zinc-300 hover:border-[#8B5CF6]/50 hover:text-white'
                      }`}
                      title="Attach task to Focus Timer"
                    >
                      <PlayIcon size={12} />
                      <span>{isAttachedToTimer ? 'In Focus' : 'Focus'}</span>
                    </button>
                  )}

                  {/* Estimated pomodoros */}
                  <span className="rounded-lg bg-[#191920] border border-[#262632] px-2 py-1 text-[11px] font-medium text-zinc-400">
                    {task.estimatedPomodoros} 🍅
                  </span>

                  {/* Delete Task */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
