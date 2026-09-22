'use client';

import { useState, useMemo } from 'react';
import { Habit } from '@/store/useHabitStore';

interface NotesTimelineProps {
  habits: Habit[];
}

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

export default function NotesTimeline({ habits }: NotesTimelineProps) {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');

  // 1. 收集所有筆記
  const allNotes = useMemo(() => {
    return (habits || [])
      .flatMap((h) =>
        (h.notes || []).map((n) => ({
          ...n,
          habitTitle: h.title,
          habitType: h.type,
        }))
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [habits]);

  // 2. 根據時間頁籤過濾筆記
  const filteredNotes = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 本週起始點 (往前推 7 天)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // 本月起始點 (當月第一天)
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    return allNotes.filter((n) => {
      const noteDate = n.createdAt.split('T')[0];
      if (filterPeriod === 'today') return noteDate === todayStr;
      if (filterPeriod === 'week') return noteDate >= weekAgoStr;
      if (filterPeriod === 'month') return noteDate >= monthStartStr;
      return true; // 'all'
    });
  }, [allNotes, filterPeriod]);

  if (allNotes.length === 0) {
    return (
      <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">📝</div>
        <h3 className="text-slate-200 text-sm font-bold mb-1">尚無打卡筆記</h3>
        <p className="text-slate-500 text-xs">
          在打卡時填寫心情或成果，記錄會自動收錄在此處形成養成日記！
        </p>
      </div>
    );
  }

  const periodOptions: { id: FilterPeriod; label: string }[] = [
    { id: 'today', label: '📅 本日' },
    { id: 'week', label: '🗓️ 本週' },
    { id: 'month', label: '📊 本月' },
    { id: 'all', label: '🗂️ 全部' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>📖 打卡筆記養成日記</span>
          <span className="text-[10px] bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full font-bold">
            {filteredNotes.length} 則
          </span>
        </h3>
      </div>

      {/* 💡 時間分類頁籤按鈕 */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1 mb-5">
        {periodOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFilterPeriod(opt.id)}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              filterPeriod === opt.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 時間軸清單 */}
      {filteredNotes.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800/50">
          在此時間範圍內沒有新增打卡筆記喔！
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {filteredNotes.map((note) => {
            const dateStr = note.createdAt.split('T')[0];
            const timeStr = note.createdAt.split('T')[1]?.slice(0, 5) || '';

            return (
              <div key={note.id} className="relative group">
                {/* 時間軸圓點 */}
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-slate-900 shadow-md shadow-teal-500/50 group-hover:scale-125 transition-transform" />

                {/* 筆記卡片 */}
                <div className="bg-slate-950 border border-slate-800 hover:border-teal-500/40 rounded-xl p-3.5 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-teal-300 truncate">
                      {note.habitTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                      📅 {dateStr} {timeStr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                    {note.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
