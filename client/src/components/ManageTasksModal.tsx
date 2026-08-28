import React, { useEffect, useState } from 'react';
import { Habit, HabitCategory, TargetType, AssignedTo } from '../types';
import { Plus, Trash2, Edit2, X, Check, SlidersHorizontal, CalendarDays, User, Users } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { HABIT_ICONS_LIST, renderHabitIcon } from '../utils/icons';

interface ManageTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  passiveRules: Habit[];
  startDate: string;
  initialEditingHabit?: Habit | null;
  onCreateHabit: (habit: Partial<Habit>) => Promise<void>;
  onUpdateHabit: (id: number, habit: Partial<Habit>) => Promise<void>;
  onDeleteHabit: (id: number) => Promise<void>;
  onUpdateStartDate: (date: string) => Promise<void>;
}

export const ManageTasksModal: React.FC<ManageTasksModalProps> = ({
  isOpen,
  onClose,
  habits,
  passiveRules,
  startDate,
  initialEditingHabit,
  onCreateHabit,
  onUpdateHabit,
  onDeleteHabit,
  onUpdateStartDate,
}) => {
  const [activeTab, setActiveTab] = useState<HabitCategory>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('number');
  const [assignedTo, setAssignedTo] = useState<AssignedTo>('both');
  const [selectedIcon, setSelectedIcon] = useState<string>('footprints');
  const [targetSereja, setTargetSereja] = useState('');
  const [targetLera, setTargetLera] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Start Date state
  const [selectedStartDate, setSelectedStartDate] = useState(startDate || '2026-08-31');
  const [isSavingStartDate, setIsSavingStartDate] = useState(false);

  useEffect(() => {
    if (initialEditingHabit) {
      setActiveTab(initialEditingHabit.category);
      setEditingId(initialEditingHabit.id);
      setTitle(initialEditingHabit.title);
      setTargetType(initialEditingHabit.target_type);
      setAssignedTo(initialEditingHabit.assigned_to || 'both');
      setSelectedIcon(initialEditingHabit.icon || 'footprints');
      setTargetSereja(initialEditingHabit.target_sereja);
      setTargetLera(initialEditingHabit.target_lera);
      setUnit(initialEditingHabit.unit);
      setIsCreating(false);
    }
  }, [initialEditingHabit]);

  if (!isOpen) return null;

  const currentList = activeTab === 'active' ? habits : passiveRules;

  const resetForm = () => {
    setTitle('');
    setTargetType('number');
    setAssignedTo('both');
    setSelectedIcon('footprints');
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
    setAssignedTo(h.assigned_to || 'both');
    setSelectedIcon(h.icon || 'footprints');
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
          assigned_to: assignedTo,
          icon: selectedIcon,
          target_sereja: targetSereja.trim(),
          target_lera: targetLera.trim(),
          unit: unit.trim(),
        });
      } else {
        await onCreateHabit({
          title: title.trim(),
          category: activeTab,
          target_type: activeTab === 'passive' ? 'checkbox' : targetType,
          assigned_to: assignedTo,
          icon: selectedIcon,
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

  const handleSaveStartDate = async () => {
    if (!selectedStartDate) return;
    setIsSavingStartDate(true);
    try {
      await onUpdateStartDate(selectedStartDate);
      triggerHaptic('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStartDate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-text-black" />
            <h3 className="text-lg font-black text-text-black">
              Настройка целей
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              resetForm();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-black hover:bg-surface-subtle transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-surface-muted p-1 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab('active');
              resetForm();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'active' ? 'bg-card-dark text-white shadow-xs' : 'text-text-muted hover:text-text-black'
            }`}
          >
            Привычки ({habits.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('passive');
              resetForm();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'passive' ? 'bg-card-dark text-white shadow-xs' : 'text-text-muted hover:text-text-black'
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
            className="w-full py-3 bg-surface-muted hover:bg-surface-subtle rounded-2xl text-xs font-bold text-text-black flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Добавить {activeTab === 'active' ? 'привычку' : 'правило питания'}
          </button>
        )}

        {/* Create / Edit Form */}
        {(isCreating || editingId) && (
          <form onSubmit={handleSubmit} className="bg-surface-muted p-4 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-black">
                {editingId ? 'Редактирование цели' : 'Новая цель'}
              </h4>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-text-muted hover:text-text-black"
              >
                Отмена
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-black">Название:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название цели"
                className="w-full bg-white rounded-xl px-3 py-2 text-xs font-semibold text-text-black focus:outline-none"
                required
              />
            </div>

            {activeTab === 'active' && (
              <>
                {/* 40 Icons Picker Grid */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-black">Иконка цели:</label>
                  <div className="bg-white p-2.5 rounded-2xl max-h-32 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-8 gap-1.5">
                      {HABIT_ICONS_LIST.map((iconItem) => {
                        const isSelected = selectedIcon === iconItem.id;
                        const IconComp = iconItem.icon;
                        return (
                          <button
                            key={iconItem.id}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedIcon(iconItem.id);
                            }}
                            title={iconItem.name}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-lime text-black scale-105 font-bold shadow-xs'
                                : 'bg-surface-muted hover:bg-surface-subtle text-text-black'
                            }`}
                          >
                            <IconComp className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Assignee selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-black">Кому назначить:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAssignedTo('both')}
                      className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        assignedTo === 'both' ? 'bg-card-dark text-white' : 'bg-white text-text-black hover:bg-surface-subtle'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Обоим</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignedTo('sereja')}
                      className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        assignedTo === 'sereja' ? 'bg-card-dark text-white' : 'bg-white text-text-black hover:bg-surface-subtle'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Серёже</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignedTo('lera')}
                      className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        assignedTo === 'lera' ? 'bg-card-dark text-white' : 'bg-white text-text-black hover:bg-surface-subtle'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Лере</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-black">Тип:</label>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as TargetType)}
                      className="w-full bg-white rounded-xl px-3 py-2 text-xs font-semibold text-text-black focus:outline-none"
                    >
                      <option value="number">Число / Количество</option>
                      <option value="time">Время (Сон)</option>
                      <option value="checkbox">Чекбокс</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-text-black">Единица (шагов, мин):</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="шагов / мин"
                      className="w-full bg-white rounded-xl px-3 py-2 text-xs font-semibold text-text-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dynamic Targets based on Assignee */}
                <div className="bg-white p-3 rounded-2xl space-y-2">
                  {(assignedTo === 'both' || assignedTo === 'sereja') && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-black">Цель для Серёжи:</label>
                      <input
                        type="text"
                        value={targetSereja}
                        onChange={(e) => setTargetSereja(e.target.value)}
                        placeholder="00:00 или 6000"
                        className="w-full bg-surface-muted rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-black focus:outline-none"
                      />
                    </div>
                  )}

                  {(assignedTo === 'both' || assignedTo === 'lera') && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-text-black">Цель для Леры:</label>
                      <input
                        type="text"
                        value={targetLera}
                        onChange={(e) => setTargetLera(e.target.value)}
                        placeholder="23:30 или 6000"
                        className="w-full bg-surface-muted rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-black focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-card-dark hover:bg-black text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 shadow-none"
            >
              <Check className="w-3.5 h-3.5" />
              {editingId ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        )}

        {/* Existing List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-surface-muted rounded-2xl flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  {renderHabitIcon(item.icon, item.title, false, 'w-4 h-4')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-text-black truncate">{item.title}</p>
                    {item.assigned_to && item.assigned_to !== 'both' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-text-muted">
                        {item.assigned_to === 'sereja' ? 'Серёжа' : 'Лера'}
                      </span>
                    )}
                  </div>
                  {item.category === 'active' && (
                    <p className="text-[11px] font-medium text-text-muted mt-0.5">
                      {item.assigned_to === 'both' || !item.assigned_to
                        ? `Серёжа: ${item.target_sereja} ${item.unit} • Лера: ${item.target_lera} ${item.unit}`
                        : item.assigned_to === 'sereja'
                        ? `Серёжа: ${item.target_sereja} ${item.unit}`
                        : `Лера: ${item.target_lera} ${item.unit}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(item)}
                  className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-text-black hover:bg-surface-subtle transition"
                  title="Редактировать"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-danger hover:bg-danger-subtle transition"
                  title="Удалить"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle Start Date Setting Section */}
        <div className="pt-3 border-t border-surface-subtle flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-text-muted" />
            <div>
              <span className="text-xs font-bold text-text-black block">Начало челленджа:</span>
              <span className="text-[10px] font-medium text-text-muted">Дата первого дня</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={selectedStartDate}
              onChange={(e) => setSelectedStartDate(e.target.value)}
              className="bg-surface-muted px-2.5 py-1.5 rounded-xl text-xs font-bold text-text-black focus:outline-none"
            />
            {selectedStartDate !== startDate && (
              <button
                onClick={handleSaveStartDate}
                disabled={isSavingStartDate}
                className="px-3 py-1.5 bg-lime text-black font-bold text-xs rounded-xl shadow-none active:scale-95 transition"
              >
                {isSavingStartDate ? '...' : 'Ок'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
