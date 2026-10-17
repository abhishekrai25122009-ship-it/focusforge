'use client';

import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCards from '../components/StatCards';
import TaskSection from '../components/TaskSection';
import FocusTimer from '../components/FocusTimer';
import ActivityChart from '../components/ActivityChart';
import UpcomingSessions from '../components/UpcomingSessions';
import TaskCalendar from '../components/TaskCalendar';
import NewTaskModal from '../components/NewTaskModal';
import AIPlanner from '../components/AIPlanner';
import NewSessionModal from '../components/NewSessionModal';
import SettingsView from '../components/SettingsView';
import { Task, StudySession, ActivityDay, Priority } from '../types/focus';

// Initial hackathon demo dataset
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Solve Dynamic Programming Problem Set 4',
    subject: 'Computer Science',
    subjectColor: '#8B5CF6',
    priority: 'high',
    completed: false,
    dueTime: 'Today, 2:30 PM',
    estimatedPomodoros: 2,
  },
  {
    id: 'task-2',
    title: 'Read Operating Systems Chapter 6: Deadlocks & Locks',
    subject: 'Computer Science',
    subjectColor: '#8B5CF6',
    priority: 'medium',
    completed: false,
    dueTime: 'Today, 4:00 PM',
    estimatedPomodoros: 1,
  },
  {
    id: 'task-3',
    title: 'Linear Algebra: Eigenvalue Diagonalization Proofs',
    subject: 'Applied Mathematics',
    subjectColor: '#FF9F43',
    priority: 'high',
    completed: false,
    dueTime: 'Today, 7:00 PM',
    estimatedPomodoros: 3,
  },
  {
    id: 'task-4',
    title: 'Review Physics Electromagnetic Wave Equations',
    subject: 'Physics & Signals',
    subjectColor: '#38BDF8',
    priority: 'low',
    completed: true,
    dueTime: 'Morning 9:00 AM',
    estimatedPomodoros: 1,
  },
  {
    id: 'task-5',
    title: 'Submit HCI Sprint 2 Wireframe Critique',
    subject: 'Human-Computer Interaction',
    subjectColor: '#34D399',
    priority: 'medium',
    completed: false,
    dueTime: 'Tonight, 11:59 PM',
    estimatedPomodoros: 2,
  },
];

const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 's-1',
    title: 'Algorithms & Complexity Review',
    subject: 'CS 301',
    time: 'Today, 4:00 PM',
    durationMinutes: 60,
    type: 'Exam Prep',
    completed: false,
    notes: 'Go over master theorem and amortized analysis',
  },
  {
    id: 's-2',
    title: 'Operating Systems Kernel Lab',
    subject: 'CS 320',
    time: 'Today, 6:30 PM',
    durationMinutes: 90,
    type: 'Lab',
    completed: false,
    notes: 'Pair debugging for thread synchronization locks',
  },
  {
    id: 's-3',
    title: 'Discrete Math Problem Set 5',
    subject: 'MATH 240',
    time: 'Tomorrow, 10:00 AM',
    durationMinutes: 45,
    type: 'Solo',
    completed: false,
  },
];

const INITIAL_ACTIVITY: ActivityDay[] = [
  { day: 'Monday', shortDay: 'Mon', hours: 3.5, targetHours: 4.0, sessionsCount: 4 },
  { day: 'Tuesday', shortDay: 'Tue', hours: 4.2, targetHours: 4.0, sessionsCount: 5 },
  { day: 'Wednesday', shortDay: 'Wed', hours: 2.8, targetHours: 4.0, sessionsCount: 3 },
  { day: 'Thursday', shortDay: 'Thu', hours: 4.6, targetHours: 4.0, sessionsCount: 6, isToday: true },
  { day: 'Friday', shortDay: 'Fri', hours: 5.1, targetHours: 4.0, sessionsCount: 6 },
  { day: 'Saturday', shortDay: 'Sat', hours: 3.0, targetHours: 4.0, sessionsCount: 3 },
  { day: 'Sunday', shortDay: 'Sun', hours: 2.5, targetHours: 4.0, sessionsCount: 2 },
];

const TASK_STORAGE_KEY = 'focusforge:tasks';
const SESSION_STORAGE_KEY = 'focusforge:sessions';

// Advance a local calendar date by N days.
// Serializes using local year/month/day components with zero-padding.
// Returns null for malformed or impossible dates.
function advanceDueDate(isoDate: string, daysToAdd: number): string | null {
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
  date.setDate(date.getDate() + daysToAdd);
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}

