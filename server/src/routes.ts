import { Router, Request, Response } from 'express';
import {
  db,
  getUsers,
  getUser,
  getStartDate,
  setStartDate,
  getHabitsWithStatus,
  toggleHabitLog,
  recordViolation,
  getViolations,
  getHistoryDays,
  resetStreak,
  updateStreak
} from './db.js';
import { getDateInfo } from './dateUtils.js';
import { sseManager } from './sse.js';
import { linkTelegramUser, notifyPartner } from './bot.js';
import { evaluateYesterdayResults } from './cron.js';
import { Habit, UserId } from './types.js';

export const apiRouter = Router();

// Auth / Auto-detect endpoint for Telegram
apiRouter.post('/auth', (req: Request, res: Response) => {
  const { telegramId, username, firstName, manualUserId } = req.body as {
    telegramId?: string | number;
    username?: string;
    firstName?: string;
    manualUserId?: UserId;
  };

  const tgIdStr = telegramId ? telegramId.toString() : null;

  // 1. Check if Telegram ID already mapped in DB
  if (tgIdStr) {
    const matchedUser = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(tgIdStr) as { id: UserId } | undefined;
    if (matchedUser) {
      return res.json({ userId: matchedUser.id, autoDetected: true });
    }
  }

  // 2. Auto-detect by firstName or username if matches
  const nameStr = `${firstName || ''} ${username || ''}`.toLowerCase();
  let detectedId: UserId | null = null;

  if (nameStr.includes('сергей') || nameStr.includes('сережа') || nameStr.includes('degtyarik') || nameStr.includes('sergei') || nameStr.includes('sereja')) {
    detectedId = 'sereja';
  } else if (nameStr.includes('лера') || nameStr.includes('валерия') || nameStr.includes('lera') || nameStr.includes('valeria')) {
    detectedId = 'lera';
  } else if (manualUserId === 'sereja' || manualUserId === 'lera') {
    detectedId = manualUserId;
  }

  if (detectedId && tgIdStr) {
    linkTelegramUser(detectedId, tgIdStr);
  }

  res.json({
    userId: detectedId,
    requiresSelection: !detectedId,
  });
});

// 1. Get Application Full State
apiRouter.get('/state', (req: Request, res: Response) => {
  const reqDate = typeof req.query.date === 'string' ? req.query.date : undefined;
  const dateInfo = getDateInfo(reqDate);
  const selectedDate = dateInfo.targetDate;

  const users = getUsers();
  const startDate = getStartDate();

  // Calculate days until start or current day index
  const todayMs = new Date(dateInfo.actualDate).getTime();
  const startMs = new Date(startDate).getTime();
  const diffDays = Math.round((startMs - todayMs) / (1000 * 60 * 60 * 24));

  const { activeHabits, passiveRules } = getHabitsWithStatus(selectedDate);
  const violations = getViolations(selectedDate);
  const recentViolations = getViolations();

  const serejaCompletedCount = activeHabits.filter(h => h.assigned_to !== 'lera' && h.status_sereja.completed).length;
  const leraCompletedCount = activeHabits.filter(h => h.assigned_to !== 'sereja' && h.status_lera.completed).length;

  res.json({
    users,
    date: selectedDate,
    actualDate: dateInfo.actualDate,
    yesterdayDate: dateInfo.yesterdayDate,
    isGracePeriod: dateInfo.isGracePeriod,
    gracePeriodDeadline: dateInfo.gracePeriodDeadline,
    startDate,
    daysUntilStart: diffDays,
    habits: activeHabits,
    passiveRules,
    violations,
    recentViolations,
    stats: {
      totalDays: 30,
      serejaCompletedCountToday: serejaCompletedCount,
      leraCompletedCountToday: leraCompletedCount,
      totalActiveHabits: activeHabits.length,
    }
  });
});

// 2. Update Start Date (Manual Setting)
apiRouter.post('/settings/start-date', (req: Request, res: Response) => {
  const { startDate } = req.body as { startDate: string };
  if (!startDate) {
    return res.status(400).json({ error: 'Missing startDate' });
  }

  setStartDate(startDate);
  sseManager.broadcast('state_updated', { type: 'start_date_updated', startDate });
  res.json({ success: true, startDate });
});

// 3. Toggle / Check habit (enforcing user restriction)
apiRouter.post('/check', (req: Request, res: Response) => {
  const { habitId, userId, date, completed, value } = req.body as {
    habitId: number;
    userId: UserId;
    date: string;
    completed: boolean;
    value?: string;
  };

  if (!habitId || !userId || !date) {
    return res.status(400).json({ error: 'Missing habitId, userId or date' });
  }

  toggleHabitLog(habitId, userId, date, completed, value || null);

  // Broadcast update to all clients
  sseManager.broadcast('state_updated', {
    type: 'habit_toggled',
    habitId,
    userId,
    date,
    completed,
    value,
  });

  // Check if this action completed all active habits for the day
  const { activeHabits } = getHabitsWithStatus(date);
  const userKey = userId === 'sereja' ? 'status_sereja' : 'status_lera';
  const relevantHabits = activeHabits.filter(h => h.assigned_to === 'both' || h.assigned_to === userId);
  const allDone = relevantHabits.length > 0 && relevantHabits.every(h => h[userKey].completed);

  if (allDone && completed) {
    const user = getUser(userId);
    const userName = user?.name || (userId === 'sereja' ? 'Серёжа' : 'Лера');
    notifyPartner(userId, `${userName} выполнил(а) все задачи на ${date}.`);
  }

  res.json({ success: true, allDone });
});

