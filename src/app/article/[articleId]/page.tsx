"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import type { Article } from "@/lib/domain";
import { AdminContainer } from "@/components/admin/AdminContainer";
import { DashboardPage } from "@/components/admin/DashboardPage";
import { PrimaryButton } from "@/components/admin/PrimaryButton";
import { SecondaryButton } from "@/components/admin/SecondaryButton";
import { SectionCard } from "@/components/admin/SectionCard";
import { TabNavigation } from "@/components/admin/TabNavigation";
import {
  generateBodyAsTiptapJson,
  generateOutline,
  getDemoOwner,
  loadLocalDb,
  publishArticleDraft,
  saveLocalDb,
} from "@/lib/localDb";

import type { LocalDB } from "@/lib/localDb";

export default function ArticleBuildPage() {
  const params = useParams<{ articleId: string }>();
  const router = useRouter();
  const articleId = params.articleId;

  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [db, setDb] = useState<LocalDB | null>(null);
  const [generatingBody, setGeneratingBody] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setDb(loadLocalDb());
  }, [mounted, nonce]);

  if (!mounted || !db) return <main className="min-h-screen bg-gray-50 font-admin" />;

  const owner = getDemoOwner(db);
  const article = db.articles.find((a) => a.id === articleId && a.ownerId === owner.id) ?? null;
  const cla = article?.claId ? db.clas.find((c) => c.id === article.claId) ?? null : null;

  if (!article) {
    return (
      <DashboardPage userName={owner.displayName} planLabel="フリープラン">
        <TabNavigation
          activeTab="article"
          onTabChange={(tab) => {
            if (tab === "cla") return router.push("/cla");
            if (tab === "title") return router.push("/");
            if (tab === "article") return;
          }}
        />
        <AdminContainer>
          <SectionCard title="記事が見つかりません">
            <Link href="/" className="text-sm text-gray-700 underline hover:text-gray-900">
              トップへ戻る
            </Link>
          </SectionCard>
        </AdminContainer>
      </DashboardPage>
    );
  }

  const publicUrl = `/u/${owner.userSlug}/${article.slug}`;

  function updateArticle(mutator: (a: Article) => Article) {
    const latest = loadLocalDb();
    latest.articles = latest.articles.map((x) => (x.id === articleId ? mutator(x) : x));
    saveLocalDb(latest);
    setNonce((n) => n + 1);
  }

  return (
    <DashboardPage userName={owner.displayName} planLabel="フリープラン">
      <TabNavigation
        activeTab="article"
        onTabChange={(tab) => {
          if (tab === "cla") return router.push("/cla");
          if (tab === "title") {
            if (article.contentPlanBatchId) return router.push(`/plan/${article.contentPlanBatchId}`);
            return router.push("/");
          }
          if (tab === "article") return;
        }}
      />
      <AdminContainer>
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-gray-900">記事作成</div>
            <div className="mt-1 truncate text-sm text-gray-600">{article.title}</div>
            <div className="mt-1 text-xs text-gray-500">status: {article.status} / edition: {article.edition}</div>
          </div>
          <Link href="/" className="text-sm text-gray-700 underline hover:text-gray-900">
            戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
          <div className="space-y-6">
            <SectionCard title="生成" description="SSOTに沿って段階的に進めます">
              <div className="space-y-3">
                <PrimaryButton
                  type="button"
                  onClick={() => {
                    const outline = generateOutline(article.title, cla?.content ?? "");
                    updateArticle((a) => ({ ...a, outline, updatedAt: new Date().toISOString() }));
                  }}
                >
                  アウトライン生成/再生成
                </PrimaryButton>

                <PrimaryButton
                  type="button"
                  disabled={!article.outline || generatingBody}
                  onClick={() => {
                    if (!article.outline) return;
                    setGeneratingBody(true);
                    setPreview("");

                    const chunks = [
                      "本文生成を開始します…\n",
                      "アウトラインをもとに構成を組み立てています…\n",
                      "文章を生成しています…\n",
                      "仕上げています…\n",
                    ];
                    let i = 0;

                    if (timerRef.current) window.clearInterval(timerRef.current);
                    timerRef.current = window.setInterval(() => {
                      setPreview((p) => p + chunks[i]);
                      i += 1;
                      if (i >= chunks.length) {
                        if (timerRef.current) window.clearInterval(timerRef.current);
                        timerRef.current = null;

                        const { contentJsonString, excerpt } = generateBodyAsTiptapJson({
                          title: article.title,
                          outline: article.outline ?? "",
                        });

                        updateArticle((a) => ({
                          ...a,
                          content: contentJsonString,
                          excerpt,
                          edition: (a.edition ?? 0) + 1,
                          updatedAt: new Date().toISOString(),
                        }));

                        setGeneratingBody(false);
                      }
                    }, 350);
                  }}
                >
                  本文を生成（承認）
                </PrimaryButton>

                <SecondaryButton type="button" onClick={() => router.push(publicUrl)}>
                  公開URLを開く
                </SecondaryButton>

                <PrimaryButton
                  type="button"
                  disabled={article.status === "PUBLISHED" || article.edition < 1}
                  onClick={() => updateArticle((a) => publishArticleDraft(a))}
                >
                  公開する
                </PrimaryButton>
              </div>
            </SectionCard>

            <SectionCard title="ログ" description="生成状況を表示します">
              <div
                className="rounded bg-white p-4 shadow-sm border border-gray-200"
                style={{ minHeight: "200px", maxHeight: "400px", overflowY: "auto" }}
              >
                <div className="text-sm text-gray-600">
                  {preview ? (
                    <pre className="whitespace-pre-wrap text-gray-700 text-xs">{preview}</pre>
                  ) : (
                    <div className="text-gray-400">ログが表示されます</div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="アウトライン" description="編集できます（editionは増えません）">
              <textarea
                className="w-full resize-none rounded border border-gray-200 p-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
                rows={16}
                value={article.outline ?? ""}
                placeholder="アウトラインがここに入ります"
                onChange={(e) => {
                  const outline = e.target.value;
                  updateArticle((a) => ({ ...a, outline, updatedAt: new Date().toISOString() }));
                }}
              />
            </SectionCard>

            <SectionCard title="生成結果" description="本文はTipTap JSONとして保存されます">
              <div className="text-sm text-gray-700">
                <div className="text-xs text-gray-500">excerpt</div>
                <div className="mt-1 text-gray-900">{article.excerpt || "（未生成）"}</div>

                <div className="mt-4 text-xs text-gray-500">公開URL</div>
                {article.status === "PUBLISHED" ? (
                  <Link href={publicUrl} className="mt-1 inline-block text-sm text-gray-700 underline hover:text-gray-900">
                    {publicUrl}
                  </Link>
                ) : (
                  <div className="mt-1 text-sm text-gray-600">（未公開）</div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </AdminContainer>
    </DashboardPage>
  );
}
