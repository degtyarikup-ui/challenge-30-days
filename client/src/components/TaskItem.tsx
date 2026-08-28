import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { Check, Footprints, Moon, Dumbbell, BookOpen, Circle, Target } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface TaskItemProps {
  habit: HabitWithStatus;
  currentUserId: UserId;
  onToggle: (habitId: number, userId: UserId, currentStatus: boolean) => void;
  disabled?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  habit,
  currentUserId,
  onToggle,
  disabled = false,
}) => {
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('шаг') || t.includes('ходьб')) return <Footprints className="w-5 h-5 text-blue-400" />;
    if (t.includes('сон') || t.includes('спать') || t.includes('сн')) return <Moon className="w-5 h-5 text-indigo-400" />;
    if (t.includes('спорт') || t.includes('тренировк') || t.includes('зал')) return <Dumbbell className="w-5 h-5 text-emerald-400" />;
    if (t.includes('англ') || t.includes('чтени') || t.includes('книг') || t.includes('учеб')) return <BookOpen className="w-5 h-5 text-purple-400" />;
    return <Target className="w-5 h-5 text-amber-400" />;
  };

  const hasDistinctTargets = habit.target_sereja && habit.target_lera && habit.target_sereja !== habit.target_lera;
  const isSerejaDone = habit.status_sereja.completed;
  const isLeraDone = habit.status_lera.completed;
  const isBothDone = isSerejaDone && isLeraDone;

  const handleUserClick = (userId: UserId, currentStatus: boolean) => {
    if (disabled) return;
    triggerHaptic(currentStatus ? 'light' : 'success');
    onToggle(habit.id, userId, currentStatus);
  };

  return (
    <div
      className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        isBothDone
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-card/90 border-card-border hover:border-slate-700'
      }`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3">
        {/* Left Side: Icon & Title & Targets */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              isBothDone
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800/80 border border-slate-700/60'
            }`}
          >
            {getIcon(habit.title)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-semibold tracking-tight text-white ${isBothDone ? 'text-emerald-300' : ''}`}>
                {habit.title}
              </h3>
            </div>

            {/* Target information / Values */}
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
              {hasDistinctTargets ? (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-blue-300 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    👦 Серёжа: {habit.target_sereja} {habit.unit}
                  </span>
                  <span className="text-pink-300 font-medium bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                    👧 Лера: {habit.target_lera} {habit.unit}
                  </span>
                </div>
              ) : (
                habit.target_sereja && (
                  <span className="text-slate-300 font-medium bg-slate-800/60 px-2 py-0.5 rounded-md text-[11px]">
                    Цель: {habit.target_sereja} {habit.unit}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Dual Partner Checkboxes (Sereja & Lera) */}
        <div className="flex items-center gap-2 self-center flex-shrink-0">
          {/* Sereja Check Button */}
          <button
            onClick={() => handleUserClick('sereja', isSerejaDone)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isSerejaDone
                ? 'bg-blue-600 border-blue-500 text-white shadow-glow-blue'
                : currentUserId === 'sereja'
                ? 'bg-slate-800/90 border-blue-500/50 text-blue-300 hover:bg-slate-700 hover:border-blue-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            } ${currentUserId !== 'sereja' ? 'cursor-default' : 'cursor-pointer'}`}
            title={currentUserId === 'sereja' ? 'Нажмите, чтобы отметить для Серёжи' : 'Статус Серёжи'}
          >
            <span className="text-sm">👦</span>
            {isSerejaDone ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline text-[11px]">Серёжа</span>
          </button>

          {/* Lera Check Button */}
          <button
            onClick={() => handleUserClick('lera', isLeraDone)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isLeraDone
                ? 'bg-pink-600 border-pink-500 text-white shadow-glow-pink'
                : currentUserId === 'lera'
                ? 'bg-slate-800/90 border-pink-500/50 text-pink-300 hover:bg-slate-700 hover:border-pink-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            } ${currentUserId !== 'lera' ? 'cursor-default' : 'cursor-pointer'}`}
            title={currentUserId === 'lera' ? 'Нажмите, чтобы отметить для Леры' : 'Статус Леры'}
          >
            <span className="text-sm">👧</span>
            {isLeraDone ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline text-[11px]">Лера</span>
          </button>
        </div>
      </div>
    </div>
  );
};
