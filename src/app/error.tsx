'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('系統發生異常：', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-300">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-teal-400 mb-2">系統發生暫時性異常</h2>
      <p className="text-xs text-slate-400 max-w-xs mb-6">
        抱歉，程式載入時發生了一點小狀況。請點擊下方按鈕重新載入，或清理瀏覽器快取。
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
        >
          🔄 重新載入
        </button>
        <button
          onClick={() => {
            try {
              localStorage.clear();
              window.location.reload();
            } catch {
              window.location.reload();
            }
          }}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors border border-slate-700"
        >
          🧹 重置快取資料
        </button>
      </div>
    </div>
  );
}
