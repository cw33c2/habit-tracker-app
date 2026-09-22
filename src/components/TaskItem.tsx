'use client';
import { Habit, useHabitStore } from '@/store/useHabitStore';
import { useState } from 'react';
import EditHabitForm from '@/components/EditHabitForm';

export default function TaskItem({ habit, date }: { habit: Habit, date: string }) {
  const toggleHabit = useHabitStore(state => state.toggleHabit);
  const isCompleted = habit.completedDates?.includes(date);
  const [isHiding, setIsHiding] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  if (isCompleted) {
    return null; 
  }

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 彈出筆記對話框（可選填），如果直接確認或按跳過即完成打卡
    setShowNoteModal(true);
  };

  const confirmComplete = (withNote: boolean) => {
    setShowNoteModal(false);
    setIsHiding(true);
    const text = withNote ? noteInput : undefined;
    setTimeout(() => {
      toggleHabit(habit.id, date, text);
      setNoteInput('');
    }, 400);
  };

  const isUrgent = habit.isUrgent;

  return (
    <>
      {showEditForm && (
        <EditHabitForm habit={habit} onClose={() => setShowEditForm(false)} />
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => confirmComplete(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-slate-100 font-bold text-sm">📝 寫下打卡筆記（選填）</h3>
              <button onClick={() => confirmComplete(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                跳過 ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">例如：今天運動做 50 下伏地挺身、讀書第 3 章...</p>
            <textarea
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              placeholder="記錄今天的感悟或數據..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500 mb-4 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => confirmComplete(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                直接打卡
              </button>
              <button
                onClick={() => confirmComplete(true)}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                帶筆記打卡 💾
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        onClick={() => setShowEditForm(true)}
        className={`transition-all duration-300 ease-out cursor-pointer group ${isHiding ? 'opacity-0 -translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'} 
          ${isUrgent ? 'glow-urgent bg-red-950/40 border-red-500/60' : 'glass-card hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-950/20'} 
          rounded-2xl p-4 flex items-start gap-4 mb-3 relative overflow-hidden`}
      >
        <div className={`${isUrgent ? 'text-red-400 text-lg' : 'text-teal-400 font-mono text-xs font-bold'} bg-slate-950/50 border border-slate-800 px-2.5 py-1 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
          {isUrgent ? '🔥' : habit.time || '--:--'}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-sm font-semibold truncate ${isUrgent ? 'text-slate-100 font-bold' : 'text-slate-200 group-hover:text-teal-300 transition-colors'}`}>
              {habit.title}
            </span>
            {isUrgent && (
              <span className="text-[9px] bg-red-900/80 text-red-200 border border-red-700/80 px-2 py-0.5 rounded-full font-bold">
                重要緊急
              </span>
            )}
            {!isUrgent && habit.type === 'permanent' && (
              <span className="text-[9px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">常駐</span>
            )}
            {!isUrgent && habit.type === 'countdown' && (
              <span className="text-[9px] bg-orange-950/80 text-orange-300 border border-orange-800 px-2 py-0.5 rounded-full font-bold">
                倒數 {habit.targetDays} 天
              </span>
            )}
            {!isUrgent && habit.type === 'one-time' && (
              <span className="text-[9px] bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
                一次性
              </span>
            )}
          </div>
          <div className={`text-[11px] flex items-center gap-2 ${isUrgent ? 'text-red-400/90 font-medium' : 'text-slate-500'}`}>
            <span>{isUrgent ? '⚠️ 優先完成！' : '點擊卡片編輯 ✏️'}</span>
            {(habit.notes || []).length > 0 && (
              <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-800">
                📝 {(habit.notes || []).length} 則筆記
              </span>
            )}
          </div>
        </div>

        {/* Complete Checkbox & Delete Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`確定要刪除「${habit.title}」嗎？`)) {
                useHabitStore.getState().removeHabit(habit.id);
              }
            }}
            title="刪除此習慣"
            className="w-8 h-8 rounded-xl border border-slate-800 hover:border-red-500/80 hover:bg-red-950/40 text-slate-500 hover:text-red-400 flex items-center justify-center transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <button 
            onClick={handleCheckClick}
            title="打卡並填寫筆記"
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all transform active:scale-90
              ${isUrgent ? 'border-red-500 bg-red-950/40 hover:bg-red-500 text-white' : 'border-teal-500/60 bg-teal-950/30 hover:border-teal-400 hover:bg-teal-500 text-teal-400 hover:text-slate-950'}`}
          >
            <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
