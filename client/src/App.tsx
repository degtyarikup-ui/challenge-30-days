import React, { useEffect, useState, useCallback } from 'react';
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
import { RefreshCw } from 'lucide-react';

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

  // Load Data
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
      const savedUser = (localStorage.getItem('challenge_user_id') as UserId) || 'sereja';
      linkTelegramIdApi(savedUser, tgUser.id.toString());
    }

    loadData();

    // SSE Realtime Subscription
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
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      loadData(targetDate);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-2 text-text-secondary">
        <RefreshCw className="w-5 h-5 animate-spin text-text-muted" />
        <span className="text-xs">Загрузка...</span>
      </div>
    );
  }

  const isPastDate = selectedDate !== state.actualDate;
  const isGracePeriodActiveForPast = isPastDate && selectedDate === state.yesterdayDate && state.isGracePeriod;

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16 flex flex-col">
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

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4 flex-1">
        {/* Past Date indicator */}
        {isPastDate && !isGracePeriodActiveForPast && (
          <div className="bg-surface-subtle border border-border rounded-lg px-3 py-2 text-xs text-text-secondary flex items-center justify-between">
            <span>Просмотр дня: {selectedDate}</span>
            <button
              onClick={() => handleDateChange(state.actualDate)}
              className="text-sereja hover:underline font-medium"
            >
              Вернуться на сегодня
            </button>
          </div>
        )}

        {/* 1. Streak Tracker */}
        <StreakTracker users={state.users} currentUserId={currentUserId} />

        {/* 2. Active Habits */}
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
