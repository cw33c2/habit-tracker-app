// 🔔 Web Notification / PWA 提醒通知系統

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    alert('你的瀏覽器暫不支援通知功能。');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  alert('通知權限已被拒絕。請在瀏覽器設定中開啟通知權限！');
  return false;
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          icon: '/icon.svg',
          badge: '/icon.svg',
          data: { url: '/' },
          ...options,
        } as NotificationOptions);
      });
    } else {
      new Notification(title, {
        icon: '/icon.svg',
        ...options,
      });
    }
  }
}
