import cron from 'node-cron';
import { db, getUser, getUsers, resetStreak, updateStreak } from './db.js';
import { broadcastTelegram } from './bot.js';
import { formatDate } from './dateUtils.js';
import { UserId } from './types.js';
import { sseManager } from './sse.js';

export function initCronJobs() {
  // 1. Every day at 12:00 (Noon) - Grace Period Check for yesterday
  cron.schedule('0 12 * * *', () => {
    console.log('⏰ [CRON 12:00] Выполняется проверка дедлайна льготного периода за вчера...');
    evaluateYesterdayResults();
  });

  // 2. Every day at 21:30 - Evening Reminder to check off remaining tasks
  cron.schedule('30 21 * * *', async () => {
    console.log('🔔 [CRON 21:30] Отправка вечернего напоминания...');
    await sendEveningReminders();
  });
}

export function evaluateYesterdayResults() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const activeHabits = db.prepare("SELECT * FROM habits WHERE category = 'active' AND is_active = 1").all() as Array<{ id: number; title: string }>;
  const users: UserId[] = ['sereja', 'lera'];

  for (const userId of users) {
    const user = getUser(userId);
    if (!user) continue;

    // Check violations yesterday
    const violationsCount = (db.prepare('SELECT COUNT(*) as c FROM violations WHERE user_id = ? AND date = ?').get(userId, yesterdayStr) as { c: number }).c;
    
    // Check completed active habits yesterday
    const completedCount = (db.prepare(`
      SELECT COUNT(*) as c FROM habit_logs 
      WHERE user_id = ? AND date = ? AND completed = 1 AND habit_id IN (SELECT id FROM habits WHERE category = 'active' AND is_active = 1)
    `).get(userId, yesterdayStr) as { c: number }).c;

    const allCompleted = activeHabits.length > 0 && completedCount === activeHabits.length && violationsCount === 0;

    // Record summary
    db.prepare(`
      INSERT INTO daily_summaries (user_id, date, completed_all, streak_at_day)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        completed_all = excluded.completed_all,
        streak_at_day = excluded.streak_at_day
    `).run(userId, yesterdayStr, allCompleted ? 1 : 0, user.current_streak);

    if (allCompleted) {
      // Advance streak if not already updated today
      const newStreak = Math.min(30, user.current_streak + 1);
      updateStreak(userId, newStreak);
      console.log(`✅ ${user.name} успешно закрыл(а) день ${yesterdayStr}! Новый стрик: ${newStreak}`);
    } else if (violationsCount === 0) {
      // Not completed and no explicit violation recorded yet -> reset due to missed habits
      resetStreak(userId);
      db.prepare(`
        INSERT INTO violations (user_id, date, rule_title, note)
        VALUES (?, ?, ?, ?)
      `).run(userId, yesterdayStr, 'Пропуск ежедневных привычек', `Не все задачи были выполнены за ${yesterdayStr} до дедлайна 12:00`);
      console.log(`⚠️ ${user.name} не выполнил(а) все задачи за ${yesterdayStr}. Стрик сброшен на День 1.`);
    }
  }

  // Notify clients via SSE
  sseManager.broadcast('state_updated', { reason: 'cron_evaluation' });

  // Send summary to Telegram
  const updatedUsers = getUsers();
  broadcastTelegram(
    `⏰ *Итоги вчерашнего дня (${yesterdayStr}) подведены!*\n\n` +
    `👦 *Серёжа*: День ${updatedUsers.sereja.current_streak} / 30\n` +
    `👧 *Лера*: День ${updatedUsers.lera.current_streak} / 30\n\n` +
    `Вперёд к новым победам сегодня! 💪`
  );
}

async function sendEveningReminders() {
  const todayStr = formatDate(new Date());
  const activeHabits = db.prepare("SELECT * FROM habits WHERE category = 'active' AND is_active = 1").all() as Array<{ id: number; title: string }>;

  const users = getUsers();
  for (const user of Object.values(users)) {
    if (!user.telegram_id) continue;

    const completed = (db.prepare(`
      SELECT COUNT(*) as c FROM habit_logs 
      WHERE user_id = ? AND date = ? AND completed = 1
    `).get(user.id, todayStr) as { c: number }).c;

    const remaining = activeHabits.length - completed;
    if (remaining > 0) {
      try {
        await broadcastTelegram(
          `🔔 *Напоминание на вечер для ${user.name}:*\n` +
          `Осталось выполнить задач на сегодня: *${remaining} из ${activeHabits.length}*.\n` +
          `Не забудьте отметить до сна или утром до 12:00! 🔥`
        );
      } catch (err) {
        console.warn('Reminder error:', err);
      }
    }
  }
}
