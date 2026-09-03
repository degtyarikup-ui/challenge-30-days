import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AppStateResponse, Habit, HabitWithStatus, UserId } from './types';
import {
  fetchAppState,
  toggleHabitApi,
  recordViolationApi,
  createHabitApi,
  updateHabitApi,
  deleteHabitApi,
  authenticateUserApi,
  updateStartDateApi,
  subscribeToEvents,
  setProfileAvatar,
  onSyncStatusChange,
} from './api';
import { initTelegramApp, getTelegramUser, triggerHaptic } from './utils/telegram';
import { playAllDoneSound, playWarningSound } from './utils/audio';
import { Header } from './components/Header';
import { StreakTracker } from './components/StreakTracker';
import { TaskList } from './components/TaskList';
import { CelebrationBanner } from './components/CelebrationBanner';
import { FullScreenCelebration } from './components/FullScreenCelebration';
import { RulesModal } from './components/RulesModal';
import { ViolationModal } from './components/ViolationModal';
import { ManageTasksModal } from './components/ManageTasksModal';
import { TaskContextMenuModal } from './components/TaskContextMenuModal';
import { DayHistoryModal } from './components/DayHistoryModal';
import { RefreshCw, User, Clock } from 'lucide-react';
import { getChallengeDay } from './utils/date';

