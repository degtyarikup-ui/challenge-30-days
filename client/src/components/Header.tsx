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
    <header className="px-4 pt-4 pb-2 sm:px-6">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* User Identity & Title */}
        <div className="flex items-center gap-2.5">
          <div className="bg-card-dark text-white px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-bold tracking-wide">
              {currentUserId === 'sereja' ? 'Серёжа' : 'Лера'}
            </span>
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-card text-xs font-semibold">
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(actualDate);
              }}
              className={`px-3 py-1 rounded-full transition ${
                !isViewingYesterday
                  ? 'bg-card-dark text-white'
                  : 'text-text-muted hover:text-text-black'
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
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                  isViewingYesterday
                    ? 'bg-lime text-black font-bold'
                    : 'text-text-muted hover:text-text-black'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Вчера</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenHistoryModal();
            }}
            className="w-10 h-10 rounded-2xl bg-white shadow-card hover:bg-surface-subtle flex items-center justify-center text-text-black transition active:scale-95"
            title="История"
          >
            <Calendar className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="w-10 h-10 rounded-2xl bg-white shadow-card hover:bg-surface-subtle flex items-center justify-center text-text-black transition active:scale-95"
            title="Цели"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
