/**
 * Article Grid Component
 * 
 * Responsive grid container for displaying article cards
 * Handles layout and spacing
 * 
 * @module components/home/ArticleGrid
 * @created 2026-01-20
 */

import { Article } from "@/types/article";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
  articles: Article[];
}

export const ArticleGrid = ({ articles }: ArticleGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};
