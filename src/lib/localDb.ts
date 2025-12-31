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

    // bunko-media-ui のカテゴリ表示に寄せるためのタグ（MVP用）
    {
      id: "t_cat_economy",
      scope: "OWNER",
      ownerId: owner.id,
      label: "経済",
      slug: "economy",
      status: "ACTIVE",
      canonicalTagId: "t_cat_economy",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_business",
      scope: "OWNER",
      ownerId: owner.id,
      label: "ビジネス",
      slug: "business",
      status: "ACTIVE",
      canonicalTagId: "t_cat_business",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_politics_econ",
      scope: "OWNER",
      ownerId: owner.id,
      label: "政治・経済",
      slug: "politics-economy",
      status: "ACTIVE",
      canonicalTagId: "t_cat_politics_econ",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_workstyle",
      scope: "OWNER",
      ownerId: owner.id,
      label: "働き方",
      slug: "workstyle",
      status: "ACTIVE",
      canonicalTagId: "t_cat_workstyle",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_startup",
      scope: "OWNER",
      ownerId: owner.id,
      label: "スタートアップ",
      slug: "startup",
      status: "ACTIVE",
      canonicalTagId: "t_cat_startup",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_regional",
      scope: "OWNER",
      ownerId: owner.id,
      label: "地方創生",
      slug: "regional-revitalization",
      status: "ACTIVE",
      canonicalTagId: "t_cat_regional",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_esg",
      scope: "OWNER",
      ownerId: owner.id,
      label: "ESG",
      slug: "esg",
      status: "ACTIVE",
      canonicalTagId: "t_cat_esg",
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t_cat_education",
      scope: "OWNER",
      ownerId: owner.id,
      label: "教育",
      slug: "education",
      status: "ACTIVE",
      canonicalTagId: "t_cat_education",
      createdAt: t,
      updatedAt: t,
    },
  ];

  const makeArticle = (params: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    outline: string;
    tagIds: string[];
    readCompleteCount: number;
    minutesAgo: number;
  }): Article => {
    const date = new Date(Date.now() - params.minutesAgo * 60 * 1000).toISOString();
    return {
      id: params.id,
      ownerId: owner.id,
      title: params.title,
      slug: params.slug,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: params.title }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "## 要点" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: params.outline }],
          },
        ],
      }),
      excerpt: params.excerpt,
      outline: params.outline,
      tagIds: params.tagIds,
      readCompleteCount: params.readCompleteCount,
      edition: 1,
      createdAt: date,
      updatedAt: date,
      publishedAt: date,
    };
  };

  const articles: Article[] = [
    makeArticle({
      id: "a_1",
      title: "円安はいつまで続く？家計への影響を整理する",
      slug: "yen-weakness-household",
      excerpt: "円安局面が長期化する背景と、家計への具体的な影響を整理します。",
      outline: "- 背景\n- 影響\n- 取れる行動\n- まとめ",
      tagIds: ["t_cat_economy"],
      readCompleteCount: 18,
      minutesAgo: 60,
    }),
    makeArticle({
      id: "a_2",
      title: "会議が長い組織が見落としている3つの前提",
      slug: "long-meetings-premises",
      excerpt: "会議が長くなる原因は、アジェンダ以前の“前提”にあります。",
      outline: "- よくある前提\n- 変え方\n- 実践ステップ\n- まとめ",
      tagIds: ["t_cat_workstyle"],
      readCompleteCount: 7,
      minutesAgo: 120,
    }),
    makeArticle({
      id: "a_3",
      title: "スタートアップが最初に整えるべき『数字の見取り図』",
      slug: "startup-metrics-map",
      excerpt: "KPI以前に、全員が共有できる“見取り図”を作ることが重要です。",
      outline: "- 見取り図の作り方\n- 指標の選び方\n- 失敗例\n- まとめ",
      tagIds: ["t_cat_startup"],
      readCompleteCount: 11,
      minutesAgo: 180,
    }),
    makeArticle({
      id: "a_4",
      title: "ESGは結局『コスト』なのか？投資家の視点で見る",
      slug: "esg-cost-or-investment",
      excerpt: "ESG対応をコストで終わらせないための見方を整理します。",
      outline: "- 誤解\n- 投資家の見方\n- 実装の勘所\n- まとめ",
      tagIds: ["t_cat_esg"],
      readCompleteCount: 5,
      minutesAgo: 240,
    }),
    makeArticle({
      id: "a_5",
      title: "地方創生は『観光』だけでは続かない：産業の筋肉を作る",
      slug: "regional-industry-muscle",
      excerpt: "観光の波に依存しない地域経済の作り方を考えます。",
      outline: "- なぜ続かないか\n- 産業の筋肉\n- 連携の設計\n- まとめ",
      tagIds: ["t_cat_regional"],
      readCompleteCount: 9,
      minutesAgo: 300,
    }),
    makeArticle({
      id: "a_6",
      title: "政治・経済ニュースの読み方：『論点』を3分で抜く",
      slug: "politics-econ-reading",
      excerpt: "ニュースに振り回されず、論点だけを素早く抜く方法。",
      outline: "- 論点の型\n- 3分の手順\n- よくある落とし穴\n- まとめ",
      tagIds: ["t_cat_politics_econ"],
      readCompleteCount: 14,
      minutesAgo: 360,
    }),
    makeArticle({
      id: "a_7",
      title: "教育の『質』を測るのは難しい：現場の指標設計",
      slug: "education-quality-metrics",
      excerpt: "教育の質を測る指標は、現場の行動設計とセットです。",
      outline: "- 指標の罠\n- 行動設計\n- データの扱い\n- まとめ",
      tagIds: ["t_cat_education"],
      readCompleteCount: 4,
      minutesAgo: 420,
    }),
    makeArticle({
      id: "a_8",
      title: "ビジネス文章が刺さらない理由は『主語』にある",
      slug: "business-writing-subject",
      excerpt: "読み手の頭の中で主語が揺れると、文章は一気に読みにくくなります。",
      outline: "- 主語の揺れ\n- 直し方\n- 実例\n- まとめ",
      tagIds: ["t_cat_business", "t_writer"],
      readCompleteCount: 22,
      minutesAgo: 480,
    }),
    makeArticle({
      id: "a_9",
      title: "AI入門：まず何から学ぶ？",
      slug: "ai-getting-started",
      excerpt: "AI学習の最初の一歩を整理します。",
      outline: "- はじめに\n- 何を学ぶか\n- 学び方\n- まとめ",
      tagIds: ["t_ai", "t_cat_business"],
      readCompleteCount: 31,
      minutesAgo: 540,
    }),
    makeArticle({
      id: "a_10",
      title: "新規事業の『仮説』が増えすぎたときの整理術",
      slug: "newbiz-hypothesis-cleanup",
      excerpt: "仮説が増えるのは良い兆候。ただし整理の型が必要です。",
      outline: "- 何が起きるか\n- 整理の型\n- 実行計画\n- まとめ",
      tagIds: ["t_cat_business"],
      readCompleteCount: 6,
      minutesAgo: 600,
    }),
    makeArticle({
      id: "a_11",
      title: "景気後退局面で強い企業がやっている『固定費の扱い』",
      slug: "recession-fixed-costs",
      excerpt: "固定費を削る前に、まずは構造を見える化します。",
      outline: "- 構造\n- 先行指標\n- 実務の手順\n- まとめ",
      tagIds: ["t_cat_economy", "t_cat_business"],
      readCompleteCount: 13,
      minutesAgo: 660,
    }),
    makeArticle({
      id: "a_12",
      title: "働き方改革の次に来る『評価』のアップデート",
      slug: "workstyle-performance-review",
      excerpt: "制度より先に、評価の言語を揃える必要があります。",
      outline: "- なぜ今\n- 失敗例\n- 言語の揃え方\n- まとめ",
      tagIds: ["t_cat_workstyle"],
      readCompleteCount: 8,
      minutesAgo: 720,
    }),
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
