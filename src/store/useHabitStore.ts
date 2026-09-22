import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// 安全相容的 UUID 產生器 (相容 iOS Safari HTTP / 舊版瀏覽器)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // 在非 HTTPS 環境下 Safe fallback
    }
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

// 計算睡眠時數輔助函式 (HH:mm ~ HH:mm，支援跨夜)
function calcSleepDuration(sleepStr: string, wakeStr: string): number {
  const [sh, sm] = sleepStr.split(':').map(Number);
  const [wh, wm] = wakeStr.split(':').map(Number);
  let sleepMin = sh * 60 + sm;
  let wakeMin = wh * 60 + wm;
  if (wakeMin <= sleepMin) {
    wakeMin += 24 * 60; // 跨夜補 24 小時
  }
  const diffMin = wakeMin - sleepMin;
  return Math.round((diffMin / 60) * 10) / 10;
}

// 日誌筆記項目結構
export const LogNoteSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  habitTitle: z.string(),
  date: z.string(), // YYYY-MM-DD
  note: z.string(),
  createdAt: z.string(),
});

export type LogNote = z.infer<typeof LogNoteSchema>;

// 睡眠打卡紀錄結構
export const SleepLogSchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  sleepTime: z.string().optional(), // HH:mm
  wakeTime: z.string().optional(), // HH:mm
  durationHours: z.number().optional(), // 睡眠時數
  createdAt: z.string(),
});

export type SleepLog = z.infer<typeof SleepLogSchema>;

// 定義習慣的資料結構 (Zod 嚴格驗證)
export const HabitSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '標題不能為空'),
  type: z.enum(['permanent', 'countdown', 'weekly', 'one-time']),
  isUrgent: z.boolean().default(false),
  time: z.string().optional(), // HH:mm
  targetDays: z.number().optional(), // 給倒數或期間限定使用
  createdAt: z.string(),
  completedDates: z.array(z.string()).default([]), // 記錄完成的日期 "YYYY-MM-DD"
  notes: z.array(LogNoteSchema).default([]), // 打卡隨手筆記
});

export type Habit = z.infer<typeof HabitSchema>;

export type ThemeMode = 'dark' | 'violet' | 'cyber' | 'light';

