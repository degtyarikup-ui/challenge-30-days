export type UserId = 'sereja' | 'lera';

export interface User {
  id: UserId;
  name: string;
  telegram_id: string | null;
  current_streak: number;
  max_streak: number;
  challenge_start_date: string;
  avatar_color: string;
  last_active_date?: string;
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
  is_active: number;
  order_index: number;
  created_at: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  user_id: UserId;
  date: string; // YYYY-MM-DD
  completed: number; // 0 or 1
  value: string | null;
  updated_at: string;
}

export interface Violation {
  id: number;
  user_id: UserId;
  date: string; // YYYY-MM-DD
  rule_title: string;
  note: string | null;
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

export interface AppStateResponse {
  users: Record<UserId, User>;
  date: string; // Current challenge logical date
  actualDate: string; // Real calendar date
  isGracePeriod: boolean; // True between 00:00 and 12:00 next day for previous day
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
