export type UserId = 'sereja' | 'lera';
export type AssignedTo = 'both' | 'sereja' | 'lera';

export interface User {
  id: UserId;
  name: string;
  telegram_id: string | null;
  current_streak: number;
  max_streak: number;
  challenge_start_date: string;
  avatar_color: string;
  avatar_url?: string | null;
}

export type HabitCategory = 'active' | 'passive';
export type TargetType = 'checkbox' | 'number' | 'time';

export interface Habit {
  id: number;
  title: string;
  category: HabitCategory;
  target_type: TargetType;
  target_sereja: string;
  target_lera: string;
  unit: string;
  icon?: string;
  assigned_to?: AssignedTo;
  is_active: number;
  order_index: number;
  created_at: string;
}

export interface HabitWithStatus extends Habit {
  status_sereja: {
    completed: boolean;
    value: string | null;
    updated_at?: string;
  };
  status_lera: {
    completed: boolean;
    value: string | null;
    updated_at?: string;
  };
}

export interface Violation {
  id: number;
  user_id: UserId;
  date: string;
  rule_title: string;
  note: string | null;
  created_at: string;
}

export interface AppStateResponse {
  users: Record<UserId, User>;
  date: string;
  actualDate: string;
  yesterdayDate: string;
  isGracePeriod: boolean;
  gracePeriodDeadline: string;
  startDate: string;
  daysUntilStart: number;
  habits: HabitWithStatus[];
  passiveRules: Habit[];
  violations: Violation[];
  recentViolations: Violation[];
  stats: {
    totalDays: number;
    serejaCompletedCountToday: number;
    leraCompletedCountToday: number;
    totalActiveHabits: number;
  };
}

export interface HistoryDay {
  date: string;
  serejaCompleted: number;
  serejaTotal: number;
  leraCompleted: number;
  leraTotal: number;
  serejaViolations: number;
  leraViolations: number;
}
