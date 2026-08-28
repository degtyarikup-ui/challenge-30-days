import React from 'react';
import { User, UserId } from '../types';
import { Flame, CheckCircle2 } from 'lucide-react';

interface StreakTrackerProps {
  users: Record<UserId, User>;
  currentUserId: UserId;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ users, currentUserId }) => {
  const sereja = users.sereja || { current_streak: 1, max_streak: 1, name: 'Серёжа' };
  const lera = users.lera || { current_streak: 1, max_streak: 1, name: 'Лера' };

  const myUser = currentUserId === 'sereja' ? sereja : lera;

  return (
    <div className="bg-lime text-black rounded-4xl p-5 sm:p-6 shadow-lime relative overflow-hidden transition-all">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
          <Flame className="w-3.5 h-3.5 fill-black" />
          <span>30 Дней</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-black shadow-xs">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Main Big Counter */}
      <div className="my-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-black">
            День {myUser.current_streak}
          </span>
          <span className="text-base font-bold text-black/60">/ 30</span>
        </div>
      </div>

      {/* 3 Columns Sub-stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/10">
        <div>
          <div className="text-base sm:text-lg font-black text-black">
            {sereja.current_streak} дн.
          </div>
          <div className="text-[11px] font-semibold text-black/70">
            Серёжа (Макс: {sereja.max_streak})
          </div>
        </div>

        <div>
          <div className="text-base sm:text-lg font-black text-black">
            {lera.current_streak} дн.
          </div>
          <div className="text-[11px] font-semibold text-black/70">
            Лера (Макс: {lera.max_streak})
          </div>
        </div>

        <div>
          <div className="text-base sm:text-lg font-black text-black">
            {Math.round((myUser.current_streak / 30) * 100)}%
          </div>
          <div className="text-[11px] font-semibold text-black/70">
            Пройдено
          </div>
        </div>
      </div>
    </div>
  );
};
