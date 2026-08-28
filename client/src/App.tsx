import React, { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AppStateResponse, Habit, UserId } from './types';
import {
  fetchAppState,
  toggleHabitApi,
  recordViolationApi,
  createHabitApi,
  updateHabitApi,
  deleteHabitApi,
  linkTelegramIdApi,
  subscribeToEvents,
} from './api';
import { initTelegramApp, getTelegramUser, triggerHaptic } from './utils/telegram';
import { Header } from './components/Header';
import { StreakTracker } from './components/StreakTracker';
import { TaskList } from './components/TaskList';
import { PassiveRulesCard } from './components/PassiveRulesCard';
import { ViolationModal } from './components/ViolationModal';
import { ManageTasksModal } from './components/ManageTasksModal';
import { DayHistoryModal } from './components/DayHistoryModal';
import { RefreshCw, Bot, Heart, Flame } from 'lucide-react';

export const App: React.FC = () => {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<UserId>(() => {
    const saved = localStorage.getItem('challenge_user_id');
    return (saved as UserId) || 'sereja';
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Initialize Telegram & Load Data
  const loadData = useCallback(async (date?: string) => {
    try {
      const data = await fetchAppState(date);
      setState(data);
      if (!date) {
        setSelectedDate(data.date);
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initTelegramApp();
    const tgUser = getTelegramUser();
    if (tgUser) {
      // Auto-link Telegram ID
      const savedUser = (localStorage.getItem('challenge_user_id') as UserId) || 'sereja';
      linkTelegramIdApi(savedUser, tgUser.id.toString());
    }

    loadData();

    // Subscribe to real-time events
    const unsubscribe = subscribeToEvents(() => {
      loadData(selectedDate);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData, selectedDate]);

  const handleSelectUser = (userId: UserId) => {
    setCurrentUserId(userId);
    localStorage.setItem('challenge_user_id', userId);

    const tgUser = getTelegramUser();
    if (tgUser) {
      linkTelegramIdApi(userId, tgUser.id.toString());
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadData(date);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#EC4899', '#F59E0B', '#10B981'],
    });
  };

  const handleToggleHabit = async (habitId: number, userId: UserId, currentStatus: boolean) => {
    if (!state) return;
    const targetDate = selectedDate || state.date;
    const newStatus = !currentStatus;

    // Optimistic UI update
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        habits: prev.habits.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              [userId === 'sereja' ? 'status_sereja' : 'status_lera']: {
                completed: newStatus,
                value: null,
              },
            };
          }
          return h;
        }),
      };
    });

    try {
      const res = await toggleHabitApi(habitId, userId, targetDate, newStatus);
      if (res.allDone) {
        fireConfetti();
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      loadData(targetDate); // Revert on failure
    }
  };

  const handleConfirmViolation = async (ruleTitle: string, note: string) => {
    if (!state) return;
    const targetDate = selectedDate || state.date;
    await recordViolationApi(currentUserId, targetDate, ruleTitle, note);
    await loadData(targetDate);
  };

  const handleCreateHabit = async (habit: Partial<Habit>) => {
    await createHabitApi(habit);
    await loadData(selectedDate);
  };

  const handleUpdateHabit = async (id: number, habit: Partial<Habit>) => {
    await updateHabitApi(id, habit);
    await loadData(selectedDate);
  };

  const handleDeleteHabit = async (id: number) => {
    await deleteHabitApi(id);
    await loadData(selectedDate);
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center shadow-glow-gold animate-bounce">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Загрузка челленджа...</span>
        </div>
      </div>
    );
  }

  const isPastDate = selectedDate !== state.actualDate;
  const isGracePeriodActiveForPast = isPastDate && selectedDate === state.yesterdayDate && state.isGracePeriod;

  return (
    <div className="min-h-screen bg-background text-slate-100 pb-16 flex flex-col">
      {/* Header */}
      <Header
        currentUserId={currentUserId}
        onSelectUser={handleSelectUser}
        selectedDate={selectedDate}
        actualDate={state.actualDate}
        yesterdayDate={state.yesterdayDate}
        isGracePeriod={state.isGracePeriod}
        onSelectDate={handleDateChange}
        onOpenManageModal={() => setIsManageModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5 flex-1">
        {/* Past Date Warning if viewing older history beyond grace period */}
        {isPastDate && !isGracePeriodActiveForPast && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-300 flex items-center justify-between">
            <span>Просмотр истории за <b>{selectedDate}</b></span>
            <button
              onClick={() => handleDateChange(state.actualDate)}
              className="text-blue-400 hover:text-blue-300 font-semibold underline text-xs"
            >
              Вернуться на сегодня
            </button>
          </div>
        )}

        {/* 1. 30-Day Streak Tracker */}
        <StreakTracker users={state.users} currentUserId={currentUserId} />

        {/* 2. Active Daily Habits List */}
        <TaskList
          habits={state.habits}
          currentUserId={currentUserId}
          onToggle={handleToggleHabit}
          onOpenManageModal={() => setIsManageModalOpen(true)}
          disabled={isPastDate && !isGracePeriodActiveForPast}
        />

        {/* 3. Passive Rules & Prohibited Items (Clean eating, no alcohol/cigarettes) */}
        <PassiveRulesCard
          rules={state.passiveRules}
          currentUserId={currentUserId}
          onOpenViolationModal={() => setIsViolationModalOpen(true)}
          recentViolations={state.recentViolations}
        />

        {/* Bot & WebApp footer indicator */}
        <div className="pt-4 border-t border-card-border/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-500" />
            <span>Серёжа + Лера = 30 Дней к цели</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Telegram Bot Connected</span>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ViolationModal
        isOpen={isViolationModalOpen}
        onClose={() => setIsViolationModalOpen(false)}
        onConfirm={handleConfirmViolation}
        currentUserId={currentUserId}
        rules={state.passiveRules}
        date={selectedDate}
      />

      <ManageTasksModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        habits={state.habits}
        passiveRules={state.passiveRules}
        onCreateHabit={handleCreateHabit}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
      />

      <DayHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectDate={handleDateChange}
      />
    </div>
  );
};
