import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/admin/DashboardHeader";

interface DashboardPageProps {
  userName: string;
  planLabel: string;
  children: ReactNode;
}

export function DashboardPage({ userName, planLabel, children }: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 font-admin">
      <DashboardHeader userName={userName} planLabel={planLabel} />
      {children}
    </main>
  );
}
