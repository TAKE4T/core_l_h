"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { LocalDB } from "@/lib/localDb";
import { incrementReadComplete, loadLocalDb, saveLocalDb } from "@/lib/localDb";

type TipTapDoc = {
  type?: string;
  content?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function extractPlainParagraphs(jsonString: string): string[] {
  try {
    const doc = JSON.parse(jsonString) as TipTapDoc;
    const blocks = doc.content ?? [];
    const ps: string[] = [];
    for (const b of blocks) {
      if (b.type !== "paragraph") continue;
      const text = (b.content ?? [])
        .map((n) => (n.type === "text" ? n.text ?? "" : ""))
        .join("");
      if (text.trim()) ps.push(text);
    }
    return ps;
  } catch {
    return [];
  }
}

export default function ArticlePublicPage() {
  const params = useParams<{ userSlug: string; articleSlug: string }>();
  const { userSlug, articleSlug } = params;

  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [db, setDb] = useState<LocalDB | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    triggeredRef.current = false;
  }, [userSlug, articleSlug]);

  useEffect(() => {
    if (!mounted) return;
    setDb(loadLocalDb());
  }, [mounted, nonce]);

  const owner = useMemo(() => {
    return db?.owners.find((o) => o.userSlug === userSlug) ?? null;
  }, [db, userSlug]);

  const article = useMemo(() => {
    if (!db || !owner) return null;
    return (
      db.articles.find(
        (a) => a.ownerId === owner.id && a.slug === articleSlug && a.status === "PUBLISHED",
      ) ?? null
    );
  }, [db, owner, articleSlug]);

  useEffect(() => {
    if (!owner || !article) return;

    const onScroll = () => {
      if (triggeredRef.current) return;
      const doc = document.documentElement;
      const scrollTop = window.scrollY ?? doc.scrollTop;
      const viewport = window.innerHeight;
      const full = doc.scrollHeight;

      if (scrollTop + viewport >= full - 2) {
        triggeredRef.current = true;
        const latest = loadLocalDb();
        latest.articles = latest.articles.map((x) =>
          x.id === article.id ? incrementReadComplete(x) : x,
        );
        saveLocalDb(latest);
        setNonce((n) => n + 1);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [owner, article]);

  if (!mounted || !db) {
    return <main className="min-h-screen p-8" />;
  }

  if (!owner || !article) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl font-bold">404</h1>
          <p className="mt-2 text-sm text-neutral-600">記事が見つかりません。</p>
          <div className="mt-4">
            <Link href="/" className="text-sm underline">
              トップへ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const paragraphs = extractPlainParagraphs(article.content);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="text-sm text-neutral-500">/u/{userSlug}/{article.slug}</div>

      <h1 className="mt-2 text-3xl font-bold leading-tight">{article.title}</h1>

      <p className="mt-4 text-neutral-700">{article.excerpt}</p>

      <hr className="my-8" />

      <section className="prose prose-neutral max-w-none">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => (
            <p key={idx} className="whitespace-pre-wrap">
              {p}
            </p>
          ))
        ) : (
          <pre className="overflow-auto rounded bg-neutral-100 p-4 text-xs">{article.content}</pre>
        )}
      </section>

      <hr className="my-8" />

      <section className="text-sm text-neutral-600">
        <div>readCompleteCount: {article.readCompleteCount}</div>
        <div>edition: {article.edition}</div>
      </section>
    </main>
  );
}
