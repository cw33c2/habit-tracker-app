'use client';
import { useState } from 'react';
import { Habit, useHabitStore } from '@/store/useHabitStore';

interface EditHabitFormProps {
  habit: Habit;
  onClose: () => void;
}

const habitTypeOptions = [
  { value: 'permanent', label: '常駐習慣', desc: '每天都要做', color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-800' },
  { value: 'countdown', label: '倒數挑戰', desc: '設定幾天後到期', color: 'text-orange-400', border: 'border-orange-800', bg: 'bg-orange-900/30' },
  { value: 'weekly', label: '期間限定', desc: '例如戒糖 7 天', color: 'text-blue-400', border: 'border-blue-800', bg: 'bg-blue-900/30' },
  { value: 'one-time', label: '一次性', desc: '做完就消失', color: 'text-purple-400', border: 'border-purple-800', bg: 'bg-purple-900/30' },
] as const;

export default function EditHabitForm({ habit, onClose }: EditHabitFormProps) {
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);

  const [title, setTitle] = useState(habit.title);
  const [type, setType] = useState<'permanent' | 'countdown' | 'weekly' | 'one-time'>(habit.type);
  const [time, setTime] = useState(habit.time || '');
  const [targetDays, setTargetDays] = useState(String(habit.targetDays || 7));
  const [isUrgent, setIsUrgent] = useState(habit.isUrgent);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('請輸入習慣的標題！');
      return;
    }
    setError('');
    updateHabit(habit.id, {
      title: title.trim(),
      type,
      time: time || undefined,
      isUrgent,
      targetDays: (type === 'countdown' || type === 'weekly') ? parseInt(targetDays) : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    removeHabit(habit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Title */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-teal-400">&gt; 編輯習慣</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Delete Confirmation View */}
        {showDeleteConfirm ? (
          <div className="py-4 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-slate-100 font-bold text-base mb-2">確定要刪除「{habit.title}」？</h3>
            <p className="text-slate-400 text-xs mb-6">刪除後所有過去的打卡紀錄將無法復原。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-colors"
              >
                確定刪除
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Habit Title */}
            <div className="mb-5">
              <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">習慣標題</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：喝 500ml 溫開水"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
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

            {/* Target Days */}
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

            {/* Notes History List */}
            {(habit.notes || []).length > 0 && (
              <div className="mb-6">
                <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                  <span>📝 歷史打卡筆記 ({habit.notes.length} 則)</span>
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {habit.notes.map((n) => (
                    <div
                      key={n.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-start gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-teal-400 font-bold mb-1">
                          📅 {n.createdAt.split('T')[0]} {n.createdAt.split('T')[1]?.slice(0, 5)}
                        </div>
                        <div className="text-xs text-slate-200 whitespace-pre-wrap break-words">
                          {n.note}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('確定要刪除這則筆記嗎？')) {
                            useHabitStore.getState().deleteNote(n.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 text-xs transition-colors flex-shrink-0"
                        title="刪除筆記"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
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

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-950/50 hover:bg-red-900/60 border border-red-800/50 text-red-400 font-bold px-4 py-3 rounded-xl transition-colors"
              >
                🗑️ 刪除
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                💾 儲存修改
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
