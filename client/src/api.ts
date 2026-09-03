import { AppStateResponse, Habit, HistoryDay, UserId, HabitWithStatus, Violation, User } from './types';
import {
  formatLocalDate,
  getYesterdayLocalDate,
  calculateUserStreaks,
  isGracePeriodNow,
  daysBetween,
} from './utils/date';
import {
  DEFAULT_HABITS,
  DEFAULT_START_DATE,
  SyncDoc,
  mutate,
  onRemoteChange,
  pullFromCloud,
  readLocal,
  stamp,
  startCloudSync,
} from './utils/sync';

const API_BASE = '/api';

/**
 * The same bundle runs two ways: against the Express server in local dev, and
 * as a static GitHub Pages site where the only shared storage is the cloud
 * document. `res.ok` is the honest test — a 404 from Pages resolves fine, it
 * does not throw, which is why every cloud fallback used to be unreachable.
 */
let serverAvailable: boolean | null = null;

async function probeServer(): Promise<boolean> {
  if (serverAvailable !== null) return serverAvailable;
  try {
    const res = await fetch(`${API_BASE}/state`, { method: 'GET' });
    serverAvailable = res.ok && (res.headers.get('content-type') || '').includes('json');
  } catch {
    serverAvailable = false;
  }
  return serverAvailable;
}

/** Wraps a server call so any failure (throw *or* non-2xx) falls back to cloud. */
async function tryServer<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (serverAvailable === false) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) {
      if (res.status === 404 || res.status === 405) serverAvailable = false;
      return null;
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) {
      serverAvailable = false;
      return null;
    }
    serverAvailable = true;
    return (await res.json()) as T;
  } catch {
    serverAvailable = false;
    return null;
  }
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// ------------------------------------------------------------ doc -> app view

export function logKey(habitId: number, userId: UserId, date: string): string {
  return `${habitId}_${userId}_${date}`;
}

function habitsFromDoc(doc: SyncDoc): Habit[] {
  const list = Object.values(doc.habits)
    .filter((e) => !e.del && e.h && e.h.is_active !== 0)
    .map((e) => ({ ...e.h, assigned_to: e.h.assigned_to || 'both' }));

  if (list.length === 0) return DEFAULT_HABITS.map((h) => ({ ...h }));
  return list.sort((a, b) => (a.order_index - b.order_index) || (a.id - b.id));
}

function violationsFromDoc(doc: SyncDoc): Violation[] {
  return Object.values(doc.violations)
    .filter((e) => !e.del && e.v)
    .map((e) => e.v)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '') || b.id - a.id);
}

function startDateFromDoc(doc: SyncDoc): string {
  return doc.settings.startDate?.val || DEFAULT_START_DATE;
}

export function habitAppliesTo(habit: Habit, userId: UserId): boolean {
  const assigned = habit.assigned_to || 'both';
  return assigned === 'both' || assigned === userId;
}

/** True when every active habit assigned to this user is checked on that date. */
function makeDayCompleteFn(doc: SyncDoc, habits: Habit[]) {
  const activeHabits = habits.filter((h) => h.category === 'active');
  return (userId: UserId, date: string): boolean => {
    const mine = activeHabits.filter((h) => habitAppliesTo(h, userId));
    if (mine.length === 0) return false;
    return mine.every((h) => doc.logs[logKey(h.id, userId, date)]?.c === true);
  };
}

