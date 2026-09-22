'use client';

import { useState, useEffect } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { playTimerFinishSound } from '@/lib/sound';
import Link from 'next/link';

type Mode = 'work' | 'break';

export default function PomodoroPage() {
  const habits = useHabitStore((state) => state.habits);
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const incrementPomodoro = useHabitStore((state) => state.incrementPomodoro);
  const storePomodoroSessions = useHabitStore((state) => state.pomodoroSessions || 0);

  const WORK_TIME = 25 * 60; // 25 分鐘
  const BREAK_TIME = 5 * 60;  // 5 分鐘

  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  // 倒數計時器 Logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // 完成專注或休息
      playTimerFinishSound();
      setIsRunning(false);

      if (mode === 'work') {
        incrementPomodoro();

        // 如果選擇了關聯習慣，自動為今日打卡
        if (selectedHabitId) {
          const todayStr = new Date().toISOString().split('T')[0];
          const targetHabit = (habits || []).find((h) => h.id === selectedHabitId);
          if (targetHabit && !(targetHabit.completedDates || []).includes(todayStr)) {
            toggleHabit(selectedHabitId, todayStr);
          }
        }

        alert('🎉 恭喜完成 25 分鐘專注！進入 5 分鐘休息時間 ☕');
        setMode('break');
        setTimeLeft(BREAK_TIME);
      } else {
        alert('⏰ 休息結束！準備好開始下一個番茄鐘了嗎？💪');
        setMode('work');
        setTimeLeft(WORK_TIME);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, selectedHabitId, habits, toggleHabit]);

  // 切換工作/休息模式
  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
  };

  // 格式化 mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 圓形進度條百分比
  const totalDuration = mode === 'work' ? WORK_TIME : BREAK_TIME;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-36 transition-colors duration-400">
      <main className="max-w-md mx-auto p-4 sm:p-6 text-center">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4 text-left">
          <Link href="/" className="text-slate-500 hover:text-teal-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 tracking-wider">&gt; 🍅 番茄時鐘</h1>
        </div>

        {/* 模式切換按鈕 */}
        <div className="glass-card flex rounded-2xl p-1 mb-6 border border-slate-800">
          <button
            onClick={() => switchMode('work')}
            className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'work'
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg glow-rose'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍅 專注模式 (25m)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'break'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg glow-teal'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ☕ 休息模式 (5m)
          </button>
        </div>

        {/* 關聯習慣選擇器 */}
        <div className="mb-6 glass-card rounded-2xl p-4 text-left border border-slate-800">
          <label className="text-xs text-slate-400 font-bold block mb-2">
            🎯 關聯今日習慣（專注結束自動打卡）：
          </label>
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="">-- 不關聯（純專注）--</option>
            {(habits || []).map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.title}
              </option>
            ))}
          </select>
        </div>

        {/* 倒數計時主圓環區塊 */}
        <div className="relative w-72 h-72 mx-auto my-6 flex items-center justify-center">
          {/* SVG 雙層漸層霓虹圓環 */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
              <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            {/* 底環 */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-900/80 stroke-current"
              strokeWidth="5"
              fill="transparent"
            />
            {/* 發光進度環 */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={mode === 'work' ? 'url(#roseGradient)' : 'url(#tealGradient)'}
              className="transition-all duration-1000"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: mode === 'work' ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.6))' : 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.6))',
              }}
            />
          </svg>

          {/* 倒數文字與狀態 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-black font-mono text-slate-100 tracking-wider drop-shadow-md">
              {formatTime(timeLeft)}
            </div>
            <div className={`text-xs mt-3 font-bold px-3 py-1 rounded-full border ${
              mode === 'work'
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                : 'bg-teal-950/60 text-teal-300 border-teal-800/80'
            }`}>
              {isRunning ? (mode === 'work' ? '🔥 專注進行中...' : '☕ 充能休息中...') : '⏸️ 準備就緒'}
            </div>
          </div>
        </div>

        {/* 控制按鈕組 */}
        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all transform active:scale-95 flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25'
                : mode === 'work'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-xl glow-rose'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-xl glow-teal'
            }`}
          >
            {isRunning ? '⏸️ 暫停' : '▶️ 開始專注'}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
            }}
            className="px-4 py-3.5 glass-card hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-2xl text-xs font-bold transition-all active:scale-95"
            title="重置計時"
          >
            🔄 重置
          </button>

          <button
            onClick={() => setTimeLeft((prev) => prev + 5 * 60)}
            className="px-4 py-3.5 glass-card hover:bg-slate-800 text-teal-400 border border-slate-800 rounded-2xl text-xs font-bold transition-all active:scale-95"
            title="增加 5 分鐘"
          >
            +5m
          </button>
        </div>

        {/* 今日成就小計卡片 */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-around text-center mb-8">
          <div>
            <div className="text-xs text-slate-400 mb-1 font-medium">累計完成番茄鐘</div>
            <div className="text-2xl font-black text-rose-400 font-mono">🍅 {storePomodoroSessions} 個</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 mb-1 font-medium">總專注時長</div>
            <div className="text-2xl font-black text-teal-400 font-mono">{storePomodoroSessions * 25} 分鐘</div>
          </div>
        </div>

      </main>

      {/* 🚀 懸浮玻璃質感膠囊導覽列 (Floating Pill Nav) */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
        <div className="glass-nav rounded-full px-3 py-2 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <svg className="w-5 h-5 mb-0.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px]">今日</span>
          </Link>
          <Link href="/pomodoro" className="flex-1 flex flex-col items-center justify-center py-1 text-rose-400 font-bold">
            <span className="text-lg mb-0.5 leading-none">🍅</span>
            <span className="text-[10px]">番茄鐘</span>
          </Link>
          <Link href="/stats" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <svg className="w-5 h-5 mb-0.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px]">統計</span>
          </Link>
          <Link href="/badges" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <svg className="w-5 h-5 mb-0.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[10px]">成就</span>
          </Link>
          <Link href="/settings" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <svg className="w-5 h-5 mb-0.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px]">設定</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
