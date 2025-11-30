import { Link } from 'react-router-dom';
import { Calendar, Eye, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import defaultImage from '@/assets/default-news-image.jpg';

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  isSponsored?: boolean;
  viewsCount?: number;
  likesCount?: number;
  authorName?: string;
}

export function ArticleCard({
  id,
  slug,
  title,
  excerpt,
  featuredImage,
  publishedAt,
  isSponsored = false,
  viewsCount = 0,
  likesCount = 0,
  authorName
}: ArticleCardProps) {
  return (
    <Link to={`/article/${slug}`} className="group block">
      <article className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-muted relative">
          <img
            src={featuredImage || defaultImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isSponsored && (
            <div className="absolute top-2 right-2 bg-background/90 px-2 py-0.5 rounded text-[10px] text-muted-foreground uppercase tracking-wide">
              Sponsored
            </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-news-heading mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="text-news-body mb-4 flex-1 line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-news-meta flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(publishedAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {viewsCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {likesCount.toLocaleString()}
            </span>
            {authorName && (
              <span className="text-xs italic">
                By {authorName}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
