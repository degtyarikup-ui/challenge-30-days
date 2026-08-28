import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface TaskListProps {
  habits: HabitWithStatus[];
  currentUserId: UserId;
  onToggle: (habitId: number, currentStatus: boolean) => void;
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
  const myDone = habits.filter(h =>
    currentUserId === 'sereja' ? h.status_sereja.completed : h.status_lera.completed
  ).length;

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black tracking-tight text-text-black">
          Привычки
        </h2>

        <span className="bg-white text-text-black px-2.5 py-0.5 rounded-full text-xs font-bold">
          {myDone} из {total}
        </span>
      </div>

      {/* List of Compact Cards */}
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
            Добавить
          </button>
        </div>
      )}
    </div>
  );
};
