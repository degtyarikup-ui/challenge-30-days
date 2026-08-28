import React from 'react';
import { UserId } from '../types';
import { Calendar, SlidersHorizontal, Clock } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface HeaderProps {
  currentUserId: UserId;
  selectedDate: string;
  actualDate: string;
  yesterdayDate: string;
  isGracePeriod: boolean;
  onSelectDate: (date: string) => void;
  onOpenManageModal: () => void;
  onOpenHistoryModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUserId,
  selectedDate,
  actualDate,
  yesterdayDate,
  isGracePeriod,
  onSelectDate,
  onOpenManageModal,
  onOpenHistoryModal,
}) => {
  const isViewingYesterday = selectedDate === yesterdayDate;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 sm:px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand & User identity */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-semibold text-text-primary tracking-tight">
            30 Дней
          </h1>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
              currentUserId === 'sereja'
                ? 'bg-sereja-light text-sereja-text border-sereja-border'
                : 'bg-lera-light text-lera-text border-lera-border'
            }`}
          >
            {currentUserId === 'sereja' ? 'Серёжа' : 'Лера'}
          </span>
        </div>

        {/* Actions & Date switcher */}
        <div className="flex items-center gap-1.5">
          {/* Date Selector */}
          <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border text-xs mr-1">
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(actualDate);
              }}
              className={`px-2 py-1 rounded font-medium transition ${
                !isViewingYesterday
                  ? 'bg-white text-text-primary border border-border shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Сегодня
            </button>

            {isGracePeriod && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onSelectDate(yesterdayDate);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition ${
                  isViewingYesterday
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
                title="Подтверждение вчерашнего дня (до 12:00)"
              >
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Вчера</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenHistoryModal();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-surface-subtle border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition"
            title="История"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">История</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-surface-subtle border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition"
            title="Цели"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Цели</span>
          </button>
        </div>
      </div>
    </header>
  );
};
