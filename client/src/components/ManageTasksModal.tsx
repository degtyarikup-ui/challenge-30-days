import React, { useState } from 'react';
import { Habit, HabitCategory, TargetType } from '../types';
import { Plus, Trash2, Edit2, X, Check, SlidersHorizontal } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface ManageTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  passiveRules: Habit[];
  onCreateHabit: (habit: Partial<Habit>) => Promise<void>;
  onUpdateHabit: (id: number, habit: Partial<Habit>) => Promise<void>;
  onDeleteHabit: (id: number) => Promise<void>;
}

export const ManageTasksModal: React.FC<ManageTasksModalProps> = ({
  isOpen,
  onClose,
  habits,
  passiveRules,
  onCreateHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  const [activeTab, setActiveTab] = useState<HabitCategory>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('number');
  const [targetSereja, setTargetSereja] = useState('');
  const [targetLera, setTargetLera] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentList = activeTab === 'active' ? habits : passiveRules;

  const resetForm = () => {
    setTitle('');
    setTargetType('number');
    setTargetSereja('');
    setTargetLera('');
    setUnit('');
    setIsCreating(false);
    setEditingId(null);
  };

  const startEdit = (h: Habit) => {
    setEditingId(h.id);
    setTitle(h.title);
    setTargetType(h.target_type);
    setTargetSereja(h.target_sereja);
    setTargetLera(h.target_lera);
    setUnit(h.unit);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateHabit(editingId, {
          title: title.trim(),
          target_type: targetType,
          target_sereja: targetSereja.trim(),
          target_lera: targetLera.trim(),
          unit: unit.trim(),
        });
      } else {
        await onCreateHabit({
          title: title.trim(),
          category: activeTab,
          target_type: activeTab === 'passive' ? 'checkbox' : targetType,
          target_sereja: targetSereja.trim(),
          target_lera: targetLera.trim(),
          unit: unit.trim(),
        });
      }
      triggerHaptic('success');
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Удалить эту цель?')) {
      triggerHaptic('warning');
      await onDeleteHabit(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-border w-full max-w-lg rounded-2xl p-5 shadow-xl space-y-3.5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-text-secondary" />
            <h3 className="text-base font-semibold text-text-primary">
              Настройка целей
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-surface-subtle p-0.5 rounded-lg border border-border">
          <button
            onClick={() => {
              setActiveTab('active');
              resetForm();
            }}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'active' ? 'bg-white text-text-primary border border-border shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Ежедневные привычки ({habits.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('passive');
              resetForm();
            }}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'passive' ? 'bg-white text-text-primary border border-border shadow-xs' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Правила питания ({passiveRules.length})
          </button>
        </div>

        {/* Add New Button */}
        {!isCreating && !editingId && (
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsCreating(true);
            }}
            className="w-full py-2 bg-surface-subtle border border-dashed border-border hover:bg-surface-hover rounded-lg text-xs font-medium text-text-primary flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить {activeTab === 'active' ? 'привычку' : 'правило питания'}
          </button>
        )}

        {/* Create / Edit Form */}
        {(isCreating || editingId) && (
          <form onSubmit={handleSubmit} className="bg-surface-subtle border border-border p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-text-primary">
                {editingId ? 'Редактирование' : 'Новая цель'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-text-secondary">Название:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название цели"
                className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                required
              />
            </div>

            {activeTab === 'active' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary">Тип:</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as TargetType)}
                      className="w-full bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                    >
                      <option value="number">Число / Количество</option>
                      <option value="time">Время (Сон)</option>
                      <option value="checkbox">Чекбокс</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-text-secondary">Единица (шагов, мин):</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="шагов / мин"
                      className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-border">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-sereja-text">Серёжа:</label>
                    <input
                      type="text"
                      value={targetSereja}
                      onChange={(e) => setTargetSereja(e.target.value)}
                      placeholder="00:00 или 6000"
                      className="w-full bg-surface-subtle border border-border rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-sereja"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-lera-text">Лера:</label>
                    <input
                      type="text"
                      value={targetLera}
                      onChange={(e) => setTargetLera(e.target.value)}
                      placeholder="23:30 или 6000"
                      className="w-full bg-surface-subtle border border-border rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-lera"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-1.5 bg-text-primary hover:bg-black text-white text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {editingId ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        )}

        {/* Existing List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-white border border-border rounded-lg flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text-primary truncate">{item.title}</p>
                {item.category === 'active' && (
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Серёжа: {item.target_sereja} {item.unit} • Лера: {item.target_lera} {item.unit}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(item)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
                  title="Редактировать"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded text-danger hover:text-red-700 hover:bg-red-50 transition"
                  title="Удалить"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
