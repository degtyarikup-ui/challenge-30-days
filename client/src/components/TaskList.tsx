import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { TaskItem } from './TaskItem';
import { CheckSquare, Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface TaskListProps {
  habits: HabitWithStatus[];
  currentUserId: UserId;
  onToggle: (habitId: number, userId: UserId, currentStatus: boolean) => void;
  onOpenManageModal: () => void;
  disabled?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  habits,
  currentUserId,
  onToggle,
  onOpenManageModal,
  disabled = false,
}) => {
  const total = habits.length;
  const serejaDone = habits.filter(h => h.status_sereja.completed).length;
  const leraDone = habits.filter(h => h.status_lera.completed).length;

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-primary">
            Ежедневные привычки
          </h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="bg-sereja-light border border-sereja-border text-sereja-text px-2 py-0.5 rounded font-medium">
            Серёжа: {serejaDone}/{total}
          </span>
          <span className="bg-lera-light border border-lera-border text-lera-text px-2 py-0.5 rounded font-medium">
            Лера: {leraDone}/{total}
          </span>
        </div>
      </div>

      {/* Habit Items */}
      {habits.length > 0 ? (
        <div className="space-y-2">
          {habits.map((habit) => (
            <TaskItem
              key={habit.id}
              habit={habit}
              currentUserId={currentUserId}
              onToggle={onToggle}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-border rounded-xl p-6 text-center space-y-2">
          <p className="text-text-secondary text-xs">Список привычек пуст.</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="px-3 py-1.5 bg-surface-subtle hover:bg-surface-hover border border-border text-text-primary text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить привычку
          </button>
        </div>
      )}
    </div>
  );
};
