import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { CategoryNav } from '@/components/CategoryNav';
import { BannerDisplay } from '@/components/BannerDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const SECTIONS = [
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'sports', name: 'Sports' },
  { id: 'general', name: 'General' },
];

const ARTICLES_PER_PAGE = 12; // 4 rows × 3 columns

export default function SectionArticles() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = SECTIONS.find(s => s.id === sectionId);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['section-articles', sectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('section', sectionId)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!sectionId,
  });

  if (!section) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-news-heading mb-4">Section Not Found</h1>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <BannerDisplay type="top" section={sectionId} />
      
      <main className="container mx-auto px-4 py-8">
        <BannerDisplay type="hero" section={sectionId} />
        
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-news-heading mb-2">
            {section.name}
          </h1>
          <p className="text-news-meta">
            All articles in {section.name.toLowerCase()}
          </p>
        </div>

        <CategoryNav activeSection={sectionId} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles
                .slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)
                .map((article) => (
                  <ArticleCard 
                    key={article.id}
                    id={article.id}
                    slug={article.slug}
                    title={article.title}
                    excerpt={article.excerpt}
                    featuredImage={article.featured_image_url || undefined}
                    publishedAt={article.published_at || ''}
                    isSponsored={article.is_sponsored || false}
                  />
                ))}
            </div>

            <BannerDisplay type="interstitial" section={sectionId} />

            {articles.length > ARTICLES_PER_PAGE && (
              <Pagination className="mt-12">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.ceil(articles.length / ARTICLES_PER_PAGE) }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(articles.length / ARTICLES_PER_PAGE), prev + 1))}
                      className={currentPage === Math.ceil(articles.length / ARTICLES_PER_PAGE) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-news-meta text-lg">
              No articles found in this section yet.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
