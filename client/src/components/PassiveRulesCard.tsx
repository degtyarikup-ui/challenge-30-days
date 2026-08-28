import React from 'react';
import { Habit, UserId, Violation } from '../types';
import { Shield, AlertCircle } from 'lucide-react';
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
    <div className="bg-surface rounded-xl border border-border p-4 sm:p-5 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-text-secondary" />
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Правила питания и запреты
            </h2>
            <p className="text-[11px] text-text-secondary">
              Соблюдаются постоянно
            </p>
          </div>
        </div>

        <span className="text-[11px] text-text-muted">
          24/7
        </span>
      </div>

      {/* Rules Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-border text-xs text-text-primary"
          >
            <span className="w-1 h-1 rounded-full bg-text-muted flex-shrink-0" />
            <span className="truncate">{rule.title}</span>
          </div>
        ))}
      </div>

      {/* Violation Action */}
      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-danger-light border border-danger-border rounded-lg p-3">
        <div className="text-xs text-danger-text flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
          <span>Нарушение сбрасывает стрик на День 1</span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('warning');
            onOpenViolationModal();
          }}
          className="px-3 py-1.5 bg-white hover:bg-red-50 border border-danger-border text-danger text-xs font-medium rounded-lg transition active:scale-98 whitespace-nowrap shadow-xs"
        >
          Зафиксировать нарушение ({currentUserName})
        </button>
      </div>

      {/* Recent Violations */}
      {recentViolations.length > 0 && (
        <div className="pt-1 text-[11px] text-text-secondary space-y-1">
          <span className="font-medium text-text-primary">История нарушений:</span>
          <div className="space-y-1">
            {recentViolations.slice(0, 2).map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-border text-[11px]">
                <span className="text-text-primary">
                  {v.user_id === 'sereja' ? 'Серёжа' : 'Лера'}: <span className="font-medium text-danger">{v.rule_title}</span> {v.note ? `(${v.note})` : ''}
                </span>
                <span className="text-text-muted">{v.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
