'use client';
import { useHabitStore } from '@/store/useHabitStore';
import { ALL_BADGES, computeEarnedBadgeIds, calcTotalCheckIns, calcPerfectDays, calcLongestStreak } from '@/lib/badges';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BadgesPage() {
  const { habits, pomodoroSessions } = useHabitStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);


  const earnedIds = computeEarnedBadgeIds(habits || [], pomodoroSessions || 0);
  const earnedCount = earnedIds.size;
  const totalCount = ALL_BADGES.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  const totalCheckIns = calcTotalCheckIns(habits || []);
  const perfectDays = calcPerfectDays(habits || []);
  const maxStreak = Math.max(0, ...(habits || []).map(h => calcLongestStreak(h.completedDates || [])));

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
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">&gt; 成就徽章</h1>
        </div>

        {/* Trophy Cabinet Banner */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
          <div className="text-4xl mb-2">🏅</div>
          <h2 className="text-slate-100 font-bold text-lg mb-1">榮譽陳列室</h2>
          <p className="text-xs text-slate-400 mb-4">解鎖徽章，見證你的習慣養成之路！</p>
          
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-bold">
            <span>解鎖進度</span>
            <span className="text-teal-400">{earnedCount} / {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Mini Stats Banner */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">總打卡</div>
            <div className="text-lg font-bold text-teal-400 font-mono">{totalCheckIns} 次</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">最高連勝</div>
            <div className="text-lg font-bold text-orange-400 font-mono">{maxStreak} 天</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">全勤天數</div>
            <div className="text-lg font-bold text-purple-400 font-mono">{perfectDays} 天</div>
          </div>
        </div>

        {/* Badges Grid */}
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">徽章列表</h2>
        <div className="grid grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`border rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                  isEarned
                    ? 'bg-slate-900/90 border-teal-500/50 shadow-lg shadow-teal-950/50'
                    : 'bg-slate-900/30 border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className={`text-4xl mb-2 ${isEarned ? 'scale-110 transition-transform' : ''}`}>
                  {badge.emoji}
                </div>
                <div className={`font-bold text-xs mb-1 ${isEarned ? 'text-teal-300' : 'text-slate-500'}`}>
                  {badge.title}
                </div>
                <div className="text-[10px] text-slate-500 leading-snug">
                  {badge.description}
                </div>
                <div className="mt-3">
                  {isEarned ? (
                    <span className="text-[9px] bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full font-bold">
                      ✓ 已解鎖
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-600 px-2 py-0.5 rounded-full">
                      🔒 未解鎖
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
          <Link href="/pomodoro" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <span className="text-lg mb-0.5 leading-none">🍅</span>
            <span className="text-[10px]">番茄鐘</span>
          </Link>
          <Link href="/stats" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <svg className="w-5 h-5 mb-0.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px]">統計</span>
          </Link>
          <Link href="/badges" className="flex-1 flex flex-col items-center justify-center py-1 text-teal-400 font-bold">
            <svg className="w-5 h-5 mb-0.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
