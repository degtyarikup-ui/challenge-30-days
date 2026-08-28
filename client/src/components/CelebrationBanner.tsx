import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface CelebrationBannerProps {
  show: boolean;
}

export const CelebrationBanner: React.FC<CelebrationBannerProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="bg-card-dark text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 animate-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-lime text-black flex items-center justify-center animate-bounce">
          <Flame className="w-5 h-5 fill-black stroke-black" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm sm:text-base font-black tracking-tight text-lime">
              Все цели на сегодня закрыты!
            </h4>
            <Sparkles className="w-3.5 h-3.5 text-lime animate-spin" />
          </div>
          <p className="text-xs font-semibold text-white/70">
            День засчитан в стрик. Вы красавчики! 🔥
          </p>
        </div>
      </div>
    </div>
  );
};
