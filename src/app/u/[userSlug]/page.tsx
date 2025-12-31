"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BunkoFooter } from "@/components/public/BunkoFooter";
import { BunkoHeader } from "@/components/public/BunkoHeader";
import { BunkoTopPage } from "@/components/public/BunkoTopPage";
import type { PublicArticleCard } from "@/components/public/types";
import type { LocalDB } from "@/lib/localDb";
import { loadLocalDb, saveLocalDb } from "@/lib/localDb";

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

function extractFirstParagraph(jsonString: string): string {
  try {
    const doc = JSON.parse(jsonString) as TipTapDoc;
    const blocks = doc.content ?? [];
    for (const b of blocks) {
      if (b.type !== "paragraph") continue;
      const text = (b.content ?? [])
        .map((n) => (n.type === "text" ? n.text ?? "" : ""))
        .join("")
        .trim();
      if (!text) continue;
      if (text.startsWith("# ") || text.startsWith("## ")) continue;
      return text;
    }
    return "";
  } catch {
    return "";
  }
}

export default function UserPublicTopPage() {
  const params = useParams<{ userSlug: string }>();
  const { userSlug } = params;

  const [mounted, setMounted] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [db, setDb] = useState<LocalDB | null>(null);

  const [currentCategory, setCurrentCategory] = useState("すべて");

  useEffect(() => {
    setMounted(true);
    setCurrentCategory("すべて");
  }, [userSlug]);

  useEffect(() => {
    if (!mounted) return;
    const loaded = loadLocalDb();
    saveLocalDb(loaded);
    setDb(loaded);
  }, [mounted, nonce]);

  const owner = useMemo(() => {
    return db?.owners.find((o) => o.userSlug === userSlug) ?? null;
  }, [db, userSlug]);

  const published = useMemo(() => {
    if (!db || !owner) return [];
    const all = db.articles
      .filter((a) => a.ownerId === owner.id && a.status === "PUBLISHED" && a.visibility === "PUBLIC")
      .slice()
      .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));

    // bunko-media-ui は「カテゴリ選択時の下線表示」が主。
    // MVPではカテゴリでの記事絞り込みは行わず、常に同じ一覧を表示する。
    return all;
  }, [db, owner]);

  const featuredIds = useMemo(() => {
    // bunko-media-ui は Article.featured を元に「特集」を作る。
    // このMVPでは、最新順のトップ記事を除いた次の4件を「特集」として扱う。
    if (!db || !owner) return new Set<string>();
    const all = db.articles
      .filter((a) => a.ownerId === owner.id && a.status === "PUBLISHED" && a.visibility === "PUBLIC")
      .slice()
      .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));

    const ids = all.slice(1, 5).map((a) => a.id);
    return new Set(ids);
  }, [db, owner]);

  const cards: PublicArticleCard[] = useMemo(() => {
    if (!db || !owner) return [];
    return published.map((a) => {
      const dateIso = a.publishedAt ?? a.updatedAt;
      const fallbackSummary = extractFirstParagraph(a.content);
      return {
        id: a.id,
        href: `/u/${owner.userSlug}/${a.slug}`,
        title: a.title,
        summary: a.excerpt || fallbackSummary || "",
        date: formatDateYmdDots(dateIso),
        category: primaryCategoryLabel(db, a.tagIds),
        author: owner.displayName,
        readCompleteCount: a.readCompleteCount ?? 0,
        featured: featuredIds.has(a.id),
      };
    });
  }, [db, owner, published, featuredIds]);

  const ranking: PublicArticleCard[] = useMemo(() => {
    const r = cards
      .slice()
      .sort((a, b) => {
        const diff = (b.readCompleteCount ?? 0) - (a.readCompleteCount ?? 0);
        if (diff !== 0) return diff;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 10);
    return r;
  }, [cards]);

  if (!mounted || !db) {
    return <main className="min-h-screen" />;
  }

  if (!owner) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-xl" style={{ lineHeight: "1.6" }}>
            404
          </h1>
          <p className="mt-2 text-sm text-gray-600" style={{ lineHeight: "1.7" }}>
            ユーザーが見つかりません。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <BunkoHeader
        currentCategory={currentCategory}
        onCategoryChange={(c) => setCurrentCategory(c)}
      />
      <BunkoTopPage articles={cards} ranking={ranking} />
      <BunkoFooter />
    </main>
  );
}
