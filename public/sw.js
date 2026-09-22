const CACHE_NAME = 'habit-tracker-v2';
const STATIC_URLS = [
  '/',
  '/pomodoro',
  '/stats',
  '/badges',
  '/settings',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── 安裝：把所有頁面先存進快取 ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS);
    }).catch(() => {
      // 某些 Next.js 動態路由無法預先快取，忽略錯誤繼續
    })
  );
  self.skipWaiting();
});

// ── 啟用：清除所有舊版快取 ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── 攔截請求：優先用網路，網路掛了就用快取 ────────────────────
self.addEventListener('fetch', (event) => {
  // 只處理 GET，略過 Chrome 擴充、外部 API
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Google Sheets Webhook → 一律走網路，不快取
  if (url.pathname.includes('/api/sheets') || url.host.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功：把最新版本存進快取（更新用）
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 網路失敗 → 回退到快取
        return caches.match(event.request).then((cached) => {
          return (
            cached ||
            new Response(
              JSON.stringify({ error: '離線中，無法載入此內容' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
              }
            )
          );
        });
      })
  );
});

// ── 點擊推播通知：開啟 App ────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('/');
      })
  );
});
