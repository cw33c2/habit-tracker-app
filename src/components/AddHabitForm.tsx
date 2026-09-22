'use client';
import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';

import { HABIT_PRESETS, HabitPreset } from '@/lib/presets';

interface AddHabitFormProps {
  onClose: () => void;
}

const habitTypeOptions = [
  { value: 'permanent', label: '常駐習慣', desc: '每天都要做', color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-800' },
  { value: 'countdown', label: '倒數挑戰', desc: '設定幾天後到期', color: 'text-orange-400', border: 'border-orange-800', bg: 'bg-orange-900/30' },
  { value: 'weekly', label: '期間限定', desc: '例如戒糖 7 天', color: 'text-blue-400', border: 'border-blue-800', bg: 'bg-blue-900/30' },
  { value: 'one-time', label: '一次性', desc: '做完就消失', color: 'text-purple-400', border: 'border-purple-800', bg: 'bg-purple-900/30' },
] as const;

export default function AddHabitForm({ onClose }: AddHabitFormProps) {
  const addHabit = useHabitStore((state) => state.addHabit);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'permanent' | 'countdown' | 'weekly' | 'one-time'>('permanent');
  const [time, setTime] = useState('');
  const [targetDays, setTargetDays] = useState('7');
  const [isUrgent, setIsUrgent] = useState(false);
  const [error, setError] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const applyPreset = (preset: HabitPreset) => {
    setTitle(preset.title);
    setType(preset.type);
    if (preset.time) setTime(preset.time);
    if (preset.targetDays) setTargetDays(preset.targetDays.toString());
    setShowPresets(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('請輸入習慣的標題！');
      return;
    }
    setError('');
    addHabit({
      title: title.trim(),
      type,
      time: time || undefined,
      isUrgent,
      targetDays: (type === 'countdown' || type === 'weekly') ? parseInt(targetDays) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Title */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-teal-400">&gt; 新增習慣</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 💡 一鍵熱門習慣範本按鈕 */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="w-full bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 text-teal-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              💡 一鍵套用熱門習慣範本
            </span>
            <span>{showPresets ? '▲ 隱藏範本' : '▼ 挑選範本'}</span>
          </button>

          {/* 範本抽屜 */}
          {showPresets && (
            <div className="mt-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3 animate-fadeIn max-h-60 overflow-y-auto">
              {Array.from(new Set(HABIT_PRESETS.map(p => p.categoryName))).map((catName) => {
                const categoryPresets = HABIT_PRESETS.filter(p => p.categoryName === catName);
                return (
                  <div key={catName}>
                    <div className="text-[10px] text-slate-500 font-bold mb-1.5">{catName}</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {categoryPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/80 rounded-lg p-2 text-xs text-slate-200 transition-all flex items-center justify-between group"
                        >
                          <span>{preset.title}</span>
                          <span className="text-[10px] text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            + 套用
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Habit Title */}
        <div className="mb-5">
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">習慣標題</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：喝 500ml 溫開水"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mt-2">⚠️ {error}</p>}
        </div>

        {/* Time Setting */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-slate-400 uppercase tracking-widest">提醒時間（選填）</label>
            {time && (
              <button
                type="button"
                onClick={() => setTime('')}
                className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
              >
                清除時間 ✕
              </button>
            )}
          </div>
          
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors mb-2 cursor-pointer"
          />

          {/* 快速時間標籤按鈕 */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { label: '🌅 07:00 早晨', value: '07:00' },
              { label: '☀️ 12:00 中午', value: '12:00' },
              { label: '☕ 15:00 下午', value: '15:00' },
              { label: '🌙 20:00 晚上', value: '20:00' },
              { label: '🛌 22:30 睡前', value: '22:30' },
            ].map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTime(t.value)}
                className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                  time === t.value
                    ? 'bg-teal-900/60 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Habit Type */}
        <div className="mb-5">
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">任務類型</label>
          <div className="grid grid-cols-2 gap-2">
            {habitTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={`text-left border rounded-xl px-3 py-2.5 transition-all ${
                  type === opt.value
                    ? `${opt.bg} ${opt.border} ${opt.color}`
                    : 'bg-slate-800/50 border-slate-700 text-slate-500'
                }`}
              >
                <div className="font-bold text-sm">{opt.label}</div>
                <div className="text-[10px] mt-0.5 opacity-75">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Target Days (for countdown / weekly) */}
        {(type === 'countdown' || type === 'weekly') && (
          <div className="mb-5">
            <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
              {type === 'countdown' ? '倒數天數' : '挑戰天數'}
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={targetDays}
              onChange={(e) => setTargetDays(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        )}

        {/* Urgent Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setIsUrgent(!isUrgent)}
            className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 transition-all ${
              isUrgent
                ? 'bg-red-950/40 border-red-500/50 text-red-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <div className="font-bold text-sm text-left">標示為「重要緊急」</div>
                <div className="text-[10px] opacity-75 text-left">將置頂並顯示警告呼吸燈</div>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full transition-colors ${isUrgent ? 'bg-red-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 ml-0.5 transition-transform ${isUrgent ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          ✅ 加入清單
        </button>
      </div>
    </div>
  );
}
