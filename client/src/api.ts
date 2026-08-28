import { AppStateResponse, Habit, HistoryDay, UserId, HabitWithStatus, Violation, User } from './types';

const API_BASE = '/api';
const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a04a3f6b575799';

// Initial Mock / Local Storage Data for GitHub Pages
const DEFAULT_HABITS: Habit[] = [
  { id: 1, title: 'Минимальное количество шагов', category: 'active', target_type: 'number', target_sereja: '6000', target_lera: '6000', unit: 'шагов', is_active: 1, order_index: 1, created_at: '' },
  { id: 2, title: 'Время ко сну', category: 'active', target_type: 'time', target_sereja: '00:00', target_lera: '23:30', unit: '', is_active: 1, order_index: 2, created_at: '' },
  { id: 3, title: 'Занятие спортом', category: 'active', target_type: 'number', target_sereja: '40', target_lera: '40', unit: 'мин', is_active: 1, order_index: 3, created_at: '' },
  { id: 4, title: 'Изучение английского', category: 'active', target_type: 'number', target_sereja: '15', target_lera: '15', unit: 'мин', is_active: 1, order_index: 4, created_at: '' },
  { id: 10, title: 'Без газировок', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 10, created_at: '' },
  { id: 11, title: 'Без сладкого', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 11, created_at: '' },
  { id: 12, title: 'Без снеков', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 12, created_at: '' },
  { id: 13, title: 'Без Сока', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 13, created_at: '' },
  { id: 14, title: 'Без мазика и кетчупа', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 14, created_at: '' },
  { id: 15, title: 'Фастфуд (запрещено)', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 15, created_at: '' },
  { id: 16, title: 'Без жарки в масле', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 16, created_at: '' },
  { id: 17, title: 'Без алкоголя', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 17, created_at: '' },
  { id: 18, title: 'Без сигарет', category: 'passive', target_type: 'checkbox', target_sereja: '', target_lera: '', unit: '', is_active: 1, order_index: 18, created_at: '' },
];

