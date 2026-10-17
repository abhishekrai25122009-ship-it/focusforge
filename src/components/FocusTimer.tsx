'use client';

import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
} from 'react';
import { PlayIcon, PauseIcon, RotateCcwIcon, CoffeeIcon, SparklesIcon, TimerIcon } from './Icons';
import { Task, TimerMode } from '../types/focus';

interface FocusTimerProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  sessionsCompletedToday?: number;
  onSessionComplete: (
    durationMinutes: number,
    mode: TimerMode,
    taskId: string | null,
    taskTitle: string | null,
    startedAt: number,
    completedAt: number
  ) => void;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

const FocusTimer = forwardRef<{ toggleTimer: () => void }, FocusTimerProps>(
  ({
    tasks,
    selectedTaskId,
    onSelectTask,
    onSessionComplete,
    sessionsCompletedToday = 0,
  }, ref) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(MODE_DURATIONS.pomodoro);

  // Interval reference for clean setup & cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const completionHandledRef = useRef<boolean>(false);

  // Announcement state for screen reader live region
  const [announcement, setAnnouncement] = useState<string>('');
  const prevIsRunningRef = useRef<boolean>(isRunning);
  const prevModeRef = useRef<TimerMode>(mode);

  // Audio tone generation for session finish using Web Audio API (no external file needed)
  const playAlertSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio context may be restricted by autoplay policy before user gesture
    }
  }, []);

  // Timer tick effect with proper interval cleanup
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished. clear interval once and suppress duplicate completions.
            if (completionHandledRef.current) return 0;
            completionHandledRef.current = true;

            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsRunning(false);
            playAlertSound();

            if (mode === 'pomodoro' && sessionStartedAtRef.current !== null && sessionDurationSeconds > 0) {
              const completedAt = Date.now();
              onSessionComplete(
                Math.round(sessionDurationSeconds / 60),
                mode,
                selectedTaskId,
                tasks.find((task) => task.id === selectedTaskId)?.title ?? null,
                sessionStartedAtRef.current,
                completedAt
              );
              announceSessionComplete();
            }

            sessionStartedAtRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount or when isRunning changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, mode, onSessionComplete, playAlertSound, selectedTaskId, sessionDurationSeconds, tasks]);

  // Announce timer state changes via live region for screen readers
  useEffect(() => {
    const prevIsRunning = prevIsRunningRef.current;
    const prevMode = prevModeRef.current;

    if (mode !== prevMode) {
      setAnnouncement(`Switched to ${mode}`);
    } else if (isRunning && !prevIsRunning) {
      setAnnouncement(`Timer started, ${mode}`);
    } else if (!isRunning && prevIsRunning) {
      setAnnouncement('Timer paused');
    }

    prevIsRunningRef.current = isRunning;
    prevModeRef.current = mode;
  }, [isRunning, mode]);

  // Announce timer reset
  const announceReset = () => {
    setAnnouncement('Timer reset');
  };

  // Announce session completion
  const announceSessionComplete = () => {
    setAnnouncement('Session complete');
  };
  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionStartedAtRef.current = null;
    completionHandledRef.current = false;
    setSessionDurationSeconds(MODE_DURATIONS[newMode]);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  // Timer controls
  const handleToggle = () => {
    if (timeLeft === 0) {
      // If at zero, reset to a new full interval before starting.
      setTimeLeft(MODE_DURATIONS[mode]);
      setSessionDurationSeconds(MODE_DURATIONS[mode]);
      completionHandledRef.current = false;
      sessionStartedAtRef.current = null;
    }

    const willRun = !isRunning;
    if (willRun && sessionStartedAtRef.current === null) {
      sessionStartedAtRef.current = Date.now();
    }
    setIsRunning(willRun);
  };

  useImperativeHandle(ref, () => ({
    toggleTimer: handleToggle,
  }));

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionStartedAtRef.current = null;
    completionHandledRef.current = false;
    setSessionDurationSeconds(MODE_DURATIONS[mode]);
    setTimeLeft(MODE_DURATIONS[mode]);
    announceReset();
  };

  const handleAddFiveMinutes = () => {
    setSessionDurationSeconds((prev) => prev + 300);
    setTimeLeft((prev) => prev + 300);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circle math
  const totalDuration = sessionDurationSeconds > 0 ? sessionDurationSeconds : MODE_DURATIONS[mode];
  const progressRatio = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div
      id="focus-timer-section"
      className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#262632] bg-[#191920] p-6 shadow-sm"
    >
      {/* Live region for timer announcements */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {/* Top Bar: Title & Mode Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/15 text-[#DC2626]">
            <TimerIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Focus Sprint</h2>
            <p className="text-xs text-zinc-400">Deep study intervals & break pacing</p>
          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center rounded-xl border border-[#262632] bg-[#101014] p-1">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'pomodoro'
                ? 'bg-[#DC2626] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'shortBreak'
                ? 'bg-[#F59E0B] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CoffeeIcon size={12} />
            Short (5m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === 'longBreak'
                ? 'bg-zinc-200 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Long (15m)
          </button>
        </div>
      </div>

      {/* Center: Circular Progress Ring & Timer */}
      <div className="my-6 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <svg className="h-56 w-56 -rotate-90 transform" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#262632"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={mode === 'pomodoro' ? '#DC2626' : mode === 'shortBreak' ? '#F59E0B' : '#F87171'}
              strokeWidth="9"
              strokeLinecap="round"
              fill="transparent"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.8s ease',
              }}
            />
          </svg>

          {/* Time digits in the center */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {timeFormatted}
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs font-medium text-zinc-400">
              {isRunning ? (
                <span className="flex items-center gap-1.5 text-[#F59E0B]">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-ping" />
                  Focus in progress
                </span>
              ) : (
                <span>{timeLeft === 0 ? 'Session Complete!' : 'Paused'}</span>
              )}
            </span>
          </div>
        </div>

        {/* Active Task Selector */}
        <div className="mt-4 flex w-full max-w-sm flex-col items-center gap-1.5 text-center">
          <label htmlFor="timer-task-select" className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Attached Task
          </label>
          <select
            id="timer-task-select"
            value={selectedTaskId || ''}
            onChange={(e) => onSelectTask(e.target.value)}
            className="w-full rounded-xl border border-[#262632] bg-[#101014] px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-[#DC2626] transition-colors"
          >
            <option value="">General Deep Focus (No task selected)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.completed ? '✓ ' : ''}[{task.subject}] {task.title}
              </option>
            ))}
          </select>
          {activeTask && (
            <span className="text-[11px] text-[#F87171]">
              Linked: {activeTask.title} ({activeTask.estimatedPomodoros} pomodoro est.)
            </span>
          )}
        </div>
      </div>

      {/* Bottom: Action Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-3">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#262632] bg-[#101014] text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors focus-ring"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcwIcon size={18} />
          </button>

          {/* Primary Start / Pause Button */}
          <button
            onClick={handleToggle}
            className={`flex h-12 flex-1 max-w-[200px] items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isRunning
                ? 'bg-amber-600 shadow-amber-600/25 hover:bg-amber-500'
                : 'bg-gradient-to-r from-[#DC2626] to-[#991B1B] shadow-[#DC2626]/30 hover:brightness-110'
            }`}
          >
            {isRunning ? (
              <>
                <PauseIcon size={18} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon size={18} />
                <span>{timeLeft === MODE_DURATIONS[mode] ? 'Start Focus' : 'Resume'}</span>
              </>
            )}
          </button>

          {/* Quick +5 mins extension */}
          <button
            onClick={handleAddFiveMinutes}
            className="flex h-12 items-center justify-center rounded-xl border border-[#262632] bg-[#101014] px-3.5 text-xs font-semibold text-zinc-300 hover:border-[#DC2626]/50 hover:text-white transition-colors focus-ring"
            title="Add 5 minutes to current timer"
          >
            +5m
          </button>
        </div>

        {/* Session Counter Tag */}
        <div className="flex items-center justify-between border-t border-[#262632] pt-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <SparklesIcon size={13} className="text-[#F59E0B]" />
            <span>Completed sprints today:</span>
          </div>
          <span className="font-bold text-[#F59E0B]">{sessionsCompletedToday} pomodoros</span>
        </div>
      </div>
    </div>
  );
});

FocusTimer.displayName = 'FocusTimer';

export default FocusTimer;
