/**
 * @file src/types/index.ts
 * Definições de tipos centrais do Focalize (strict TypeScript).
 */

export type GoalPriority = 'low' | 'medium' | 'high';

export type GoalStatus = 'pending' | 'in_progress' | 'completed';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: GoalPriority;
  deadline: string; // ISO string YYYY-MM-DD ou vazia
  status: GoalStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  totalStudiedSeconds: number;
}

export type GoalFormData = {
  title: string;
  description: string;
  category: string;
  priority: GoalPriority;
  deadline: string;
  status: GoalStatus;
};

export type FormValidationErrors = Partial<Record<keyof GoalFormData, string>>;

export type SessionType = 'focus' | 'short_break' | 'long_break';

export interface StudySession {
  id: string;
  goalId: string | null;
  goalTitle: string;
  startedAt: string; // ISO string
  endedAt: string; // ISO string
  durationSeconds: number;
  type: SessionType;
  completed: boolean;
}

export interface FlowSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export type SortByOption = 'deadline' | 'priority' | 'createdAt' | 'studied' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface GoalFiltersState {
  search: string;
  status: GoalStatus | 'all';
  category: string;
  priority: GoalPriority | 'all';
  sortBy: SortByOption;
  sortDirection: SortDirection;
}

export type Theme = 'light' | 'dark' | 'system';
