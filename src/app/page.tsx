"use client";

import { useState } from "react";

export default function HomePage() {
  const [todos, setTodos] = useState<string[]>([]);

  async function createTodo(): Promise<void> {
    const content = window.prompt("Todo content");
    if (!content) return;
    setTodos((prev) => [content, ...prev]);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">My todos</h1>
        <button
          type="button"
          className="w-fit rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          onClick={createTodo}
        >
          + new
        </button>
        <ul className="flex flex-col gap-2">
          {todos.map((t, idx) => (
            <li key={`${idx}:${t}`} className="rounded border border-neutral-200 bg-white p-3">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
