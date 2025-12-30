"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import type { Article } from "@/lib/domain";
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

  if (!mounted || !db) return <main className="min-h-screen p-8" />;

  const owner = getDemoOwner(db);
  const article = db.articles.find((a) => a.id === articleId && a.ownerId === owner.id) ?? null;
  const cla = article?.claId ? db.clas.find((c) => c.id === article.claId) ?? null : null;

  if (!article) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-bold">記事が見つかりません</h1>
          <div className="mt-3">
            <Link href="/" className="text-sm underline">
              トップへ戻る
            </Link>
          </div>
        </div>
      </main>
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
    <main className="min-h-screen p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-neutral-500">記事作成</div>
            <h1 className="mt-1 truncate text-2xl font-bold">{article.title}</h1>
            <div className="mt-1 text-sm text-neutral-600">status: {article.status} / edition: {article.edition}</div>
          </div>
          <div className="shrink-0">
            <Link href="/" className="text-sm text-neutral-600 underline">
              戻る
            </Link>
          </div>
        </div>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">1) アウトライン生成</h2>
          <p className="mt-1 text-sm text-neutral-600">
            アウトライン再生成ではeditionは増やしません（SSOT）。
          </p>

          <button
            type="button"
            className="mt-3 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              const outline = generateOutline(article.title, cla?.content ?? "");
              updateArticle((a) => ({ ...a, outline, updatedAt: new Date().toISOString() }));
            }}
          >
            アウトラインを生成/再生成
          </button>

          <textarea
            className="mt-3 min-h-40 w-full rounded border border-neutral-300 p-3 text-sm"
            value={article.outline ?? ""}
            placeholder="アウトラインがここに入ります"
            onChange={(e) => {
              const outline = e.target.value;
              updateArticle((a) => ({ ...a, outline, updatedAt: new Date().toISOString() }));
            }}
          />
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">2) 承認 → 本文生成</h2>
          <p className="mt-1 text-sm text-neutral-600">
            本文生成（または再生成）ではedition++（SSOT）。
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
            </button>

            <button
              type="button"
              className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium"
              onClick={() => router.push(publicUrl)}
            >
              公開URLを開く
            </button>
          </div>

          {preview ? (
            <pre className="mt-3 overflow-auto rounded bg-neutral-100 p-3 text-xs">{preview}</pre>
          ) : null}

          <div className="mt-4 text-sm text-neutral-700">
            <div className="font-medium">excerpt</div>
            <div className="mt-1 text-neutral-600">{article.excerpt || "（未生成）"}</div>
          </div>
        </section>

        <section className="rounded border border-neutral-200 bg-white p-4">
          <h2 className="text-lg font-semibold">3) 公開</h2>
          <p className="mt-1 text-sm text-neutral-600">本文生成後に公開する想定です。</p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={article.status === "PUBLISHED" || article.edition < 1}
              onClick={() => {
                updateArticle((a) => publishArticleDraft(a));
              }}
            >
              公開する
            </button>

            {article.status === "PUBLISHED" ? (
              <Link href={publicUrl} className="rounded border border-neutral-300 px-4 py-2 text-sm">
                {publicUrl}
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
