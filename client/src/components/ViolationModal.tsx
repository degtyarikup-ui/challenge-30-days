import React, { useState } from 'react';
import { Habit, UserId } from '../types';
import { AlertCircle, X } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface ViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ruleTitle: string, note: string) => Promise<void>;
  currentUserId: UserId;
  rules: Habit[];
  date: string;
}

export const ViolationModal: React.FC<ViolationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentUserId,
  rules,
  date,
}) => {
  const [selectedRule, setSelectedRule] = useState<string>(rules[0]?.title || 'Нарушение питания');
  const [customRule, setCustomRule] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentUserName = currentUserId === 'sereja' ? 'Серёжа' : 'Лера';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRule = selectedRule === 'other' ? customRule.trim() || 'Другое нарушение' : selectedRule;
    setIsSubmitting(true);
    try {
      await onConfirm(finalRule, note.trim());
      triggerHaptic('error');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-text-black">
              Фиксация срыва
            </h3>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              Пользователь: {currentUserName} • Дата: {date}
            </p>
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

        {/* Warning Banner */}
        <div className="bg-danger-subtle rounded-2xl p-4 flex items-start gap-2.5 text-xs text-text-black font-medium">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-danger text-sm">Стрик будет сброшен на День 1</p>
            <p className="text-text-black/80 mt-1">
              Партнер получит уведомление в Telegram.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-black">Нарушенное правило:</label>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="w-full bg-surface-muted rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-text-black focus:outline-none"
            >
              {rules.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
              <option value="other">Другое правило</option>
            </select>
          </div>

          {selectedRule === 'other' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-black">Название:</label>
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                placeholder="Что произошло"
                className="w-full bg-surface-muted rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-text-black focus:outline-none"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-black">Комментарий (необязательно):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Причина срыва..."
              rows={2}
              className="w-full bg-surface-muted rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-text-black focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-surface-muted hover:bg-surface-subtle text-text-black text-xs font-bold transition"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-card-dark text-white hover:bg-black text-xs font-bold transition active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Сброс...' : 'Сбросить стрик на День 1'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
