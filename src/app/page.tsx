"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getDemoOwner, loadLocalDb, resetLocalDb, saveLocalDb } from "@/lib/localDb";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const db = useMemo(() => {
    if (!mounted) return null;
    const loaded = loadLocalDb();
    // Ensure it is persisted at least once.
    saveLocalDb(loaded);
    return loaded;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, nonce]);

  if (!mounted || !db) {
    return <main className="min-h-screen p-8" />;
  }

  const owner = getDemoOwner(db);
  const published = db.articles
    .filter((a) => a.ownerId === owner.id && a.status === "PUBLISHED")
    .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));

  const overallRanking = db.articles
    .filter((a) => a.status === "PUBLISHED")
    .slice()
    .sort((a, b) => {
      const diff = (b.readCompleteCount ?? 0) - (a.readCompleteCount ?? 0);
      if (diff !== 0) return diff;
      return (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt);
    })
    .slice(0, 20);

  const ownerRanking = db.articles
    .filter((a) => a.ownerId === owner.id && a.status === "PUBLISHED")
    .slice()
    .sort((a, b) => {
      const diff = (b.readCompleteCount ?? 0) - (a.readCompleteCount ?? 0);
      if (diff !== 0) return diff;
      return (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt);
    })
    .slice(0, 20);

  const batches = db.contentPlanBatches
    .filter((b) => b.ownerId === owner.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="text-sm text-neutral-500">Core Language Hub（MVP）</div>
          <h1 className="text-3xl font-bold leading-tight">コアランゲージハブ</h1>
          <p className="text-neutral-700">
            CLA → タイトル案10件 → アウトライン承認 → 本文生成（デモ）
          </p>
        </header>

        <section className="flex flex-wrap gap-3">
          <Link
            href="/cla"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            CLAを作成する
          </Link>

          <button
            type="button"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium"
            onClick={() => {
              resetLocalDb();
              setNonce((x) => x + 1);
            }}
          >
            ローカルデータをリセット
          </button>
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">公開記事（デモ）</h2>
          {published.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">まだ公開記事がありません。</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {published.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.title}</div>
                    <div className="truncate text-sm text-neutral-500">/u/{owner.userSlug}/{a.slug}</div>
                  </div>
                  <Link
                    href={`/u/${owner.userSlug}/${a.slug}`}
                    className="shrink-0 rounded border border-neutral-300 px-3 py-1 text-sm"
                  >
                    開く
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">ランキング（全体）</h2>
          <p className="mt-1 text-sm text-neutral-600">readCompleteCount のみ（SSOT）</p>
          {overallRanking.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">まだ公開記事がありません。</p>
          ) : (
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5">
              {overallRanking.map((a) => {
                const aOwner = db.owners.find((o) => o.id === a.ownerId);
                const userSlug = aOwner?.userSlug ?? "unknown";
                return (
                  <li key={a.id} className="rounded border border-neutral-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{a.title}</div>
                        <div className="truncate text-xs text-neutral-500">/u/{userSlug}/{a.slug}</div>
                        <div className="mt-1 text-xs text-neutral-600">
                          readCompleteCount: {a.readCompleteCount}
                        </div>
                      </div>
                      <Link
                        href={`/u/${userSlug}/${a.slug}`}
                        className="shrink-0 rounded border border-neutral-300 px-3 py-1 text-sm"
                      >
                        開く
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">ランキング（ユーザー内）</h2>
          <p className="mt-1 text-sm text-neutral-600">作者: {owner.displayName}</p>
          {ownerRanking.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">まだ公開記事がありません。</p>
          ) : (
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5">
              {ownerRanking.map((a) => (
                <li key={a.id} className="rounded border border-neutral-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.title}</div>
                      <div className="truncate text-xs text-neutral-500">/u/{owner.userSlug}/{a.slug}</div>
                      <div className="mt-1 text-xs text-neutral-600">
                        readCompleteCount: {a.readCompleteCount}
                      </div>
                    </div>
                    <Link
                      href={`/u/${owner.userSlug}/${a.slug}`}
                      className="shrink-0 rounded border border-neutral-300 px-3 py-1 text-sm"
                    >
                      開く
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">タイトル案バッチ</h2>
          {batches.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-600">まだ作成されていません。</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {batches.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-neutral-700">{new Date(b.createdAt).toLocaleString()}</div>
                  <Link
                    href={`/plan/${b.id}`}
                    className="shrink-0 rounded border border-neutral-300 px-3 py-1 text-sm"
                  >
                    開く
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
