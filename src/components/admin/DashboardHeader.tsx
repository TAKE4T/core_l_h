"use client";

interface DashboardHeaderProps {
  userName: string;
  planLabel: string;
  onLogout?: () => void;
}

export function DashboardHeader({ userName, planLabel, onLogout }: DashboardHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-gray-900">記事制作ツール</div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{userName}</span>
            <span>{planLabel}</span>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => onLogout?.()}
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
