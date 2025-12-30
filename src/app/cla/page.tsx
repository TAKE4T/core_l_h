"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { LocalDB } from "@/lib/localDb";
import { createClaAndBatch, getDemoOwner, loadLocalDb, saveLocalDb } from "@/lib/localDb";

export default function ClaPage() {
  const router = useRouter();
  const [claText, setClaText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [db, setDb] = useState<LocalDB | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setDb(loadLocalDb());
  }, [mounted]);

  const owner = db ? getDemoOwner(db) : null;

  if (!mounted || !db || !owner) {
    return <main className="min-h-screen p-8" />;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CLA（コアランゲージ）作成</h1>
          <Link href="/" className="text-sm text-neutral-600 underline">
            戻る
          </Link>
        </div>

        <p className="text-sm text-neutral-600">
          SSOT: CLA作成後にタイトル案を10件生成します。
        </p>

        <textarea
          className="min-h-48 w-full rounded border border-neutral-300 p-3 text-sm"
          placeholder="例：私は◯◯のために、△△を□□という考え方で実現する……"
          value={claText}
          onChange={(e) => setClaText(e.target.value)}
        />

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setError(null);
              const text = claText.trim();
              if (text.length < 10) {
                setError("CLAはもう少し詳しく（10文字以上）書いてください");
                return;
              }

              const latest = loadLocalDb();
              const { cla, batch, titleIdeas } = createClaAndBatch({
                ownerId: owner.id,
                claText: text,
              });

              latest.clas.unshift(cla);
              latest.contentPlanBatches.unshift(batch);
              latest.titleIdeas.unshift(...titleIdeas);
              saveLocalDb(latest);

              router.push(`/plan/${batch.id}`);
            }}
          >
            保存してタイトル案を生成
          </button>

          <Link
            href="/"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium"
          >
            キャンセル
          </Link>
        </div>
      </div>
    </main>
  );
}
