export type PublicArticleCard = {
  id: string;
  href: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  author: string;
  imageUrl?: string;
  featured?: boolean;
  readCompleteCount: number;
};
