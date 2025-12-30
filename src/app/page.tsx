"use client";

import { useEffect, useState } from "react";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import "@aws-amplify/ui-react/styles.css";

import outputs from "../../amplify_outputs.json";
import type { Schema } from "../../amplify/data/resource";

const hasUsableOutputs =
  typeof outputs === "object" &&
  outputs !== null &&
  Object.keys(outputs as Record<string, unknown>).length > 1;

if (hasUsableOutputs) {
  Amplify.configure(outputs);
}

const client = hasUsableOutputs ? generateClient<Schema>() : null;

export default function HomePage() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;

    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
      error: (err) => setError(err instanceof Error ? err.message : String(err)),
    });

    return () => sub.unsubscribe();
  }, []);

  async function createTodo(): Promise<void> {
    if (!client) return;
    const content = window.prompt("Todo content");
    if (!content) return;
    await client.models.Todo.create({ content });
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">My todos</h1>

        {!hasUsableOutputs && (
          <div className="rounded border border-neutral-200 bg-white p-3 text-sm">
            <p className="font-medium">Backend 未接続</p>
            <p className="mt-1 text-neutral-700">
              現在の amplify_outputs.json がプレースホルダのため、Amplify Data に接続できません。
              Vercel で利用する場合は、環境変数 <span className="font-mono">AMPLIFY_APP_ID</span>（必要なら <span className="font-mono">AMPLIFY_BRANCH</span>）と、
              AWS 認証情報を設定してビルド時に outputs を生成してください。
            </p>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-white p-3 text-sm">
            <p className="font-medium text-red-700">Error</p>
            <p className="mt-1 break-words text-red-700">{error}</p>
          </div>
        )}

        <button
          type="button"
          className="w-fit rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          onClick={createTodo}
          disabled={!client}
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
