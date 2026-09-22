export interface HabitPreset {
  id: string;
  title: string;
  category: 'health' | 'mind' | 'growth' | 'life' | 'work' | 'finance';
  categoryName: string;
  time?: string;
  type: 'permanent' | 'countdown' | 'weekly' | 'one-time';
  targetDays?: number;
  emoji: string;
}

export const HABIT_PRESETS: HabitPreset[] = [
  // ⚡ 高效工作
  { id: 'w1', title: '深度專注工作 60 分鐘 ⚡', category: 'work', categoryName: '⚡ 高效工作', time: '09:30', type: 'permanent', emoji: '⚡' },
  { id: 'w2', title: '完成今日 Top 3 優先任務 🎯', category: 'work', categoryName: '⚡ 高效工作', time: '10:00', type: 'permanent', emoji: '🎯' },
  { id: 'w3', title: '清空 Email / 訊息信箱 📩', category: 'work', categoryName: '⚡ 高效工作', time: '17:00', type: 'permanent', emoji: '📩' },
  { id: 'w4', title: '工作區 / 檔案整理 5 分鐘 📂', category: 'work', categoryName: '⚡ 高效工作', time: '17:30', type: 'permanent', emoji: '📂' },

  // 💪 健康運動
  { id: 'h1', title: '每日喝水 2000cc 💧', category: 'health', categoryName: '💪 健康運動', time: '09:00', type: 'permanent', emoji: '💧' },
  { id: 'h2', title: '散步 / 運動 30 分鐘 🏃', category: 'health', categoryName: '💪 健康運動', time: '17:30', type: 'permanent', emoji: '🏃' },
  { id: 'h3', title: '吃綜合維他命 / 藥物 💊', category: 'health', categoryName: '💪 健康運動', time: '08:30', type: 'permanent', emoji: '💊' },
  { id: 'h4', title: '睡前拉筋伸展 10 分鐘 🧘', category: 'health', categoryName: '💪 健康運動', time: '22:00', type: 'permanent', emoji: '🧘' },
  
  // 🧠 心靈舒壓
  { id: 'm1', title: '冥想 / 深呼吸 5 分鐘 🧘‍♂️', category: 'mind', categoryName: '🧠 心靈舒壓', time: '07:30', type: 'permanent', emoji: '🧘‍♂️' },
  { id: 'm2', title: '撰寫 3 件感謝事項 ✍️', category: 'mind', categoryName: '🧠 心靈舒壓', time: '21:30', type: 'permanent', emoji: '✍️' },
  { id: 'm3', title: '曬太陽 10 分鐘 ☀️', category: 'mind', categoryName: '🧠 心靈舒壓', time: '10:00', type: 'permanent', emoji: '☀️' },

  // 📖 學習成長
  { id: 'g1', title: '閱讀書籍 15 分鐘 📖', category: 'growth', categoryName: '📖 學習成長', time: '21:00', type: 'permanent', emoji: '📖' },
  { id: 'g2', title: '學習外語單字 10 個 🔤', category: 'growth', categoryName: '📖 學習成長', time: '12:30', type: 'permanent', emoji: '🔤' },
  { id: 'g3', title: '規劃明日待辦事項 📝', category: 'growth', categoryName: '📖 學習成長', time: '22:00', type: 'permanent', emoji: '📝' },

  // 🏡 生活習慣
  { id: 'l1', title: '隨手整理桌面 5 分鐘 🧹', category: 'life', categoryName: '🏡 生活習慣', time: '20:30', type: 'permanent', emoji: '🧹' },
  { id: 'l2', title: '睡前 30 分鐘不看手機 📱', category: 'life', categoryName: '🏡 生活習慣', time: '22:30', type: 'permanent', emoji: '📱' },
  { id: 'l3', title: '連續 7 天戒含糖飲料 🚫', category: 'life', categoryName: '🏡 生活習慣', time: '12:00', type: 'weekly', targetDays: 7, emoji: '🚫' },
];
