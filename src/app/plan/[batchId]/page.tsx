"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminContainer } from "@/components/admin/AdminContainer";
import { DashboardPage } from "@/components/admin/DashboardPage";
import { PrimaryButton } from "@/components/admin/PrimaryButton";
import { SectionCard } from "@/components/admin/SectionCard";
import { TabNavigation } from "@/components/admin/TabNavigation";
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

  if (!mounted || !db) return <main className="min-h-screen bg-gray-50 font-admin" />;

  const owner = getDemoOwner(db);
  const batch = db.contentPlanBatches.find((b) => b.id === batchId && b.ownerId === owner.id);
  const titleIdeas = db.titleIdeas
    .filter((t) => t.batchId === batchId && t.ownerId === owner.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  if (!batch) {
    return (
      <DashboardPage userName={owner.displayName} planLabel="フリープラン">
        <TabNavigation
          activeTab="title"
          onTabChange={(tab) => {
            if (tab === "cla") return router.push("/cla");
            if (tab === "title") return;
            if (tab === "article") return router.push("/");
          }}
        />
        <AdminContainer>
          <SectionCard title="バッチが見つかりません">
            <Link href="/" className="text-sm text-gray-700 underline hover:text-gray-900">
              トップへ戻る
            </Link>
          </SectionCard>
        </AdminContainer>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage userName={owner.displayName} planLabel="フリープラン">
      <TabNavigation
        activeTab="title"
        onTabChange={(tab) => {
          if (tab === "cla") return router.push("/cla");
          if (tab === "title") return;
          if (tab === "article") return router.push("/");
        }}
      />
      <AdminContainer>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-gray-900">タイトル案（10件）</div>
            <div className="mt-1 text-sm text-gray-600">batch: {new Date(batch.createdAt).toLocaleString()}</div>
          </div>
          <Link href="/" className="text-sm text-gray-700 underline hover:text-gray-900">
            戻る
          </Link>
        </div>

        <div className="space-y-4">
          {titleIdeas.map((ti) => (
            <SectionCard key={ti.id} title={ti.title} description={`status: ${ti.status}`}>
              <PrimaryButton
                type="button"
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
                このタイトルで記事を書く
              </PrimaryButton>
            </SectionCard>
          ))}
        </div>
      </AdminContainer>
    </DashboardPage>
  );
}
