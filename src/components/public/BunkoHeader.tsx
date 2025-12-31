"use client";

interface BunkoHeaderProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

export function BunkoHeader({
  currentCategory,
  onCategoryChange,
}: BunkoHeaderProps) {
  const categories = [
    "すべて",
    "経済",
    "ビジネス",
    "政治・経済",
    "働き方",
    "スタートアップ",
    "地方創生",
    "ESG",
    "教育",
  ];

  return (
    <header className="border-b border-gray-300">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="border-b border-gray-200 py-6">
          <button
            type="button"
            onClick={() => onCategoryChange("すべて")}
            className="text-3xl tracking-wide"
            style={{ fontFamily: "Noto Serif JP, serif" }}
          >
            文庫オンライン
          </button>
        </div>

        <nav className="py-3">
          <ul className="flex gap-6 overflow-x-auto">
            {categories.map((category) => (
              <li key={category} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`border-b-2 pb-3 text-sm transition-colors ${
                    currentCategory === category
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
