import { Habit } from '@/store/useHabitStore';

// 匯出 JSON 備份檔
export function exportToJSON(habits: Habit[]) {
  const dataStr = JSON.stringify(habits, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit-tracker-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 匯出 CSV 試算表 (支援 Excel 打開不亂碼 BOM)
export function exportToCSV(habits: Habit[]) {
  const headers = ['習慣 ID', '標題', '類型', '重要緊急', '提醒時間', '目標天數', '建立時間', '完成打卡日期列表'];
  
  const rows = habits.map(h => [
    `"${h.id}"`,
    `"${h.title.replace(/"/g, '""')}"`,
    `"${h.type}"`,
    `"${h.isUrgent ? '是' : '否'}"`,
    `"${h.time || ''}"`,
    `"${h.targetDays || ''}"`,
    `"${h.createdAt}"`,
    `"${(h.completedDates || []).join('; ')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit-tracker-export-${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 讀取匯入的 JSON 檔案內容
export function parseJSONBackup(file: File): Promise<Habit[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          resolve(parsed as Habit[]);
        } else {
          reject(new Error('格式錯誤：JSON 必須為習慣陣列'));
        }
      } catch (err) {
        reject(new Error('無法解析 JSON 檔案'));
      }
    };
    reader.onerror = () => reject(new Error('讀取檔案失敗'));
    reader.readAsText(file);
  });
}
