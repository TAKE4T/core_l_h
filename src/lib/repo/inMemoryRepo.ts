import type { Article, Id, Tag } from "@/lib/domain";

export interface ArticleKey {
  ownerId: Id;
  articleSlug: string;
}

export interface InMemoryDB {
  owners: Array<{ id: Id; userSlug: string; displayName: string }>;
  tags: Tag[];
  articles: Article[];
}

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const db: InMemoryDB = {
  owners: [{ id: "o_demo", userSlug: "demo", displayName: "Demo Author" }],
  tags: [
    {
      id: "t_ai",
      scope: "OWNER",
      ownerId: "o_demo",
      label: "AI",
      slug: "ai",
      status: "ACTIVE",
      canonicalTagId: "t_ai",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
    {
      id: "t_writer",
      scope: "GLOBAL",
      label: "Writing",
      slug: "writing",
      status: "ACTIVE",
      canonicalTagId: "t_writer",
      createdAt: iso(now),
      updatedAt: iso(now),
    },
  ],
  articles: [
    {
      id: "a_1",
      ownerId: "o_demo",
      title: "AI入門：まず何から学ぶ？",
      slug: "ai-getting-started",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello TipTap JSON" }] }] }),
      excerpt: "AI学習の最初の一歩を整理します。",
      tagIds: ["t_ai"],
      readCompleteCount: 3,
      edition: 1,
      createdAt: iso(now),
      updatedAt: iso(now),
      publishedAt: iso(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
    },
  ],
};

export function getOwnerByUserSlug(userSlug: string) {
  return db.owners.find((o) => o.userSlug === userSlug) ?? null;
}

export function getPublishedArticleBySlug(key: ArticleKey) {
  const a = db.articles.find(
    (x) => x.ownerId === key.ownerId && x.slug === key.articleSlug && x.status === "PUBLISHED",
  );
  return a ?? null;
}
