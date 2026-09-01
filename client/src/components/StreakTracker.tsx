import React from 'react';
import { User, UserId } from '../types';
import { CheckCircle2 } from 'lucide-react';
import { getChallengeDay } from '../utils/date';

interface StreakTrackerProps {
  users: Record<UserId, User>;
  currentUserId: UserId;
  selectedDate?: string;
  actualDate?: string;
  startDate?: string;
  daysUntilStart?: number;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  users,
  currentUserId,
  selectedDate,
  actualDate,
  startDate = '2026-08-31',
}) => {
  const sereja = users.sereja || { current_streak: 1, max_streak: 1, name: 'Серёжа' };
  const lera = users.lera || { current_streak: 1, max_streak: 1, name: 'Лера' };

  const myUser = currentUserId === 'sereja' ? sereja : lera;

  // Calculate the day number of the challenge for the currently viewed / actual date
  const effectiveDate = selectedDate || actualDate || startDate;
  const challengeDay = getChallengeDay(effectiveDate, startDate);

  return (
    <div className="bg-lime text-black rounded-3xl p-5 relative overflow-hidden transition-all shadow-none">
      {/* Top: Large Counter & Status Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-black">
            День {challengeDay}
          </span>
          <span className="text-base font-bold text-black/60">/ 30</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-black">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* 3 Columns Sub-stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/10">
        <div>
          <div className="text-base font-black text-black">
            {sereja.current_streak} дн.
          </div>
          <div className="text-[11px] font-semibold text-black/70">
            Серёжа (Макс: {sereja.max_streak})
          </div>
        </div>

        <div>
          <div className="text-base font-black text-black">
            {lera.current_streak} дн.
          </div>
          <div className="text-[11px] font-semibold text-black/70">
            Лера (Макс: {lera.max_streak})
          </div>
        </div>

        <div>
          <div className="text-base font-black text-black">
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
