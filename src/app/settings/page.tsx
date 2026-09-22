'use client';

import { useHabitStore } from '@/store/useHabitStore';
import { exportToJSON, exportToCSV, parseJSONBackup } from '@/lib/export';
import GoogleSheetsSyncModal from '@/components/GoogleSheetsSyncModal';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const themeOptions = [
  { id: 'dark', name: '極夜黑客 (Dark)', icon: '🟢', desc: '深藍黑配色，極簡科技質感' },
  { id: 'violet', name: '紫羅蘭微光 (Violet)', icon: '🟣', desc: '柔和紫調，舒緩專注體驗' },
  { id: 'cyber', name: '賽博霓虹 (Cyber)', icon: '💗', desc: '炫彩粉紫，充滿活力衝勁' },
  { id: 'light', name: '日系簡約 (Light)', icon: '⚪', desc: '明亮簡潔，清新無負擔' },
] as const;

export default function SettingsPage() {
  const { habits, importHabits, theme, setTheme } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pb-36">
      <main className="max-w-md mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <Link href="/" className="text-slate-500 hover:text-teal-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-teal-400 tracking-wider">&gt; 系統設定</h1>
        </div>

        {/* 🎨 視覺風格主題切換 */}
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">視覺風格主題</h2>
        <div className="grid grid-cols-2 gap-2.5 mb-8">
          {themeOptions.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                theme === t.id
                  ? 'bg-teal-950/60 border-teal-500 text-teal-300 shadow-md shadow-teal-950/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </div>
              <div className="text-[10px] text-slate-500">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ☁️ 雲端同步與資料備份 */}
        <h2 className="text-xs text-slate-500 uppercase tracking-widest mb-4">雲端同步與資料備份</h2>
        
        {/* Google Sheets Sync Button Banner */}
        <div className="bg-slate-900 border border-teal-800/80 rounded-xl p-4 mb-3 flex items-center justify-between shadow-lg shadow-teal-950/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <div className="text-xs font-bold text-teal-400">Google 試算表雲端同步</div>
              <div className="text-[10px] text-slate-400">電腦與手機雙向即時同步寫入</div>
            </div>
          </div>
          <button
            onClick={() => setShowSheetsModal(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            設定同步 ☁️
          </button>
        </div>

        {showSheetsModal && (
          <GoogleSheetsSyncModal onClose={() => setShowSheetsModal(false)} />
        )}

        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => exportToJSON(habits || [])}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-800/50 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>📦 匯出 JSON 備份</span>
            </button>
            <button
              onClick={() => exportToCSV(habits || [])}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-800/50 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>📊 匯出 CSV 報表</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="w-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 border-dashed py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <span>📥 匯入 JSON 備份檔復原</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const importedHabits = await parseJSONBackup(file);
                    importHabits(importedHabits);
                    alert(`✅ 成功匯入 ${importedHabits.length} 個習慣資料！`);
                  } catch (err: any) {
                    alert(`❌ 匯入失敗：${err.message || '檔案格式無效'}`);
                  }
                  e.target.value = '';
                }}
              />
            </label>
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
          <Link href="/badges" className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-teal-300 transition-colors">
            <svg className="w-5 h-5 mb-0.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[10px]">成就</span>
          </Link>
          <Link href="/settings" className="flex-1 flex flex-col items-center justify-center py-1 text-teal-400 font-bold">
            <svg className="w-5 h-5 mb-0.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
