'use client';
import { useHabitStore } from '@/store/useHabitStore';
import TaskItem from '@/components/TaskItem';
import AddHabitForm from '@/components/AddHabitForm';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import NotificationToggle from '@/components/NotificationToggle';
import SleepTrackerCard from '@/components/SleepTrackerCard';


export default function Home() {
  const { habits, getCompletedCountByDate } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // 取得本機當前日期的 YYYY-MM-DD 格式
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'permanent' | 'countdown' | 'one-time'>('all');
  const { syncStatus } = useAutoSync();
  useNotificationScheduler();

  useEffect(() => { setMounted(true); }, []);

  const todayStr = getTodayString();

  // 日期切換函式
  const changeDate = (offsetDays: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + offsetDays);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const isToday = selectedDate === todayStr;
  const dateFormatted = `${selectedDateObj.getMonth() + 1}月${selectedDateObj.getDate()}日` + (isToday ? '（今日）' : '');

  const totalTasks = (habits || []).length;
  const completedTasks = getCompletedCountByDate(selectedDate);
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 篩選與排序：按分類篩選 -> 緊急置頂 -> 時間排序
  const filteredHabits = [...(habits || [])].filter(h => {
    if (selectedFilter === 'all') return true;
    return h.type === selectedFilter;
  });

  const sortedHabits = filteredHabits.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return (a.time || '23:59').localeCompare(b.time || '23:59');
  });

  const remainingTasks = sortedHabits.filter(h => !(h.completedDates || []).includes(selectedDate));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      {/* Add Habit Modal */}
      {showForm && <AddHabitForm onClose={() => setShowForm(false)} />}

      <main className="max-w-md mx-auto p-4 sm:p-6 pb-36">

        {/* Header & Progress */}
        <div className="glass-card rounded-2xl p-4 mb-6 pt-4 border border-slate-800/80 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 flex-nowrap">
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 tracking-wider whitespace-nowrap">&gt; 習慣清單</h1>
              <div className="flex items-center gap-1.5">
                <ThemeToggle />
                <NotificationToggle />
              </div>
              {syncStatus === 'syncing' && (
                <span className="text-[10px] text-slate-400 animate-pulse flex items-center gap-1 whitespace-nowrap">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                  同步中
                </span>
              )}
              {syncStatus === 'success' && (
                <span className="text-[10px] text-teal-400 flex items-center gap-1 whitespace-nowrap">
                  ☁️
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="text-[10px] text-red-400 flex items-center gap-1 whitespace-nowrap">
                  ⚠️
                </span>
              )}
            </div>

            <div className="text-xs font-bold text-teal-400 font-mono">
              {mounted ? percentage : 0}%
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
            <span>今日目標突破</span>
            <span>{mounted ? completedTasks : 0} / {mounted ? totalTasks : 0} 習慣</span>
          </div>

          <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700 glow-teal"
              style={{ width: `${mounted ? percentage : 0}%` }}
            />
          </div>
        </div>

        {/* Date Navigator */}
        <div className="glass-card flex justify-between items-center rounded-2xl p-3 mb-6 shadow-md border border-slate-800">
          <button 
            onClick={() => changeDate(-1)}
            title="前一天"
            className="text-slate-400 hover:text-teal-400 hover:bg-slate-800/80 p-2 rounded-xl transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center cursor-pointer group" onClick={() => setSelectedDate(todayStr)}>
            <div className="text-slate-100 font-bold group-hover:text-teal-300 transition-colors">{dateFormatted}</div>
            <div className="text-[10px] text-teal-400/90 font-medium mt-0.5">
              {isToday ? '✨ 今日打卡進行中' : '↺ 點擊秒回今日'}
            </div>
          </div>
          <button 
            onClick={() => changeDate(1)}
            title="後一天"
            className="text-slate-400 hover:text-teal-400 hover:bg-slate-800/80 p-2 rounded-xl transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`text-xs px-3.5 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
              selectedFilter === 'all'
                ? 'bg-teal-500 text-slate-950 font-extrabold shadow-lg shadow-teal-500/25'
                : 'glass-card text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            全部（{mounted ? totalTasks : 0}）
          </button>
          <button
            onClick={() => setSelectedFilter('permanent')}
            className={`text-xs px-3.5 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
              selectedFilter === 'permanent'
                ? 'bg-teal-500 text-slate-950 font-extrabold shadow-lg shadow-teal-500/25'
                : 'glass-card text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            常駐（{mounted ? (habits || []).filter(h => h.type === 'permanent').length : 0}）
          </button>
          <button
            onClick={() => setSelectedFilter('countdown')}
            className={`text-xs px-3.5 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
              selectedFilter === 'countdown'
                ? 'bg-orange-500 text-slate-950 font-extrabold shadow-lg shadow-orange-500/25'
                : 'glass-card text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            倒數（{mounted ? (habits || []).filter(h => h.type === 'countdown').length : 0}）
          </button>
          <button
            onClick={() => setSelectedFilter('one-time')}
            className={`text-xs px-3.5 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
              selectedFilter === 'one-time'
                ? 'bg-purple-500 text-slate-950 font-extrabold shadow-lg shadow-purple-500/25'
                : 'glass-card text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            一次性（{mounted ? (habits || []).filter(h => h.type === 'one-time').length : 0}）
          </button>
        </div>

        {/* Today's Task List by 4 Time Slots */}
        <h2 className="text-[11px] text-slate-400 font-bold mb-3 uppercase tracking-widest px-1 flex items-center justify-between">
          <span>{isToday ? '今日行程清單（4 大時段分組）' : `${selectedDate} 行程`}</span>
          <span className="text-[10px] text-teal-400">剩餘 {remainingTasks.length} 項</span>
        </h2>

        <div className="mb-6 space-y-5">
          {remainingTasks.length === 0 ? (
            <div className="glass-card rounded-2xl text-center py-12 border border-slate-800">
              <div className="text-5xl mb-3 animate-bounce">🏅</div>
              <p className="text-slate-100 font-bold text-base">今日任務全數達成！</p>
              <p className="text-xs mt-1 text-slate-400">太優秀了，保持連勝迎接明天 ✨</p>
            </div>
          ) : (
            (() => {
              // 時間分組邏輯
              const morningTasks = remainingTasks.filter(h => h.time && h.time >= '05:00' && h.time < '12:00');
              const noonTasks    = remainingTasks.filter(h => h.time && h.time >= '12:00' && h.time < '18:00');
              const nightTasks   = remainingTasks.filter(h => h.time && (h.time >= '18:00' || h.time < '05:00'));
              const anytimeTasks = remainingTasks.filter(h => !h.time);

              const slots = [
                { title: '🌅 早晨時段 (05:00 - 12:00)', tasks: morningTasks, color: 'text-amber-300', border: 'border-amber-500/30' },
                { title: '☀️ 中午 / 下午 (12:00 - 18:00)', tasks: noonTasks, color: 'text-orange-300', border: 'border-orange-500/30' },
                { title: '🌙 晚上 / 睡前 (18:00 以後)', tasks: nightTasks, color: 'text-indigo-300', border: 'border-indigo-500/30' },
                { title: '⏰ 全天 / 未指定時間', tasks: anytimeTasks, color: 'text-teal-300', border: 'border-teal-500/30' },
              ];

              return slots
                .filter(s => s.tasks.length > 0)
                .map(s => (
                  <div key={s.title} className={`bg-slate-950/60 border ${s.border} rounded-2xl p-3 shadow-md`}>
                    <div className="flex items-center justify-between mb-2.5 px-1">
                      <span className={`text-xs font-bold ${s.color}`}>{s.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {s.tasks.length} 項任務
                      </span>
                    </div>
                    <div className="space-y-1">
                      {s.tasks.map(habit => (
                        <TaskItem key={habit.id} habit={habit} date={selectedDate} />
                      ))}
                    </div>
                  </div>
                ));
            })()
          )}
        </div>

        {/* ↩️ 已完成習慣區塊（方便按錯時取消打卡/恢復） */}
        {sortedHabits.filter(h => (h.completedDates || []).includes(selectedDate)).length > 0 && (
          <div className="mb-8 glass-card rounded-2xl p-4 border border-slate-800/80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <span>🎉 今日已完成項</span>
                <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded-full font-mono">
                  {sortedHabits.filter(h => (h.completedDates || []).includes(selectedDate)).length}
                </span>
              </h3>
              <span className="text-[10px] text-slate-500">※ 按錯打勾可點擊「取消完成 ↩️」恢復</span>
            </div>

            <div className="space-y-2">
              {sortedHabits.filter(h => (h.completedDates || []).includes(selectedDate)).map(habit => (
                <div
                  key={habit.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs transition-all opacity-85 hover:opacity-100"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span className="line-through text-slate-400 truncate">{habit.title}</span>
                  </div>

                  <button
                    onClick={() => useHabitStore.getState().toggleHabit(habit.id, selectedDate)}
                    className="bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-800/50 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 flex-shrink-0 active:scale-95"
                  >
                    <span>取消打卡 ↩️</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalTasks === 0 && (
          <div className="glass-card text-center py-10 mb-6 rounded-2xl border-dashed border-slate-800">
            <p className="text-slate-400 text-sm font-medium">還沒有建立任何習慣</p>
            <p className="text-xs text-slate-500 mt-1">點擊下方「+」按鈕套用範本或建立專屬習慣！</p>
          </div>
        )}

        {/* 🛏️ 睡眠時間追蹤卡片（放最下面） */}
        <div className="mt-8 pt-4 border-t border-slate-800/60">
          <h2 className="text-[11px] text-slate-400 font-bold mb-3 uppercase tracking-widest px-1">
            🛏️ 睡眠時間追蹤
          </h2>
          <SleepTrackerCard date={selectedDate} />
        </div>

      </main>

      {/* 🚀 懸浮玻璃質感膠囊導覽列 (Floating Pill Nav) */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
        <div className="glass-nav rounded-full px-3 py-2 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex-1 flex flex-col items-center justify-center py-1 text-teal-400 font-bold">
            <svg className="w-5 h-5 mb-0.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-[10px]">今日</span>
          </Link>
          <Link href="/pomodoro" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <span className="text-lg mb-0.5 leading-none">🍅</span>
            <span className="text-[10px]">番茄鐘</span>
          </Link>

          {/* ➕ 中央亮彩新增按鈕 */}
          <button
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 mx-1 transform active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 glow-teal">
              <svg className="w-6 h-6 text-slate-950 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>

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
