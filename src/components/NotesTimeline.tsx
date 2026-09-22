'use client';

import { Habit } from '@/store/useHabitStore';

interface NotesTimelineProps {
  habits: Habit[];
}

export default function NotesTimeline({ habits }: NotesTimelineProps) {
  // 收集所有習慣裡面的筆記並依時間排序（最新在前面）
  const allNotes = (habits || [])
    .flatMap((h) =>
      (h.notes || []).map((n) => ({
        ...n,
        habitTitle: h.title,
        habitType: h.type,
      }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

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

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>📖 打卡筆記養成日記</span>
          <span className="text-[10px] bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full font-bold">
            共 {allNotes.length} 則
          </span>
        </h3>
      </div>

      {/* 時間軸容器 */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {allNotes.map((note) => {
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
    </div>
  );
}
