import React from 'react';
import { HabitWithStatus, UserId } from '../types';
import { TaskItem } from './TaskItem';
import { ListTodo, Plus } from 'lucide-react';
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
    <div className="space-y-3">
      {/* Header & Progress Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Ежедневные привычки
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg font-semibold">
            👦 {serejaDone}/{total}
          </span>
          <span className="bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-0.5 rounded-lg font-semibold">
            👧 {leraDone}/{total}
          </span>
        </div>
      </div>

      {/* Habit Items */}
      {habits.length > 0 ? (
        <div className="space-y-2.5">
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
        <div className="bg-card border border-dashed border-card-border rounded-2xl p-8 text-center space-y-3">
          <p className="text-slate-400 text-sm">Список ежедневных привычек пуст.</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Добавить привычку
          </button>
        </div>
      )}
    </div>
  );
};
