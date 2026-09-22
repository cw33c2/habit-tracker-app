// 🎨 4 大高質感主題切換 Modal / 彈窗元件
'use client';

import { useHabitStore, ThemeMode } from '@/store/useHabitStore';
import { useEffect, useState } from 'react';

const themeOptions: { id: ThemeMode; name: string; icon: string; bg: string; border: string; accent: string }[] = [
  { id: 'dark', name: '極夜黑客', icon: '🟢', bg: 'bg-slate-950', border: 'border-teal-500', accent: 'text-teal-400' },
  { id: 'violet', name: '紫羅蘭微光', icon: '🟣', bg: 'bg-purple-950', border: 'border-purple-500', accent: 'text-purple-400' },
  { id: 'cyber', name: '賽博霓虹', icon: '💗', bg: 'bg-pink-950', border: 'border-pink-500', accent: 'text-pink-400' },
  { id: 'light', name: '日系簡約', icon: '⚪', bg: 'bg-slate-100', border: 'border-slate-400', accent: 'text-slate-800' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useHabitStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = themeOptions.find((t) => t.id === theme) || themeOptions[0];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="更換視覺主題"
        className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:border-teal-500/50 transition-all flex items-center justify-center flex-shrink-0"
      >
        <span className="text-base">{currentTheme.icon}</span>
      </button>

      {/* 主題選擇選單 Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <span>🎨</span> 選擇視覺主題
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                關閉 ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 ${
                    theme === opt.id
                      ? 'bg-slate-800 border-teal-500 ring-2 ring-teal-500/30 shadow-lg'
                      : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{opt.icon}</span>
                    {theme === opt.id && <span className="text-xs text-teal-400 font-bold">✓ 使用中</span>}
                  </div>
                  <div className={`text-xs font-bold ${opt.accent}`}>{opt.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
