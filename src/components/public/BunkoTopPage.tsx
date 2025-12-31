import Link from "next/link";
import Image from "next/image";

import type { PublicArticleCard } from "@/components/public/types";

interface BunkoTopPageProps {
  articles: PublicArticleCard[];
  ranking: PublicArticleCard[];
}

export function BunkoTopPage({ articles, ranking }: BunkoTopPageProps) {
  const topArticle = articles[0] ?? null;
  const newArticles = articles.slice(1, 9);
  const featuredArticles = articles.filter((a) => a.featured).slice(0, 4);
  const rankingArticles = ranking.length > 0 ? ranking : articles.slice(0, 10);

  const fallbackImage = "/placeholder-news.svg";

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
        <div className="flex-1 lg:max-w-[800px]">
          {topArticle && (
            <section className="mb-12">
              <article className="border-b border-gray-200 pb-8">
                <Link href={topArticle.href} className="block text-left w-full">
                  <div className="mb-4">
                    <div className="relative h-64 w-full overflow-hidden bg-gray-100 sm:h-80 lg:h-96">
                      <Image
                        src={topArticle.imageUrl || fallbackImage}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 1200px) 100vw, 800px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <span
                      className="inline-block bg-gray-900 px-2 py-1 text-xs text-white"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {topArticle.category}
                    </span>
                  </div>
                  <div
                    className="mb-2 text-xs text-gray-500"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {topArticle.date} / {topArticle.author}
                  </div>
                  <h2 className="mb-3 text-2xl" style={{ lineHeight: "1.6" }}>
                    {topArticle.title}
                  </h2>
                  <p className="text-gray-600" style={{ lineHeight: "1.8" }}>
                    {topArticle.summary}
                  </p>
                </Link>
              </article>
            </section>
          )}

          <section className="mb-12">
            <h2 className="mb-6 border-b-2 border-gray-900 pb-2">新着記事</h2>
            {newArticles.length === 0 ? (
              <p className="text-sm text-gray-600" style={{ lineHeight: "1.7" }}>
                まだ公開記事がありません。
              </p>
            ) : (
              <div className="space-y-6">
                {newArticles.map((article) => (
                  <article key={article.id} className="border-b border-gray-100 pb-6">
                    <Link
                      href={article.href}
                      className="flex w-full flex-col gap-4 text-left sm:flex-row"
                    >
                      <div className="h-48 w-full flex-shrink-0 overflow-hidden bg-gray-100 sm:h-20 sm:w-32">
                        <Image
                          src={article.imageUrl || fallbackImage}
                          alt=""
                          width={640}
                          height={360}
                          sizes="(max-width: 640px) 100vw, 128px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1">
                          <span
                            className="text-xs text-gray-500"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {article.category}
                          </span>
                        </div>
                        <div
                          className="mb-2 text-xs text-gray-500"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {article.date} / {article.author}
                        </div>
                        <h3 className="mb-2" style={{ lineHeight: "1.7" }}>
                          {article.title}
                        </h3>
                        <p
                          className="line-clamp-2 text-sm text-gray-600"
                          style={{ lineHeight: "1.7" }}
                        >
                          {article.summary}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          {featuredArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 border-b-2 border-gray-900 pb-2">特集</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {featuredArticles.map((article) => (
                  <article key={article.id} className="border-b border-gray-100 pb-4">
                    <Link href={article.href} className="block w-full text-left">
                      <div className="mb-3">
                        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                          <Image
                            src={article.imageUrl || fallbackImage}
                            alt=""
                            fill
                            sizes="(max-width: 1200px) 50vw, 400px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="mb-1">
                        <span
                          className="text-xs text-gray-500"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {article.category}
                        </span>
                      </div>
                      <div
                        className="mb-2 text-xs text-gray-500"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {article.date} / {article.author}
                      </div>
                      <h3 className="mb-2 text-sm" style={{ lineHeight: "1.7" }}>
                        {article.title}
                      </h3>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="w-full flex-shrink-0 lg:w-80">
          <div className="lg:sticky lg:top-8">
            <section>
              <h2 className="mb-6 border-b-2 border-gray-900 pb-2">ランキング</h2>
              {rankingArticles.length === 0 ? (
                <p className="text-sm text-gray-600" style={{ lineHeight: "1.7" }}>
                  まだ公開記事がありません。
                </p>
              ) : (
                <div className="space-y-4">
                  {rankingArticles.map((article, index) => (
                    <article key={article.id} className="border-b border-gray-100 pb-4">
                      <Link href={article.href} className="flex w-full gap-3 text-left">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-gray-900 text-white"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm" style={{ lineHeight: "1.6" }}>
                            {article.title}
                          </h3>
                          <div
                            className="mt-1 text-xs text-gray-500"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {article.date}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
