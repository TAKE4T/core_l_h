import type { ReactNode } from "react";

export function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded bg-white p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <div className="text-gray-900">{title}</div>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
