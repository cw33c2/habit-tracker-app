// 🛏️ 睡眠快速打卡卡片 (一鍵記錄入睡與起床時間)
'use client';

import { useHabitStore } from '@/store/useHabitStore';
import { useState } from 'react';

export default function SleepTrackerCard({ date }: { date: string }) {
  const sleepLogs = useHabitStore((s) => s.sleepLogs) || [];
  const logSleepTime = useHabitStore((s) => s.logSleepTime);
  const logWakeTime = useHabitStore((s) => s.logWakeTime);

  const [editingField, setEditingField] = useState<'sleep' | 'wake' | null>(null);
  const [customTime, setCustomTime] = useState('');

  const currentLog = sleepLogs.find((l) => l.date === date);

  const handleSleepClick = () => {
    logSleepTime(date);
  };

  const handleWakeClick = () => {
    logWakeTime(date);
  };

  const handleCustomTimeSubmit = (field: 'sleep' | 'wake') => {
    if (!customTime) return;
    if (field === 'sleep') {
      logSleepTime(date, customTime);
    } else {
      logWakeTime(date, customTime);
    }
    setEditingField(null);
    setCustomTime('');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/50 rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
      {/* 裝飾背景柔光 */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌙</span>
          <div>
            <h2 className="text-sm font-bold text-indigo-300">睡眠時間追蹤</h2>
            <p className="text-[10px] text-slate-400">一按即刻打卡，自動計算睡眠時數</p>
          </div>
        </div>
        {currentLog?.durationHours !== undefined && (
          <div className="bg-indigo-900/60 border border-indigo-700/60 px-3 py-1 rounded-xl text-center">
            <div className="text-[9px] text-indigo-300 uppercase">總睡眠</div>
            <div className="text-sm font-bold text-indigo-200">{currentLog.durationHours} 小時</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* 我要睡了 按鈕 */}
        <div className="bg-slate-900/80 border border-indigo-900/80 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span>🛌</span> 入睡時間
            </span>
            <button
              onClick={() => {
                setEditingField('sleep');
                setCustomTime(currentLog?.sleepTime || '23:00');
              }}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              手動修
            </button>
          </div>

          <div className="text-lg font-bold font-mono text-indigo-200 mb-2">
            {currentLog?.sleepTime || '--:--'}
          </div>

          <button
            onClick={handleSleepClick}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-md shadow-indigo-950"
          >
            <span>🌙 我要睡了</span>
          </button>
        </div>

        {/* 我起床了 按鈕 */}
        <div className="bg-slate-900/80 border border-amber-900/50 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span>🌅</span> 起床時間
            </span>
            <button
              onClick={() => {
                setEditingField('wake');
                setCustomTime(currentLog?.wakeTime || '07:30');
              }}
              className="text-[10px] text-amber-400 hover:underline"
            >
              手動修
            </button>
          </div>

          <div className="text-lg font-bold font-mono text-amber-200 mb-2">
            {currentLog?.wakeTime || '--:--'}
          </div>

          <button
            onClick={handleWakeClick}
            className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-md shadow-amber-950"
          >
            <span>☀️ 我起床了</span>
          </button>
        </div>
      </div>

      {/* 手動編輯 Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-xs shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3">
              修改{editingField === 'sleep' ? '入睡時間 🌙' : '起床時間 ☀️'}
            </h3>
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-slate-100 text-center font-mono text-lg mb-4 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-xl text-xs font-bold"
              >
                取消
              </button>
              <button
                onClick={() => handleCustomTimeSubmit(editingField)}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