function buildLocalState(doc: SyncDoc, targetDate?: string): AppStateResponse {
  const now = new Date();
  const actualDate = formatLocalDate(now);
  const date = targetDate || actualDate;
  const yesterdayDate = getYesterdayLocalDate(now);

  const allHabits = habitsFromDoc(doc);
  const startDate = startDateFromDoc(doc);
  const violations = violationsFromDoc(doc);
  const isDayComplete = makeDayCompleteFn(doc, allHabits);

  const violationDatesFor = (userId: UserId) =>
    new Set(violations.filter((v) => v.user_id === userId).map((v) => v.date));

  const serejaStreaks = calculateUserStreaks('sereja', isDayComplete, startDate, actualDate, violationDatesFor('sereja'));
  const leraStreaks = calculateUserStreaks('lera', isDayComplete, startDate, actualDate, violationDatesFor('lera'));

  const profile = (id: UserId, fallbackName: string, color: string, streaks: typeof serejaStreaks): User => ({
    id,
    name: doc.profiles[id]?.name || fallbackName,
    telegram_id: null,
    current_streak: streaks.currentStreak,
    max_streak: Math.max(streaks.maxStreak, streaks.currentStreak),
    challenge_start_date: startDate,
    avatar_color: color,
    avatar_url: doc.profiles[id]?.avatar_url || null,
  });

  const users: Record<UserId, User> = {
    sereja: profile('sereja', 'Серёжа', '#3B82F6', serejaStreaks),
    lera: profile('lera', 'Лера', '#EC4899', leraStreaks),
  };

  const activeHabits: HabitWithStatus[] = [];
  const passiveRules: Habit[] = [];

  for (const h of allHabits) {
    if (h.category === 'active') {
      const s = doc.logs[logKey(h.id, 'sereja', date)];
      const l = doc.logs[logKey(h.id, 'lera', date)];
      activeHabits.push({
        ...h,
        status_sereja: { completed: !!s?.c, value: s?.val ?? null },
        status_lera: { completed: !!l?.c, value: l?.val ?? null },
      });
    } else {
      passiveRules.push(h);
    }
  }

  return {
    users,
    date,
    actualDate,
    yesterdayDate,
    isGracePeriod: isGracePeriodNow(now),
    gracePeriodDeadline: 'До 12:00',
    startDate,
    daysUntilStart: daysBetween(actualDate, startDate),
    habits: activeHabits,
    passiveRules,
    violations: violations.filter((v) => v.date === date),
    recentViolations: violations.slice(0, 20),
    stats: {
      totalDays: 30,
      serejaCompletedCountToday: activeHabits.filter((h) => habitAppliesTo(h, 'sereja') && h.status_sereja.completed).length,
      leraCompletedCountToday: activeHabits.filter((h) => habitAppliesTo(h, 'lera') && h.status_lera.completed).length,
      totalActiveHabits: activeHabits.length,
    },
  };
}

/** History rebuilt from the merged log set, so it works with no server. */
function buildLocalHistory(doc: SyncDoc): HistoryDay[] {
  const habits = habitsFromDoc(doc);
  const activeHabits = habits.filter((h) => h.category === 'active');
  const violations = violationsFromDoc(doc);

  const dates = new Set<string>();
  for (const key of Object.keys(doc.logs)) {
    // key is `${habitId}_${userId}_${YYYY-MM-DD}`
    const date = key.slice(key.lastIndexOf('_') + 1);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) dates.add(date);
  }
  for (const v of violations) dates.add(v.date);

  const countFor = (userId: UserId, date: string) => {
    const mine = activeHabits.filter((h) => habitAppliesTo(h, userId));
    return {
      completed: mine.filter((h) => doc.logs[logKey(h.id, userId, date)]?.c === true).length,
      total: mine.length,
    };
  };

  return Array.from(dates)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 60)
    .map((date) => {
      const s = countFor('sereja', date);
      const l = countFor('lera', date);
      return {
        date,
        serejaCompleted: s.completed,
        serejaTotal: s.total,
        leraCompleted: l.completed,
        leraTotal: l.total,
        serejaViolations: violations.filter((v) => v.user_id === 'sereja' && v.date === date).length,
        leraViolations: violations.filter((v) => v.user_id === 'lera' && v.date === date).length,
      };
    });
}

// ------------------------------------------------------------------- public API

