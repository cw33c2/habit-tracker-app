'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { syncToGoogleSheets, fetchFromGoogleSheets } from '@/lib/googleSheets';

export default function GoogleSheetsSyncModal({ onClose }: { onClose: () => void }) {
  const { sheetsApiUrl, setSheetsApiUrl, habits, importHabits } = useHabitStore();
  const [urlInput, setUrlInput] = useState(sheetsApiUrl || '');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(!sheetsApiUrl);

  const handleSaveUrl = () => {
    setSheetsApiUrl(urlInput.trim());
    setStatusMsg('✅ 已儲存 Google 試算表 Web API 網址！');
  };

  const handleSyncToSheets = async () => {
    if (!urlInput.trim()) {
      setStatusMsg('⚠️ 請先填入網址！');
      return;
    }
    setLoading(true);
    setStatusMsg('☁️ 正在上傳同步資料到 Google 試算表...');
    const success = await syncToGoogleSheets(urlInput.trim(), habits);
    setLoading(false);
    if (success) {
      setStatusMsg('🎉 同步成功！資料已寫入你的 Google 試算表。');
    } else {
      setStatusMsg('❌ 同步失敗，請確認網址或權限設定是否正確。');
    }
  };

  const handleFetchFromSheets = async () => {
    if (!urlInput.trim()) {
      setStatusMsg('⚠️ 請先填入網址！');
      return;
    }
    setLoading(true);
    setStatusMsg('📥 正在從 Google 試算表下載最新習慣資料...');
    const cloudHabits = await fetchFromGoogleSheets(urlInput.trim());
    setLoading(false);
    if (cloudHabits && Array.isArray(cloudHabits)) {
      importHabits(cloudHabits);
      setStatusMsg(`🎉 成功從雲端載入 ${cloudHabits.length} 個習慣！`);
    } else {
      setStatusMsg('❌ 載入失敗，雲端尚無資料或網址錯誤。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-lg font-bold text-teal-400">Google 試算表雲端同步</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          綁定你個人的 Google 試算表，電腦與手機打卡將自動雙向同步寫入試算表中！
        </p>

        {/* API URL Input */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 uppercase tracking-widest mb-2 block">
            Google Apps Script Web API 網址
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
            />
            <button
              onClick={handleSaveUrl}
              className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-700 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              儲存
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="mb-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200">
            {statusMsg}
          </div>
        )}

        {/* Sync Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleSyncToSheets}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>☁️ 上傳至雲端</span>
          </button>
          <button
            onClick={handleFetchFromSheets}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 border border-teal-800/60 disabled:opacity-50 text-teal-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>📥 從雲端下載</span>
          </button>
        </div>

        {/* Instructions Collapsible */}
        <div className="border-t border-slate-800 pt-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex justify-between items-center text-xs text-slate-400 hover:text-teal-400 font-bold transition-colors"
          >
            <span>📖 如何建立我的 Google 試算表同步網址？</span>
            <span>{showInstructions ? '▲' : '▼'}</span>
          </button>

          {showInstructions && (
            <div className="mt-3 space-y-3 text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans leading-relaxed">
              <p className="font-bold text-slate-200">只需要 4 個步驟（免費且完全屬於你）：</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>打開 <span className="text-teal-400 font-bold">Google 雲端硬碟</span> ➔ 新增一份空白的「Google 試算表」。</li>
                <li>點擊選單 **擴充功能 ➔ Apps Script**。</li>
                <li>把原本的內容清空，貼上下方我為你寫好的程式碼，然後按 **儲存 💾**。</li>
                <li>點右上 **部署 ➔ 新增部署 ➔ 種類選「Web 應用程式」**：
                  <ul className="list-disc list-inside ml-4 text-[11px] text-slate-400 mt-1">
                    <li>誰可以存取：選 **「任何人 (Anyone)」**</li>
                    <li>點擊「部署」並複製產生的 **Web 應用程式網址** 貼到上方即完成！</li>
                  </ul>
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