// Validate that an ISO YYYY-MM-DD string parses to a real calendar date.
// Returns true only for valid dates (e.g., rejects "2024-02-30").
function isValidISODateString(isoDate: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return false;
  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// Build a readable dueTime string for display from the optional ISO dueDate.
// Parses the date locally to avoid UTC timezone shifts.
function formatDueTime(isoDate: string): string {
  if (!isoDate) return 'No due date';
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `Due ${d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function isPriority(value: unknown): value is Priority {
  return value === 'high' || value === 'medium' || value === 'low';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim() !== '' &&
    typeof candidate.title === 'string' &&
    typeof candidate.subject === 'string' &&
    typeof candidate.subjectColor === 'string' &&
    isPriority(candidate.priority) &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.dueTime === 'string' &&
    isFiniteNumber(candidate.estimatedPomodoros)
  );
}

function isStudySession(value: unknown): value is StudySession {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    candidate.id.trim() === '' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.subject !== 'string' ||
    typeof candidate.time !== 'string' ||
    !isFiniteNumber(candidate.durationMinutes) ||
    (candidate.type !== 'Solo' && candidate.type !== 'Group' && candidate.type !== 'Exam Prep' && candidate.type !== 'Lab') ||
    typeof candidate.completed !== 'boolean'
  ) {
    return false;
  }

  if (candidate.notes !== undefined && typeof candidate.notes !== 'string') return false;
  return true;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [sessions, setSessions] = useState<StudySession[]>(INITIAL_SESSIONS);
  const [activityData, setActivityData] = useState<ActivityDay[]>(INITIAL_ACTIVITY);
  const [studyMinutes, setStudyMinutes] = useState<number>(225); // 3h 45m
  const [targetStudyHours, setTargetStudyHours] = useState<number>(4);
  const [streakDays, setStreakDays] = useState<number>(7);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task-1');
  const timerRef = useRef<{ toggleTimer: () => void } | null>(null);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState<boolean>(false);

  // Hydrate persisted tasks and sessions after mount without causing hydration mismatches.
  useEffect(() => {
    try {
      const storedTasks = window.localStorage.getItem(TASK_STORAGE_KEY);
      if (storedTasks !== null) {
        const parsed: unknown = JSON.parse(storedTasks);
        if (Array.isArray(parsed)) {
          const validTasks = parsed.filter(isTask);
          if (parsed.length === 0 || validTasks.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTasks(validTasks);
          } else {
            window.localStorage.removeItem(TASK_STORAGE_KEY);
          }
        } else {
          window.localStorage.removeItem(TASK_STORAGE_KEY);
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(TASK_STORAGE_KEY);
      } catch {
        // Ignore storage access errors.
      }
    }

    try {
      const storedSessions = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSessions !== null) {
        const parsed: unknown = JSON.parse(storedSessions);
        if (Array.isArray(parsed)) {
          const validSessions = parsed.filter(isStudySession);
          if (parsed.length === 0 || validSessions.length > 0) {
            setSessions(validSessions);
          } else {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } else {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // Ignore storage access errors.
      }
    }

    setHasHydrated(true);
  }, []);

  // Persist only after the initial client-side load has completed.
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage errors so the app remains usable.
    }
  }, [tasks, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore storage errors so the app remains usable.
    }
  }, [sessions, hasHydrated]);

  // Global keyboard shortcuts:
  // Space toggles the focus timer, / opens the Add Task modal.
  // Shortcuts are ignored when typing in editable fields, when modifiers
  // are pressed, or when a modal is open (modals handle their own keys).
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys to avoid overriding browser/OS shortcuts.
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const target = e.target as HTMLElement | null;
      const active = document.activeElement as HTMLElement | null;
      const editableOrInteractiveSelector =
        'input, textarea, select, button, a[href], [contenteditable="true"], [contenteditable=""]';

      // Ignore when typing in or focusing an editable/interactive control.
      if (target?.matches(editableOrInteractiveSelector)) return;
      if (active?.matches(editableOrInteractiveSelector)) return;

      // Do not interfere with modals; they handle their own Escape/Tab keys.
      if (isNewTaskModalOpen || isNewSessionModalOpen) return;

      if (e.key === ' ') {
        e.preventDefault();
        timerRef.current?.toggleTimer();
      } else if (e.key === '/') {
        e.preventDefault();
        setIsNewTaskModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isNewTaskModalOpen, isNewSessionModalOpen, setIsNewTaskModalOpen]);

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.flatMap((task) => {
        if (task.id !== taskId) return [task];
        if (!task.completed) {
          // Marking complete: spawn next occurrence if recurring with valid dueDate.
          const completedTask: Task = { ...task, completed: true };
          if (
            (task.recurrence === 'daily' || task.recurrence === 'weekly') &&
            task.dueDate
          ) {
            const nextDueDate = advanceDueDate(
              task.dueDate,
              task.recurrence === 'daily' ? 1 : 7
            );
            if (nextDueDate) {
              const nextTask: Task = {
                ...task,
                id: `task-${Date.now()}`,
                completed: false,
                dueDate: nextDueDate,
                dueTime: formatDueTime(nextDueDate),
                examDate: undefined,
              };
              return [completedTask, nextTask];
            }
          }
          return [completedTask];
        }
        // Marking incomplete: just flip back, no spawn.
        return [{ ...task, completed: false }];
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Study Session Handlers
  const handleToggleSessionCompleted = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleAddSession = (newSessionData: Omit<StudySession, 'id' | 'completed'>) => {
    const newSession: StudySession = {
      ...newSessionData,
      id: `session-${Date.now()}`,
      completed: false,
    };
    setSessions((prev) => [...prev, newSession]);
  };

  // Focus Timer Session Completed Handler
  const handleSessionComplete = (minutes: number) => {
    setStudyMinutes((prev) => prev + minutes);

    // Update today's hours on the chart
    setActivityData((prev) =>
      prev.map((day) =>
        day.isToday
          ? {
              ...day,
              hours: parseFloat((day.hours + minutes / 60).toFixed(1)),
              sessionsCount: day.sessionsCount + 1,
            }
          : day
      )
    );
  };

  // Quick jump to Focus Timer
  const handleQuickFocus = () => {
    setActiveTab('overview');
    const timerElem = document.getElementById('focus-timer-section');
    if (timerElem) {
      timerElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Launch a session into the timer
  const handleStartSessionInTimer = (sessionTitle: string) => {
    // Add a temporary task or link
    const existingTask = tasks.find((t) => t.title.includes(sessionTitle));
    if (existingTask) {
      setSelectedTaskId(existingTask.id);
    } else {
      const created: Task = {
        id: `task-${Date.now()}`,
        title: sessionTitle,
        subject: 'Study Session',
        subjectColor: '#8B5CF6',
        priority: 'high',
        completed: false,
        dueTime: 'Active Session',
        estimatedPomodoros: 2,
      };
      setTasks((prev) => [created, ...prev]);
      setSelectedTaskId(created.id);
    }

    handleQuickFocus();
  };

  // Backup/Restore
  const BACKUP_STORAGE_VERSION = '1.0';

  const handleExportBackup = () => {
    const backup = {
      version: BACKUP_STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      tasks,
      sessions,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusforge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);

        if (!backup || typeof backup !== 'object') {
          throw new Error('Invalid backup format');
        }

        if (backup.version !== BACKUP_STORAGE_VERSION) {
          throw new Error(`Unsupported backup version: ${backup.version}`);
        }

        if (!Array.isArray(backup.tasks)) {
          throw new Error('Invalid backup: missing tasks array');
        }

        if (!Array.isArray(backup.sessions)) {
          throw new Error('Invalid backup: missing sessions array');
        }

        const invalidTasks = backup.tasks.filter((t: unknown) => !isTask(t));
        if (invalidTasks.length > 0) {
          throw new Error('Invalid backup: some tasks are malformed');
        }

        // Validate optional fields that isTask does not check
        const invalidDueDate = backup.tasks.filter(
          (t: Task) => t.dueDate !== undefined && !isValidISODateString(t.dueDate)
        );
        if (invalidDueDate.length > 0) {
          throw new Error('Invalid backup: some tasks have invalid dueDate');
        }

        const invalidExamDate = backup.tasks.filter(
          (t: Task) =>
            t.examDate !== undefined && t.examDate !== null && !isValidISODateString(t.examDate)
        );
        if (invalidExamDate.length > 0) {
          throw new Error('Invalid backup: some tasks have invalid examDate');
        }

        const invalidRecurrence = backup.tasks.filter(
          (t: Task) =>
            t.recurrence !== undefined && t.recurrence !== 'daily' && t.recurrence !== 'weekly'
        );
        if (invalidRecurrence.length > 0) {
          throw new Error('Invalid backup: some tasks have invalid recurrence');
        }

        const invalidSessions = backup.sessions.filter((s: unknown) => !isStudySession(s));
        if (invalidSessions.length > 0) {
          throw new Error('Invalid backup: some sessions are malformed');
        }

        if (
          window.confirm(
            `This will replace all existing tasks (${tasks.length}) and sessions (${sessions.length}) with ${backup.tasks.length} tasks and ${backup.sessions.length} sessions from the backup. Continue?`
          )
        ) {
          // Capture existing localStorage values before any write.
          const previousTasks = localStorage.getItem(TASK_STORAGE_KEY);
          const previousSessions = localStorage.getItem(SESSION_STORAGE_KEY);

          // Attempt both writes before touching React state.
          try {
            localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(backup.tasks));
          } catch (err) {
            window.alert(`Failed to restore backup: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return;
          }

          try {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(backup.sessions));
          } catch (err) {
            // Rollback: restore both keys to their exact previous values.
            try {
              if (previousTasks === null) {
                localStorage.removeItem(TASK_STORAGE_KEY);
              } else {
                localStorage.setItem(TASK_STORAGE_KEY, previousTasks);
              }
              if (previousSessions === null) {
                localStorage.removeItem(SESSION_STORAGE_KEY);
              } else {
                localStorage.setItem(SESSION_STORAGE_KEY, previousSessions);
              }
            } catch (rollbackErr) {
              // Rollback itself failed — the user's data may be in an inconsistent state.
              window.alert(
                `Failed to restore backup and failed to roll back: ${rollbackErr instanceof Error ? rollbackErr.message : 'Unknown error'}. Your data may be inconsistent.`
              );
              return;
            }

            window.alert(`Failed to restore backup: ${err instanceof Error ? err.message : 'Unknown error'}`);
            return;
          }

          // Both writes succeeded — update React state.
          setTasks(backup.tasks as Task[]);
          setSessions(backup.sessions as StudySession[]);
        }
      } catch (err) {
        window.alert(`Failed to restore backup: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    reader.onerror = () => {
      window.alert('Failed to read backup file');
    };

    reader.readAsText(file);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex min-h-screen bg-[#101014] text-[#f4f4f6]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        completedTasksCount={completedCount}
        totalTasksCount={tasks.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onAddTask={() => setIsNewTaskModalOpen(true)}
          onQuickFocus={handleQuickFocus}
          isTimerRunning={false}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl flex flex-col gap-6">
            {activeTab === 'settings' ? (
              <SettingsView
                targetStudyHours={targetStudyHours}
                onUpdateTargetHours={setTargetStudyHours}
                streakDays={streakDays}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
              />
            ) : activeTab === 'planner' ? (
              <div className="flex flex-col gap-6">
                <UpcomingSessions
                  sessions={sessions}
                  onToggleSessionCompleted={handleToggleSessionCompleted}
                  onDeleteSession={handleDeleteSession}
                  onOpenNewSessionModal={() => setIsNewSessionModalOpen(true)}
                  onStartSessionInTimer={handleStartSessionInTimer}
                />
                <ActivityChart
                  activityData={activityData}
                />
              </div>
            ) : activeTab === 'timer' ? (
              <div className="max-w-2xl mx-auto w-full py-4" />
            ) : activeTab === 'calendar' ? (
              <div className="flex flex-col gap-6">
                <TaskCalendar
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                />
              </div>
            ) : activeTab === 'ai-planner' ? (
              <div className="flex flex-col gap-6">
                <AIPlanner tasks={tasks} />
              </div>
            ) : activeTab === 'tasks' ? (
              <div className="flex flex-col gap-6">
                <StatCards
                  completedTasks={completedCount}
                  totalTasks={tasks.length}
                  studyMinutes={studyMinutes}
                  streakDays={streakDays}
                  targetDailyMinutes={targetStudyHours * 60}
                />
                <TaskSection
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                  onSelectTaskForTimer={setSelectedTaskId}
                  selectedTaskId={selectedTaskId}
                />
              </div>
            ) : (
              /* Overview Default View */
              <>
                {/* 1. Statistic Cards */}
                <StatCards
                  completedTasks={completedCount}
                  totalTasks={tasks.length}
                  studyMinutes={studyMinutes}
                  streakDays={streakDays}
                  targetDailyMinutes={targetStudyHours * 60}
                />

                {/* 2. Main Middle Grid: Today's Tasks & Focus Timer */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left Column: Today's Tasks (7 cols) */}
                  <div className="lg:col-span-7">
                    <TaskSection
                      tasks={tasks}
                      onToggleTask={handleToggleTask}
                      onDeleteTask={handleDeleteTask}
                      onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                      onSelectTaskForTimer={setSelectedTaskId}
                      selectedTaskId={selectedTaskId}
                    />
                  </div>

                  {/* Right Column: reserved */}
                  <div className="lg:col-span-5" />
                </div>

                {/* 3. Bottom Grid: Weekly Activity Chart & Upcoming Sessions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left Column: Weekly Activity Chart (7 cols) */}
                  <div className="lg:col-span-7">
                    <ActivityChart
                      activityData={activityData}
                    />
                  </div>

                  {/* Right Column: Upcoming Sessions (5 cols) */}
                  <div className="lg:col-span-5">
                    <UpcomingSessions
                      sessions={sessions}
                      onToggleSessionCompleted={handleToggleSessionCompleted}
                      onDeleteSession={handleDeleteSession}
                      onOpenNewSessionModal={() => setIsNewSessionModalOpen(true)}
                      onStartSessionInTimer={handleStartSessionInTimer}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Always mounted timer so global Space shortcut works from any tab */}
          <div className={activeTab === 'timer' ? '' : 'hidden'}>
            <FocusTimer
              ref={timerRef}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        </main>
      </div>

      {/* Add Task Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* Schedule Session Modal */}
      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onAddSession={handleAddSession}
      />
    </div>
  );
}
