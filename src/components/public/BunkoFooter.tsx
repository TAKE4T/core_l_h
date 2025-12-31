export function BunkoFooter() {
  const categories = [
    "経済",
    "ビジネス",
    "政治・経済",
    "働き方",
    "スタートアップ",
    "地方創生",
    "ESG",
    "教育",
  ];

  const links = ["会社概要", "プライバシーポリシー", "利用規約", "お問い合わせ"];

  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="mb-8">
          <h3 className="mb-4 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            カテゴリー
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category) => (
              <a key={category} href="#" className="text-sm text-gray-600 hover:text-gray-900">
                {category}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div
            className="mb-4 flex gap-6 text-sm text-gray-500"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {links.map((label) => (
              <a key={label} href="#" className="hover:text-gray-700">
                {label}
              </a>
            ))}
          </div>
          <p className="text-sm text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
            © {new Date().getFullYear()} 文庫オンライン All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
