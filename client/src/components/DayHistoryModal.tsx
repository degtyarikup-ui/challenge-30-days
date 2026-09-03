import React, { useEffect, useState } from 'react';
import { HistoryDay } from '../types';
import { fetchHistoryApi } from '../api';
import { Calendar, X, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { formatDayLabel, getChallengeDay } from '../utils/date';

interface DayHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  actualDate: string;
  startDate: string;
}

export const DayHistoryModal: React.FC<DayHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  actualDate,
  startDate,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-text-black" />
            <h3 className="text-lg font-black text-text-black">
              История по дням
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                loadHistory();
              }}
              disabled={loading}
              className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-black hover:bg-surface-subtle transition disabled:opacity-50"
              title="Обновить"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-text-muted flex flex-col items-center gap-1.5">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-semibold">Загрузка...</span>
            </div>
          ) : history.length > 0 ? (
            history.map((day) => {
              const serejaDone = day.serejaTotal > 0 && day.serejaCompleted === day.serejaTotal;
              const leraDone = day.leraTotal > 0 && day.leraCompleted === day.leraTotal;

              const badge = (
                name: string,
                completed: number,
                total: number,
                done: boolean,
                violations: number
              ) => (
                <span
                  className={`px-3 py-1 rounded-full font-bold shadow-xs whitespace-nowrap ${
                    violations > 0
                      ? 'bg-danger/10 text-danger'
                      : done
                      ? 'bg-lime text-black'
                      : 'bg-white text-text-black'
                  }`}
                >
                  {name}: {completed}/{total}
                  {violations > 0 && <span className="ml-1">⚠️</span>}
                </span>
              );

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectDate(day.date);
                    onClose();
                  }}
                  className="p-4 bg-surface-muted hover:bg-surface-subtle rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition active:scale-98"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-text-black truncate">
                      {formatDayLabel(day.date, actualDate)}
                    </div>
                    <div className="text-[11px] font-semibold text-text-muted">
                      День {getChallengeDay(day.date, startDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-shrink-0">
                    {badge('Серёжа', day.serejaCompleted, day.serejaTotal, serejaDone, day.serejaViolations)}
                    {badge('Лера', day.leraCompleted, day.leraTotal, leraDone, day.leraViolations)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-text-muted space-y-1">
              <p className="text-xs font-semibold">История пока пуста.</p>
              <p className="text-[11px] font-medium">Отметьте первую привычку — день появится здесь.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
