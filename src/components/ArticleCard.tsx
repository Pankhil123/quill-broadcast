import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import defaultImage from '@/assets/default-news-image.jpg';

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  authorEmail?: string;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  featuredImage,
  publishedAt,
  authorEmail
}: ArticleCardProps) {
  return (
    <Link to={`/article/${slug}`} className="group">
      <article className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={featuredImage || defaultImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-news-heading mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="text-news-body mb-4 flex-1 line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-news-meta">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(publishedAt), 'MMM d, yyyy')}
            </span>
            {authorEmail && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {authorEmail.split('@')[0]}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
