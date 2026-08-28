import React, { useState } from 'react';
import { Habit, HabitCategory, TargetType } from '../types';
import { Plus, Trash2, Edit2, X, Check, Settings } from 'lucide-react';
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
    if (confirm('Вы уверены, что хотите удалить эту цель?')) {
      triggerHaptic('warning');
      await onDeleteHabit(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-card-border w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Настройка целей и привычек
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-card-border">
          <button
            onClick={() => {
              setActiveTab('active');
              resetForm();
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'active' ? 'bg-blue-600 text-white shadow-glow-blue' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ежедневные привычки ({habits.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('passive');
              resetForm();
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'passive' ? 'bg-pink-600 text-white shadow-glow-pink' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Правила питания / Запреты ({passiveRules.length})
          </button>
        </div>

        {/* Add New Button */}
        {!isCreating && !editingId && (
          <button
            onClick={() => {
              triggerHaptic('light');
              setIsCreating(true);
            }}
            className="w-full py-2.5 bg-card-hover border border-dashed border-card-border hover:border-slate-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Добавить {activeTab === 'active' ? 'привычку' : 'правило питания'}
          </button>
        )}

        {/* Create / Edit Form */}
        {(isCreating || editingId) && (
          <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-card-border p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200">
                {editingId ? 'Редактирование цели' : 'Новая цель'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Название:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Чтение книги, Медитация"
                className="w-full bg-slate-950 border border-card-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {activeTab === 'active' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Тип цели:</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as TargetType)}
                      className="w-full bg-slate-950 border border-card-border rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="number">Число / Количество</option>
                      <option value="time">Время (Сон, тайминг)</option>
                      <option value="checkbox">Простая галочка</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Единица (шагов, мин):</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="шагов / мин / стр"
                      className="w-full bg-slate-950 border border-card-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Individual targets for Sereja & Lera */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-card-border/60">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-400">👦 Цель для Серёжи:</label>
                    <input
                      type="text"
                      value={targetSereja}
                      onChange={(e) => setTargetSereja(e.target.value)}
                      placeholder="00:00 или 6000"
                      className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-pink-400">👧 Цель для Леры:</label>
                    <input
                      type="text"
                      value={targetLera}
                      onChange={(e) => setTargetLera(e.target.value)}
                      placeholder="23:30 или 6000"
                      className="w-full bg-slate-900 border border-pink-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Сохранить изменения' : 'Создать цель'}
            </button>
          </form>
        )}

        {/* Existing List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-900/50 border border-card-border/70 rounded-xl flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                {item.category === 'active' && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Серёжа: <span className="text-blue-300 font-medium">{item.target_sereja} {item.unit}</span> • Лера: <span className="text-pink-300 font-medium">{item.target_lera} {item.unit}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Редактировать"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
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