export async function authenticateUserApi(params: {
  telegramId?: string | number;
  username?: string;
  firstName?: string;
  photoUrl?: string;
  manualUserId?: UserId;
}): Promise<{ userId: UserId | null; requiresSelection?: boolean }> {
  const server = await tryServer<{ userId: UserId | null; requiresSelection?: boolean }>(
    '/auth',
    jsonInit('POST', params)
  );

  const nameStr = `${params.firstName || ''} ${params.username || ''}`.toLowerCase();
  let detectedId: UserId | null = server?.userId ?? null;

  if (!detectedId) {
    if (/сергей|сережа|серёжа|degtyarik|sergei|sereja/.test(nameStr)) {
      detectedId = 'sereja';
    } else if (/лера|валерия|lera|valeria/.test(nameStr)) {
      detectedId = 'lera';
    } else if (params.manualUserId) {
      detectedId = params.manualUserId;
    }
  }

  // Share the avatar through the synced document so the partner's device can
  // actually render it — the old per-device `avatar_<id>` key never travelled.
  if (detectedId && params.photoUrl) {
    setProfileAvatar(detectedId, params.photoUrl);
  }

  return { userId: detectedId, requiresSelection: !detectedId };
}

export function setProfileAvatar(userId: UserId, photoUrl: string) {
  const existing = readLocal().profiles[userId];
  if (existing?.avatar_url === photoUrl) return;
  mutate((doc) => {
    doc.profiles[userId] = { ...(doc.profiles[userId] || {}), avatar_url: photoUrl, t: stamp() };
  });
}

export async function fetchAppState(date?: string): Promise<AppStateResponse> {
  const path = date ? `/state?date=${encodeURIComponent(date)}` : '/state';
  const server = await tryServer<AppStateResponse>(path);
  if (server) return server;
  return buildLocalState(readLocal(), date);
}

export async function updateStartDateApi(startDate: string): Promise<{ success: boolean; startDate: string }> {
  const server = await tryServer<{ success: boolean; startDate: string }>(
    '/settings/start-date',
    jsonInit('POST', { startDate })
  );
  if (server) return server;

  mutate((doc) => {
    doc.settings.startDate = { val: startDate, t: stamp() };
  });
  return { success: true, startDate };
}

export async function toggleHabitApi(
  habitId: number,
  userId: UserId,
  date: string,
  completed: boolean,
  value?: string
): Promise<{ success: boolean; allDone: boolean }> {
  const server = await tryServer<{ success: boolean; allDone: boolean }>(
    '/check',
    jsonInit('POST', { habitId, userId, date, completed, value })
  );
  if (server) return server;

  const doc = mutate((d) => {
    d.logs[logKey(habitId, userId, date)] = { c: completed, val: value ?? null, t: stamp() };
  });

  const isDayComplete = makeDayCompleteFn(doc, habitsFromDoc(doc));
  return { success: true, allDone: isDayComplete(userId, date) };
}

export async function recordViolationApi(
  userId: UserId,
  date: string,
  ruleTitle: string,
  note?: string
): Promise<{ success: boolean; message: string }> {
  const server = await tryServer<{ success: boolean; message: string }>(
    '/violation',
    jsonInit('POST', { userId, date, ruleTitle, note })
  );
  if (server) return server;

  const id = Date.now();
  mutate((doc) => {
    doc.violations[String(id)] = {
      v: {
        id,
        user_id: userId,
        date,
        rule_title: ruleTitle,
        note: note || null,
        created_at: new Date().toISOString(),
      },
      t: stamp(),
    };
  });
  return { success: true, message: 'Срыв зафиксирован, стрик сброшен' };
}

export async function deleteViolationApi(id: number): Promise<{ success: boolean }> {
  const server = await tryServer<{ success: boolean }>(`/violations/${id}`, { method: 'DELETE' });
  if (server) return server;

  mutate((doc) => {
    const existing = doc.violations[String(id)];
    if (existing) doc.violations[String(id)] = { ...existing, del: true, t: stamp() };
  });
  return { success: true };
}

