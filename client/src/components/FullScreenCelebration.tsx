import React, { useEffect } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface FullScreenCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullScreenCelebration: React.FC<FullScreenCelebrationProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        triggerHaptic('light');
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm text-center space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-300"
      >
        {/* Animated Flame Icon Container with Pulsing Rings */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Ripple Ring */}
          <div className="absolute w-32 h-32 rounded-full bg-lime/20 animate-ping opacity-75 pointer-events-none" />
          
          {/* Inner Glow Ring */}
          <div className="absolute w-28 h-28 rounded-full bg-lime/30 animate-pulse pointer-events-none" />

          {/* Main Flame Badge */}
          <div className="relative w-24 h-24 rounded-3xl bg-lime flex items-center justify-center text-black shadow-2xl transition-transform duration-300 hover:scale-105">
            <Flame className="w-14 h-14 fill-black stroke-black animate-bounce" />
          </div>

          {/* Sparkles on top */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shadow-md">
            <Sparkles className="w-4 h-4 fill-black" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-lime text-xs font-black tracking-widest uppercase">
            30 ДНЕЙ ЧЕЛЛЕНДЖ
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ДЕНЬ ЗАКРЫТ!
          </h2>
          <p className="text-sm font-semibold text-white/70 max-w-xs mx-auto">
            Все привычки на сегодня выполнены. Вы красавчики! 🔥
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            onClose();
          }}
          className="w-full py-4 bg-lime hover:bg-lime/90 text-black text-sm font-black rounded-2xl transition active:scale-95 shadow-none flex items-center justify-center gap-2"
        >
          <span>Супер!</span>
          <Flame className="w-4 h-4 fill-black" />
        </button>
      </div>
    </div>
  );
};
