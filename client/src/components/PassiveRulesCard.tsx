import React from 'react';
import { Habit, UserId, Violation } from '../types';
import { AlertTriangle, ShieldCheck, Ban } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface PassiveRulesCardProps {
  rules: Habit[];
  currentUserId: UserId;
  onOpenViolationModal: () => void;
  recentViolations: Violation[];
}

export const PassiveRulesCard: React.FC<PassiveRulesCardProps> = ({
  rules,
  currentUserId,
  onOpenViolationModal,
  recentViolations,
}) => {
  const currentUserName = currentUserId === 'sereja' ? 'Серёжа' : 'Лера';

  return (
    <div className="bg-card/70 backdrop-blur border border-card-border/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-400" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Правильное питание и запреты
            </h2>
            <p className="text-[11px] text-slate-400">
              Постоянные правила (соблюдаются по умолчанию 24/7)
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-rose-400/90 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Без срывов
        </span>
      </div>

      {/* Rules Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 hover:border-slate-700 transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
            <span className="truncate font-medium">{rule.title}</span>
          </div>
        ))}
      </div>

      {/* Violation Trigger Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-rose-950/20 border border-rose-500/20 rounded-xl p-3.5">
        <div className="text-xs text-rose-200/90 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>
            Был срыв по питанию или привычкам? Честность — главный закон челленджа.
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('warning');
            onOpenViolationModal();
          }}
          className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5 transition active:scale-95 whitespace-nowrap"
        >
          <Ban className="w-4 h-4" />
          Зафиксировать срыв ({currentUserName})
        </button>
      </div>

      {/* Recent Violations History Snippet (if any) */}
      {recentViolations.length > 0 && (
        <div className="pt-1 text-[11px] text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300">Последние зафиксированные срывы:</span>
          <div className="space-y-1">
            {recentViolations.slice(0, 2).map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-card/60 px-2.5 py-1 rounded-lg border border-card-border/50 text-[11px]">
                <span className="text-slate-300">
                  {v.user_id === 'sereja' ? '👦 Серёжа' : '👧 Лера'}: <b className="text-rose-400">{v.rule_title}</b> {v.note ? `(${v.note})` : ''}
                </span>
                <span className="text-slate-500">{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
