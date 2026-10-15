'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCards from '../components/StatCards';
import TaskSection from '../components/TaskSection';
import FocusTimer from '../components/FocusTimer';
import ActivityChart from '../components/ActivityChart';
import UpcomingSessions from '../components/UpcomingSessions';
import NewTaskModal from '../components/NewTaskModal';
import NewSessionModal from '../components/NewSessionModal';
import SettingsView from '../components/SettingsView';
import { Task, StudySession, ActivityDay } from '../types/focus';

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

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState<boolean>(false);

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
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
                onResetStreak={() => setStreakDays(1)}
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
              <div className="max-w-2xl mx-auto w-full py-4">
                <FocusTimer
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                  onSessionComplete={handleSessionComplete}
                />
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

                  {/* Right Column: Focus Timer (5 cols) */}
                  <div className="lg:col-span-5">
                    <FocusTimer
                      tasks={tasks}
                      selectedTaskId={selectedTaskId}
                      onSelectTask={setSelectedTaskId}
                      onSessionComplete={handleSessionComplete}
                    />
                  </div>
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
