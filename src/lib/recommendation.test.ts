import { describe, expect, it } from "vitest";

import type { Article, ReaderProfile, Tag } from "./domain";
import { recommendArticles } from "./recommendation";

describe("recommendArticles", () => {
  it("prefers preset tag matches", () => {
    const tags: Tag[] = [
      {
        id: "t1",
        scope: "OWNER",
        ownerId: "o1",
        label: "AI",
        slug: "ai",
        status: "ACTIVE",
        canonicalTagId: "t1",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      },
    ];

    const reader: ReaderProfile = {
      id: "r1",
      ownerId: "o1",
      presetTagIds: ["t1"],
      freeTextInterests: [],
      normalizedTagIdsFromFreeText: [],
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    };

    const a1: Article = {
      id: "a1",
      ownerId: "o1",
      title: "AI入門",
      slug: "ai-1",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      content: "{}",
      excerpt: "AIの話",
      tagIds: ["t1"],
      readCompleteCount: 0,
      edition: 1,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
      publishedAt: "2025-01-01",
    };

    const a2: Article = {
      ...a1,
      id: "a2",
      slug: "other",
      title: "別の記事",
      tagIds: [],
    };

    const rec = recommendArticles({ articles: [a2, a1], reader, tags, options: { maxResults: 10 } });
    expect(rec[0]?.id).toBe("a1");
  });
});
