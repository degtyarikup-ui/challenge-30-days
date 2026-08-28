import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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
    // 2. Habits table
    db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('active', 'passive')),
      target_type TEXT NOT NULL DEFAULT 'checkbox' CHECK(target_type IN ('checkbox', 'number', 'time')),
      target_sereja TEXT NOT NULL DEFAULT '',
      target_lera TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
    // 3. Habit logs table (date stored as YYYY-MM-DD)
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
    // 4. Violations table (logs any resets/slips)
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
    // 5. Daily summaries
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
    // Seed default users if not exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count === 0) {
        const today = new Date().toISOString().split('T')[0];
        const insertUser = db.prepare(`
      INSERT INTO users (id, name, telegram_id, current_streak, max_streak, challenge_start_date, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        insertUser.run('sereja', 'Серёжа', null, 1, 1, today, '#3B82F6');
        insertUser.run('lera', 'Лера', null, 1, 1, today, '#EC4899');
    }
    // Seed default habits and rules if empty
    const habitCount = db.prepare('SELECT COUNT(*) as count FROM habits').get();
    if (habitCount.count === 0) {
        const insertHabit = db.prepare(`
      INSERT INTO habits (title, category, target_type, target_sereja, target_lera, unit, is_active, order_index)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
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
export function getUsers() {
    const rows = db.prepare('SELECT * FROM users').all();
    const result = {};
    for (const u of rows) {
        result[u.id] = u;
    }
    return result;
}
export function getUser(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}
export function updateStreak(id, newStreak) {
    const user = getUser(id);
    if (!user)
        return;
    const maxStreak = Math.max(user.max_streak, newStreak);
    db.prepare('UPDATE users SET current_streak = ?, max_streak = ? WHERE id = ?').run(newStreak, maxStreak, id);
}
export function resetStreak(id) {
    const today = new Date().toISOString().split('T')[0];
    db.prepare('UPDATE users SET current_streak = 1, challenge_start_date = ? WHERE id = ?').run(today, id);
}
export function getHabitsWithStatus(date) {
    const allHabits = db.prepare('SELECT * FROM habits WHERE is_active = 1 ORDER BY order_index ASC, id ASC').all();
    const logs = db.prepare('SELECT * FROM habit_logs WHERE date = ?').all(date);
    const logsMap = new Map();
    for (const log of logs) {
        logsMap.set(`${log.habit_id}_${log.user_id}`, {
            completed: log.completed === 1,
            value: log.value,
            updated_at: log.updated_at,
        });
    }
    const activeHabits = [];
    const passiveRules = [];
    for (const habit of allHabits) {
        if (habit.category === 'active') {
            const statusSereja = logsMap.get(`${habit.id}_sereja`) || { completed: false, value: null };
            const statusLera = logsMap.get(`${habit.id}_lera`) || { completed: false, value: null };
            activeHabits.push({
                ...habit,
                status_sereja: statusSereja,
                status_lera: statusLera,
            });
        }
        else {
            passiveRules.push(habit);
        }
    }
    return { activeHabits, passiveRules };
}
export function toggleHabitLog(habitId, userId, date, completed, value = null) {
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
export function recordViolation(userId, date, ruleTitle, note = null) {
    const insert = db.prepare(`
    INSERT INTO violations (user_id, date, rule_title, note)
    VALUES (?, ?, ?, ?)
  `);
    insert.run(userId, date, ruleTitle, note);
    resetStreak(userId);
}
export function getViolations(date) {
    if (date) {
        return db.prepare('SELECT * FROM violations WHERE date = ? ORDER BY id DESC').all(date);
    }
    return db.prepare('SELECT * FROM violations ORDER BY id DESC LIMIT 50').all();
}
export function getHistoryDays() {
    // Aggregate history for calendar
    const activeHabitsCount = db.prepare("SELECT COUNT(*) as count FROM habits WHERE category = 'active' AND is_active = 1").get().count;
    const datesRows = db.prepare(`
    SELECT DISTINCT date FROM habit_logs
    UNION
    SELECT DISTINCT date FROM violations
    ORDER BY date DESC
    LIMIT 60
  `).all();
    return datesRows.map(({ date }) => {
        const serejaDone = db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE date = ? AND user_id = 'sereja' AND completed = 1").get(date).c;
        const leraDone = db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE date = ? AND user_id = 'lera' AND completed = 1").get(date).c;
        const serejaV = db.prepare("SELECT COUNT(*) as c FROM violations WHERE date = ? AND user_id = 'sereja'").get(date).c;
        const leraV = db.prepare("SELECT COUNT(*) as c FROM violations WHERE date = ? AND user_id = 'lera'").get(date).c;
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
