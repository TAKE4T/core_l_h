"use client";

export type AdminTab = "cla" | "title" | "article";

interface TabNavigationProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: AdminTab; label: string }[] = [
    { id: "cla", label: "CLA" },
    { id: "title", label: "タイトル" },
    { id: "article", label: "記事" },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative py-4 transition-colors ${
                activeTab === tab.id ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
