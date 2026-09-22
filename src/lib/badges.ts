// 成就徽章系統的定義與計算邏輯

import { Habit } from '@/store/useHabitStore';

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earnedAt?: string; // ISO 日期字串，有值代表已解鎖
}

// 計算某習慣的最長連勝天數
export function calcLongestStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort();
  let max = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return max;
}

// 計算全體習慣的「全勤天數」（所有習慣都完成的天數）
export function calcPerfectDays(habits: Habit[]): number {
  if (!habits || habits.length === 0) return 0;

  const allDates = new Set<string>();
  habits.forEach(h => (h.completedDates || []).forEach(d => allDates.add(d)));

  let count = 0;
  allDates.forEach(date => {
    const allCompleted = habits.every(h => (h.completedDates || []).includes(date));
    if (allCompleted) count++;
  });
  return count;
}

// 計算總打卡次數（所有習慣所有日期的總和）
export function calcTotalCheckIns(habits: Habit[]): number {
  return (habits || []).reduce((sum, h) => sum + (h.completedDates || []).length, 0);
}

// 定義所有可能解鎖的徽章
export const ALL_BADGES: Omit<Badge, 'earnedAt'>[] = [
  // 🌱 入門
  { id: 'first_checkin', emoji: '🌱', title: '種下第一顆種子', description: '完成第一次打卡' },
  { id: 'checkin_7', emoji: '🔥', title: '火焰七日', description: '累積 7 次打卡' },
  { id: 'checkin_30', emoji: '💎', title: '鑽石三十', description: '累積 30 次打卡' },
  { id: 'checkin_100', emoji: '🏆', title: '百打卡大師', description: '累積 100 次打卡' },
  // ⚡ 連勝
  { id: 'streak_3', emoji: '⚡', title: '三日閃電', description: '單一習慣連續打卡 3 天' },
  { id: 'streak_7', emoji: '🌊', title: '一週浪潮', description: '單一習慣連續打卡 7 天' },
  { id: 'streak_21', emoji: '🚀', title: '習慣養成', description: '單一習慣連續打卡 21 天' },
  { id: 'streak_66', emoji: '👑', title: '習慣之王', description: '單一習慣連續打卡 66 天（科學認定的習慣形成天數）' },
  // 🌟 全勤
  { id: 'perfect_1', emoji: '⭐', title: '完美一日', description: '所有習慣在同一天全數完成' },
  { id: 'perfect_7', emoji: '🌟', title: '完美一週', description: '累積 7 天全勤（全部習慣完成）' },
  { id: 'perfect_30', emoji: '🌠', title: '完美一月', description: '累積 30 天全勤' },
  // 🎯 多樣性
  { id: 'habits_3', emoji: '🎯', title: '三劍客', description: '同時管理 3 個習慣' },
  { id: 'habits_5', emoji: '🎪', title: '習慣馬戲團', description: '同時管理 5 個習慣' },
  // 🍅 番茄專注
  { id: 'pomo_1', emoji: '🍅', title: '初級專注者', description: '完成 1 個番茄鐘專注' },
  { id: 'pomo_10', emoji: '⏱️', title: '番茄達人', description: '累積完成 10 個番茄鐘專注' },
  { id: 'pomo_50', emoji: '🧘‍♂️', title: '專注大師', description: '累積完成 50 個番茄鐘專注' },
];

// 根據當前資料，計算哪些徽章應該被解鎖
export function computeEarnedBadgeIds(habits: Habit[], pomodoroSessions: number = 0): Set<string> {
  const earned = new Set<string>();
  const totalCheckIns = calcTotalCheckIns(habits);
  const perfectDays = calcPerfectDays(habits);
  const maxStreak = Math.max(0, ...(habits || []).map(h => calcLongestStreak(h.completedDates || [])));
  const habitCount = (habits || []).length;

  if (totalCheckIns >= 1) earned.add('first_checkin');
  if (totalCheckIns >= 7) earned.add('checkin_7');
  if (totalCheckIns >= 30) earned.add('checkin_30');
  if (totalCheckIns >= 100) earned.add('checkin_100');

  if (maxStreak >= 3) earned.add('streak_3');
  if (maxStreak >= 7) earned.add('streak_7');
  if (maxStreak >= 21) earned.add('streak_21');
  if (maxStreak >= 66) earned.add('streak_66');

  if (perfectDays >= 1) earned.add('perfect_1');
  if (perfectDays >= 7) earned.add('perfect_7');
  if (perfectDays >= 30) earned.add('perfect_30');

  if (habitCount >= 3) earned.add('habits_3');
  if (habitCount >= 5) earned.add('habits_5');

  if (pomodoroSessions >= 1) earned.add('pomo_1');
  if (pomodoroSessions >= 10) earned.add('pomo_10');
  if (pomodoroSessions >= 50) earned.add('pomo_50');

  return earned;
}
