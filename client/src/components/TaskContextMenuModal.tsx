import React from 'react';
import { HabitWithStatus } from '../types';
import { Edit2, Trash2, X } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { renderHabitIcon } from '../utils/icons';

interface TaskContextMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: HabitWithStatus | null;
  onEdit: (habit: HabitWithStatus) => void;
  onDelete: (habitId: number) => Promise<void>;
}

export const TaskContextMenuModal: React.FC<TaskContextMenuModalProps> = ({
  isOpen,
  onClose,
  habit,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !habit) return null;

  const handleEditClick = () => {
    triggerHaptic('light');
    onClose();
    onEdit(habit);
  };

  const handleDeleteClick = async () => {
    if (confirm(`Удалить цель «${habit.title}»?`)) {
      triggerHaptic('warning');
      onClose();
      await onDelete(habit.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-muted flex items-center justify-center">
              {renderHabitIcon(habit.icon, habit.title, false, 'w-5 h-5')}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-black text-text-black">
                {habit.title}
              </h3>
              <p className="text-xs font-semibold text-text-muted">
                {habit.assigned_to === 'both' || !habit.assigned_to
                  ? `Серёжа: ${habit.target_sereja} ${habit.unit} • Лера: ${habit.target_lera} ${habit.unit}`
                  : habit.assigned_to === 'sereja'
                  ? `Серёжа: ${habit.target_sereja} ${habit.unit}`
                  : `Лера: ${habit.target_lera} ${habit.unit}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-black hover:bg-surface-subtle transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions List */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleEditClick}
            className="w-full p-3.5 bg-surface-muted hover:bg-surface-subtle rounded-2xl flex items-center gap-3 text-text-black text-xs font-bold transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-text-black">
              <Edit2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>Редактировать цель</span>
          </button>

          <button
            onClick={handleDeleteClick}
            className="w-full p-3.5 bg-danger-subtle hover:bg-red-100 rounded-2xl flex items-center gap-3 text-danger text-xs font-bold transition active:scale-98"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-danger">
              <Trash2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>Удалить цель</span>
          </button>
        </div>
      </div>
    </div>
  );
};
