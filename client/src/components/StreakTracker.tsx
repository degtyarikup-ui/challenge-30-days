import React from 'react';
import { User, UserId } from '../types';
import { Trophy } from 'lucide-react';

interface StreakTrackerProps {
  users: Record<UserId, User>;
  currentUserId: UserId;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ users, currentUserId }) => {
  const sereja = users.sereja || { current_streak: 1, max_streak: 1, name: 'Серёжа' };
  const lera = users.lera || { current_streak: 1, max_streak: 1, name: 'Лера' };

  const milestones = [
    { day: 1, label: 'Старт', icon: '🚀' },
    { day: 7, label: '7 дней', icon: '🔥' },
    { day: 14, label: 'Экватор', icon: '⚡' },
    { day: 21, label: 'Привычка', icon: '🎯' },
    { day: 30, label: 'Победа', icon: '👑' },
  ];

  const getMilestoneLabel = (streak: number) => {
    if (streak >= 30) return '🎉 30 ДНЕЙ ПРОЙДЕНО!';
    if (streak >= 21) return '🔥 Финальный рывок (21+ дней)';
    if (streak >= 14) return '⚡ Перевалили за экватор (14+ дней)';
    if (streak >= 7) return '💪 1 неделя без срывов!';
    if (streak > 1) return `✨ День ${streak} подряд`;
    return '🏁 День 1 (Новый старт)';
  };

  return (
    <div className="bg-card/70 backdrop-blur border border-card-border/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Title & Milestones Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Цель: 30 Дней Челленджа
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
          Строгий режим
        </span>
      </div>

      {/* Dual Streak Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sereja Card */}
        <div
          className={`relative p-3 rounded-xl border transition-all ${
            currentUserId === 'sereja'
              ? 'bg-blue-950/40 border-blue-500/60 shadow-glow-blue'
              : 'bg-card border-card-border/60 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
              👦 Серёжа
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Рекорд: {sereja.max_streak} дн.
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {sereja.current_streak}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 30 дн.</span>
          </div>

          <div className="text-[11px] text-blue-300/80 font-medium mt-0.5 truncate">
            {getMilestoneLabel(sereja.current_streak)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, (sereja.current_streak / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* Lera Card */}
        <div
          className={`relative p-3 rounded-xl border transition-all ${
            currentUserId === 'lera'
              ? 'bg-pink-950/40 border-pink-500/60 shadow-glow-pink'
              : 'bg-card border-card-border/60 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
              👧 Лера
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Рекорд: {lera.max_streak} дн.
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lera.current_streak}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 30 дн.</span>
          </div>

          <div className="text-[11px] text-pink-300/80 font-medium mt-0.5 truncate">
            {getMilestoneLabel(lera.current_streak)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-400 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, (lera.current_streak / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Roadmap / Milestones */}
      <div className="pt-2">
        <div className="flex items-center justify-between px-1">
          {milestones.map((m) => {
            const isReachedByBoth = sereja.current_streak >= m.day && lera.current_streak >= m.day;
            const isReachedByAny = sereja.current_streak >= m.day || lera.current_streak >= m.day;

            return (
              <div key={m.day} className="flex flex-col items-center space-y-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                    isReachedByBoth
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-glow-gold scale-105'
                      : isReachedByAny
                      ? 'bg-slate-700 border border-amber-500/50 text-white font-medium'
                      : 'bg-card border border-card-border text-slate-500'
                  }`}
                >
                  {m.icon}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-medium ${
                    isReachedByBoth ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
