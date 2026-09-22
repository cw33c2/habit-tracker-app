'use client';
import { useHabitStore } from '@/store/useHabitStore';
import SleepStatsChart from '@/components/SleepStatsChart';
import NotesTimeline from '@/components/NotesTimeline';
import Heatmap from '@/components/Heatmap';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type ViewMode = 'today' | 'week' | 'month';

function getPastDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  return weekDays[d.getDay()];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function StatsPage() {
  const { habits, removeHabit } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  useEffect(() => { setMounted(true); }, []);

  const totalHabits = (habits || []).length;
  const days = viewMode === 'today' ? getPastDays(1) : viewMode === 'week' ? getPastDays(7) : getPastDays(30);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 每天完成率
  const dailyStats = useMemo(() =>
    days.map(dateStr => {
      const completed = (habits || []).filter(h => (h.completedDates || []).includes(dateStr)).length;
      const rate = totalHabits === 0 ? 0 : Math.round((completed / totalHabits) * 100);
      return { dateStr, completed, rate };
    }),
    [habits, days, totalHabits]
  );

  // 整體平均完成率
  const avgRate = dailyStats.length === 0 ? 0
    : Math.round(dailyStats.reduce((sum, d) => sum + d.rate, 0) / dailyStats.length);

  // 全勤天數
  const perfectDays = dailyStats.filter(d => d.rate === 100).length;

  // 最高連勝計算
  let currentStreak = 0;
  let maxStreak = 0;
  const allDays = getPastDays(90);
  for (const dateStr of allDays) {
    const completed = (habits || []).filter(h => (h.completedDates || []).includes(dateStr)).length;
    if (totalHabits > 0 && completed === totalHabits) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      if (dateStr < todayStr) currentStreak = 0;
    }
  }

  // 今日完成項目數
  const todayCompletedHabits = (habits || []).filter(h => (h.completedDates || []).includes(todayStr));
  const todayRate = totalHabits === 0 ? 0 : Math.round((todayCompletedHabits.length / totalHabits) * 100);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-36 transition-colors duration-400">
      <main className="max-w-md mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <Link href="/" className="text-slate-500 hover:text-teal-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">&gt; 數據統計</h1>
        </div>

        {/* View Mode Toggle (本日 / 本週 / 本月) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1 mb-6">
          <button
            onClick={() => setViewMode('today')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              viewMode === 'today' ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ☀️ 本日檢視
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              viewMode === 'week' ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📅 本週數據
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              viewMode === 'month' ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🗓️ 本月月報
          </button>
        </div>

        {/* 🧠 邏輯分工 1：【☀️ 本日】專屬邏輯 */}
        {viewMode === 'today' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 今日完成率大卡片 */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden">
              <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">今日目標進度</div>
              <div className="text-4xl font-black text-teal-400 mb-2">{todayRate}%</div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${todayRate}%` }}
                />
              </div>
              <div className="text-xs text-slate-400">
                已完成 <span className="text-teal-400 font-bold">{todayCompletedHabits.length}</span> / {totalHabits} 項習慣
              </div>
            </div>

            {/* 今日習慣打卡狀態清單 */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center justify-between">
                <span>📋 今日習慣執行清單</span>
                <span className="text-[10px] text-slate-500 font-mono">{todayStr}</span>
              </h3>
              {totalHabits === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">今日尚未新增習慣</p>
              ) : (
                <div className="space-y-2">
                  {(habits || []).map((h) => {
                    const isDone = (h.completedDates || []).includes(todayStr);
                    return (
                      <div
                        key={h.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isDone
                            ? 'bg-teal-950/30 border-teal-800/60 text-teal-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold truncate flex-1">{h.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone ? 'bg-teal-900 text-teal-300' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isDone ? '✅ 已完成' : '⏳ 未打卡'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 今日筆記時間軸 */}
            <NotesTimeline habits={habits || []} defaultPeriod="today" />
          </div>
        )}

        {/* 🧠 邏輯分工 2：【📅 本週】專屬邏輯 */}
        {viewMode === 'week' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 本週 Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-400">{avgRate}%</div>
                <div className="text-[10px] text-slate-500 mt-1">週平均完成率</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{perfectDays}</div>
                <div className="text-[10px] text-slate-500 mt-1">本週全勤天數</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{maxStreak}</div>
                <div className="text-[10px] text-slate-500 mt-1">最高連勝</div>
              </div>
            </div>

            {/* 本週每日長條圖 */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                近 7 天每日完成率 (%)
              </h3>
              <div className="flex items-end gap-1 h-32 pt-4">
                {dailyStats.map(({ dateStr, rate }) => (
                  <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: '90px' }}>
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${
                          rate === 0 ? 'bg-slate-800' :
                          rate < 50 ? 'bg-teal-900' :
                          rate < 80 ? 'bg-teal-600' :
                          rate === 100 ? 'bg-teal-400' : 'bg-teal-500'
                        }`}
                        style={{ height: `${Math.max(rate, 4)}%` }}
                        title={`${formatDate(dateStr)}: ${rate}%`}
                      />
                    </div>
                    <div className="text-[9px] text-slate-500">{formatDay(dateStr)}</div>
                    <div className={`text-[9px] font-bold ${rate === 100 ? 'text-teal-400' : 'text-slate-500'}`}>
                      {rate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 本週睡眠趨勢 */}
            <SleepStatsChart />

            {/* 本週逐項習慣表現 */}
            <div className="space-y-3">
              <h3 className="text-xs text-slate-400 uppercase tracking-widest font-bold">本週逐項習慣完成率</h3>
              {(habits || []).map(habit => {
                const completedCount = days.filter(d => (habit.completedDates || []).includes(d)).length;
                const rate = Math.round((completedCount / days.length) * 100);
                return (
                  <div key={habit.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2 gap-2">
                      <span className="text-sm text-slate-200 flex-1 truncate font-medium">{habit.title}</span>
                      <span className={`text-sm font-bold ${rate >= 80 ? 'text-teal-400' : rate >= 50 ? 'text-orange-400' : 'text-slate-500'}`}>
                        {rate}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rate >= 80 ? 'bg-teal-500' : rate >= 50 ? 'bg-orange-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🧠 邏輯分工 3：【🗓️ 本月】專屬邏輯 */}
        {viewMode === 'month' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 本月 12 週活躍度熱力圖 */}
            <div>
              <Heatmap weeks={12} />
            </div>

            {/* 本月長效指標 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-1">{perfectDays}</div>
                <div className="text-xs text-slate-400 font-bold">本月全勤天數</div>
                <div className="text-[10px] text-slate-500 mt-0.5">達成率 100% 的日子</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">{maxStreak}</div>
                <div className="text-xs text-slate-400 font-bold">最高連勝紀錄</div>
                <div className="text-[10px] text-slate-500 mt-0.5">連續不間斷天數</div>
              </div>
            </div>

            {/* 本月筆記總覽 */}
            <NotesTimeline habits={habits || []} defaultPeriod="month" />

            {/* 本月逐項習慣表現 */}
            <div className="space-y-3">
              <h3 className="text-xs text-slate-400 uppercase tracking-widest font-bold">本月逐項習慣表現</h3>
              {(habits || []).map(habit => {
                const completedCount = days.filter(d => (habit.completedDates || []).includes(d)).length;
                const rate = Math.round((completedCount / days.length) * 100);
                return (
                  <div key={habit.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2 gap-2">
                      <span className="text-sm text-slate-200 flex-1 truncate font-medium">{habit.title}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${rate >= 80 ? 'text-teal-400' : rate >= 50 ? 'text-orange-400' : 'text-slate-500'}`}>
                          {rate}%
                        </span>
                        <button
                          onClick={() => {
                            if (window.confirm(`確定要刪除「${habit.title}」這項習慣及其所有紀錄嗎？`)) {
                              removeHabit(habit.id);
                            }
                          }}
                          title="刪除此習慣"
                          className="p-1.5 rounded-lg border border-slate-700/60 hover:border-red-500/80 hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rate >= 80 ? 'bg-teal-500' : rate >= 50 ? 'bg-orange-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      本月累積完成 {completedCount} / {days.length} 天
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          <Link href="/pomodoro" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <span className="text-lg mb-0.5 leading-none">🍅</span>
            <span className="text-[10px]">番茄鐘</span>
          </Link>
          <Link href="/stats" className="flex-1 flex flex-col items-center justify-center py-1 text-teal-400 font-bold">
            <svg className="w-5 h-5 mb-0.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
