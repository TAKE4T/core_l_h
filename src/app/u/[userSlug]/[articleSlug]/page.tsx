import { notFound } from "next/navigation";

import { getOwnerByUserSlug, getPublishedArticleBySlug } from "@/lib/repo/inMemoryRepo";

export default async function ArticlePublicPage({
  params,
}: {
  params: Promise<{ userSlug: string; articleSlug: string }>;
}) {
  const { userSlug, articleSlug } = await params;

  const owner = getOwnerByUserSlug(userSlug);
  if (!owner) notFound();

  const article = getPublishedArticleBySlug({ ownerId: owner.id, articleSlug });
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="text-sm text-neutral-500">/u/{userSlug}/{article.slug}</div>

      <h1 className="mt-2 text-3xl font-bold leading-tight">{article.title}</h1>

      <p className="mt-4 text-neutral-700">{article.excerpt}</p>

      <hr className="my-8" />

      <section>
        <h2 className="text-lg font-semibold">content（TipTap JSON string）</h2>
        <pre className="mt-3 overflow-auto rounded bg-neutral-100 p-4 text-xs">
          {article.content}
        </pre>
      </section>

      <hr className="my-8" />

      <section className="text-sm text-neutral-600">
        <div>readCompleteCount: {article.readCompleteCount}</div>
        <div>edition: {article.edition}</div>
      </section>
    </main>
  );
}