// Push local data to Cloud
async function pushToCloud() {
  try {
    const logs = JSON.parse(localStorage.getItem('challenge_logs') || '{}');
    const habits = JSON.parse(localStorage.getItem('challenge_habits') || 'null');
    const violations = JSON.parse(localStorage.getItem('challenge_violations') || 'null');
    const startDate = localStorage.getItem('challenge_start_date') || '2026-08-31';
    const users = JSON.parse(localStorage.getItem('challenge_users') || 'null');

    const payload = {
      name: 'challenge_state',
      data: {
        logs,
        habits: habits || undefined,
        violations: violations || undefined,
        startDate,
        users: users || undefined,
        lastUpdated: Date.now(),
      }
    };

    await fetch(CLOUD_SYNC_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Ignore offline errors
  }
}

// Pull data from Cloud and merge
async function pullFromCloud() {
  try {
    const res = await fetch(CLOUD_SYNC_URL);
    if (res.ok) {
      const resp = await res.json();
      const data = resp.data;
      if (data && data.logs) {
        const localLogs = JSON.parse(localStorage.getItem('challenge_logs') || '{}');
        const mergedLogs = { ...localLogs, ...data.logs };
        localStorage.setItem('challenge_logs', JSON.stringify(mergedLogs));

        if (data.habits && data.habits.length > 0) {
          localStorage.setItem('challenge_habits', JSON.stringify(data.habits));
        }
        if (data.violations) {
          localStorage.setItem('challenge_violations', JSON.stringify(data.violations));
        }
        if (data.startDate) {
          localStorage.setItem('challenge_start_date', data.startDate);
        }
        if (data.users) {
          localStorage.setItem('challenge_users', JSON.stringify(data.users));
        }
      }
    }
  } catch (e) {
    // Ignore offline errors
  }
}

function getLocalState(targetDate?: string): AppStateResponse {
  const now = new Date();
  const actualDate = now.toISOString().split('T')[0];
  const date = targetDate || actualDate;

  const yDate = new Date(now.getTime() - 86400000);
  const yesterdayDate = yDate.toISOString().split('T')[0];

  const habitsStr = localStorage.getItem('challenge_habits');
  const habits: Habit[] = habitsStr ? JSON.parse(habitsStr) : DEFAULT_HABITS;

  const logsStr = localStorage.getItem('challenge_logs') || '{}';
  const logs = JSON.parse(logsStr); // key: `${habitId}_${userId}_${date}` => boolean

  const violationsStr = localStorage.getItem('challenge_violations') || '[]';
  const violations: Violation[] = JSON.parse(violationsStr);

  const startDate = localStorage.getItem('challenge_start_date') || '2026-08-31';

  const users: Record<UserId, User> = {
    sereja: { id: 'sereja', name: 'Серёжа', telegram_id: null, current_streak: 1, max_streak: 1, challenge_start_date: startDate, avatar_color: '#3B82F6' },
    lera: { id: 'lera', name: 'Лера', telegram_id: null, current_streak: 1, max_streak: 1, challenge_start_date: startDate, avatar_color: '#EC4899' },
  };

  const usersSaved = localStorage.getItem('challenge_users');
  if (usersSaved) {
    Object.assign(users, JSON.parse(usersSaved));
  }

  const activeHabits: HabitWithStatus[] = [];
  const passiveRules: Habit[] = [];

  for (const h of habits.filter(h => h.is_active !== 0)) {
    if (h.category === 'active') {
      activeHabits.push({
        ...h,
        assigned_to: h.assigned_to || 'both',
        status_sereja: { completed: !!logs[`${h.id}_sereja_${date}`], value: null },
        status_lera: { completed: !!logs[`${h.id}_lera_${date}`], value: null },
      });
    } else {
      passiveRules.push({
        ...h,
        assigned_to: h.assigned_to || 'both',
      });
    }
  }

  const todayMs = new Date(actualDate).getTime();
  const startMs = new Date(startDate).getTime();
  const diffDays = Math.round((startMs - todayMs) / (1000 * 60 * 60 * 24));

  return {
    users,
    date,
    actualDate,
    yesterdayDate,
    isGracePeriod: now.getHours() < 12,
    gracePeriodDeadline: '12:00',
    startDate,
    daysUntilStart: diffDays,
    habits: activeHabits,
    passiveRules,
    violations: violations.filter(v => v.date === date),
    recentViolations: violations.slice(0, 10),
    stats: {
      totalDays: 30,
      serejaCompletedCountToday: activeHabits.filter(h => h.assigned_to !== 'lera' && h.status_sereja.completed).length,
      leraCompletedCountToday: activeHabits.filter(h => h.assigned_to !== 'sereja' && h.status_lera.completed).length,
      totalActiveHabits: activeHabits.length,
    }
  };
}

export async function authenticateUserApi(params: {
  telegramId?: string | number;
  username?: string;
  firstName?: string;
  manualUserId?: UserId;
}): Promise<{ userId: UserId | null; requiresSelection?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }

  const nameStr = `${params.firstName || ''} ${params.username || ''}`.toLowerCase();
  let detectedId: UserId | null = null;
  if (nameStr.includes('сергей') || nameStr.includes('сережа') || nameStr.includes('degtyarik') || nameStr.includes('sergei')) {
    detectedId = 'sereja';
  } else if (nameStr.includes('лера') || nameStr.includes('валерия') || nameStr.includes('lera') || nameStr.includes('valeria')) {
    detectedId = 'lera';
  } else if (params.manualUserId) {
    detectedId = params.manualUserId;
  }
  return { userId: detectedId, requiresSelection: !detectedId };
}

export async function fetchAppState(date?: string): Promise<AppStateResponse> {
  try {
    const url = date ? `${API_BASE}/state?date=${date}` : `${API_BASE}/state`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    // Pull latest updates from Cloud on GitHub Pages
    await pullFromCloud();
  }
  return getLocalState(date);
}

