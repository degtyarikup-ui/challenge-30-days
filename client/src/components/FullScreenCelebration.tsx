import React, { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { clearCelebrationConfetti } from '../utils/confetti';

interface FullScreenCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber?: number;
}

const MOTIVATION_QUOTES: string[] = [
  'Первый шаг сделан — начало легендарного пути.',
  'Дисциплина — это мост между целями и победами.',
  'Отличный темп, формируются новые нейронные связи.',
  'Маленькие ежедневные победы создают большой успех.',
  'Пять дней подряд — отличная демонстрация упорства.',
  'Вы доказываете себе силу своего намерения.',
  'Первая неделя закрыта. Невероятный результат.',
  'Новая неделя — новый уровень уверенности в себе.',
  'С каждым днем становиться сильнее — это ваш выбор.',
  'Треть пути пройдена на максимуме.',
  'Сила воли прокачана на новый уровень.',
  'Вы делаете то, о чем многие только мечтают.',
  'Несгибаемый фокус и железная дисциплина.',
  'Две недели без срывов — вы двигаетесь уверенно.',
  'Экватор челленджа. Ровно половина пути пройдена.',
  'Каждый шаг вперед приближает к лучшей версии себя.',
  'Привычки уже работают на вас на автомате.',
  'Не сбавляем обороты, только вперед к цели.',
  'Вы поддерживаете и мотивируете друг друга каждый день.',
  'Двадцать дней побед — фантастическая стойкость.',
  'Привычки окончательно закрепились в жизни.',
  'Финальная треть челленджа — режим максимальной отдачи.',
  'Вы полностью управляете своим телом и разумом.',
  'Дисциплина на абсолютном максимуме.',
  'Осталось всего пять дней — держим строй.',
  'Вы почти у цели, финишная прямая.',
  'Отличный результат каждого пройденного дня.',
  'Четыре недели железной дисциплины.',
  'Предпоследний день — триумф уже совсем близко.',
  'Тридцать дней завершено. Вы покорили эту вершину.',
];

export const FullScreenCelebration: React.FC<FullScreenCelebrationProps> = ({
  isOpen,
  onClose,
  dayNumber = 1,
}) => {
  useEffect(() => {
    return () => {
      clearCelebrationConfetti();
    };
  }, []);

  if (!isOpen) return null;

  const quoteIndex = Math.max(0, Math.min(dayNumber - 1, MOTIVATION_QUOTES.length - 1));
  const motivationalQuote = MOTIVATION_QUOTES[quoteIndex] || MOTIVATION_QUOTES[0];

  const handleDismiss = () => {
    clearCelebrationConfetti();
    triggerHaptic('medium');
    onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm text-center space-y-7 flex flex-col items-center animate-in zoom-in-95 duration-300"
      >
        {/* Standalone Glowing Swaying Flame - No plate/card behind */}
        <div className="relative flex items-center justify-center py-4">
          <Flame className="w-28 h-28 sm:w-32 sm:h-32 text-lime fill-lime animate-flame-sway stroke-[1.5]" />
        </div>

        {/* Text Area - Pure typography without emojis */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            День {dayNumber} закрыт
          </h2>
          <p className="text-sm font-semibold text-lime/90 px-2 leading-relaxed">
            {motivationalQuote}
          </p>
        </div>

        {/* Button - Pure text only, no icons, no emojis */}
        <button
          onClick={handleDismiss}
          className="w-full py-4 bg-lime hover:bg-lime/90 text-black text-sm font-black rounded-2xl transition active:scale-95 shadow-none"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};
