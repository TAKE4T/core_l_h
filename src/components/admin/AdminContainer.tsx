import type { ReactNode } from "react";

export function AdminContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1200px] px-6 py-8">{children}</div>;
}