export async function updateStartDateApi(startDate: string): Promise<{ success: boolean; startDate: string }> {
  try {
    const res = await fetch(`${API_BASE}/settings/start-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }
  localStorage.setItem('challenge_start_date', startDate);
  pushToCloud();
  return { success: true, startDate };
}

export async function toggleHabitApi(
  habitId: number,
  userId: UserId,
  date: string,
  completed: boolean,
  value?: string
): Promise<{ success: boolean; allDone: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, userId, date, completed, value }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }

  const logsStr = localStorage.getItem('challenge_logs') || '{}';
  const logs = JSON.parse(logsStr);
  logs[`${habitId}_${userId}_${date}`] = completed;
  localStorage.setItem('challenge_logs', JSON.stringify(logs));
  pushToCloud();
  return { success: true, allDone: false };
}

export async function recordViolationApi(
  userId: UserId,
  date: string,
  ruleTitle: string,
  note?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date, ruleTitle, note }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }

  const violationsStr = localStorage.getItem('challenge_violations') || '[]';
  const violations: Violation[] = JSON.parse(violationsStr);
  violations.unshift({
    id: Date.now(),
    user_id: userId,
    date,
    rule_title: ruleTitle,
    note: note || null,
    created_at: new Date().toISOString(),
  });
  localStorage.setItem('challenge_violations', JSON.stringify(violations));
  pushToCloud();
  return { success: true, message: 'Срыв зафиксирован' };
}

export async function createHabitApi(habit: Partial<Habit>): Promise<{ success: boolean; id: number }> {
  try {
    const res = await fetch(`${API_BASE}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }

  const habitsStr = localStorage.getItem('challenge_habits');
  const habits: Habit[] = habitsStr ? JSON.parse(habitsStr) : [...DEFAULT_HABITS];
  const newId = Date.now();
  habits.push({
    id: newId,
    title: habit.title || 'Новая цель',
    category: habit.category || 'active',
    target_type: habit.target_type || 'number',
    target_sereja: habit.target_sereja || '',
    target_lera: habit.target_lera || '',
    unit: habit.unit || '',
    icon: habit.icon || 'footprints',
    assigned_to: habit.assigned_to || 'both',
    is_active: 1,
    order_index: habits.length + 1,
    created_at: new Date().toISOString(),
  });
  localStorage.setItem('challenge_habits', JSON.stringify(habits));
  pushToCloud();
  return { success: true, id: newId };
}

export async function updateHabitApi(id: number, habit: Partial<Habit>): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }

  const habitsStr = localStorage.getItem('challenge_habits');
  const habits: Habit[] = habitsStr ? JSON.parse(habitsStr) : [...DEFAULT_HABITS];
  const idx = habits.findIndex(h => h.id === id);
  if (idx !== -1) {
    habits[idx] = { ...habits[idx], ...habit };
    localStorage.setItem('challenge_habits', JSON.stringify(habits));
    pushToCloud();
  }
  return { success: true };
}

export async function deleteHabitApi(id: number): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }

  const habitsStr = localStorage.getItem('challenge_habits');
  const habits: Habit[] = habitsStr ? JSON.parse(habitsStr) : [...DEFAULT_HABITS];
  const filtered = habits.filter(h => h.id !== id);
  localStorage.setItem('challenge_habits', JSON.stringify(filtered));
  pushToCloud();
  return { success: true };
}

export async function fetchHistoryApi(): Promise<HistoryDay[]> {
  try {
    const res = await fetch(`${API_BASE}/history`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback on GitHub Pages
  }
  return [];
}

export async function resetUserStreakApi(userId: UserId): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/user/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return { success: true };
}

export async function linkTelegramIdApi(userId: UserId, telegramId: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/link-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, telegramId }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return { success: true };
}

export function subscribeToEvents(onEvent: (event: any) => void): () => void {
  try {
    const eventSource = new EventSource(`${API_BASE}/events`);

    eventSource.addEventListener('state_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  } catch (e) {
    // Background live cloud sync polling interval for GitHub Pages (every 2.5s)
    const interval = setInterval(async () => {
      await pullFromCloud();
      onEvent({ type: 'cloud_sync' });
    }, 2500);

    return () => {
      clearInterval(interval);
    };
  }
}
