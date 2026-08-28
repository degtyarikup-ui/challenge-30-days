import {
  Footprints,
  Moon,
  Dumbbell,
  BookOpen,
  Languages,
  Droplets,
  Apple,
  Utensils,
  Salad,
  CupSoda,
  Coffee,
  Brain,
  Heart,
  Activity,
  Flame,
  Zap,
  Bike,
  Timer,
  Smile,
  Sun,
  Sunrise,
  Sunset,
  Sparkles,
  Pencil,
  Laptop,
  Briefcase,
  CheckSquare,
  Target,
  Award,
  Medal,
  Coins,
  Wallet,
  ShieldCheck,
  Music,
  Palette,
  Scale,
  Bed,
  ShowerHead,
  Pill,
  Ban,
  CheckSquare2,
  LucideIcon
} from 'lucide-react';

export interface IconOption {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const HABIT_ICONS_LIST: IconOption[] = [
  { id: 'footprints', name: 'Шаги', icon: Footprints },
  { id: 'moon', name: 'Сон', icon: Moon },
  { id: 'dumbbell', name: 'Спорт', icon: Dumbbell },
  { id: 'book', name: 'Чтение', icon: BookOpen },
  { id: 'languages', name: 'Языки', icon: Languages },
  { id: 'droplets', name: 'Вода', icon: Droplets },
  { id: 'apple', name: 'Фрукты', icon: Apple },
  { id: 'utensils', name: 'Еда', icon: Utensils },
  { id: 'salad', name: 'ЗОЖ', icon: Salad },
  { id: 'cupsoda', name: 'Напитки', icon: CupSoda },
  { id: 'coffee', name: 'Кофе', icon: Coffee },
  { id: 'brain', name: 'Медитация', icon: Brain },
  { id: 'heart', name: 'Здоровье', icon: Heart },
  { id: 'activity', name: 'Пульс', icon: Activity },
  { id: 'flame', name: 'Калории', icon: Flame },
  { id: 'zap', name: 'Энергия', icon: Zap },
  { id: 'bike', name: 'Велосипед', icon: Bike },
  { id: 'timer', name: 'Тайминг', icon: Timer },
  { id: 'smile', name: 'Настроение', icon: Smile },
  { id: 'sun', name: 'Утро', icon: Sun },
  { id: 'sunrise', name: 'Подъем', icon: Sunrise },
  { id: 'sunset', name: 'Вечер', icon: Sunset },
  { id: 'sparkles', name: 'Порядок', icon: Sparkles },
  { id: 'pencil', name: 'Дневник', icon: Pencil },
  { id: 'laptop', name: 'Работа', icon: Laptop },
  { id: 'briefcase', name: 'Проект', icon: Briefcase },
  { id: 'checksquare', name: 'Чек-лист', icon: CheckSquare },
  { id: 'target', name: 'Фокус', icon: Target },
  { id: 'award', name: 'Награда', icon: Award },
  { id: 'medal', name: 'Победа', icon: Medal },
  { id: 'coins', name: 'Финансы', icon: Coins },
  { id: 'wallet', name: 'Бюджет', icon: Wallet },
  { id: 'shieldcheck', name: 'Дисциплина', icon: ShieldCheck },
  { id: 'music', name: 'Музыка', icon: Music },
  { id: 'palette', name: 'Творчество', icon: Palette },
  { id: 'scale', name: 'Вес', icon: Scale },
  { id: 'bed', name: 'Отдых', icon: Bed },
  { id: 'shower', name: 'Душ', icon: ShowerHead },
  { id: 'pill', name: 'Витамины', icon: Pill },
  { id: 'ban', name: 'Запрет', icon: Ban },
];

export function renderHabitIcon(iconId?: string, title?: string, isDark?: boolean, className = 'w-4 h-4') {
  const colorClass = isDark ? 'text-lime' : 'text-text-black';
  const fullClassName = `${className} ${colorClass}`;

  // 1. By explicit ID
  if (iconId) {
    const found = HABIT_ICONS_LIST.find((i) => i.id === iconId);
    if (found) {
      const IconComponent = found.icon;
      return <IconComponent className={fullClassName} />;
    }
  }

  // 2. By Title keyword fallback
  const t = (title || '').toLowerCase();
  if (t.includes('шаг') || t.includes('ходьб') || t.includes('прогулк')) return <Footprints className={fullClassName} />;
  if (t.includes('сон') || t.includes('спать') || t.includes('сн')) return <Moon className={fullClassName} />;
  if (t.includes('спорт') || t.includes('тренировк') || t.includes('зал') || t.includes('жим')) return <Dumbbell className={fullClassName} />;
  if (t.includes('англ') || t.includes('язык')) return <Languages className={fullClassName} />;
  if (t.includes('книг') || t.includes('чтени') || t.includes('учеб')) return <BookOpen className={fullClassName} />;
  if (t.includes('вод') || t.includes('пить')) return <Droplets className={fullClassName} />;
  if (t.includes('медитац') || t.includes('ум')) return <Brain className={fullClassName} />;
  if (t.includes('душ') || t.includes('облив')) return <ShowerHead className={fullClassName} />;
  if (t.includes('витамин') || t.includes('бад') || t.includes('таблет')) return <Pill className={fullClassName} />;
  if (t.includes('утр') || t.includes('подъем') || t.includes('зарядк')) return <Sunrise className={fullClassName} />;
  if (t.includes('вес') || t.includes('взвешив')) return <Scale className={fullClassName} />;

  return <CheckSquare2 className={fullClassName} />;
}
