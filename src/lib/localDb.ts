import type {
  Article,
  ContentPlanBatch,
  CoreLanguageArtifact,
  Id,
  Owner,
  Tag,
  TitleIdea,
} from "@/lib/domain";

export interface LocalDB {
  owners: Owner[];
  tags: Tag[];
  clas: CoreLanguageArtifact[];
  contentPlanBatches: ContentPlanBatch[];
  titleIdeas: TitleIdea[];
  articles: Article[];
}

const STORAGE_KEY = "core_l_h.localdb.v1";

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): Id {
  // Good enough for local demo; avoids adding deps.
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function slugFromTitle(title: string): string {
  const ascii = title
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii.length >= 3) return ascii.slice(0, 80);
  return `article-${Date.now().toString(36)}`;
}

function seedDb(): LocalDB {
  const t = nowIso();
  const owner: Owner = {
    id: "o_demo",
    userSlug: "demo",
    displayName: "Demo Author",
    createdAt: t,
    updatedAt: t,
  };

  const tags: Tag[] = [
    {
      id: "t_ai",
      scope: "OWNER",
      ownerId: owner.id,
      label: "AI",
      slug: "ai",
      status: "ACTIVE",
      canonicalTagId: "t_ai",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_writer",
      scope: "GLOBAL",
      label: "Writing",
      slug: "writing",
      status: "ACTIVE",
      canonicalTagId: "t_writer",
      createdAt: t,
      updatedAt: t,
    },
  ];

  const articles: Article[] = [
    {
      id: "a_1",
      ownerId: owner.id,
      title: "AI入門：まず何から学ぶ？",
      slug: "ai-getting-started",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello TipTap JSON" }],
          },
        ],
      }),
      excerpt: "AI学習の最初の一歩を整理します。",
      outline: "- はじめに\n- 何を学ぶか\n- 学び方\n- まとめ",
      tagIds: ["t_ai"],
      readCompleteCount: 3,
      edition: 1,
      createdAt: t,
      updatedAt: t,
      publishedAt: t,
    },
  ];

  return {
    owners: [owner],
    tags,
    clas: [],
    contentPlanBatches: [],
    titleIdeas: [],
    articles,
  };
}

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error("localDb can only be used in the browser");
  }
}

export function loadLocalDb(): LocalDB {
  assertBrowser();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedDb();

  try {
    const parsed = JSON.parse(raw) as LocalDB;
    // Minimal shape guard.
    if (!parsed || typeof parsed !== "object") return seedDb();
    if (!Array.isArray(parsed.owners) || !Array.isArray(parsed.articles)) return seedDb();
    return {
      owners: parsed.owners ?? [],
      tags: parsed.tags ?? [],
      clas: parsed.clas ?? [],
      contentPlanBatches: parsed.contentPlanBatches ?? [],
      titleIdeas: parsed.titleIdeas ?? [],
      articles: parsed.articles ?? [],
    };
  } catch {
    return seedDb();
  }
}

export function saveLocalDb(db: LocalDB): void {
  assertBrowser();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetLocalDb(): void {
  assertBrowser();
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getDemoOwner(db: LocalDB): Owner {
  return db.owners[0] ?? {
    id: "o_demo",
    userSlug: "demo",
    displayName: "Demo Author",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function createClaAndBatch(params: { ownerId: Id; claText: string }): {
  cla: CoreLanguageArtifact;
  batch: ContentPlanBatch;
  titleIdeas: TitleIdea[];
} {
  const t = nowIso();

  const cla: CoreLanguageArtifact = {
    id: randomId("cla"),
    ownerId: params.ownerId,
    content: params.claText,
    version: 1,
    createdAt: t,
    updatedAt: t,
  };

  const batch: ContentPlanBatch = {
    id: randomId("cpb"),
    ownerId: params.ownerId,
    claId: cla.id,
    createdAt: t,
    updatedAt: t,
  };

  const titles = generateTitleIdeas(params.claText);
  const titleIdeas: TitleIdea[] = titles.map((title) => ({
    id: randomId("ti"),
    ownerId: params.ownerId,
    batchId: batch.id,
    title,
    status: "PROPOSED",
    createdAt: t,
    updatedAt: t,
  }));

  return { cla, batch, titleIdeas };
}

export function selectTitleAndCreateDraft(params: {
  ownerId: Id;
  batchId: Id;
  claId: Id;
  titleIdeaId: Id;
  title: string;
}): Article {
  const t = nowIso();

  const article: Article = {
    id: randomId("a"),
    ownerId: params.ownerId,
    title: params.title,
    slug: slugFromTitle(params.title),
    status: "DRAFT",
    visibility: "MEMBERS_ONLY",
    outline: undefined,
    content: JSON.stringify({ type: "doc", content: [] }),
    excerpt: "",
    tagIds: [],
    readCompleteCount: 0,
    edition: 0,
    createdAt: t,
    updatedAt: t,
    claId: params.claId,
    contentPlanBatchId: params.batchId,
    titleIdeaId: params.titleIdeaId,
  };

  return article;
}

export function generateOutline(title: string, claText: string): string {
  const seed = (claText.trim() || "コアランゲージ").slice(0, 24);
  return [
    `# ${title}`,
    "",
    `- なぜ今「${seed}」が重要か`,
    "- 読者が抱えがちな誤解", 
    "- 実践ステップ（今日から）",
    "- よくある失敗と回避策",
    "- まとめ",
  ].join("\n");
}

export function generateBodyAsTiptapJson(params: {
  title: string;
  outline: string;
}): { contentJsonString: string; excerpt: string } {
  const paragraphs = [
    params.title,
    "この記事では、アウトライン承認後に本文を生成するフローをデモします。",
    "（本番ではLLMのストリーミング生成に置き換えます）",
    "",
    params.outline,
  ].filter(Boolean);

  const doc = {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };

  const excerpt = paragraphs.find((p) => p && p !== params.title) ?? "";
  return { contentJsonString: JSON.stringify(doc), excerpt: excerpt.slice(0, 160) };
}

export function publishArticleDraft(article: Article): Article {
  const t = nowIso();
  return {
    ...article,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    edition: Math.max(1, article.edition),
    updatedAt: t,
    publishedAt: t,
  };
}

export function incrementReadComplete(article: Article): Article {
  const t = nowIso();
  return {
    ...article,
    readCompleteCount: (article.readCompleteCount ?? 0) + 1,
    updatedAt: t,
  };
}

function generateTitleIdeas(claText: string): string[] {
  const seed = (claText.trim() || "コアランゲージ").replace(/\s+/g, " ").slice(0, 28);
  const s = seed || "コアランゲージ";
  const templates = [
    `【保存版】${s}を言語化するための7つの質問`,
    `${s}が定まらないときに見るチェックリスト`,
    `${s}を刺さる一文に変えるコツ`,
    `${s}を“読まれる構成”に落とす手順`,
    `失敗しない${s}：よくある誤解と対策`,
    `${s}を武器にする：小さく試す実践ステップ`,
    `なぜ${s}は伝わらないのか？原因を分解する`,
    `${s}の具体例10選（そのまま使える）`,
    `${s}を磨く：問い直しのフレームワーク`,
    `${s}から記事テーマを量産する方法`,
  ];
  return templates.slice(0, 10);
}
