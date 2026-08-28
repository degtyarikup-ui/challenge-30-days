import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { Footprints, Moon, Dumbbell, BookOpen, CheckSquare2, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface TaskItemProps {
  habit: HabitWithStatus;
  currentUserId: UserId;
  onToggle: (habitId: number, currentStatus: boolean) => void;
  disabled?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  habit,
  currentUserId,
  onToggle,
  disabled = false,
}) => {
  const getIcon = (title: string, isDark: boolean) => {
    const t = title.toLowerCase();
    const colorClass = isDark ? 'text-lime' : 'text-text-black';
    if (t.includes('шаг') || t.includes('ходьб')) return <Footprints className={`w-5 h-5 ${colorClass}`} />;
    if (t.includes('сон') || t.includes('спать') || t.includes('сн')) return <Moon className={`w-5 h-5 ${colorClass}`} />;
    if (t.includes('спорт') || t.includes('тренировк') || t.includes('зал')) return <Dumbbell className={`w-5 h-5 ${colorClass}`} />;
    if (t.includes('англ') || t.includes('чтени') || t.includes('книг') || t.includes('учеб')) return <BookOpen className={`w-5 h-5 ${colorClass}`} />;
    return <CheckSquare2 className={`w-5 h-5 ${colorClass}`} />;
  };

  const isSerejaDone = habit.status_sereja.completed;
  const isLeraDone = habit.status_lera.completed;

  const isMyDone = currentUserId === 'sereja' ? isSerejaDone : isLeraDone;
  const isPartnerDone = currentUserId === 'sereja' ? isLeraDone : isSerejaDone;
  const partnerName = currentUserId === 'sereja' ? 'Лера' : 'Серёжа';

  const myTarget = currentUserId === 'sereja' ? habit.target_sereja : habit.target_lera;
  const partnerTarget = currentUserId === 'sereja' ? habit.target_lera : habit.target_sereja;
  const hasDistinctTargets = habit.target_sereja && habit.target_lera && habit.target_sereja !== habit.target_lera;

  const handleMyToggle = () => {
    if (disabled) return;
    triggerHaptic(isMyDone ? 'light' : 'success');
    onToggle(habit.id, isMyDone);
  };

  return (
    <div
      className={`rounded-3xl p-4 sm:p-5 transition-all duration-200 ${
        isMyDone
          ? 'bg-card-dark text-white shadow-dark'
          : 'bg-white text-text-black shadow-card'
      }`}
    >
      {/* Top: Icon & Partner Status Pill */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isMyDone ? 'bg-white/10' : 'bg-surface-muted'
          }`}
        >
          {getIcon(habit.title, isMyDone)}
        </div>

        {/* Partner Status Pill */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isPartnerDone
              ? 'bg-lime text-black'
              : isMyDone
              ? 'bg-white/10 text-white/60'
              : 'bg-surface-muted text-text-muted'
          }`}
          title={`${partnerName}: ${isPartnerDone ? 'Выполнено' : 'Не выполнено'}`}
        >
          {isPartnerDone && <Check className="w-3 h-3 stroke-[3]" />}
          <span>
            {partnerName}: {isPartnerDone ? 'Готово' : 'В процессе'}
          </span>
        </div>
      </div>

      {/* Title & Target Description */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-black tracking-tight">
          {habit.title}
        </h3>

        <div className="text-xs font-semibold mt-1">
          {hasDistinctTargets ? (
            <span className={isMyDone ? 'text-white/70' : 'text-text-muted'}>
              Моя цель: <b className={isMyDone ? 'text-lime' : 'text-text-black'}>{myTarget} {habit.unit}</b>
              <span className="mx-1.5 opacity-40">•</span>
              {partnerName}: {partnerTarget} {habit.unit}
            </span>
          ) : (
            myTarget && (
              <span className={isMyDone ? 'text-white/70' : 'text-text-muted'}>
                Цель: <b className={isMyDone ? 'text-lime' : 'text-text-black'}>{myTarget} {habit.unit}</b>
              </span>
            )
          )}
        </div>
      </div>

      {/* Bottom: Interactive Switch Control (Reference Style) */}
      <div
        onClick={handleMyToggle}
        className={`flex items-center justify-between pt-3 border-t cursor-pointer select-none ${
          isMyDone ? 'border-white/10' : 'border-black/5'
        }`}
      >
        <span className={`text-xs font-bold ${isMyDone ? 'text-lime' : 'text-text-muted'}`}>
          {isMyDone ? 'Выполнено' : 'Не выполнено'}
        </span>

        {/* Custom iOS/Reference Pill Switch */}
        <div
          className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${
            isMyDone ? 'bg-lime justify-end' : 'bg-surface-subtle justify-start'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full shadow-sm transition-transform duration-200 ${
              isMyDone ? 'bg-black' : 'bg-white'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
