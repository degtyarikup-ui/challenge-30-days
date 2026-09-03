import { UserId } from '../types';

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

/** Parses YYYY-MM-DD as a local (not UTC) midnight, so DST never shifts a day. */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

export function daysBetween(fromDate: string, toDate: string): number {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function getChallengeDay(targetDate: string, startDate: string, totalDays = 30): number {
  if (!targetDate || !startDate) return 1;
  const diffDays = daysBetween(startDate, targetDate);
  if (diffDays < 0) return 1;
  return Math.min(totalDays, diffDays + 1);
}

export function formatDateRu(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

const WEEKDAYS_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export function formatDayLabel(dateStr: string, actualDate: string): string {
  if (dateStr === actualDate) return 'Сегодня';
  if (dateStr === getYesterdayLocalDate(parseLocalDate(actualDate))) return 'Вчера';
  const d = parseLocalDate(dateStr);
  return `${formatDateRu(dateStr)}, ${WEEKDAYS_RU[d.getDay()]}`;
}

export interface StreakResult {
  currentStreak: number;
  maxStreak: number;
  completedDays: number;
}

/**
 * Consecutive fully-completed days ending at (or just before) today.
 *
 * Today counts only once it is actually complete, but an incomplete today does
 * NOT break the streak — the day is still in progress. A violation on a date
 * breaks the streak at that date regardless of habit checkmarks.
 *
 * Both devices run this over the same merged log set, so both must arrive at
 * the same number. The old implementation fell back to "days since start" when
 * the streak was zero, which is why the two phones disagreed.
 */
export function calculateUserStreaks(
  userId: UserId,
  isDayComplete: (userId: UserId, date: string) => boolean,
  startDate: string,
  actualDate: string,
  violationDates: Set<string> = new Set()
): StreakResult {
  const empty: StreakResult = { currentStreak: 0, maxStreak: 0, completedDays: 0 };
  if (!startDate || !actualDate) return empty;

  const totalDays = daysBetween(startDate, actualDate) + 1;
  if (totalDays <= 0) return empty;

  let runningStreak = 0;
  let maxStreak = 0;
  let currentStreak = 0;
  let completedDays = 0;

  for (let i = 0; i < totalDays; i++) {
    const dateStr = addDays(startDate, i);
    const isToday = dateStr === actualDate;
    const brokenByViolation = violationDates.has(dateStr);
    const done = !brokenByViolation && isDayComplete(userId, dateStr);

    if (done) {
      runningStreak += 1;
      completedDays += 1;
      if (runningStreak > maxStreak) maxStreak = runningStreak;
    } else if (isToday && !brokenByViolation) {
      // Today is still open — hold the streak without extending it.
    } else {
      runningStreak = 0;
    }

    if (isToday) currentStreak = runningStreak;
  }

  return { currentStreak, maxStreak, completedDays };
}

export function isGracePeriodNow(d: Date = new Date()): boolean {
  return d.getHours() < 12;
}
