import { UserId, Habit } from '../types';

export function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayLocalDate(d: Date = new Date()): string {
  const yesterday = new Date(d);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatLocalDate(yesterday);
}

export function getChallengeDay(targetDate: string, startDate: string): number {
  if (!targetDate || !startDate) return 1;
  const [ty, tm, td] = targetDate.split('-').map(Number);
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const targetMs = new Date(ty, tm - 1, td).getTime();
  const startMs = new Date(sy, sm - 1, sd).getTime();
  const diffDays = Math.floor((targetMs - startMs) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  return Math.min(30, diffDays + 1);
}

export function calculateUserStreaks(
  userId: UserId,
  logs: Record<string, boolean>,
  habits: Habit[],
  startDate: string,
  actualDate: string
): { currentStreak: number; maxStreak: number } {
  if (!startDate || !actualDate) return { currentStreak: 1, maxStreak: 1 };

  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ay, am, ad] = actualDate.split('-').map(Number);

  const start = new Date(sy, sm - 1, sd);
  const current = new Date(ay, am - 1, ad);

  if (current.getTime() < start.getTime()) {
    return { currentStreak: 1, maxStreak: 1 };
  }

  const activeHabits = habits.filter(
    (h) => h.category === 'active' && (!h.assigned_to || h.assigned_to === 'both' || h.assigned_to === userId)
  );

  let currentStreak = 0;
  let maxStreak = 0;
  let runningStreak = 0;

  const totalDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < totalDays; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = formatLocalDate(dayDate);
    const isToday = dateStr === actualDate;

    const allDone =
      activeHabits.length > 0 &&
      activeHabits.every((h) => !!logs[`${h.id}_${userId}_${dateStr}`]);

    if (allDone) {
      runningStreak += 1;
      if (runningStreak > maxStreak) maxStreak = runningStreak;
    } else if (isToday) {
      // If today is in progress, do not break streak yet
    } else {
      runningStreak = 0;
    }
  }

  // Current challenge progress day or consecutive completed days (minimum 1)
  const challengeDay = getChallengeDay(actualDate, startDate);
  currentStreak = Math.max(1, runningStreak > 0 ? runningStreak : challengeDay);
  maxStreak = Math.max(maxStreak, currentStreak);

  return { currentStreak, maxStreak };
}
