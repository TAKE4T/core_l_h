"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AdminContainer } from "@/components/admin/AdminContainer";
import { DashboardPage } from "@/components/admin/DashboardPage";
import { PrimaryButton } from "@/components/admin/PrimaryButton";
import { SecondaryButton } from "@/components/admin/SecondaryButton";
import { SectionCard } from "@/components/admin/SectionCard";
import { TabNavigation } from "@/components/admin/TabNavigation";
import { getDemoOwner, loadLocalDb, resetLocalDb, saveLocalDb } from "@/lib/localDb";

export default function HomePage() {
  const router = useRouter();
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
    return <main className="min-h-screen bg-gray-50 font-admin" />;
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

  const drafts = db.articles
    .filter((a) => a.ownerId === owner.id && a.status === "DRAFT")
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20);

  return (
    <DashboardPage userName={owner.displayName} planLabel="フリープラン">
      <TabNavigation
        activeTab="cla"
        onTabChange={(tab) => {
          if (tab === "cla") return;
          if (tab === "title") {
            const latestBatch = batches[0];
            if (latestBatch) return router.push(`/plan/${latestBatch.id}`);
            return router.push("/cla");
          }
          if (tab === "article") {
            const latestArticle = drafts[0] ?? published[0];
            if (latestArticle) return router.push(`/article/${latestArticle.id}`);
            return router.push("/cla");
          }
        }}
      />
      <AdminContainer>
        <div className="mb-6">
          <div className="text-gray-900">コアランゲージハブ</div>
          <p className="mt-1 text-sm text-gray-600">CLA → タイトル案10件 → アウトライン承認 → 本文生成（デモ）</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/cla"
            className="inline-flex items-center justify-center rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            CLAを作成する
          </Link>
          <SecondaryButton
            type="button"
            onClick={() => {
              resetLocalDb();
              setNonce((x) => x + 1);
            }}
          >
            ローカルデータをリセット
          </SecondaryButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="下書き" description="作成中の記事">
            {drafts.length === 0 ? (
              <div className="text-sm text-gray-600">下書きはありません。</div>
            ) : (
              <ul className="space-y-3">
                {drafts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-gray-900">{a.title}</div>
                      <div className="text-xs text-gray-500">updated: {new Date(a.updatedAt).toLocaleString()}</div>
                    </div>
                    <Link href={`/article/${a.id}`} className="text-sm text-gray-700 underline hover:text-gray-900">
                      開く
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="公開記事" description="公開URLの確認">
            {published.length === 0 ? (
              <div className="text-sm text-gray-600">まだ公開記事がありません。</div>
            ) : (
              <ul className="space-y-3">
                {published.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-gray-900">{a.title}</div>
                      <div className="truncate text-xs text-gray-500">/u/{owner.userSlug}/{a.slug}</div>
                    </div>
                    <Link href={`/u/${owner.userSlug}/${a.slug}`} className="text-sm text-gray-700 underline hover:text-gray-900">
                      開く
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="ランキング（全体）" description="readCompleteCount のみ（SSOT）">
            {overallRanking.length === 0 ? (
              <div className="text-sm text-gray-600">まだ公開記事がありません。</div>
            ) : (
              <ol className="list-decimal pl-5 space-y-3">
                {overallRanking.slice(0, 10).map((a) => {
                  const aOwner = db.owners.find((o) => o.id === a.ownerId);
                  const userSlug = aOwner?.userSlug ?? "unknown";
                  return (
                    <li key={a.id} className="text-sm">
                      <div className="text-gray-900">{a.title}</div>
                      <div className="text-xs text-gray-600">readCompleteCount: {a.readCompleteCount ?? 0}</div>
                      <Link href={`/u/${userSlug}/${a.slug}`} className="text-xs text-gray-700 underline hover:text-gray-900">
                        /u/{userSlug}/{a.slug}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </SectionCard>

          <SectionCard title="タイトル案バッチ" description="作成済みの10件バッチ">
            {batches.length === 0 ? (
              <div className="text-sm text-gray-600">まだ作成されていません。</div>
            ) : (
              <ul className="space-y-3">
                {batches.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-700">{new Date(b.createdAt).toLocaleString()}</div>
                    <Link href={`/plan/${b.id}`} className="text-sm text-gray-700 underline hover:text-gray-900">
                      開く
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </AdminContainer>
    </DashboardPage>
  );
}
