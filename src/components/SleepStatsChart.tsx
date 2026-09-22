// 📊 睡眠統計趨勢圖 (曲線/折線圖 + 睡眠時數長條圖)
'use client';

import { useHabitStore } from '@/store/useHabitStore';
import { useState } from 'react';

function getPastDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

// HH:mm 轉小時浮點數 (如 "23:30" -> 23.5)
function timeToFloat(timeStr?: string): number | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

export default function SleepStatsChart() {
  const sleepLogs = useHabitStore((s) => s.sleepLogs) || [];
  const [daysCount, setDaysCount] = useState<7 | 14>(7);

  const days = getPastDays(daysCount);
  const data = days.map((date) => {
    const log = sleepLogs.find((l) => l.date === date);
    const sleepVal = timeToFloat(log?.sleepTime);
    const wakeVal = timeToFloat(log?.wakeTime);
    const duration = log?.durationHours || 0;

    return {
      date,
      displayDate: `${new Date(date + 'T00:00:00').getMonth() + 1}/${new Date(date + 'T00:00:00').getDate()}`,
      sleepTime: log?.sleepTime || null,
      wakeTime: log?.wakeTime || null,
      sleepVal,
      wakeVal,
      duration,
    };
  });

  const validDurations = data.map((d) => d.duration).filter((d) => d > 0);
  const avgDuration = validDurations.length > 0
    ? (validDurations.reduce((a, b) => a + b, 0) / validDurations.length).toFixed(1)
    : '0';

  // 圖表高度設定 (240px)
  const chartHeight = 180;
  const maxHours = 12; // 睡眠時數上限對應圖表 100%

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 mb-6 shadow-xl">
      {/* 標題與切換天數 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
            <span>📈</span> 睡眠數據統計線圖
          </h2>
          <p className="text-[10px] text-slate-400">觀察起居時間律動與睡眠品質時數</p>
        </div>
        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setDaysCount(7)}
            className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${
              daysCount === 7 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            近 7 天
          </button>
          <button
            onClick={() => setDaysCount(14)}
            className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${
              daysCount === 14 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            近 14 天
          </button>
        </div>
      </div>

      {/* 平均睡眠數據卡片 */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-5 text-center">
        <div>
          <div className="text-[10px] text-slate-500">平均睡眠時數</div>
          <div className="text-sm font-bold text-teal-400 mt-0.5">{avgDuration} 小時</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">目標睡眠</div>
          <div className="text-sm font-bold text-indigo-400 mt-0.5">8.0 小時</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">紀錄天數</div>
          <div className="text-sm font-bold text-amber-400 mt-0.5">{validDurations.length} / {daysCount} 天</div>
        </div>
      </div>

      {/* 1. 睡眠時數柱狀統計圖 */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
          <span>📊 每日睡眠長度（小時）</span>
          <span className="text-[10px] font-normal text-slate-500">建議 7~9 小時</span>
        </div>

        <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1 px-2 bg-slate-950/40 rounded-xl border border-slate-800">
          {data.map((d, i) => {
            const heightPercent = Math.min(100, (d.duration / maxHours) * 100);
            const isOptimal = d.duration >= 7 && d.duration <= 9;

            return (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* 浮動提示 */}
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-[9px] text-slate-200 border border-slate-700 px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                  {d.duration > 0 ? `${d.duration}h` : '無紀錄'}
                </div>

                {/* 數據標籤 */}
                {d.duration > 0 && (
                  <span className="text-[9px] font-mono text-slate-400 mb-1">{d.duration}h</span>
                )}

                {/* 長條柱 */}
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    d.duration === 0
                      ? 'bg-slate-800/40 h-1'
                      : isOptimal
                      ? 'bg-gradient-to-t from-teal-600 to-emerald-400 shadow-sm shadow-teal-500/20'
                      : 'bg-gradient-to-t from-indigo-700 to-indigo-400'
                  }`}
                  style={{ height: `${d.duration === 0 ? 4 : heightPercent}%` }}
                />

                {/* X 軸日期 */}
                <span className="text-[9px] text-slate-500 mt-1">{d.displayDate}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 起居時間動態節律線圖 (入睡 🌙 / 起床 ☀️ 時間趨勢) */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
          <span>📉 起居時間時間軸趨勢</span>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> 入睡
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 起床
            </span>
          </div>
        </div>

        <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
          {data.map((d, i) => (
            <div key={i} className="flex items-center text-[10px] gap-2">
              <span className="w-8 text-slate-500 text-right">{d.displayDate}</span>

              <div className="flex-1 h-5 bg-slate-900 rounded-md relative flex items-center px-2 overflow-hidden border border-slate-800/80">
                {d.sleepTime || d.wakeTime ? (
                  <div className="w-full flex justify-between items-center font-mono">
                    <span className="text-indigo-400">🌙 {d.sleepTime || '--:--'}</span>
                    <span className="text-amber-400">☀️ {d.wakeTime || '--:--'}</span>
                  </div>
                ) : (
                  <span className="text-slate-600 text-[9px]">尚無登錄資料</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
