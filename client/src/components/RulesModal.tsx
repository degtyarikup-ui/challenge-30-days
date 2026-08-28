import React from 'react';
import { Habit, UserId, Violation } from '../types';
import { Shield, X, SlidersHorizontal, Ban } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: Habit[];
  currentUserId: UserId;
  onOpenViolationModal: () => void;
  onOpenManageModal: () => void;
  recentViolations: Violation[];
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onOpenViolationModal,
  onOpenManageModal,
  recentViolations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center text-text-black">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text-black">
                Правила питания и запреты
              </h3>
              <p className="text-[11px] font-semibold text-text-muted">
                Постоянные правила (24/7)
              </p>
            </div>
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

        {/* Prohibited Rules Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="px-3 py-2.5 rounded-2xl bg-surface-muted text-xs font-bold text-text-black flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black/40 flex-shrink-0" />
                <span className="truncate">{rule.title}</span>
              </div>
            ))}
          </div>

          {/* Action: Fix Slip */}
          <div className="pt-2">
            <button
              onClick={() => {
                triggerHaptic('warning');
                onClose();
                onOpenViolationModal();
              }}
              className="w-full py-3 bg-card-dark hover:bg-black text-white text-xs font-bold rounded-2xl transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Ban className="w-4 h-4 text-danger" />
              <span>Зафиксировать срыв (сброс на День 1)</span>
            </button>
          </div>

          {/* Manage Rules Button */}
          <div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
                onOpenManageModal();
              }}
              className="w-full py-2.5 bg-surface-muted hover:bg-surface-subtle text-text-black text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 active:scale-98"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Редактировать список правил</span>
            </button>
          </div>

          {/* Recent Violations History */}
          {recentViolations.length > 0 && (
            <div className="pt-2 text-xs text-text-muted space-y-1.5 border-t border-surface-subtle">
              <span className="font-bold text-text-black block">История срывов:</span>
              <div className="space-y-1">
                {recentViolations.slice(0, 4).map((v) => (
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
      </div>
    </div>
  );
};
