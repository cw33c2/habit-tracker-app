"use client";

import { useHabitStore } from "@/store/useHabitStore";

export default function Home() {
  const { habits, pet, toggleHabit } = useHabitStore();

  return (
    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 antialiased p-5 flex justify-center items-center min-h-screen font-mono font-bold">
      {/* Mobile Phone Container Simulator */}
      <div className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-4 border-zinc-900 dark:border-zinc-500 shadow-[4px_4px_0px_#18181b] dark:shadow-[4px_4px_0px_#a1a1aa] rounded-none p-6 w-[360px] flex flex-col gap-6">
        {/* Header */}
        <div className="text-center border-b-4 border-dashed border-zinc-900 dark:border-zinc-500 pb-4">
          <h1 className="text-2xl tracking-widest uppercase">Habit-chi</h1>
          <p className="text-zinc-500 text-xs mt-1">
            LV.{pet.level} - 🥚 初生之卵 (EXP: {pet.exp})
          </p>
        </div>

        {/* Pet Display Area */}
        <div className="flex justify-center items-center h-48 bg-zinc-200 dark:bg-zinc-700 border-4 border-zinc-900 dark:border-zinc-500 relative">
          {/* Pixel Art Egg (SVG) */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            className="text-zinc-900 dark:text-zinc-100"
          >
            {/* Egg Outline */}
            <rect x="6" y="2" width="4" height="1" fill="currentColor" />
            <rect x="4" y="3" width="2" height="1" fill="currentColor" />
            <rect x="10" y="3" width="2" height="1" fill="currentColor" />
            <rect x="3" y="4" width="1" height="2" fill="currentColor" />
            <rect x="12" y="4" width="1" height="2" fill="currentColor" />
            <rect x="2" y="6" width="1" height="6" fill="currentColor" />
            <rect x="13" y="6" width="1" height="6" fill="currentColor" />
            <rect x="3" y="12" width="2" height="1" fill="currentColor" />
            <rect x="11" y="12" width="2" height="1" fill="currentColor" />
            <rect x="5" y="13" width="6" height="1" fill="currentColor" />
            {/* Egg Inner filling */}
            <rect x="6" y="3" width="4" height="10" fill="white" />
            <rect x="4" y="4" width="2" height="8" fill="white" />
            <rect x="10" y="4" width="2" height="8" fill="white" />
            <rect x="3" y="6" width="1" height="6" fill="white" />
            <rect x="12" y="6" width="1" height="6" fill="white" />
            <rect x="5" y="12" width="6" height="1" fill="white" />
            {/* Eyes */}
            <rect x="6" y="7" width="1" height="1" fill="black" />
            <rect x="9" y="7" width="1" height="1" fill="black" />
          </svg>
        </div>

        {/* Coach Prompt */}
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 p-3 border-4 border-zinc-900 dark:border-zinc-500 text-sm relative shadow-[4px_4px_0px_#18181b] dark:shadow-[4px_4px_0px_#a1a1aa]">
          <div className="absolute -top-3 left-4 w-4 h-4 bg-blue-100 dark:bg-blue-900 border-t-4 border-l-4 border-zinc-900 dark:border-zinc-500 transform rotate-45"></div>
          <p>{pet.mood}</p>
        </div>

        {/* Micro-Habits Checklist */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg border-b-4 border-solid border-zinc-900 dark:border-zinc-500 pb-2 mb-2">
            DAILY QUESTS
          </h2>

          {habits.map((habit) => (
            <label
              key={habit.id}
              className="flex items-center gap-3 p-2 bg-zinc-100 dark:bg-zinc-800 border-4 border-zinc-900 dark:border-zinc-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            >
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() => toggleHabit(habit.id)}
                className="w-5 h-5 accent-zinc-900 rounded-none cursor-pointer"
              />
              <span
                className={`text-sm ${habit.completed ? "line-through text-zinc-400" : ""}`}
              >
                {habit.title}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
