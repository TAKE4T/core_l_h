"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminContainer } from "@/components/admin/AdminContainer";
import { ClaBot } from "@/components/admin/ClaBot";
import { DashboardPage } from "@/components/admin/DashboardPage";
import { PrimaryButton } from "@/components/admin/PrimaryButton";
import { SecondaryButton } from "@/components/admin/SecondaryButton";
import { SectionCard } from "@/components/admin/SectionCard";
import { TabNavigation } from "@/components/admin/TabNavigation";
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
    return <main className="min-h-screen bg-gray-50 font-admin" />;
  }

  return (
    <DashboardPage userName={owner.displayName} planLabel="フリープラン">
      <TabNavigation
        activeTab="cla"
        onTabChange={(tab) => {
          if (tab === "cla") return;
          if (tab === "title") return router.push("/");
          if (tab === "article") return router.push("/");
        }}
      />
      <AdminContainer>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-gray-900">CLA（コアランゲージ）作成</div>
            <p className="mt-1 text-sm text-gray-600">SSOT: CLA作成後にタイトル案を10件生成します。</p>
          </div>
          <Link href="/" className="text-sm text-gray-700 underline hover:text-gray-900">
            戻る
          </Link>
        </div>

        <div className="space-y-6">
          <SectionCard title="コアランゲージ作成BOT" description="質問に答えるだけでCLAの下書きを作ります（MVPの疑似BOT）">
            <ClaBot
              onApplyDraft={(draft) => {
                setClaText(draft);
                setError(null);
              }}
            />
          </SectionCard>

          <SectionCard title="CLA入力" description="例：私は◯◯のために、△△を□□という考え方で実現する……">
            <textarea
              className="min-h-48 w-full rounded border border-gray-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={claText}
              onChange={(e) => setClaText(e.target.value)}
            />

            {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton
                type="button"
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
              </PrimaryButton>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </Link>
            </div>
          </SectionCard>
        </div>
      </AdminContainer>
    </DashboardPage>
  );
}
