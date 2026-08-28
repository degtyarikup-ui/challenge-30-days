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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black tracking-tight text-text-black">
          Привычки
        </h2>

        <span className="bg-white text-text-black px-3 py-1 rounded-full text-xs font-bold shadow-card">
          {myDone} из {total}
        </span>
      </div>

      {/* Grid of Habit Cards */}
      {habits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 shadow-card">
          <p className="text-text-muted text-sm font-medium">Список привычек пуст.</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="px-4 py-2 bg-card-dark text-white text-xs font-bold rounded-full inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            Добавить привычку
          </button>
        </div>
      )}
    </div>
  );
};
