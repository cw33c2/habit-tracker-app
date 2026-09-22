// ⏰ 自動檢查並觸發習慣提醒 Hook
'use client';

import { useEffect, useRef } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { sendLocalNotification } from '@/lib/notifications';
import { playReminderBeep } from '@/lib/sound';

export function useNotificationScheduler() {
  const habits = useHabitStore((s) => s.habits);
  const notifiedMapRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      (habits || []).forEach((habit) => {
        // 設定了提醒時間、且當前時間符合、且今天尚未打卡、且今天此習慣還沒發過提醒
        if (habit.time === currentTimeStr) {
          const isCompletedToday = (habit.completedDates || []).includes(todayStr);
          const notifyKey = `${todayStr}_${habit.id}_${currentTimeStr}`;

          if (!isCompletedToday && !notifiedMapRef.current.has(notifyKey)) {
            notifiedMapRef.current.add(notifyKey);

            sendLocalNotification(`⏰ 習慣打卡提醒：${habit.title}`, {
              body: `現在是 ${currentTimeStr}，記得完成今日的「${habit.title}」喔！點擊開啟 App 打卡。`,
              tag: notifyKey,
            });

            // 若使用者開啟了鈴聲提醒，則發出柔和提示音
            if (useHabitStore.getState().soundEnabled) {
              playReminderBeep();
            }
          }
        }
      });
    };

    // 每 20 秒檢查一次
    const timer = setInterval(checkReminders, 20000);
    checkReminders(); // 啟動時立刻檢查一次

    return () => clearInterval(timer);
  }, [habits]);
}
