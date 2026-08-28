import React from 'react';
import { UserId } from '../types';
import { Calendar, SlidersHorizontal, Clock, User } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface HeaderProps {
  currentUserId: UserId;
  onSelectUser: (userId: UserId) => void;
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
  onSelectUser,
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
      <div className="max-w-2xl mx-auto flex flex-col gap-2.5">
        {/* Top bar: Title & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-text-primary tracking-tight">
              30 Дней
            </h1>
            <p className="text-[12px] text-text-secondary">
              Серёжа и Лера
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenHistoryModal();
              }}
              className="px-2.5 py-1.5 rounded-md bg-surface-subtle border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition"
              title="История по дням"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">История</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenManageModal();
              }}
              className="px-2.5 py-1.5 rounded-md bg-surface-subtle border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition"
              title="Настройка списка целей"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Цели</span>
            </button>
          </div>
        </div>

        {/* Profile Switcher & Date Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {/* User selector: Sereja / Lera */}
          <div className="flex items-center bg-surface-subtle p-0.5 rounded-lg border border-border">
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectUser('sereja');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                currentUserId === 'sereja'
                  ? 'bg-white text-sereja-text border border-sereja-border shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-3 h-3 text-sereja" />
              Серёжа
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectUser('lera');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
                currentUserId === 'lera'
                  ? 'bg-white text-lera-text border border-lera-border shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-3 h-3 text-lera" />
              Лера
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border text-xs">
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(actualDate);
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition ${
                  isViewingYesterday
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
                title="Подтверждение вчерашнего дня (до 12:00)"
              >
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Вчера (до 12:00)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
