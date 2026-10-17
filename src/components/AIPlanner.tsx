'use client';

import React, { useState } from 'react';
import { Task } from '../types/focus';
import { RotateCcwIcon, SparklesIcon } from './Icons';

interface PlannedTask {
  taskId: string;
  durationMinutes: number;
  order: number;
  reason: string;
}

// Message shown when the AI service is temporarily unavailable.
const AI_SERVICE_BUSY_MESSAGE =
  'The AI service is temporarily busy. Please try again shortly.';

interface AIPlannerProps {
  tasks: Task[];
}

export default function AIPlanner({ tasks }: AIPlannerProps) {
  const [targetMinutes, setTargetMinutes] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PlannedTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const incompleteTasks = tasks.filter((task) => !task.completed);

  const handleGeneratePlan = async () => {
    setError(null);
    setPlan(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: incompleteTasks, targetMinutes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate plan' }));
        if (response.status === 503) {
          throw new Error(AI_SERVICE_BUSY_MESSAGE);
        }
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const data = await response.json();
      setPlan(data.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setIsLoading(false);
    }
  };

  const plannedTasks = plan
    ? plan
        .map((pt) => {
          const task = tasks.find((t) => t.id === pt.taskId);
          return task ? { ...pt, task } : null;
        })
        .filter(
          (pt): pt is { taskId: string; durationMinutes: number; order: number; reason: string; task: Task } => pt !== null && pt.task !== null
        )
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/15 text-[#DC2626]">
            <SparklesIcon size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Study Planner</h2>
            <p className="text-xs text-zinc-400">AI-powered study plan based on your tasks</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-400">Target Study Time</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Math.max(5, Math.min(480, parseInt(e.target.value, 10) || 60)))}
              min={5}
              max={480}
              step="5"
              className="flex-1 rounded-xl border border-[#262632] bg-[#101014] px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
            />
            <span className="text-xs text-zinc-400">minutes</span>
          </div>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={isLoading || incompleteTasks.length === 0}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all disabled:bg-[#262632] disabled:text-zinc-500 disabled:hover:bg-[#262632] bg-[#DC2626]/20 border border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/30"
        >
          {isLoading ? 'Generating Plan...' : 'Generate Study Plan'}
        </button>

        {incompleteTasks.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-[#262632] bg-[#101014] p-3">
            <span className="text-xs text-zinc-500">No incomplete tasks available. Add some tasks first.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-[#262632] border border-[#DC2626]/30 p-3">
            <span className="text-xs text-[#F87171]">{error}</span>
            <button
              onClick={handleGeneratePlan}
              disabled={isLoading}
              className="ml-auto flex items-center gap-1 rounded-xl border border-[#262632] bg-[#101014] px-3 py-2 text-xs font-bold text-zinc-200 transition-colors hover:bg-[#262632] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcwIcon size={14} />
              Retry
            </button>
          </div>
        )}

        {plan && plan.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Study Plan</h3>
            <div className="flex flex-col gap-2">
              {plannedTasks.map((pt) => {
                const task = pt.task;
                return (
                  <div key={task.id} className="flex items-center justify-between gap-2 rounded-xl border border-[#262632] bg-[#101014] p-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-100">{task.title}</span>
                        <span className="rounded-md px-2 py-0.5 text-[9px] font-semibold" style={{ backgroundColor: `${task.subjectColor}20`, color: task.subjectColor, border: `1px solid ${task.subjectColor}40` }}>
                          {task.subject}
                        </span>
                        <span className="text-[10px] text-zinc-400">{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span>{pt.durationMinutes} min</span>
                        <span>• #{pt.order}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-400 italic max-w-[200px]">{pt.reason}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
