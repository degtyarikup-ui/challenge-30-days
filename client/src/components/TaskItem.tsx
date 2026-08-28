import React, { useRef, useState } from 'react';
import { HabitWithStatus, UserId } from '../types';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { playToggleOnSound, playToggleOffSound } from '../utils/audio';
import { renderHabitIcon } from '../utils/icons';

const MICRO_COLORS = ['#D4FF00', '#00F0FF', '#FF007A', '#FFE600', '#FFFFFF', '#7B2CBF'];

const SPARKS = [
  { id: 1, x: 22, y: -24, rot: 120, scale: 0.9, color: MICRO_COLORS[0], shape: 'circle' },
  { id: 2, x: -26, y: -20, rot: -140, scale: 1.0, color: MICRO_COLORS[1], shape: 'rect' },
  { id: 3, x: 30, y: 16, rot: 190, scale: 0.85, color: MICRO_COLORS[2], shape: 'diamond' },
  { id: 4, x: -28, y: 22, rot: -160, scale: 0.9, color: MICRO_COLORS[3], shape: 'circle' },
  { id: 5, x: 0, y: -34, rot: 45, scale: 1.1, color: MICRO_COLORS[4], shape: 'rect' },
  { id: 6, x: 0, y: 32, rot: -80, scale: 0.8, color: MICRO_COLORS[0], shape: 'diamond' },
  { id: 7, x: 34, y: -8, rot: 160, scale: 0.95, color: MICRO_COLORS[1], shape: 'circle' },
  { id: 8, x: -36, y: -4, rot: -120, scale: 1.0, color: MICRO_COLORS[2], shape: 'rect' },
  { id: 9, x: 18, y: 30, rot: 90, scale: 0.8, color: MICRO_COLORS[3], shape: 'circle' },
  { id: 10, x: -18, y: -30, rot: -90, scale: 0.85, color: MICRO_COLORS[4], shape: 'diamond' },
];

interface TaskItemProps {
  habit: HabitWithStatus;
  currentUserId: UserId;
  partnerAvatarUrl?: string | null;
  onToggle: (habitId: number, currentStatus: boolean) => void;
  onContextMenu: (habit: HabitWithStatus) => void;
  disabled?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  habit,
  currentUserId,
  partnerAvatarUrl,
  onToggle,
  onContextMenu,
  disabled = false,
}) => {
  const [isPending, setIsPending] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const isSerejaDone = !!habit.status_sereja?.completed;
  const isLeraDone = !!habit.status_lera?.completed;

  const isMyDone = currentUserId === 'sereja' ? isSerejaDone : isLeraDone;
  const isPartnerDone = currentUserId === 'sereja' ? isLeraDone : isSerejaDone;
  const partnerName = currentUserId === 'sereja' ? 'Лера' : 'Серёжа';
  const partnerInitial = currentUserId === 'sereja' ? 'Л' : 'С';

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

    // Audio & Haptic & Animation
    if (!isMyDone) {
      playToggleOnSound();
      triggerHaptic('success');
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 550);
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
      className={`group rounded-2xl p-3.5 sm:p-4 transition-all duration-200 ease-out cursor-pointer select-none active:scale-[0.98] relative overflow-visible ${
        justCompleted ? 'animate-card-bounce' : ''
      } ${
        isMyDone
          ? 'bg-card-dark text-white'
          : 'bg-white text-text-black hover:bg-white/90'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Icon & Title & Targets */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              justCompleted ? 'animate-spring-pop' : ''
            } ${
              isMyDone ? 'bg-white/10' : 'bg-surface-muted'
            }`}
          >
            {renderHabitIcon(habit.icon, habit.title, isMyDone, 'w-4 h-4')}
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

            <div className="text-xs font-semibold mt-0.5 flex items-center flex-wrap gap-x-2 gap-y-0.5">
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

        {/* Right Side: Partner Status Chip + Custom Switch + Micro Confetti */}
        <div className="flex items-center gap-2.5 flex-shrink-0 relative">
          {/* Micro Confetti Sparks on completion */}
          {justCompleted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              {SPARKS.map((s) => (
                <div
                  key={s.id}
                  className="absolute"
                  style={{
                    ['--mx' as any]: `${s.x}px`,
                    ['--my' as any]: `${s.y}px`,
                    ['--mrot' as any]: `${s.rot}deg`,
                    ['--msc' as any]: s.scale,
                    animation: 'micro-spark 0.5s cubic-bezier(0.12, 0.8, 0.33, 1) forwards',
                  }}
                >
                  {s.shape === 'circle' && (
                    <div className="w-1.5 h-1.5 rounded-full shadow-xs" style={{ backgroundColor: s.color }} />
                  )}
                  {s.shape === 'rect' && (
                    <div className="w-2 h-1 rounded-xs shadow-xs" style={{ backgroundColor: s.color }} />
                  )}
                  {s.shape === 'diamond' && (
                    <div className="w-1.5 h-1.5 rotate-45 shadow-xs" style={{ backgroundColor: s.color }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Always Visible Partner Status Chip on Joint Habits */}
          {isBoth && (
            <div
              className={`pl-1.5 pr-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all duration-200 ${
                isPartnerDone
                  ? isMyDone
                    ? 'bg-white text-black font-black'
                    : 'bg-card-dark text-lime font-black'
                  : isMyDone
                    ? 'bg-white/15 text-white/75'
                    : 'bg-surface-muted text-text-muted'
              }`}
              title={isPartnerDone ? `${partnerName} выполнил(а) цель` : `${partnerName} еще не выполнил(а)`}
            >
              {partnerAvatarUrl ? (
                <img
                  src={partnerAvatarUrl}
                  alt={partnerName}
                  className="w-4 h-4 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  isPartnerDone
                    ? isMyDone
                      ? 'bg-lime text-black'
                      : 'bg-lime text-black'
                    : isMyDone
                      ? 'bg-white/20 text-white'
                      : 'bg-text-muted/20 text-text-black'
                }`}>
                  {partnerInitial}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>{partnerName}</span>
                {isPartnerDone ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                )}
              </div>
            </div>
          )}

          {/* Toggle Switch for Current User */}
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
