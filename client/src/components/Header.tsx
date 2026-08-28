import React from 'react';
import { UserId } from '../types';
import { Calendar, SlidersHorizontal, Clock, Shield } from 'lucide-react';
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
  onOpenRulesModal: () => void;
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
  onOpenRulesModal,
}) => {
  const isViewingYesterday = selectedDate === yesterdayDate;

  return (
    <header className="px-4 pt-3 pb-1 sm:px-6">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* User Identity */}
        <div className="flex items-center gap-2">
          <div className="bg-card-dark text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime" />
            <span className="text-xs font-bold tracking-wide">
              {currentUserId === 'sereja' ? 'Серёжа' : 'Лера'}
            </span>
          </div>

          {/* Grace Period Switch to Yesterday (if applicable) */}
          {isGracePeriod && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(isViewingYesterday ? actualDate : yesterdayDate);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
                isViewingYesterday
                  ? 'bg-lime text-black'
                  : 'bg-white text-text-muted hover:text-text-black'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{isViewingYesterday ? 'Вчера' : 'Закрыть вчера'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenRulesModal();
            }}
            className="h-9 px-3 rounded-2xl bg-white hover:bg-surface-subtle flex items-center gap-1.5 text-text-black text-xs font-bold transition-all duration-150 active:scale-95"
            title="Правила питания и срыв"
          >
            <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Правила</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenHistoryModal();
            }}
            className="w-9 h-9 rounded-2xl bg-white hover:bg-surface-subtle flex items-center justify-center text-text-black transition-all duration-150 active:scale-95"
            title="История"
          >
            <Calendar className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenManageModal();
            }}
            className="w-9 h-9 rounded-2xl bg-white hover:bg-surface-subtle flex items-center justify-center text-text-black transition-all duration-150 active:scale-95"
            title="Настройка целей"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
