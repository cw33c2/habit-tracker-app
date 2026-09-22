'use client';
import { useHabitStore } from '@/store/useHabitStore';
import { useMemo } from 'react';

// 產生過去 N 天的日期字串陣列 ['YYYY-MM-DD', ...]
function getPastDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

// 把日期字串格式化為短格式顯示，例如 "9/21"
function formatShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 把日期字串格式化為完整格式，例如 "9月21日 (週日)"
function formatFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return `${d.getMonth() + 1}月${d.getDate()}日（${weekDays[d.getDay()]}）`;
}

export default function Heatmap({ weeks = 12 }: { weeks?: number }) {
  const { habits } = useHabitStore();
  const totalHabits = (habits || []).length;
  const past = getPastDays(weeks * 7); // 例如 12 週 = 84 天

  // 計算每一天的完成率 (0 ~ 1)
  const completionMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const dateStr of past) {
      const completed = (habits || []).filter(h =>
        (h.completedDates || []).includes(dateStr)
      ).length;
      map[dateStr] = totalHabits === 0 ? 0 : completed / totalHabits;
    }
    return map;
  }, [habits, past, totalHabits]);

  // 根據完成率決定顏色深淺
  function getColor(rate: number, isToday: boolean): string {
    if (isToday) return 'border-2 border-teal-400 ';
    if (rate === 0) return 'bg-slate-800';
    if (rate < 0.25) return 'bg-teal-900';
    if (rate < 0.5) return 'bg-teal-700';
    if (rate < 0.75) return 'bg-teal-500';
    return 'bg-teal-400';
  }

  // 把 past 陣列依週分組（每 7 天一組）
  const weekGroups: string[][] = [];
  for (let i = 0; i < past.length; i += 7) {
    weekGroups.push(past.slice(i, i + 7));
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs text-slate-500 uppercase tracking-widest">活躍度紀錄（過去 {weeks} 週）</h2>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
          <span>無</span>
          <div className="w-3 h-3 rounded-sm bg-teal-900"></div>
          <div className="w-3 h-3 rounded-sm bg-teal-700"></div>
          <div className="w-3 h-3 rounded-sm bg-teal-500"></div>
          <div className="w-3 h-3 rounded-sm bg-teal-400"></div>
          <span>全勤</span>
        </div>
      </div>

      {/* Heatmap Grid: 每欄 = 一週，每格 = 一天 */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex gap-1 min-w-max">
          {weekGroups.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((dateStr) => {
                const rate = completionMap[dateStr] ?? 0;
                const isToday = dateStr === todayStr;
                const baseColor = rate === 0 ? 'bg-slate-800' : getColor(rate, false);
                return (
                  <div
                    key={dateStr}
                    title={`${formatFull(dateStr)}\n完成率：${Math.round(rate * 100)}%`}
                    className={`w-4 h-4 rounded-sm transition-all cursor-pointer hover:opacity-80
                      ${isToday
                        ? `bg-teal-600 ring-2 ring-teal-400 ring-offset-1 ring-offset-slate-950`
                        : baseColor
                      }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Week Labels (show only every 4 weeks) */}
      <div className="overflow-x-auto scrollbar-none mt-1">
        <div className="flex gap-1 min-w-max">
          {weekGroups.map((week, wi) => (
            <div key={wi} className="w-4 text-center">
              {wi % 4 === 0 && week[0] && (
                <span className="text-[9px] text-slate-600">{formatShort(week[0])}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
