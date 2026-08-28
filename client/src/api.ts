import { AppStateResponse, Habit, HistoryDay, UserId } from './types';

const API_BASE = '/api';

export async function authenticateUserApi(params: {
  telegramId?: string | number;
  username?: string;
  firstName?: string;
  manualUserId?: UserId;
}): Promise<{ userId: UserId | null; requiresSelection?: boolean }> {
  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Auth failed');
  }
  return res.json();
}

export async function fetchAppState(date?: string): Promise<AppStateResponse> {
  const url = date ? `${API_BASE}/state?date=${date}` : `${API_BASE}/state`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch state');
  }
  return res.json();
}

export async function updateStartDateApi(startDate: string): Promise<{ success: boolean; startDate: string }> {
  const res = await fetch(`${API_BASE}/settings/start-date`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate }),
  });
  if (!res.ok) {
    throw new Error('Failed to update start date');
  }
  return res.json();
}

export async function toggleHabitApi(
  habitId: number,
  userId: UserId,
  date: string,
  completed: boolean,
  value?: string
): Promise<{ success: boolean; allDone: boolean }> {
  const res = await fetch(`${API_BASE}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habitId, userId, date, completed, value }),
  });
  if (!res.ok) {
    throw new Error('Failed to update habit');
  }
  return res.json();
}

export async function recordViolationApi(
  userId: UserId,
  date: string,
  ruleTitle: string,
  note?: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/violation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, date, ruleTitle, note }),
  });
  if (!res.ok) {
    throw new Error('Failed to record violation');
  }
  return res.json();
}

export async function createHabitApi(habit: Partial<Habit>): Promise<{ success: boolean; id: number }> {
  const res = await fetch(`${API_BASE}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  if (!res.ok) {
    throw new Error('Failed to create habit');
  }
  return res.json();
}

export async function updateHabitApi(id: number, habit: Partial<Habit>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  if (!res.ok) {
    throw new Error('Failed to update habit');
  }
  return res.json();
}

export async function deleteHabitApi(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/habits/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete habit');
  }
  return res.json();
}

export async function fetchHistoryApi(): Promise<HistoryDay[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) {
    throw new Error('Failed to fetch history');
  }
  return res.json();
}

export async function resetUserStreakApi(userId: UserId): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/user/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function linkTelegramIdApi(userId: UserId, telegramId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/link-telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, telegramId }),
  });
  return res.json();
}

export function subscribeToEvents(onEvent: (event: any) => void): () => void {
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
}
