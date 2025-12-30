"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getDemoOwner,
  loadLocalDb,
  saveLocalDb,
  selectTitleAndCreateDraft,
} from "@/lib/localDb";

import type { LocalDB } from "@/lib/localDb";

export default function PlanBatchPage() {
  const params = useParams<{ batchId: string }>();
  const router = useRouter();
  const batchId = params.batchId;

  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [db, setDb] = useState<LocalDB | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setDb(loadLocalDb());
  }, [mounted, nonce]);

  if (!mounted || !db) return <main className="min-h-screen p-8" />;

  const owner = getDemoOwner(db);
  const batch = db.contentPlanBatches.find((b) => b.id === batchId && b.ownerId === owner.id);
  const titleIdeas = db.titleIdeas
    .filter((t) => t.batchId === batchId && t.ownerId === owner.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (!batch) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-bold">バッチが見つかりません</h1>
          <div className="mt-3">
            <Link href="/" className="text-sm underline">
              トップへ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">タイトル案（10件）</h1>
          <Link href="/" className="text-sm text-neutral-600 underline">
            戻る
          </Link>
        </div>

        <div className="text-sm text-neutral-600">batch: {new Date(batch.createdAt).toLocaleString()}</div>

        <ul className="flex flex-col gap-2">
          {titleIdeas.map((ti) => (
            <li key={ti.id} className="rounded border border-neutral-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{ti.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">status: {ti.status}</div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white"
                  onClick={() => {
                    const latest = loadLocalDb();
                    const owner2 = getDemoOwner(latest);
                    const b2 = latest.contentPlanBatches.find((b) => b.id === batchId);
                    if (!b2) return;

                    // Update title statuses.
                    latest.titleIdeas = latest.titleIdeas.map((x) => {
                      if (x.batchId !== batchId || x.ownerId !== owner2.id) return x;
                      if (x.id === ti.id) {
                        return { ...x, status: "SELECTED", updatedAt: new Date().toISOString() };
                      }
                      return { ...x, status: x.status === "SELECTED" ? "PROPOSED" : x.status };
                    });

                    const article = selectTitleAndCreateDraft({
                      ownerId: owner2.id,
                      batchId: b2.id,
                      claId: b2.claId,
                      titleIdeaId: ti.id,
                      title: ti.title,
                    });

                    latest.articles.unshift(article);
                    saveLocalDb(latest);
                    setNonce((n) => n + 1);
                    router.push(`/article/${article.id}`);
                  }}
                >
                  この記事を作る
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
