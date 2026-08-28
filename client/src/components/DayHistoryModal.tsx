import React, { useEffect, useState } from 'react';
import { HistoryDay } from '../types';
import { fetchHistoryApi } from '../api';
import { Calendar, X, RefreshCw } from 'lucide-react';
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

        {/* History list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-text-muted flex flex-col items-center gap-1.5">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-semibold">Загрузка...</span>
            </div>
          ) : history.length > 0 ? (
            history.map((day) => {
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
                  <div>
                    <span className="text-sm font-bold text-text-black">{day.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {/* Sereja status */}
                    <span className="bg-white text-text-black px-3 py-1 rounded-full font-bold shadow-xs">
                      Серёжа: {day.serejaCompleted}/{day.serejaTotal}
                      {day.serejaViolations > 0 && <span className="ml-1 text-danger">⚠️</span>}
                    </span>

                    {/* Lera status */}
                    <span className="bg-white text-text-black px-3 py-1 rounded-full font-bold shadow-xs">
                      Лера: {day.leraCompleted}/{day.leraTotal}
                      {day.leraViolations > 0 && <span className="ml-1 text-danger">⚠️</span>}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-text-muted space-y-1">
              <p className="text-xs font-semibold">История пока пуста.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
