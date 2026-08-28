import React from 'react';
import { Habit, UserId, Violation } from '../types';
import { ShieldAlert } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface PassiveRulesCardProps {
  rules: Habit[];
  currentUserId?: UserId;
  onOpenViolationModal: () => void;
  recentViolations: Violation[];
}

export const PassiveRulesCard: React.FC<PassiveRulesCardProps> = ({
  rules,
  onOpenViolationModal,
  recentViolations,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-text-black">
          Правила питания и запреты
        </h2>
        <span className="bg-surface-muted text-text-muted px-2.5 py-0.5 rounded-full text-[11px] font-bold">
          24/7
        </span>
      </div>

      {/* Rules Solid Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="px-3 py-2 rounded-2xl bg-surface-muted text-xs font-bold text-text-black flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black/40 flex-shrink-0" />
            <span className="truncate">{rule.title}</span>
          </div>
        ))}
      </div>

      {/* Violation Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-muted p-4 rounded-2xl">
        <div className="text-xs font-semibold text-text-black/80 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-text-black flex-shrink-0" />
          <span>Нарушение любого правила сбрасывает стрик на День 1</span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('warning');
            onOpenViolationModal();
          }}
          className="px-4 py-2.5 bg-card-dark hover:bg-black text-white text-xs font-bold rounded-2xl transition active:scale-95 whitespace-nowrap shadow-sm text-center"
        >
          Зафиксировать срыв
        </button>
      </div>

      {/* Recent Violations */}
      {recentViolations.length > 0 && (
        <div className="pt-1 text-xs text-text-muted space-y-1.5">
          <span className="font-bold text-text-black">История срывов:</span>
          <div className="space-y-1.5">
            {recentViolations.slice(0, 2).map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-surface-muted px-3 py-1.5 rounded-xl text-xs">
                <span className="font-medium text-text-black">
                  {v.user_id === 'sereja' ? 'Серёжа' : 'Лера'}: <span className="font-bold text-danger">{v.rule_title}</span> {v.note ? `(${v.note})` : ''}
                </span>
                <span className="text-text-muted text-[11px]">{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