interface HabitState {
  habits: Habit[];
  sleepLogs: SleepLog[];
  pomodoroSessions: number; // 完成番茄鐘數
  theme: ThemeMode;
  soundEnabled: boolean;
  sheetsApiUrl: string;
  setSheetsApiUrl: (url: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleSound: () => void;
  incrementPomodoro: () => void;
  logSleepTime: (date: string, timeStr?: string) => void;
  logWakeTime: (date: string, timeStr?: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'notes'>) => void;
  updateHabit: (id: string, updatedData: Partial<Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'notes'>>) => void;
  toggleHabit: (id: string, date: string, noteText?: string) => void;
  addNoteToHabit: (habitId: string, date: string, noteText: string) => void;
  deleteNote: (noteId: string) => void;
  removeHabit: (id: string) => void;
  importHabits: (newHabits: Habit[]) => void;
  getCompletedCountByDate: (date: string) => number;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [
        {
          id: '1',
          title: '繳交企劃書最終版',
          type: 'one-time',
          isUrgent: true,
          time: '14:00',
          createdAt: new Date().toISOString(),
          completedDates: [],
          notes: [],
        },
        {
          id: '2',
          title: '喝 500ml 溫開水',
          type: 'permanent',
          isUrgent: false,
          time: '07:00',
          createdAt: new Date().toISOString(),
          completedDates: [],
          notes: [],
        },
        {
          id: '3',
          title: '準備多益單字',
          type: 'countdown',
          isUrgent: false,
          time: '13:00',
          targetDays: 14,
          createdAt: new Date().toISOString(),
          completedDates: [],
          notes: [],
        }
      ],
      sleepLogs: [],
      pomodoroSessions: 0,
      theme: 'dark',
      soundEnabled: false, // 預設關閉提示音效，不打擾大家
      sheetsApiUrl: 'https://script.google.com/macros/s/AKfycbztmSVxiAmNMPFJwSY3Bd7302oXwsWuE86kLgDXr5HApsDnIWOTU7xat5sM7i4F6NYn/exec',
      setSheetsApiUrl: (url) => {
        set({ sheetsApiUrl: url.trim() });
      },
      toggleTheme: () => {
        set((state) => {
          const themes: ThemeMode[] = ['dark', 'violet', 'cyber', 'light'];
          const idx = themes.indexOf(state.theme);
          const next = themes[(idx + 1) % themes.length];
          return { theme: next };
        });
      },
      setTheme: (newTheme) => {
        set({ theme: newTheme });
      },
      toggleSound: () => {
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        }));
      },
      incrementPomodoro: () => {
        set((state) => ({
          pomodoroSessions: (state.pomodoroSessions || 0) + 1,
        }));
      },

      logSleepTime: (date, customTime) => {
        const now = new Date();
        const timeStr = customTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        set((state) => {
          const logs = state.sleepLogs || [];
          const existing = logs.find((l) => l.date === date);
          let newLogs: SleepLog[];

          if (existing) {
            const updated = { ...existing, sleepTime: timeStr };
            if (updated.wakeTime) {
              updated.durationHours = calcSleepDuration(timeStr, updated.wakeTime);
            }
            newLogs = logs.map((l) => (l.date === date ? updated : l));
          } else {
            newLogs = [
              ...logs,
              {
                id: generateUUID(),
                date,
                sleepTime: timeStr,
                createdAt: new Date().toISOString(),
              },
            ];
          }

          return { sleepLogs: newLogs };
        });
      },

      logWakeTime: (date, customTime) => {
        const now = new Date();
        const timeStr = customTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        set((state) => {
          const logs = state.sleepLogs || [];
          const existing = logs.find((l) => l.date === date);
          let newLogs: SleepLog[];

          if (existing) {
            const updated = { ...existing, wakeTime: timeStr };
            if (updated.sleepTime) {
              updated.durationHours = calcSleepDuration(updated.sleepTime, timeStr);
            }
            newLogs = logs.map((l) => (l.date === date ? updated : l));
          } else {
            newLogs = [
              ...logs,
              {
                id: generateUUID(),
                date,
                wakeTime: timeStr,
                createdAt: new Date().toISOString(),
              },
            ];
          }

          return { sleepLogs: newLogs };
        });
      },

      addHabit: (habitData) => {
        const newHabit = HabitSchema.parse({
          ...habitData,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
          completedDates: [],
          notes: [],
        });
        set((state) => ({ habits: [...(state.habits || []), newHabit] }));
      },
      updateHabit: (id, updatedData) => {
        set((state) => ({
          habits: (state.habits || []).map((habit) => {
            if (habit.id === id) {
              return { ...habit, ...updatedData };
            }
            return habit;
          }),
        }));
      },
      importHabits: (newHabits) => {
        set(() => ({ habits: newHabits }));
      },
      toggleHabit: (id, date, noteText) => {
        set((state) => ({
          habits: (state.habits || []).map((habit) => {
            if (habit.id === id) {
              const isCompleted = (habit.completedDates || []).includes(date);
              const newCompletedDates = isCompleted
                ? (habit.completedDates || []).filter((d) => d !== date)
                : [...(habit.completedDates || []), date];

              let newNotes = habit.notes || [];
              if (!isCompleted && noteText && noteText.trim()) {
                newNotes = [
                  {
                    id: generateUUID(),
                    habitId: habit.id,
                    habitTitle: habit.title,
                    date,
                    note: noteText.trim(),
                    createdAt: new Date().toISOString(),
                  },
                  ...newNotes,
                ];
              }

              return {
                ...habit,
                completedDates: newCompletedDates,
                notes: newNotes,
              };
            }
            return habit;
          }),
        }));
      },
      addNoteToHabit: (habitId, date, noteText) => {
        set((state) => ({
          habits: (state.habits || []).map((habit) => {
            if (habit.id === habitId && noteText.trim()) {
              const newNote: LogNote = {
                id: generateUUID(),
                habitId: habit.id,
                habitTitle: habit.title,
                date,
                note: noteText.trim(),
                createdAt: new Date().toISOString(),
              };
              return {
                ...habit,
                notes: [newNote, ...(habit.notes || [])],
              };
            }
            return habit;
          }),
        }));
      },
      deleteNote: (noteId) => {
        set((state) => ({
          habits: (state.habits || []).map((habit) => ({
            ...habit,
            notes: (habit.notes || []).filter((n) => n.id !== noteId),
          })),
        }));
      },
      removeHabit: (id) => {
        set((state) => ({
          habits: (state.habits || []).filter((h) => h.id !== id),
        }));
      },
      getCompletedCountByDate: (date) => {
        const { habits } = get();
        return (habits || []).filter((h) => (h.completedDates || []).includes(date)).length;
      },
    }),
    {
      name: 'habit-storage',
      // 🛡️ A計畫懶人包規範：使用 Zod 進行 LocalStorage 安全相容性驗證與清洗
      migrate: (persistedState: any) => {
        if (!persistedState) return persistedState;
        try {
          if (Array.isArray(persistedState.habits)) {
            persistedState.habits = persistedState.habits.map((h: any) => {
              const res = HabitSchema.safeParse(h);
              return res.success ? res.data : h;
            });
          }
        } catch {
          // 安全防護
        }
        return persistedState;
      },
    }
  )
);
