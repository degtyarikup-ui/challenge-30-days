import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { Check, Footprints, Moon, Dumbbell, BookOpen, CheckSquare2, Circle } from 'lucide-react';
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
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('шаг') || t.includes('ходьб')) return <Footprints className="w-4 h-4 text-text-secondary" />;
    if (t.includes('сон') || t.includes('спать') || t.includes('сн')) return <Moon className="w-4 h-4 text-text-secondary" />;
    if (t.includes('спорт') || t.includes('тренировк') || t.includes('зал')) return <Dumbbell className="w-4 h-4 text-text-secondary" />;
    if (t.includes('англ') || t.includes('чтени') || t.includes('книг') || t.includes('учеб')) return <BookOpen className="w-4 h-4 text-text-secondary" />;
    return <CheckSquare2 className="w-4 h-4 text-text-secondary" />;
  };

  const hasDistinctTargets = habit.target_sereja && habit.target_lera && habit.target_sereja !== habit.target_lera;
  const isSerejaDone = habit.status_sereja.completed;
  const isLeraDone = habit.status_lera.completed;

  const isMyDone = currentUserId === 'sereja' ? isSerejaDone : isLeraDone;

  const handleMyClick = () => {
    if (disabled) return;
    triggerHaptic(isMyDone ? 'light' : 'success');
    onToggle(habit.id, isMyDone);
  };

  return (
    <div className="p-3 sm:p-3.5 bg-white border border-border hover:border-border-strong rounded-xl transition flex items-center justify-between gap-3">
      {/* Left: Icon, Title & Targets */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center flex-shrink-0">
          {getIcon(habit.title)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-text-primary truncate">
            {habit.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-text-secondary">
            {hasDistinctTargets ? (
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-sereja-text bg-sereja-light border border-sereja-border px-1.5 py-0.2 rounded font-medium">
                  Серёжа: {habit.target_sereja} {habit.unit}
                </span>
                <span className="text-lera-text bg-lera-light border border-lera-border px-1.5 py-0.2 rounded font-medium">
                  Лера: {habit.target_lera} {habit.unit}
                </span>
              </div>
            ) : (
              habit.target_sereja && (
                <span className="text-[11px] text-text-secondary">
                  Цель: {habit.target_sereja} {habit.unit}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right: Personal Interactive Checkbox + Partner Status Indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Sereja */}
        {currentUserId === 'sereja' ? (
          <button
            onClick={handleMyClick}
            disabled={disabled}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer active:scale-95 ${
              isSerejaDone
                ? 'bg-sereja text-white border-sereja'
                : 'bg-white hover:bg-sereja-light text-text-secondary border-border hover:border-sereja-border'
            }`}
          >
            {isSerejaDone ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-text-muted" />
            )}
            <span className="text-[11px]">Серёжа</span>
          </button>
        ) : (
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-default select-none ${
              isSerejaDone
                ? 'bg-sereja-light text-sereja-text border-sereja-border'
                : 'bg-surface-subtle text-text-muted border-border'
            }`}
            title="Статус Серёжи (только для просмотра)"
          >
            {isSerejaDone ? (
              <Check className="w-3.5 h-3.5 text-sereja stroke-[2.5]" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-text-muted" />
            )}
            <span className="text-[11px]">Серёжа</span>
          </div>
        )}

        {/* Lera */}
        {currentUserId === 'lera' ? (
          <button
            onClick={handleMyClick}
            disabled={disabled}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer active:scale-95 ${
              isLeraDone
                ? 'bg-lera text-white border-lera'
                : 'bg-white hover:bg-lera-light text-text-secondary border-border hover:border-lera-border'
            }`}
          >
            {isLeraDone ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-text-muted" />
            )}
            <span className="text-[11px]">Лера</span>
          </button>
        ) : (
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-default select-none ${
              isLeraDone
                ? 'bg-lera-light text-lera-text border-lera-border'
                : 'bg-surface-subtle text-text-muted border-border'
            }`}
            title="Статус Леры (только для просмотра)"
          >
            {isLeraDone ? (
              <Check className="w-3.5 h-3.5 text-lera stroke-[2.5]" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-text-muted" />
            )}
            <span className="text-[11px]">Лера</span>
          </div>
        )}
      </div>
    </div>
  );
};
