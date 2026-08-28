import React, { useState } from 'react';
import { Habit, UserId } from '../types';
import { AlertTriangle, X, Ban, ShieldAlert } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-rose-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Зафиксировать срыв ({currentUserName})
              </h3>
              <p className="text-xs text-slate-400">Дата: {date}</p>
            </div>
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

        {/* Warning Banner */}
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-100">Внимание: стрик будет сброшен на День 1!</p>
            <p className="text-rose-300/80 mt-0.5">
              Партнёр получит сообщение в Telegram. Но главное — не сдаваться и начать новый стрик сразу же!
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Что было нарушено?</label>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="w-full bg-slate-900 border border-card-border rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {rules.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title}
                </option>
              ))}
              <option value="other">Другое правило (ввести вручную)</option>
            </select>
          </div>

          {selectedRule === 'other' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Название правила:</label>
              <input
                type="text"
                value={customRule}
                onChange={(e) => setCustomRule(e.target.value)}
                placeholder="Например: Выпил энергетик"
                className="w-full bg-slate-900 border border-card-border rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Комментарий (необязательно):</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Почему произошел срыв или что случилось..."
              rows={2}
              className="w-full bg-slate-900 border border-card-border rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-card-border text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-900/50 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              {isSubmitting ? 'Сброс...' : 'Подтвердить срыв и сбросить стрик'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
