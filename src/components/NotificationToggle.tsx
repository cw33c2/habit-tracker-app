// 🔔 單一開關提醒按鈕（開啟/關閉切換）
'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission, sendLocalNotification } from '@/lib/notifications';
import { useHabitStore } from '@/store/useHabitStore';
import { playReminderBeep } from '@/lib/sound';

export default function NotificationToggle() {
  const [mounted, setMounted] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const soundEnabled = useHabitStore((s) => s.soundEnabled);
  const toggleSound = useHabitStore((s) => s.toggleSound);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggleNotification = async () => {
    // 若尚未獲得系統推播權限，先請求權限
    if (permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission('granted');
        if (!soundEnabled) toggleSound();
        sendLocalNotification('🎉 提醒通知已開啟！', {
          body: '當你設定提醒時間的習慣到期時，會自動推播與響鈴提醒你！',
        });
        playReminderBeep();
      } else {
        setPermission(Notification.permission);
      }
      return;
    }

    // 已授權狀態下：點擊直接切換開關 (開啟: 推播+音效 / 關閉: 靜音無推播)
    toggleSound();
    if (!soundEnabled) {
      playReminderBeep();
    }
  };

  if (!mounted || typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const isON = permission === 'granted' && soundEnabled;

  return (
    <button
      onClick={handleToggleNotification}
      title={isON ? '提醒通知：已開啟（點擊關閉）' : '提醒通知：已關閉（點擊開啟）'}
      className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center flex-shrink-0 ${
        isON
          ? 'bg-amber-950/50 border-amber-500/70 text-amber-400 shadow-md shadow-amber-950/50'
          : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className="text-base">{isON ? '🔔' : '🔕'}</span>
    </button>
  );
}
