import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';
import { db, getUser, getUsers } from './db.js';
import { UserId } from './types.js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';

export let bot: Bot | null = null;

export function initTelegramBot() {
  if (!BOT_TOKEN) {
    console.log('ℹ️ TELEGRAM_BOT_TOKEN не задан в .env — бот не запущен (веб-приложение работает автономно).');
    return;
  }

  try {
    bot = new Bot(BOT_TOKEN);

    bot.command('start', async (ctx) => {
      const from = ctx.from;
      const firstName = from?.first_name || 'Друг';
      const telegramId = from?.id.toString() || '';

      const keyboard = new InlineKeyboard()
        .webApp('🎯 Открыть Челлендж 30 Дней', WEBAPP_URL)
        .row()
        .text('📊 Текущий стрик', 'streak_info');

      await ctx.reply(
        `👋 Привет, ${firstName}!\n\n` +
        `Добро пожаловать в трекер 30-дневного челленджа Серёжи и Леры! 🚀\n\n` +
        `🔥 Наша цель: продержаться 30 дней без срывов по питанию и закрывать все ежедневные привычки каждый день.\n\n` +
        `Нажмите кнопку ниже, чтобы открыть приложение:`,
        { reply_markup: keyboard }
      );
    });

    bot.command('status', async (ctx) => {
      const users = getUsers();
      const sereja = users.sereja;
      const lera = users.lera;

      const message = `📊 **Статус челленджа:**\n\n` +
        `👦 **Серёжа**: День ${sereja.current_streak} / 30 (Рекорд: ${sereja.max_streak})\n` +
        `👧 **Лера**: День ${lera.current_streak} / 30 (Рекорд: ${lera.max_streak})\n\n` +
        `Открывайте мини-апп, чтобы отметить сегодняшние цели!`;

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().webApp('🎯 Открыть челлендж', WEBAPP_URL),
      });
    });

    bot.callbackQuery('streak_info', async (ctx) => {
      const users = getUsers();
      const message = `🔥 **Стрики:**\n👦 Серёжа: ${users.sereja.current_streak} дн.\n👧 Лера: ${users.lera.current_streak} дн.`;
      await ctx.answerCallbackQuery();
      await ctx.reply(message, { parse_mode: 'Markdown' });
    });

    bot.start({
      onStart: (botInfo) => {
        console.log(`🤖 Telegram-бот @${botInfo.username} успешно запущен!`);
      },
    }).catch((err) => {
      console.error('Ошибка запуска Telegram бота:', err.message);
    });

  } catch (error) {
    console.error('Ошибка инициализации Telegram бота:', error);
  }
}

export async function linkTelegramUser(userId: UserId, telegramId: string) {
  try {
    db.prepare('UPDATE users SET telegram_id = ? WHERE id = ?').run(telegramId, userId);
  } catch (err) {
    console.error('Ошибка привязки Telegram ID:', err);
  }
}

export async function notifyPartner(actorId: UserId, message: string) {
  if (!bot) return;
  const partnerId: UserId = actorId === 'sereja' ? 'lera' : 'sereja';
  const partner = getUser(partnerId);

  if (partner && partner.telegram_id) {
    try {
      await bot.api.sendMessage(partner.telegram_id, message, {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().webApp('🎯 Открыть челлендж', WEBAPP_URL),
      });
    } catch (err) {
      console.warn(`Не удалось отправить сообщение партнеру (${partnerId}):`, err);
    }
  }
}

export async function broadcastTelegram(message: string) {
  if (!bot) return;
  const users = getUsers();
  for (const user of Object.values(users)) {
    if (user.telegram_id) {
      try {
        await bot.api.sendMessage(user.telegram_id, message, {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard().webApp('🎯 Открыть челлендж', WEBAPP_URL),
        });
      } catch (err) {
        console.warn(`Не удалось отправить уведомление пользователю ${user.name}:`, err);
      }
    }
  }
}
