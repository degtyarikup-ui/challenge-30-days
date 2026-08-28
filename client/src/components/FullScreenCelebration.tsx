import React from 'react';
import { Flame } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';

interface FullScreenCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber?: number;
}

const MOTIVATION_QUOTES: string[] = [
  'Первый шаг сделан — начало легендарного пути! 🚀',
  'Дисциплина — это мост между целями и победами! 💪',
  'Отличный темп, формируются новые нейронные связи! ⚡️',
  'Маленькие ежедневные победы создают большой успех! ✨',
  '5 дней подряд — гордимся вашим упорством! 🔥',
  'Вы доказываете себе силу своего намерения! 🎯',
  'Первая неделя закрыта! Невероятный результат! 🏆',
  'Новая неделя — новый уровень уверенности в себе! 💎',
  'С каждым днем становиться сильнее — это ваш выбор! 🦁',
  'Треть пути пройдена на максимуме! Вы машина! 🚀',
  'Сила воли прокачана на новый уровень! 💥',
  'Вы делаете то, о чем многие только мечтают! ⭐️',
  'Несгибаемый фокус и железная дисциплина! 🛡',
  'Две недели без срывов — вы невероятные! 🔥',
  'Экватор челленджа! Ровно половина пути пройдена! 🌟',
  'Каждый шаг вперед приближает к лучшей версии себя! 🏃‍♂️',
  'Привычки уже работают на вас на автомате! ⚡️',
  'Не сбавляем обороты, только вперед! 🏔',
  'Вы вдохновляете друг друга каждый день! ❤️',
  '20 дней побед — фантастическая стойкость! 🏅',
  'Привычки окончательно закрепились в жизни! 🌿',
  'Финальная треть челленджа — режим чемпионов! 🥇',
  'Вы полностью управляете своим телом и разумом! 🧠',
  'Дисциплина на абсолютном максимуме! 🔥',
  'Осталось всего 5 дней — держим строй! 🎯',
  'Вы почти у цели, финишная прямая! ⚡️',
  'Гордимся каждым пройденным днем! ⭐️',
  '4 недели железной дисциплины — абсолютные красавчики! 🏆',
  'Предпоследний день — триумф уже совсем близко! 💥',
  '30 ДНЕЙ ЗАВЕРШЕНО! ВЫ ПОКОРИЛИ ЭТУ ВЕРШИНУ! 🎉👑',
];

export const FullScreenCelebration: React.FC<FullScreenCelebrationProps> = ({
  isOpen,
  onClose,
  dayNumber = 1,
}) => {
  if (!isOpen) return null;

  const quoteIndex = Math.max(0, Math.min(dayNumber - 1, MOTIVATION_QUOTES.length - 1));
  const motivationalQuote = MOTIVATION_QUOTES[quoteIndex] || MOTIVATION_QUOTES[0];

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
        {/* Animated Flame Container - Crisp & No Overlapping Artifacts */}
        <div className="relative flex items-center justify-center w-28 h-28 my-2">
          {/* Breathing Neon Aura */}
          <div className="absolute inset-0 rounded-full bg-lime/30 blur-xl animate-pulse" />

          {/* Flame Card */}
          <div className="relative w-24 h-24 rounded-3xl bg-lime flex items-center justify-center text-black shadow-xl">
            <Flame className="w-13 h-13 fill-black stroke-black animate-bounce" />
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2.5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ДЕНЬ {dayNumber} ЗАКРЫТ!
          </h2>
          <p className="text-sm font-semibold text-lime px-2 leading-relaxed">
            {motivationalQuote}
          </p>
        </div>

        {/* Close Button - Stays until user taps */}
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
