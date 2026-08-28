import React from 'react';
import { UserId } from '../types';
import { Flame, Calendar, Settings2, Sparkles, Clock } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-card-border/60 px-4 py-3 sm:px-6 transition-all">
      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {/* Top bar: Brand & Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-pink-500 flex items-center justify-center shadow-glow-gold">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Челлендж 30 Дней
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Серёжа & Лера
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenHistoryModal();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-card border border-card-border hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="История и календарь"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">История</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenManageModal();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-card border border-card-border hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Настройка целей"
            >
              <Settings2 className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Цели</span>
            </button>
          </div>
        </div>

        {/* Bottom bar: User Switcher & Date Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* User selector: Sereja / Lera */}
          <div className="flex items-center bg-card/90 p-1 rounded-xl border border-card-border shadow-inner">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Я сейчас:</span>
            
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectUser('sereja');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentUserId === 'sereja'
                  ? 'bg-blue-600 text-white shadow-glow-blue'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              👦 Серёжа
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectUser('lera');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentUserId === 'lera'
                  ? 'bg-pink-600 text-white shadow-glow-pink'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-pink-300"></span>
              👧 Лера
            </button>
          </div>

          {/* Date Selector / Grace Period */}
          <div className="flex items-center gap-1.5 bg-card/90 p-1 rounded-xl border border-card-border text-xs">
            <button
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(actualDate);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                !isViewingYesterday
                  ? 'bg-slate-700/80 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
                  isViewingYesterday
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-semibold'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
                title="Льготный период для закрытия вчерашнего дня (до 12:00)"
              >
                <Clock className="w-3 h-3 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                <span>Вчера (до 12:00)</span>
              </button>
            )}
          </div>
        </div>

        {/* Grace period notification banner if active and viewing yesterday */}
        {isGracePeriod && isViewingYesterday && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Режим <b>Grace Period</b>: можно подтвердить вчерашний сон и шаги до 12:00 дня!</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
