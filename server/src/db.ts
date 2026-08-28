import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { User, Habit, HabitWithStatus, UserId, Violation } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'challenge.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      telegram_id TEXT,
      current_streak INTEGER NOT NULL DEFAULT 1,
      max_streak INTEGER NOT NULL DEFAULT 1,
      challenge_start_date TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      last_active_date TEXT
    );
  `);

  // 2. Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 3. Habits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('active', 'passive')),
      target_type TEXT NOT NULL DEFAULT 'checkbox' CHECK(target_type IN ('checkbox', 'number', 'time')),
      target_sereja TEXT NOT NULL DEFAULT '',
      target_lera TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT '',
      assigned_to TEXT NOT NULL DEFAULT 'both',
      is_active INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Migration for assigned_to
  try {
    db.exec("ALTER TABLE habits ADD COLUMN assigned_to TEXT NOT NULL DEFAULT 'both'");
  } catch (e) {
    // Column already exists
  }

  // 4. Habit logs table (date stored as YYYY-MM-DD)
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      value TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(habit_id, user_id, date),
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Violations table (logs any resets/slips)
  db.exec(`
    CREATE TABLE IF NOT EXISTS violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      rule_title TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 6. Daily summaries
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_all INTEGER NOT NULL DEFAULT 0,
      streak_at_day INTEGER NOT NULL DEFAULT 1,
      checked_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(user_id, date),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default start date (Coming Monday: 2026-08-31)
  const defaultStartDate = '2026-08-31';
  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('start_date', ?)
    ON CONFLICT(key) DO NOTHING
  `).run(defaultStartDate);

  // Seed default users if not exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, telegram_id, current_streak, max_streak, challenge_start_date, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('sereja', 'Серёжа', null, 1, 1, defaultStartDate, '#D2FF00');
    insertUser.run('lera', 'Лера', null, 1, 1, defaultStartDate, '#D2FF00');
  }

  // Seed default habits and rules if empty
  const habitCount = db.prepare('SELECT COUNT(*) as count FROM habits').get() as { count: number };
  if (habitCount.count === 0) {
    const insertHabit = db.prepare(`
      INSERT INTO habits (title, category, target_type, target_sereja, target_lera, unit, assigned_to, is_active, order_index)
      VALUES (?, ?, ?, ?, ?, ?, 'both', 1, ?)
    `);

    // Active daily habits from screenshot
    insertHabit.run('Минимальное количество шагов', 'active', 'number', '6000', '6000', 'шагов', 1);
    insertHabit.run('Время ко сну', 'active', 'time', '00:00', '23:30', '', 2);
    insertHabit.run('Занятие спортом', 'active', 'number', '40', '40', 'мин', 3);
    insertHabit.run('Изучение английского', 'active', 'number', '15', '15', 'мин', 4);

    // Passive clean-eating and lifestyle rules from screenshot
    insertHabit.run('Без газировок', 'passive', 'checkbox', '', '', '', 10);
    insertHabit.run('Без сладкого', 'passive', 'checkbox', '', '', '', 11);
    insertHabit.run('Без снеков', 'passive', 'checkbox', '', '', '', 12);
    insertHabit.run('Без Сока', 'passive', 'checkbox', '', '', '', 13);
    insertHabit.run('Без мазика и кетчупа', 'passive', 'checkbox', '', '', '', 14);
    insertHabit.run('Фастфуд (запрещено)', 'passive', 'checkbox', '', '', '', 15);
    insertHabit.run('Без жарки в масле', 'passive', 'checkbox', '', '', '', 16);
    insertHabit.run('Без алкоголя', 'passive', 'checkbox', '', '', '', 17);
    insertHabit.run('Без сигарет', 'passive', 'checkbox', '', '', '', 18);
  }
}

export function getStartDate(): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'start_date'").get() as { value: string } | undefined;
  return row?.value || '2026-08-31';
}

export function setStartDate(startDate: string) {
  db.prepare(`
    INSERT INTO settings (key, value)
    VALUES ('start_date', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(startDate);

  db.prepare('UPDATE users SET challenge_start_date = ?').run(startDate);
}

export function getUsers(): Record<UserId, User> {
  const rows = db.prepare('SELECT * FROM users').all() as User[];
  const result = {} as Record<UserId, User>;
  for (const u of rows) {
    result[u.id] = u;
  }
  return result;
}

