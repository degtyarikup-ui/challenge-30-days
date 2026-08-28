import React from 'react';
import { User, UserId } from '../types';
import { Activity } from 'lucide-react';

interface StreakTrackerProps {
  users: Record<UserId, User>;
  currentUserId: UserId;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ users, currentUserId }) => {
  const sereja = users.sereja || { current_streak: 1, max_streak: 1, name: 'Серёжа' };
  const lera = users.lera || { current_streak: 1, max_streak: 1, name: 'Лера' };

  return (
    <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-primary">
            Прогресс
          </h2>
        </div>
      </div>

      {/* Dual Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sereja */}
        <div
          className={`p-3 rounded-lg border transition ${
            currentUserId === 'sereja'
              ? 'bg-sereja-light border-sereja-border'
              : 'bg-white border-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span className="font-medium text-sereja-text">Серёжа</span>
            <span className="text-[11px]">Рекорд: {sereja.max_streak} дн.</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-text-primary">
              {sereja.current_streak}
            </span>
            <span className="text-xs text-text-secondary">/ 30 дн.</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-sereja h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (sereja.current_streak / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* Lera */}
        <div
          className={`p-3 rounded-lg border transition ${
            currentUserId === 'lera'
              ? 'bg-lera-light border-lera-border'
              : 'bg-white border-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span className="font-medium text-lera-text">Лера</span>
            <span className="text-[11px]">Рекорд: {lera.max_streak} дн.</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-text-primary">
              {lera.current_streak}
            </span>
            <span className="text-xs text-text-secondary">/ 30 дн.</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-lera h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (lera.current_streak / 30) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
