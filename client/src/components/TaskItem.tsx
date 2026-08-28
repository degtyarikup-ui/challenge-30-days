import React, { useRef, useState } from 'react';
import { HabitWithStatus, UserId } from '../types';
import { Footprints, Moon, Dumbbell, BookOpen, CheckSquare2, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { playToggleOnSound, playToggleOffSound } from '../utils/audio';

interface TaskItemProps {
  habit: HabitWithStatus;
  currentUserId: UserId;
  onToggle: (habitId: number, currentStatus: boolean) => void;
  onContextMenu: (habit: HabitWithStatus) => void;
  disabled?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  habit,
  currentUserId,
  onToggle,
  onContextMenu,
  disabled = false,
}) => {
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const getIcon = (title: string, isDark: boolean) => {
    const t = title.toLowerCase();
    const colorClass = isDark ? 'text-lime' : 'text-text-black';
    if (t.includes('шаг') || t.includes('ходьб')) return <Footprints className={`w-4 h-4 ${colorClass}`} />;
    if (t.includes('сон') || t.includes('спать') || t.includes('сн')) return <Moon className={`w-4 h-4 ${colorClass}`} />;
    if (t.includes('спорт') || t.includes('тренировк') || t.includes('зал')) return <Dumbbell className={`w-4 h-4 ${colorClass}`} />;
    if (t.includes('англ') || t.includes('чтени') || t.includes('книг') || t.includes('учеб')) return <BookOpen className={`w-4 h-4 ${colorClass}`} />;
    return <CheckSquare2 className={`w-4 h-4 ${colorClass}`} />;
  };

  const isSerejaDone = habit.status_sereja.completed;
  const isLeraDone = habit.status_lera.completed;

  const isMyDone = currentUserId === 'sereja' ? isSerejaDone : isLeraDone;
  const isPartnerDone = currentUserId === 'sereja' ? isLeraDone : isSerejaDone;
  const partnerName = currentUserId === 'sereja' ? 'Лера' : 'Серёжа';

  const isBoth = !habit.assigned_to || habit.assigned_to === 'both';
  const myTarget = currentUserId === 'sereja' ? habit.target_sereja : habit.target_lera;
  const partnerTarget = currentUserId === 'sereja' ? habit.target_lera : habit.target_sereja;
  const hasDistinctTargets = isBoth && habit.target_sereja && habit.target_lera && habit.target_sereja !== habit.target_lera;

  // Long-press handlers
  const startLongPress = () => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      triggerHaptic('heavy');
      onContextMenu(habit);
    }, 450);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    if (disabled || isPending) return;

    setIsPending(true);

    // Audio & Haptic
    if (!isMyDone) {
      playToggleOnSound();
      triggerHaptic('success');
    } else {
      playToggleOffSound();
      triggerHaptic('light');
    }

    onToggle(habit.id, isMyDone);

    setTimeout(() => {
      setIsPending(false);
    }, 250);
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onContextMenu={(e) => {
        e.preventDefault();
        triggerHaptic('heavy');
        onContextMenu(habit);
      }}
      className={`group rounded-2xl p-3.5 sm:p-4 transition-all duration-200 ease-out cursor-pointer select-none active:scale-[0.98] ${
        isMyDone
          ? 'bg-card-dark text-white'
          : 'bg-white text-text-black hover:bg-white/90'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Icon & Title & Targets */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              isMyDone ? 'bg-white/10' : 'bg-surface-muted'
            }`}
          >
            {getIcon(habit.title, isMyDone)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold tracking-tight truncate">
                {habit.title}
              </h3>
              {!isBoth && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isMyDone ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted'
                }`}>
                  Личная
                </span>
              )}
            </div>

            <div className="text-xs font-semibold mt-0.5">
              {hasDistinctTargets ? (
                <span className={isMyDone ? 'text-white/70' : 'text-text-muted'}>
                  Цель: <b className={isMyDone ? 'text-lime' : 'text-text-black'}>{myTarget} {habit.unit}</b>
                  <span className="mx-1 opacity-40">•</span>
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
        </div>

        {/* Right Side: Partner Done Badge + Custom Switch */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Partner Done Badge (ONLY if assigned to both and partner completed) */}
          {isBoth && isPartnerDone && (
            <div
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all duration-200 animate-in fade-in ${
                isMyDone
                  ? 'bg-white text-black'
                  : 'bg-card-dark text-lime'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{partnerName} выполнил(а)</span>
            </div>
          )}

          {/* Toggle Switch */}
          <div
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-out flex items-center pointer-events-none ${
              isMyDone ? 'bg-lime justify-end' : 'bg-surface-subtle justify-start'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform duration-200 ease-out ${
                isMyDone ? 'bg-black' : 'bg-white'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
