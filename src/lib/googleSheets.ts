// Google Sheets 雙向同步服務

import { Habit } from '@/store/useHabitStore';

// 將資料發送到使用者的 Google Apps Script Web App 網址
export async function syncToGoogleSheets(apiUrl: string, habits: Habit[]): Promise<boolean> {
  if (!apiUrl || !apiUrl.startsWith('http')) return false;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS 跨網域避開 preflight OPTION 請求
      },
      body: JSON.stringify({
        action: 'save',
        habits,
        updatedAt: new Date().toISOString(),
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Google Sheets 同步失敗：', error);
    return false;
  }
}

// 從 Google Apps Script 拉取最新的 habits 資料
export async function fetchFromGoogleSheets(apiUrl: string): Promise<Habit[] | null> {
  if (!apiUrl || !apiUrl.startsWith('http')) return null;

  try {
    const response = await fetch(`${apiUrl}?action=load&t=${Date.now()}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (data.success && Array.isArray(data.habits)) {
      return data.habits as Habit[];
    }
    return null;
  } catch (error) {
    console.error('從 Google Sheets 拉取資料失敗：', error);
    return null;
  }
}