export async function createHabitApi(habit: Partial<Habit>): Promise<{ success: boolean; id: number }> {
  const server = await tryServer<{ success: boolean; id: number }>('/habits', jsonInit('POST', habit));
  if (server) return server;

  const doc = readLocal();
  const newId = Date.now();
  const maxOrder = Object.values(doc.habits).reduce((m, e) => Math.max(m, e.h?.order_index || 0), 0);

  mutate((d) => {
    d.habits[String(newId)] = {
      h: {
        id: newId,
        title: habit.title?.trim() || 'Новая цель',
        category: habit.category || 'active',
        target_type: habit.target_type || 'checkbox',
        target_sereja: habit.target_sereja || '',
        target_lera: habit.target_lera || '',
        unit: habit.unit || '',
        icon: habit.icon,
        assigned_to: habit.assigned_to || 'both',
        is_active: 1,
        order_index: maxOrder + 1,
        created_at: new Date().toISOString(),
      },
      t: stamp(),
    };
  });
  return { success: true, id: newId };
}

export async function updateHabitApi(id: number, habit: Partial<Habit>): Promise<{ success: boolean }> {
  const server = await tryServer<{ success: boolean }>(`/habits/${id}`, jsonInit('PUT', habit));
  if (server) return server;

  mutate((doc) => {
    const key = String(id);
    // A habit may only exist as a seed default on this device, so fall back to
    // the defaults list rather than dropping the edit.
    const base = doc.habits[key]?.h || DEFAULT_HABITS.find((h) => h.id === id);
    if (!base) return;
    doc.habits[key] = { h: { ...base, ...habit, id }, t: stamp() };
  });
  return { success: true };
}

export async function deleteHabitApi(id: number): Promise<{ success: boolean }> {
  const server = await tryServer<{ success: boolean }>(`/habits/${id}`, { method: 'DELETE' });
  if (server) return server;

  mutate((doc) => {
    const key = String(id);
    const base = doc.habits[key]?.h || DEFAULT_HABITS.find((h) => h.id === id);
    if (!base) return;
    // Tombstone rather than drop: a bare delete would be re-added by the next
    // pull from a device that still has the habit.
    doc.habits[key] = { h: { ...base, is_active: 0 }, t: stamp(), del: true };
  });
  return { success: true };
}

export async function fetchHistoryApi(): Promise<HistoryDay[]> {
  const server = await tryServer<HistoryDay[]>('/history');
  if (server) return server;

  // Make sure the partner's days are in before rendering the calendar.
  await pullFromCloud();
  return buildLocalHistory(readLocal());
}

export async function resetUserStreakApi(userId: UserId): Promise<{ success: boolean }> {
  const server = await tryServer<{ success: boolean }>('/user/reset', jsonInit('POST', { userId }));
  if (server) return server;
  return { success: true };
}

export async function linkTelegramIdApi(userId: UserId, telegramId: string): Promise<{ success: boolean }> {
  const server = await tryServer<{ success: boolean }>('/link-telegram', jsonInit('POST', { userId, telegramId }));
  if (server) return server;
  return { success: true };
}

export { flushPush, onStatusChange as onSyncStatusChange } from './utils/sync';

/**
 * Live updates. Uses server SSE when a server is actually reachable, otherwise
 * polls the shared cloud document. Previously the SSE branch was always taken
 * (constructing an EventSource never throws), so the static deployment had no
 * live sync at all.
 */
export function subscribeToEvents(onEvent: (event: any) => void): () => void {
  let disposed = false;
  let cleanup: (() => void) | null = null;

  const startCloudMode = () => {
    if (disposed) return;
    const stopSync = startCloudSync();
    const off = onRemoteChange(() => onEvent({ type: 'cloud_sync' }));
    cleanup = () => {
      off();
      stopSync();
    };
  };

  const startServerMode = () => {
    if (disposed) return;
    const eventSource = new EventSource(`${API_BASE}/events`);

    eventSource.addEventListener('state_updated', (e) => {
      try {
        onEvent(JSON.parse((e as MessageEvent).data));
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    });

    // EventSource fails asynchronously; that is the only reliable signal that
    // the server is gone, so treat it as the switch to cloud mode.
    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        eventSource.close();
        serverAvailable = false;
        cleanup = null;
        startCloudMode();
      }
    };

    cleanup = () => eventSource.close();
  };

  void probeServer().then((ok) => (ok ? startServerMode() : startCloudMode()));

  return () => {
    disposed = true;
    cleanup?.();
  };
}
