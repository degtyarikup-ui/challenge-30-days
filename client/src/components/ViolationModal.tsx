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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-border w-full max-w-md rounded-2xl p-5 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Зафиксировать нарушение ({currentUserName})
            </h3>
            <p className="text-xs text-text-secondary">Дата: {date}</p>
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

        {/* Warning Banner */}
        <div className="bg-danger-light border border-danger-border rounded-lg p-3 flex items-start gap-2.5 text-xs text-danger-text">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Стрик будет сброшен на День 1</p>
            <p className="text-danger-text/80 mt-0.5">
              Партнер получит уведомление в Telegram.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Что было нарушено:</label>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-border-strong"
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
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Название правила:</label>
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                placeholder="Введите название"
                className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-border-strong"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Комментарий (необязательно):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Причина или комментарий"
              rows={2}
              className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-border-strong resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium transition"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg bg-danger text-white hover:bg-red-700 text-xs font-medium transition active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Сброс...' : 'Подтвердить сброс'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
