import Link from "next/link";
import Image from "next/image";

import type { PublicArticleCard } from "@/components/public/types";

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
    const paragraphs: string[] = [];
    for (const b of blocks) {
      if (b.type !== "paragraph") continue;
      const text = (b.content ?? [])
        .map((n) => (n.type === "text" ? n.text ?? "" : ""))
        .join("");
      if (text.trim()) paragraphs.push(text);
    }
    return paragraphs;
  } catch {
    return [];
  }
}

function renderContentFromPlainText(contentText: string) {
  const parts = contentText.split("\n\n");
  return parts.map((part, index) => {
    if (!part.trim()) return null;

    if (part.startsWith("# ")) {
      return (
        <h2
          key={index}
          className="mt-12 mb-5 border-t border-gray-200 pt-8 text-2xl sm:text-3xl"
          style={{ lineHeight: "1.6" }}
        >
          {part.replace("# ", "")}
        </h2>
      );
    }

    if (part.startsWith("## ")) {
      return (
        <h3
          key={index}
          className="mt-10 mb-4 border-t border-gray-200 pt-8 text-xl sm:text-2xl"
          style={{ lineHeight: "1.7" }}
        >
          {part.replace("## ", "")}
        </h3>
      );
    }

    const trimmed = part.trim();

    if (trimmed.startsWith(">")) {
      const quote = trimmed
        .split("\n")
        .map((line) => line.replace(/^>\s?/, ""))
        .join("\n")
        .trim();

      return (
        <blockquote
          key={index}
          className="mb-6 border-l-2 border-gray-300 pl-4 text-gray-700"
          style={{ lineHeight: "2" }}
        >
          <p className="whitespace-pre-wrap">{quote}</p>
        </blockquote>
      );
    }

    const lines = trimmed.split("\n");
    const isDashList = lines.length >= 2 && lines.every((l) => l.trim().startsWith("- "));
    if (isDashList) {
      const items = lines.map((l) => l.trim().replace(/^-\s+/, "").trim()).filter(Boolean);
      return (
        <ul key={index} className="mb-6 list-disc pl-6 text-gray-800" style={{ lineHeight: "2" }}>
          {items.map((item, i) => (
            <li key={i} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="mb-6 whitespace-pre-wrap text-gray-800" style={{ lineHeight: "2" }}>
        {part}
      </p>
    );
  });
}

interface BunkoArticleDetailProps {
  article: PublicArticleCard;
  contentJsonString: string;
  relatedArticles: PublicArticleCard[];
  backHref: string;
}

export function BunkoArticleDetail({ article, contentJsonString, relatedArticles, backHref }: BunkoArticleDetailProps) {
  const paragraphs = extractPlainParagraphs(contentJsonString);
  const contentParagraphs = paragraphs.filter((p, idx) => {
    if (idx !== 0) return true;
    return p.trim() !== article.title.trim();
  });
  const plainText = contentParagraphs.join("\n\n");
  const fallbackImage = "/placeholder-news.svg";

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="mb-8">
        <Link
          href={backHref}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          ← トップに戻る
        </Link>
      </div>

      <article>
        <header className="mb-12 border-b border-gray-200 pb-8">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-8 -mx-6 sm:mx-0">
              <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                <Image
                  src={article.imageUrl || fallbackImage}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            </div>
            <h1 className="mb-6 text-3xl" style={{ lineHeight: "1.6" }}>
              {article.title}
            </h1>
            <p className="mb-6 text-lg text-gray-600" style={{ lineHeight: "1.8" }}>
              {article.summary}
            </p>
            <div
              className="flex gap-4 text-sm text-gray-500"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.category}</span>
              <span>·</span>
              <span>{article.author}</span>
            </div>
          </div>
        </header>

        <div className="mx-auto mb-8 max-w-[760px]">
          <p
            className="border-l-2 border-gray-300 pl-4 text-sm text-gray-500"
            style={{ lineHeight: "1.7" }}
          >
            この記事は{article.category}分野における最新の動向を整理したものです
          </p>
        </div>

        <div className="mx-auto mb-16 max-w-[760px]">
          {contentParagraphs.length > 0 ? (
            renderContentFromPlainText(plainText)
          ) : (
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">{contentJsonString}</pre>
          )}
        </div>

        {relatedArticles.length > 0 && (
          <div className="mx-auto mb-16 max-w-[760px] border-t border-gray-200 pt-8">
            <h3 className="mb-6 text-sm text-gray-700">あわせて読みたい記事</h3>
            <div className="space-y-4">
              {relatedArticles.slice(0, 2).map((related) => (
                <Link
                  key={related.id}
                  href={related.href}
                  className="block text-left"
                >
                  <p className="text-gray-900 underline hover:text-gray-700" style={{ lineHeight: "1.7" }}>
                    {related.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div className="mx-auto max-w-[760px] border-t border-gray-300 pt-12">
            <h3 className="mb-8 border-b border-gray-200 pb-2">関連記事</h3>
            <div className="space-y-6">
              {relatedArticles.map((related) => (
                <article key={related.id} className="border-b border-gray-100 pb-6">
                  <Link href={related.href} className="block text-left">
                    <h4 className="mb-2" style={{ lineHeight: "1.7" }}>
                      {related.title}
                    </h4>
                    <p className="text-gray-600" style={{ lineHeight: "1.8" }}>
                      {related.summary}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto mt-16 max-w-[760px] border-t border-gray-200 pt-8">
          <p className="mb-2 text-sm text-gray-600">最新記事をメールでお届けします</p>
          <a href="#" className="text-sm text-gray-900 underline hover:text-gray-700">
            メールマガジン登録はこちら
          </a>
        </div>
      </article>
    </div>
  );
}
