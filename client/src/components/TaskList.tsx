import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface TaskListProps {
  habits: HabitWithStatus[];
  currentUserId: UserId;
  partnerAvatarUrl?: string | null;
  onToggle: (habitId: number, currentStatus: boolean) => void;
  onContextMenu: (habit: HabitWithStatus) => void;
  onOpenManageModal: () => void;
  disabled?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  habits,
  currentUserId,
  partnerAvatarUrl,
  onToggle,
  onContextMenu,
  onOpenManageModal,
  disabled = false,
}) => {
  // Show habits that are either for both or for the current user
  const visibleHabits = habits.filter(
    (h) => !h.assigned_to || h.assigned_to === 'both' || h.assigned_to === currentUserId
  );

  const total = visibleHabits.length;
  const myDone = visibleHabits.filter((h) =>
    currentUserId === 'sereja' ? h.status_sereja.completed : h.status_lera.completed
  ).length;

  return (
    <div className="space-y-2.5">
      {/* Header with Quick Add Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black tracking-tight text-text-black">
            Привычки
          </h2>
          <span className="bg-white text-text-black px-2.5 py-0.5 rounded-full text-xs font-bold">
            {myDone} из {total}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenManageModal();
          }}
          className="px-3 py-1.5 bg-card-dark hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-none"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Добавить</span>
        </button>
      </div>

      {/* List of Compact Cards */}
      {visibleHabits.length > 0 ? (
        <div className="space-y-2">
          {visibleHabits.map((habit) => (
            <TaskItem
              key={habit.id}
              habit={habit}
              currentUserId={currentUserId}
              partnerAvatarUrl={partnerAvatarUrl}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 text-center space-y-2">
          <p className="text-text-muted text-xs font-medium">Список привычек пуст.</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="px-3 py-1.5 bg-card-dark text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить привычку
          </button>
        </div>
      )}
    </div>
  );
};
