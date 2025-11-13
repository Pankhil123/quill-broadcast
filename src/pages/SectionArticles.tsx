import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { CategoryNav } from '@/components/CategoryNav';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'world', name: 'World' },
  { id: 'health', name: 'Health' },
  { id: 'opinion', name: 'Opinion' },
  { id: 'general', name: 'General' },
];

export default function SectionArticles() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const section = SECTIONS.find(s => s.id === sectionId);

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
      <main className="container mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id}
                id={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                featuredImage={article.featured_image_url || undefined}
                publishedAt={article.published_at || ''}
              />
            ))}
          </div>
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