export function getUser(id: UserId): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function updateStreak(id: UserId, newStreak: number) {
  const user = getUser(id);
  if (!user) return;
  const maxStreak = Math.max(user.max_streak, newStreak);
  db.prepare('UPDATE users SET current_streak = ?, max_streak = ? WHERE id = ?').run(newStreak, maxStreak, id);
}

export function resetStreak(id: UserId) {
  const today = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE users SET current_streak = 1, challenge_start_date = ? WHERE id = ?').run(today, id);
}

export function getHabitsWithStatus(date: string): { activeHabits: HabitWithStatus[], passiveRules: Habit[] } {
  const allHabits = db.prepare('SELECT * FROM habits WHERE is_active = 1 ORDER BY order_index ASC, id ASC').all() as Habit[];
  
  const logs = db.prepare('SELECT * FROM habit_logs WHERE date = ?').all(date) as Array<{
    habit_id: number;
    user_id: UserId;
    completed: number;
    value: string | null;
    updated_at: string;
  }>;

  const logsMap = new Map<string, { completed: boolean; value: string | null; updated_at: string }>();
  for (const log of logs) {
    logsMap.set(`${log.habit_id}_${log.user_id}`, {
      completed: log.completed === 1,
      value: log.value,
      updated_at: log.updated_at,
    });
  }

  const activeHabits: HabitWithStatus[] = [];
  const passiveRules: Habit[] = [];

  for (const habit of allHabits) {
    if (habit.category === 'active') {
      const statusSereja = logsMap.get(`${habit.id}_sereja`) || { completed: false, value: null };
      const statusLera = logsMap.get(`${habit.id}_lera`) || { completed: false, value: null };
      activeHabits.push({
        ...habit,
        assigned_to: habit.assigned_to || 'both',
        status_sereja: statusSereja,
        status_lera: statusLera,
      });
    } else {
      passiveRules.push({
        ...habit,
        assigned_to: habit.assigned_to || 'both',
      });
    }
  }

  return { activeHabits, passiveRules };
}

export function toggleHabitLog(habitId: number, userId: UserId, date: string, completed: boolean, value: string | null = null) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO habit_logs (habit_id, user_id, date, completed, value, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(habit_id, user_id, date) DO UPDATE SET
      completed = excluded.completed,
      value = excluded.value,
      updated_at = excluded.updated_at
  `);
  stmt.run(habitId, userId, date, completed ? 1 : 0, value, now);
}

export function recordViolation(userId: UserId, date: string, ruleTitle: string, note: string | null = null) {
  const insert = db.prepare(`
    INSERT INTO violations (user_id, date, rule_title, note)
    VALUES (?, ?, ?, ?)
  `);
  insert.run(userId, date, ruleTitle, note);
  resetStreak(userId);
}

export function getViolations(date?: string): Violation[] {
  if (date) {
    return db.prepare('SELECT * FROM violations WHERE date = ? ORDER BY id DESC').all(date) as Violation[];
  }
  return db.prepare('SELECT * FROM violations ORDER BY id DESC LIMIT 50').all() as Violation[];
}

export function getHistoryDays(): Array<{
  date: string;
  serejaCompleted: number;
  serejaTotal: number;
  leraCompleted: number;
  leraTotal: number;
  serejaViolations: number;
  leraViolations: number;
}> {
  const activeHabitsCount = (db.prepare("SELECT COUNT(*) as count FROM habits WHERE category = 'active' AND is_active = 1").get() as { count: number }).count;
  
  const datesRows = db.prepare(`
    SELECT DISTINCT date FROM habit_logs
    UNION
    SELECT DISTINCT date FROM violations
    ORDER BY date DESC
    LIMIT 60
  `).all() as Array<{ date: string }>;

  return datesRows.map(({ date }) => {
    const serejaDone = (db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE date = ? AND user_id = 'sereja' AND completed = 1").get(date) as { c: number }).c;
    const leraDone = (db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE date = ? AND user_id = 'lera' AND completed = 1").get(date) as { c: number }).c;
    const serejaV = (db.prepare("SELECT COUNT(*) as c FROM violations WHERE date = ? AND user_id = 'sereja'").get(date) as { c: number }).c;
    const leraV = (db.prepare("SELECT COUNT(*) as c FROM violations WHERE date = ? AND user_id = 'lera'").get(date) as { c: number }).c;

    return {
      date,
      serejaCompleted: serejaDone,
      serejaTotal: activeHabitsCount,
      leraCompleted: leraDone,
      leraTotal: activeHabitsCount,
      serejaViolations: serejaV,
      leraViolations: leraV,
    };
  });
}