export const App: React.FC = () => {
  const [state, setState] = useState<AppStateResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<UserId | null>(() => {
    const saved = localStorage.getItem('challenge_user_id');
    return (saved as UserId) || null;
  });
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;

  // Modals
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuHabit, setContextMenuHabit] = useState<HabitWithStatus | null>(null);
  const [initialEditingHabit, setInitialEditingHabit] = useState<Habit | null>(null);
  const [isFullScreenCelebrationOpen, setIsFullScreenCelebrationOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => onSyncStatusChange((s) => setSyncStatus(s)), []);

  // Load App State
  const loadData = useCallback(async (date?: string) => {
    try {
      const data = await fetchAppState(date);
      setState(data);
      if (!date) {
        setSelectedDate(data.date);
        selectedDateRef.current = data.date;
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Auth & Data (mount only)
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
            if (tgUser.photo_url) {
              setProfileAvatar(authRes.userId, tgUser.photo_url);
            }
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
  }, [loadData]);

  // Realtime subscription. Mount-only: re-subscribing on every profile switch
  // used to leak an EventSource / poll timer per switch.
  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (event && event.type === 'habit_toggled' && event.date === selectedDateRef.current) {
        // Granular patch keeps the toggle animation from flickering.
        setState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            habits: prev.habits.map((h) =>
              h.id === event.habitId
                ? {
                    ...h,
                    [event.userId === 'sereja' ? 'status_sereja' : 'status_lera']: {
                      completed: event.completed,
                      value: event.value || null,
                    },
                  }
                : h
            ),
          };
        });
      } else {
        // cloud_sync, violations, start date and CRUD all need a full rebuild.
        loadData(selectedDateRef.current || undefined);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);


  const handleSelectInitialUser = async (userId: UserId) => {
    setCurrentUserId(userId);
    localStorage.setItem('challenge_user_id', userId);
    setShowUserSetup(false);

    const tgUser = getTelegramUser();
    if (tgUser) {
      if (tgUser.photo_url) {
        setProfileAvatar(userId, tgUser.photo_url);
      }
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
    selectedDateRef.current = date;
    loadData(date);
  };

  const handleToggleHabit = async (habitId: number, currentStatus: boolean) => {
    if (!state || !currentUserId) return;
    const targetDate = selectedDate || state.date;
    const newStatus = !currentStatus;

    // Check if this action will complete all user habits
    const userKey = currentUserId === 'sereja' ? 'status_sereja' : 'status_lera';
    const relevantHabits = state.habits.filter(
      (h) => !h.assigned_to || h.assigned_to === 'both' || h.assigned_to === currentUserId
    );

    const willBeAllDone =
      newStatus &&
      relevantHabits.length > 0 &&
      relevantHabits.every((h) => (h.id === habitId ? true : h[userKey].completed));

    if (willBeAllDone) {
      setTimeout(() => {
        playAllDoneSound();
        setIsFullScreenCelebrationOpen(true);
        triggerHaptic('success');
      }, 100);
    }

    // Instant local state update
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
      await toggleHabitApi(habitId, currentUserId, targetDate, newStatus);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      loadData(targetDate);
    }
  };

  const handleOpenContextMenu = (habit: HabitWithStatus) => {
    setContextMenuHabit(habit);
    setIsContextMenuOpen(true);
  };

  const handleEditFromContextMenu = (habit: HabitWithStatus) => {
    setInitialEditingHabit(habit);
    setIsManageModalOpen(true);
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

  const handleUpdateStartDate = async (date: string) => {
    await updateStartDateApi(date);
    await loadData(selectedDate);
  };

  // 1-Time User Selection Dialog
  if (showUserSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white p-7 rounded-3xl max-w-sm w-full space-y-5 text-center">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text-black">Кто вы?</h2>
            <p className="text-xs font-semibold text-text-muted">
              Выберите свой профиль для этого устройства.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSelectInitialUser('sereja')}
              className="p-4 bg-surface-muted hover:bg-lime hover:text-black rounded-2xl text-xs font-bold text-text-black flex flex-col items-center gap-2 transition active:scale-95"
            >
              <User className="w-6 h-6" />
              <span>Серёжа</span>
            </button>

            <button
              onClick={() => handleSelectInitialUser('lera')}
              className="p-4 bg-surface-muted hover:bg-lime hover:text-black rounded-2xl text-xs font-bold text-text-black flex flex-col items-center gap-2 transition active:scale-95"
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

  // Check if all habits for current user are done
  const myHabits = state.habits.filter(
    (h) => !h.assigned_to || h.assigned_to === 'both' || h.assigned_to === currentUserId
  );
  const userKey = currentUserId === 'sereja' ? 'status_sereja' : 'status_lera';
  const isAllMyDone = myHabits.length > 0 && myHabits.every((h) => h[userKey].completed);

  // Avatar URLs
  const tgUser = getTelegramUser();
  const partnerId: UserId = currentUserId === 'sereja' ? 'lera' : 'sereja';
  const userAvatarUrl = tgUser?.photo_url || state.users[currentUserId]?.avatar_url || null;
  const partnerAvatarUrl = state.users[partnerId]?.avatar_url || null;

  return (
    <div className="min-h-screen bg-background text-text-black pb-8 flex flex-col selection:bg-lime selection:text-black">
      {/* Header */}
      <Header
        currentUserId={currentUserId}
        userAvatarUrl={userAvatarUrl}
        selectedDate={selectedDate}
        actualDate={state.actualDate}
        yesterdayDate={state.yesterdayDate}
        isGracePeriod={state.isGracePeriod}
        onSelectDate={handleDateChange}
        onSwitchUser={() => handleSelectInitialUser(partnerId)}
        onOpenManageModal={() => {
          setInitialEditingHabit(null);
          setIsManageModalOpen(true);
        }}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenRulesModal={() => {
          playWarningSound();
          setIsRulesModalOpen(true);
        }}
      />

      {syncStatus === 'error' && (
        <div className="max-w-xl w-full mx-auto px-4 sm:px-6 pt-1">
          <div className="bg-danger/10 text-danger rounded-2xl px-3.5 py-2 text-xs font-bold">
            Нет связи с облаком — отметки сохранены локально и отправятся автоматически.
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-xl w-full mx-auto px-4 sm:px-6 py-2 space-y-3.5 flex-1">
        {/* Morning Grace Period Switcher (00:00 - 12:00) */}
        {state.isGracePeriod && (
          <div className="bg-white p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => {
                triggerHaptic('light');
                handleDateChange(state.actualDate);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedDate === state.actualDate
                  ? 'bg-card-dark text-white'
                  : 'text-text-muted hover:text-text-black'
              }`}
            >
              <span>Сегодня</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                handleDateChange(state.yesterdayDate);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedDate === state.yesterdayDate
                  ? 'bg-lime text-black'
                  : 'text-text-muted hover:text-text-black'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Вчера (до 12:00)</span>
            </button>
          </div>
        )}

        {/* Yesterday Active Banner during Grace Period */}
        {isGracePeriodActiveForPast && (
          <div className="bg-lime text-black rounded-2xl p-3.5 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-black flex-shrink-0" />
              <span>Отметки за вчера открыты до 12:00 дня</span>
            </div>
            <button
              onClick={() => handleDateChange(state.actualDate)}
              className="text-black underline font-black flex-shrink-0"
            >
              К сегодняшнему дню
            </button>
          </div>
        )}

        {/* Other Past Date Indicator */}
        {isPastDate && !isGracePeriodActiveForPast && (
          <div className="bg-white rounded-2xl p-3 text-xs font-bold text-text-black flex items-center justify-between">
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
        <StreakTracker
          users={state.users}
          currentUserId={currentUserId}
          selectedDate={selectedDate}
          actualDate={state.actualDate}
          startDate={state.startDate}
          daysUntilStart={state.daysUntilStart}
        />

        {/* 2. Non-intrusive Celebration Banner when all done */}
        <CelebrationBanner show={isAllMyDone} />

        {/* 3. Compact Habits List with Long-press & Partner Status */}
        <TaskList
          habits={state.habits}
          currentUserId={currentUserId}
          partnerAvatarUrl={partnerAvatarUrl}
          onToggle={handleToggleHabit}
          onContextMenu={handleOpenContextMenu}
          onOpenManageModal={() => {
            setInitialEditingHabit(null);
            setIsManageModalOpen(true);
          }}
          disabled={isPastDate && !isGracePeriodActiveForPast}
        />
      </main>

      {/* Full-Screen Celebration on Completing Day */}
      <FullScreenCelebration
        isOpen={isFullScreenCelebrationOpen}
        onClose={() => setIsFullScreenCelebrationOpen(false)}
        dayNumber={getChallengeDay(selectedDate || state.actualDate, state.startDate)}
      />

      {/* Context Menu Modal (On Long Press) */}
      <TaskContextMenuModal
        isOpen={isContextMenuOpen}
        onClose={() => setIsContextMenuOpen(false)}
        habit={contextMenuHabit}
        onEdit={handleEditFromContextMenu}
        onDelete={handleDeleteHabit}
      />

      {/* Modals */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={state.passiveRules}
        currentUserId={currentUserId}
        onOpenViolationModal={() => setIsViolationModalOpen(true)}
        onOpenManageModal={() => {
          setInitialEditingHabit(null);
          setIsManageModalOpen(true);
        }}
        recentViolations={state.recentViolations}
      />

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
        onClose={() => {
          setIsManageModalOpen(false);
          setInitialEditingHabit(null);
        }}
        habits={state.habits}
        passiveRules={state.passiveRules}
        startDate={state.startDate}
        initialEditingHabit={initialEditingHabit}
        onCreateHabit={handleCreateHabit}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
        onUpdateStartDate={handleUpdateStartDate}
      />

      <DayHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectDate={handleDateChange}
        actualDate={state.actualDate}
        startDate={state.startDate}
      />
    </div>
  );
};
