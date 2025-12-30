"use client";

import { useEffect, useState } from "react";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import "@aws-amplify/ui-react/styles.css";

import outputs from "../../amplify_outputs.json";
import type { Schema } from "../../amplify/data/resource";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function HomePage() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => sub.unsubscribe();
  }, []);

  async function createTodo(): Promise<void> {
    const content = window.prompt("Todo content");
    if (!content) return;
    await client.models.Todo.create({ content });
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
          {todos.map((t) => (
            <li key={t.id} className="rounded border border-neutral-200 bg-white p-3">
              {t.content}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
