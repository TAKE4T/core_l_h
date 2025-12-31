"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BunkoArticleDetail } from "@/components/public/BunkoArticleDetail";
import { BunkoFooter } from "@/components/public/BunkoFooter";
import { BunkoHeader } from "@/components/public/BunkoHeader";
import type { PublicArticleCard } from "@/components/public/types";
import type { LocalDB } from "@/lib/localDb";
import { incrementReadComplete, loadLocalDb, saveLocalDb } from "@/lib/localDb";

const BUNKO_CATEGORY_SET = new Set([
  "経済",
  "ビジネス",
  "政治・経済",
  "働き方",
  "スタートアップ",
  "地方創生",
  "ESG",
  "教育",
]);

type TipTapDoc = {
  type?: string;
  content?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function formatDateYmdDots(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function primaryCategoryLabel(db: LocalDB, tagIds: string[]): string {
  const labels = tagIds
    .map((id) => db.tags.find((t) => t.id === id)?.label)
    .filter((x): x is string => Boolean(x));

  const bunko = labels.find((l) => BUNKO_CATEGORY_SET.has(l));
  if (bunko) return bunko;

  return labels[0] ?? "コラム";
}

export default function ArticlePublicPage() {
  const params = useParams<{ userSlug: string; articleSlug: string }>();
  const { userSlug, articleSlug } = params;
  const router = useRouter();

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
    return <main className="min-h-screen" />;
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

  const vm: PublicArticleCard = {
    id: article.id,
    href: `/u/${owner.userSlug}/${article.slug}`,
    title: article.title,
    summary: article.excerpt || "",
    date: formatDateYmdDots(article.publishedAt ?? article.updatedAt),
    category: primaryCategoryLabel(db, article.tagIds),
    author: owner.displayName,
    readCompleteCount: article.readCompleteCount ?? 0,
  };

  const related: PublicArticleCard[] = db.articles
    .filter((a) => a.ownerId === owner.id && a.status === "PUBLISHED" && a.visibility === "PUBLIC")
    .filter((a) => a.id !== article.id)
    .slice()
    .sort((a, b) => {
      const aTagOverlap = a.tagIds.filter((id) => article.tagIds.includes(id)).length;
      const bTagOverlap = b.tagIds.filter((id) => article.tagIds.includes(id)).length;
      const tagDiff = bTagOverlap - aTagOverlap;
      if (tagDiff !== 0) return tagDiff;

      const diff = (b.readCompleteCount ?? 0) - (a.readCompleteCount ?? 0);
      if (diff !== 0) return diff;

      return (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt);
    })
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      href: `/u/${owner.userSlug}/${a.slug}`,
      title: a.title,
      summary: a.excerpt || "",
      date: formatDateYmdDots(a.publishedAt ?? a.updatedAt),
      category: primaryCategoryLabel(db, a.tagIds),
      author: owner.displayName,
      readCompleteCount: a.readCompleteCount ?? 0,
    }));

  return (
    <main className="min-h-screen">
      <BunkoHeader
        currentCategory="すべて"
        onCategoryChange={() => router.push(`/u/${owner.userSlug}`)}
      />
      <BunkoArticleDetail
        article={vm}
        contentJsonString={article.content}
        relatedArticles={related}
        backHref={`/u/${owner.userSlug}`}
      />
      <BunkoFooter />
    </main>
  );
}
