import { create } from "zustand";

export type Habit = {
  id: string;
  title: string;
  completed: boolean;
};

export type PetState = {
  level: number;
  exp: number;
  mood: string;
};

type HabitStore = {
  habits: Habit[];
  pet: PetState;
  addHabit: (title: string) => void;
  toggleHabit: (id: string) => Promise<void>;
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [
    { id: "1", title: "💧 喝 500cc 的水", completed: false },
    { id: "2", title: "💪 做 10 個伏地挺身", completed: false },
    { id: "3", title: "📖 讀 5 頁英文", completed: true },
  ],
  pet: {
    level: 1,
    exp: 0,
    mood: "主人... 我覺得好餓... 今天還沒有運動呢 😢",
  },
  addHabit: (title) =>
    set((state) => ({
      habits: [
        ...state.habits,
        { id: Date.now().toString(), title, completed: false },
      ],
    })),
  toggleHabit: async (id) => {
    // 1. 先更新前端畫面（樂觀更新）
    const state = get();
    const newHabits = state.habits.map((h) =>
      h.id === id ? { ...h, completed: !h.completed } : h,
    );

    const completedCount = newHabits.filter((h) => h.completed).length;
    const newExp = completedCount * 10;

    set({
      habits: newHabits,
      pet: { ...state.pet, exp: newExp, mood: "（小雞正在思考...💭）" },
    });

    // 2. 呼叫後端大廚索取專屬對話
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habits: newHabits,
          petLevel: state.pet.level,
          petExp: newExp,
        }),
      });
      const data = await res.json();

      set((currentState) => ({
        pet: { ...currentState.pet, mood: data.message || "啾啾！" },
      }));
    } catch (error) {
      set((currentState) => ({
        pet: { ...currentState.pet, mood: "連線中斷了... 網路好像怪怪的 😢" },
      }));
    }
  },
}));
