import type { Article, Id, ReaderProfile, Tag } from "./domain";

export interface RecommendOptions {
  now?: Date;
  maxResults?: number;
}

function normalizeText(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\u2000-\u206f\u2e00-\u2e7f'"!?,.:;()\[\]{}]/g, "");
}

function buildCanonicalMap(tags: Tag[]): Map<Id, Id> {
  const byId = new Map<Id, Tag>();
  for (const t of tags) byId.set(t.id, t);

  const resolve = (id: Id): Id => {
    const seen = new Set<Id>();
    let cur: Id | undefined = id;
    while (cur) {
      if (seen.has(cur)) return id; // cycle fallback
      seen.add(cur);
      const t = byId.get(cur);
      if (!t?.canonicalTagId || t.canonicalTagId === cur) return cur;
      cur = t.canonicalTagId;
    }
    return id;
  };

  const map = new Map<Id, Id>();
  for (const id of byId.keys()) map.set(id, resolve(id));
  return map;
}

function freshnessBoost(publishedAt: string | undefined, now: Date): number {
  if (!publishedAt) return 0;
  const dt = new Date(publishedAt);
  const ageDays = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
  if (Number.isNaN(ageDays)) return 0;
  if (ageDays <= 1) return 2;
  if (ageDays <= 7) return 1;
  return 0;
}

export function scoreArticleForReader(params: {
  article: Article;
  reader: ReaderProfile;
  tags: Tag[];
}): number {
  const { article, reader, tags } = params;
  const canonical = buildCanonicalMap(tags);

  const articleCanonicalTagIds = new Set(article.tagIds.map((id) => canonical.get(id) ?? id));
  const readerPresetCanonical = new Set(reader.presetTagIds.map((id) => canonical.get(id) ?? id));
  const readerNormCanonical = new Set(
    reader.normalizedTagIdsFromFreeText.map((id) => canonical.get(id) ?? id),
  );

  let score = 0;

  for (const id of articleCanonicalTagIds) {
    if (readerPresetCanonical.has(id)) score += 5;
    if (readerNormCanonical.has(id)) score += 2;
  }

  // Free-text fallback: loose substring match against title/excerpt only.
  const hay = normalizeText(`${article.title} ${article.excerpt}`);
  for (const t of reader.freeTextInterests) {
    const needle = normalizeText(t);
    if (!needle) continue;
    if (hay.includes(needle)) score += 1;
  }

  score += freshnessBoost(article.publishedAt, new Date());
  return score;
}

export function recommendArticles(params: {
  articles: Article[];
  reader: ReaderProfile;
  tags: Tag[];
  options?: RecommendOptions;
}): Article[] {
  const { articles, reader, tags, options } = params;
  const now = options?.now ?? new Date();
  const max = options?.maxResults ?? 20;

  const scored = articles
    .map((a) => ({
      a,
      s: scoreArticleForReader({ article: a, reader, tags }) + freshnessBoost(a.publishedAt, now),
    }))
    .sort((x, y) => {
      if (y.s !== x.s) return y.s - x.s;
      const yt = y.a.publishedAt ? new Date(y.a.publishedAt).getTime() : 0;
      const xt = x.a.publishedAt ? new Date(x.a.publishedAt).getTime() : 0;
      return yt - xt;
    })
    .map((x) => x.a);

  return scored.slice(0, max);
}
