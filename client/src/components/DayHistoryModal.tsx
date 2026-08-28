import React, { useEffect, useState } from 'react';
import { HistoryDay } from '../types';
import { fetchHistoryApi } from '../api';
import { Calendar, X, Sparkles, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface DayHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

export const DayHistoryModal: React.FC<DayHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
}) => {
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistoryApi();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-card-border w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              История челленджа по дням
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

        {/* History list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-xs">Загрузка истории...</span>
            </div>
          ) : history.length > 0 ? (
            history.map((day) => {
              const isSerejaPerfect = day.serejaCompleted === day.serejaTotal && day.serejaViolations === 0;
              const isLeraPerfect = day.leraCompleted === day.leraTotal && day.leraViolations === 0;

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectDate(day.date);
                    onClose();
                  }}
                  className="p-3.5 bg-slate-900/60 border border-card-border/70 hover:border-slate-600 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition active:scale-98"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-bold text-white">{day.date}</span>
                    <p className="text-[11px] text-slate-400">
                      Нажмите, чтобы просмотреть задачи за этот день
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {/* Sereja status pill */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
                        isSerejaPerfect
                          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      <span>👦 {day.serejaCompleted}/{day.serejaTotal}</span>
                      {day.serejaViolations > 0 && <span className="text-rose-400">⚠️</span>}
                    </div>

                    {/* Lera status pill */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold ${
                        isLeraPerfect
                          ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      <span>👧 {day.leraCompleted}/{day.leraTotal}</span>
                      {day.leraViolations > 0 && <span className="text-rose-400">⚠️</span>}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles className="w-6 h-6 mx-auto text-amber-400" />
              <p className="text-xs">Вы только начали челлендж! Первый день в процессе 🚀</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
