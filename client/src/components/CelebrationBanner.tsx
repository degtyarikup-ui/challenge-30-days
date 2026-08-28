import React from 'react';
import { Flame, Check } from 'lucide-react';

interface CelebrationBannerProps {
  show: boolean;
}

export const CelebrationBanner: React.FC<CelebrationBannerProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="bg-card-dark text-white rounded-3xl p-4 sm:p-4.5 flex items-center justify-between gap-3 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-lime text-black flex items-center justify-center flex-shrink-0">
          <Flame className="w-5 h-5 fill-black stroke-black" />
        </div>

        <div>
          <h4 className="text-sm sm:text-base font-black tracking-tight text-white">
            Все цели на сегодня закрыты
          </h4>
          <p className="text-xs font-semibold text-white/60">
            Отличная работа!
          </p>
        </div>
      </div>

      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-lime flex-shrink-0">
        <Check className="w-4 h-4 stroke-[3]" />
      </div>
    </div>
  );
};
