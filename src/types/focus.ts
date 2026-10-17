export type Priority = 'high' | 'medium' | 'low';

export type Subject = {
  id: string;
  name: string;
  color: string; // Hex or CSS color
  bgColor: string;
  borderColor: string;
};

export interface Task {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  priority: Priority;
  completed: boolean;
  dueTime: string;
  estimatedPomodoros: number;
  dueDate?: string;        // ISO YYYY-MM-DD
  examDate?: string | null; // ISO YYYY-MM-DD or null
  recurrence?: 'daily' | 'weekly'; // Recurrence rule; absent = one-off task
}

export interface StudySession {
  id: string;
  title: string;
  subject: string;
  time: string;
  durationMinutes: number;
  type: 'Solo' | 'Group' | 'Exam Prep' | 'Lab';
  completed: boolean;
  notes?: string;
}

export interface ActivityDay {
  day: string;
  shortDay: string;
  hours: number;
  targetHours: number;
  sessionsCount: number;
  isToday?: boolean;
}

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  pomodoro: number; // in seconds (e.g. 1500 for 25m)
  shortBreak: number; // 300 for 5m
  longBreak: number; // 900 for 15m
}

export interface FocusSession {
  id: string;
  mode: TimerMode;
  durationMinutes: number;
  startedAt: number;
  completedAt: number;
  taskId: string | null;
  taskTitle?: string;
}
