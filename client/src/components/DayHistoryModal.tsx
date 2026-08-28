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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-border w-full max-w-lg rounded-2xl p-5 shadow-xl space-y-3.5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <h3 className="text-base font-semibold text-text-primary">
              История по дням
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

        {/* History list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-text-secondary flex flex-col items-center gap-1.5">
              <RefreshCw className="w-4 h-4 animate-spin text-text-muted" />
              <span className="text-xs">Загрузка...</span>
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
                  className="p-3 bg-white border border-border hover:bg-surface-subtle rounded-lg flex items-center justify-between gap-3 cursor-pointer transition"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs sm:text-sm font-medium text-text-primary">{day.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {/* Sereja status */}
                    <span className="text-sereja-text bg-sereja-light border border-sereja-border px-2 py-0.5 rounded font-medium">
                      Серёжа: {day.serejaCompleted}/{day.serejaTotal}
                      {day.serejaViolations > 0 && <span className="ml-1 text-danger">●</span>}
                    </span>

                    {/* Lera status */}
                    <span className="text-lera-text bg-lera-light border border-lera-border px-2 py-0.5 rounded font-medium">
                      Лера: {day.leraCompleted}/{day.leraTotal}
                      {day.leraViolations > 0 && <span className="ml-1 text-danger">●</span>}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-text-secondary space-y-1">
              <p className="text-xs">История пока пуста.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