// 4. Record Violation / Reset Streak
apiRouter.post('/violation', (req: Request, res: Response) => {
  const { userId, date, ruleTitle, note } = req.body as {
    userId: UserId;
    date: string;
    ruleTitle: string;
    note?: string;
  };

  if (!userId || !date || !ruleTitle) {
    return res.status(400).json({ error: 'Missing userId, date or ruleTitle' });
  }

  recordViolation(userId, date, ruleTitle, note || null);

  const user = getUser(userId);
  const userName = user?.name || (userId === 'sereja' ? 'Серёжа' : 'Лера');

  notifyPartner(userId, `${userName} зафиксировал(а) нарушение: «${ruleTitle}»${note ? ` (${note})` : ''}. Стрик сброшен на День 1.`);

  sseManager.broadcast('state_updated', {
    type: 'violation_recorded',
    userId,
    date,
    ruleTitle,
  });

  res.json({ success: true, message: 'Срыв зафиксирован, стрик сброшен на День 1' });
});

// 5. Link Telegram ID
apiRouter.post('/link-telegram', (req: Request, res: Response) => {
  const { userId, telegramId } = req.body as { userId: UserId; telegramId: string };
  if (!userId || !telegramId) {
    return res.status(400).json({ error: 'Missing userId or telegramId' });
  }
  linkTelegramUser(userId, telegramId);
  res.json({ success: true });
});

// 6. Habits CRUD
apiRouter.post('/habits', (req: Request, res: Response) => {
  const { title, category, target_type, target_sereja, target_lera, unit, assigned_to } = req.body as Habit;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const maxOrder = (db.prepare('SELECT MAX(order_index) as m FROM habits').get() as { m: number | null }).m || 0;

  const result = db.prepare(`
    INSERT INTO habits (title, category, target_type, target_sereja, target_lera, unit, assigned_to, is_active, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    title.trim(),
    category,
    target_type || 'checkbox',
    target_sereja || '',
    target_lera || '',
    unit || '',
    assigned_to || 'both',
    maxOrder + 1
  );

  sseManager.broadcast('state_updated', { type: 'habit_created', id: result.lastInsertRowid });
  res.json({ success: true, id: result.lastInsertRowid });
});

apiRouter.put('/habits/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  const { title, target_type, target_sereja, target_lera, unit, assigned_to } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.prepare(`
    UPDATE habits SET
      title = ?,
      target_type = ?,
      target_sereja = ?,
      target_lera = ?,
      unit = ?,
      assigned_to = ?
    WHERE id = ?
  `).run(
    title.trim(),
    target_type || 'checkbox',
    target_sereja || '',
    target_lera || '',
    unit || '',
    assigned_to || 'both',
    id
  );

  sseManager.broadcast('state_updated', { type: 'habit_updated', id });
  res.json({ success: true });
});

apiRouter.delete('/habits/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string, 10);
  db.prepare('UPDATE habits SET is_active = 0 WHERE id = ?').run(id);
  sseManager.broadcast('state_updated', { type: 'habit_deleted', id });
  res.json({ success: true });
});

// 7. History for Calendar
apiRouter.get('/history', (_req: Request, res: Response) => {
  const history = getHistoryDays();
  res.json(history);
});

// 8. Manual update streak / reset
apiRouter.post('/user/reset', (req: Request, res: Response) => {
  const { userId } = req.body as { userId: UserId };
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  resetStreak(userId);
  sseManager.broadcast('state_updated', { type: 'user_reset', userId });
  res.json({ success: true });
});

apiRouter.post('/user/set-streak', (req: Request, res: Response) => {
  const { userId, streak } = req.body as { userId: UserId; streak: number };
  if (!userId || typeof streak !== 'number') return res.status(400).json({ error: 'Invalid params' });
  updateStreak(userId, streak);
  sseManager.broadcast('state_updated', { type: 'streak_updated', userId, streak });
  res.json({ success: true });
});

// 9. SSE Events Stream
apiRouter.get('/events', (req: Request, res: Response) => {
  const clientId = sseManager.addClient(res);
  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

// 10. Manual trigger for testing evaluation
apiRouter.post('/cron/evaluate-now', (_req: Request, res: Response) => {
  evaluateYesterdayResults();
  res.json({ success: true, message: 'Grace period evaluation executed' });
});
