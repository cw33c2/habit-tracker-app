'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── 偵測是否已安裝（App 模式）────────────────────────
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ?? false;
    const navStandalone = (navigator as { standalone?: boolean }).standalone;
    const isAppMode = Boolean(standalone || navStandalone);
    setIsStandalone(isAppMode);

    // ── 先註冊 Service Worker（所有裝置都要做）───────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // 開發環境 http 無法啟用 SW，靜默忽略
      });
    }

    // 已安裝就不顯示 banner
    if (isAppMode) return;

    // 已拒絕過就不再顯示
    try {
      if (localStorage.getItem('pwa-banner-dismissed')) return;
    } catch {
      // 隱私模式可能無法存取 localStorage
    }

    // ── iOS：顯示手動引導 ────────────────────────────────
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);
    if (ios) {
      setTimeout(() => setShowBanner(true), 2500);
      return;
    }

    // ── Android / Desktop：監聽安裝事件 ──────────────────
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2500);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } catch {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('pwa-banner-dismissed', '1');
    } catch {}
  };

  if (!showBanner || isStandalone) return null;

  return (
    /* 懸浮於 Floating Nav 上方，不會被擋住 */
    <div className="fixed bottom-32 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className="glass-card rounded-2xl p-4 shadow-2xl border border-teal-500/40"
        style={{ boxShadow: '0 0 24px rgba(20,184,166,0.25)' }}
      >
        <div className="flex items-start gap-3">
          {/* App 圖示 */}
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-teal-600/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="App圖示" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <h3 className="text-slate-100 font-bold text-sm">
              📲 加入手機主畫面
            </h3>
            {isIOS ? (
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                點底部的{' '}
                <span className="text-teal-400 font-bold">「分享 □↑」</span>
                {' '}按鈕，再選{' '}
                <span className="text-teal-400 font-bold">「加入主畫面」</span>
                {' '}即可離線使用！
              </p>
            ) : (
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                安裝後可以{' '}
                <span className="text-teal-400 font-bold">離線使用</span>
                ，就像原生 App 一樣！
              </p>
            )}
          </div>

          {/* 關閉按鈕 */}
          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 p-1"
            aria-label="關閉"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Android 安裝按鈕 */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95"
          >
            ✅ 一鍵安裝到手機桌面
          </button>
        )}

        {/* iOS 步驟圖示 */}
        {isIOS && (
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500">
            <span>① 點底部分享</span>
            <span className="text-teal-600">→</span>
            <span>② 加入主畫面</span>
            <span className="text-teal-600">→</span>
            <span>③ 完成！</span>
          </div>
        )}
      </div>
    </div>
  );
}
