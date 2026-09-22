// 🔄 自動雙向同步 Hook（穩固版）
// 使用 Zustand subscribe 訂閱 → 不干擾 React 渲染週期，手機不會凍結
'use client';

import { useEffect, useRef, useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { fetchFromGoogleSheets, syncToGoogleSheets } from '@/lib/googleSheets';
import type { Habit } from '@/store/useHabitStore';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// 合併本機與雲端習慣（取聯集，兩邊資料都保留）
function mergeHabits(local: Habit[], remote: Habit[]): Habit[] {
  const map = new Map<string, Habit>();
  for (const h of local) map.set(h.id, h);

  for (const remoteH of remote) {
    const localH = map.get(remoteH.id);
    if (!localH) {
      map.set(remoteH.id, remoteH);
    } else {
      const mergedDates = [
        ...new Set([
          ...(localH.completedDates ?? []),
          ...(remoteH.completedDates ?? []),
        ]),
      ].sort();

      const noteMap = new Map<string, Habit['notes'][number]>();
      for (const n of [...(localH.notes ?? []), ...(remoteH.notes ?? [])]) {
        noteMap.set(n.id, n);
      }

      map.set(localH.id, {
        ...remoteH,
        ...localH,
        completedDates: mergedDates,
        notes: [...noteMap.values()].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        ),
      });
    }
  }
  return [...map.values()];
}

// 帶超時保護的 fetch，避免手機在弱網路下永遠卡住
async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  ms = 8000
): Promise<T | null> {
  try {
    return await Promise.race([
      fn(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      ),
    ]);
  } catch {
    return null;
  }
}

export function useAutoSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPulledOnMount = useRef(false);

  // ① App 啟動時：從 Google 試算表拉資料，與本機合併（一次性）
  useEffect(() => {
    if (hasPulledOnMount.current) return;
    const sheetsApiUrl = useHabitStore.getState().sheetsApiUrl;
    if (!sheetsApiUrl) return;

    hasPulledOnMount.current = true;
    let cancelled = false;

    (async () => {
      setSyncStatus('syncing');
      // 用 fetchWithTimeout 避免手機弱網路凍結 UI
      const remoteHabits = await fetchWithTimeout(
        () => fetchFromGoogleSheets(sheetsApiUrl),
        8000
      );

      if (cancelled) return;

      if (remoteHabits && remoteHabits.length > 0) {
        const localHabits = useHabitStore.getState().habits ?? [];
        const merged = mergeHabits(localHabits, remoteHabits);
        const changed = JSON.stringify(merged) !== JSON.stringify(localHabits);
        if (changed) {
          // 直接操作 store，不觸發 React re-render 訂閱迴圈
          useHabitStore.getState().importHabits(merged);
        }
      }

      if (!cancelled) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isFirstChange = true;
    let prevHabits = useHabitStore.getState().habits;

    const unsubscribe = useHabitStore.subscribe((state) => {
      const habits = state.habits;
      if (habits === prevHabits) return;
      prevHabits = habits;

      if (isFirstChange) {
        isFirstChange = false;
        return;
      }
      const url = state.sheetsApiUrl;
      if (!url || !habits || habits.length === 0) return;

      // 防抖：2 秒後上傳
      if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current);
      uploadTimerRef.current = setTimeout(async () => {
        setSyncStatus('syncing');
        const ok = await fetchWithTimeout(
          () => syncToGoogleSheets(url, habits),
          10000
        );
        setSyncStatus(ok ? 'success' : 'error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }, 2000);
    });

    return () => {
      unsubscribe();
      if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current);
    };
  }, []);

  return { syncStatus };
}
