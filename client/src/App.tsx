import React, { useEffect, useState, useCallback } from 'react';
import { AppStateResponse, Habit, UserId } from './types';
import {
  fetchAppState,
  toggleHabitApi,
  recordViolationApi,
  createHabitApi,
  updateHabitApi,
  deleteHabitApi,
  authenticateUserApi,
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
import { RefreshCw, User } from 'lucide-react';

export const App: React.FC = () => {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<UserId | null>(() => {
    const saved = localStorage.getItem('challenge_user_id');
    return (saved as UserId) || null;
  });
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Load App State
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

  // Initialize Auth & Data
  useEffect(() => {
    initTelegramApp();
    const tgUser = getTelegramUser();

    const initAuth = async () => {
      if (tgUser) {
        try {
          const authRes = await authenticateUserApi({
            telegramId: tgUser.id,
            username: tgUser.username,
            firstName: tgUser.first_name,
            manualUserId: currentUserId || undefined,
          });

          if (authRes.userId) {
            setCurrentUserId(authRes.userId);
            localStorage.setItem('challenge_user_id', authRes.userId);
            setShowUserSetup(false);
          } else if (!currentUserId) {
            setShowUserSetup(true);
          }
        } catch (e) {
          console.warn('Auth check failed:', e);
          if (!currentUserId) setShowUserSetup(true);
        }
      } else if (!currentUserId) {
        setShowUserSetup(true);
      }

      await loadData();
    };

    initAuth();

    // SSE Realtime Subscription
    const unsubscribe = subscribeToEvents(() => {
      loadData(selectedDate);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData, selectedDate, currentUserId]);

  const handleSelectInitialUser = async (userId: UserId) => {
    setCurrentUserId(userId);
    localStorage.setItem('challenge_user_id', userId);
    setShowUserSetup(false);

    const tgUser = getTelegramUser();
    if (tgUser) {
      await authenticateUserApi({
        telegramId: tgUser.id,
        username: tgUser.username,
        firstName: tgUser.first_name,
        manualUserId: userId,
      });
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadData(date);
  };

  const handleToggleHabit = async (habitId: number, currentStatus: boolean) => {
    if (!state || !currentUserId) return;
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
              [currentUserId === 'sereja' ? 'status_sereja' : 'status_lera']: {
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
      const res = await toggleHabitApi(habitId, currentUserId, targetDate, newStatus);
      if (res.allDone) {
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      loadData(targetDate);
    }
  };

  const handleConfirmViolation = async (ruleTitle: string, note: string) => {
    if (!state || !currentUserId) return;
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

  // 1-Time User Selection Dialog
  if (showUserSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white p-7 rounded-3xl max-w-sm w-full space-y-5 shadow-card-elevated text-center">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text-black">Кто вы?</h2>
            <p className="text-xs font-semibold text-text-muted">
              Выберите свой профиль для этого устройства.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSelectInitialUser('sereja')}
              className="p-4 bg-surface-muted hover:bg-lime hover:text-black rounded-2xl text-xs font-bold text-text-black flex flex-col items-center gap-2 transition active:scale-95 shadow-xs"
            >
              <User className="w-6 h-6" />
              <span>Серёжа</span>
            </button>

            <button
              onClick={() => handleSelectInitialUser('lera')}
              className="p-4 bg-surface-muted hover:bg-lime hover:text-black rounded-2xl text-xs font-bold text-text-black flex flex-col items-center gap-2 transition active:scale-95 shadow-xs"
            >
              <User className="w-6 h-6" />
              <span>Лера</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !state || !currentUserId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-2 text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin text-text-black" />
        <span className="text-xs font-bold">Загрузка...</span>
      </div>
    );
  }

  const isPastDate = selectedDate !== state.actualDate;
  const isGracePeriodActiveForPast = isPastDate && selectedDate === state.yesterdayDate && state.isGracePeriod;

  return (
    <div className="min-h-screen bg-background text-text-black pb-12 flex flex-col selection:bg-lime selection:text-black">
      {/* Header */}
      <Header
        currentUserId={currentUserId}
        selectedDate={selectedDate}
        actualDate={state.actualDate}
        yesterdayDate={state.yesterdayDate}
        isGracePeriod={state.isGracePeriod}
        onSelectDate={handleDateChange}
        onOpenManageModal={() => setIsManageModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-xl w-full mx-auto px-4 sm:px-6 py-2 space-y-5 flex-1">
        {/* Past Date indicator */}
        {isPastDate && !isGracePeriodActiveForPast && (
          <div className="bg-white rounded-2xl p-3.5 text-xs font-bold text-text-black flex items-center justify-between shadow-card">
            <span>Просмотр дня: {selectedDate}</span>
            <button
              onClick={() => handleDateChange(state.actualDate)}
              className="text-black underline font-extrabold"
            >
              Вернуться на сегодня
            </button>
          </div>
        )}

        {/* 1. Lime Hero Card & Streak Tracker */}
        <StreakTracker users={state.users} currentUserId={currentUserId} />

        {/* 2. Active Habits Grid */}
        <TaskList
          habits={state.habits}
          currentUserId={currentUserId}
          onToggle={handleToggleHabit}
          onOpenManageModal={() => setIsManageModalOpen(true)}
          disabled={isPastDate && !isGracePeriodActiveForPast}
        />

        {/* 3. Passive Rules */}
        <PassiveRulesCard
          rules={state.passiveRules}
          currentUserId={currentUserId}
          onOpenViolationModal={() => setIsViolationModalOpen(true)}
          recentViolations={state.recentViolations}
        />
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
