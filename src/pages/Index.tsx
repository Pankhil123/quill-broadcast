import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';

const SECTIONS = [
  { id: 'politics', name: 'Politics' },
  { id: 'business', name: 'Business' },
  { id: 'technology', name: 'Technology' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'world', name: 'World' },
  { id: 'health', name: 'Health' },
  { id: 'opinion', name: 'Opinion' },
  { id: 'general', name: 'General' }
];

export default function Index() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['published-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          author_id,
          section
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      return data;
    }
  });

  // Group articles by section
  const articlesBySection = articles?.reduce((acc, article) => {
    const section = article.section || 'general';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-bold text-news-heading mb-4">
            Latest News & Stories
          </h1>
          <p className="text-xl text-news-body">
            Stay informed with our latest articles and in-depth reporting
          </p>
        </div>

        {/* Category Navigation */}
        <nav className="max-w-6xl mx-auto mb-12">
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {SECTIONS.map((section) => (
                <Link
                  key={section.id}
                  to={`/section/${section.id}`}
                  className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                >
                  {section.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {isLoading ? (
          <div className="space-y-16 max-w-6xl mx-auto">
            {[...Array(3)].map((_, sectionIdx) => (
              <div key={sectionIdx} className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-video w-full" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="space-y-16 max-w-6xl mx-auto">
            {SECTIONS.map((section) => {
              const sectionArticles = articlesBySection?.[section.id] || [];
              
              if (sectionArticles.length === 0) return null;
              
              const displayedArticles = sectionArticles.slice(0, 6);
              const hasMore = sectionArticles.length > 6;
              
              return (
                <section key={section.id} className="space-y-6">
                  <div className="border-b border-border pb-3">
                    <h2 className="text-3xl font-bold text-news-heading capitalize">
                      {section.name}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedArticles.map((article) => (
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
                  
                  {hasMore && (
                    <div className="text-center pt-4">
                      <Link 
                        to={`/section/${section.id}`}
                        className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-lg"
                      >
                        More from {section.name} →
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-news-meta">
              No published articles yet. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
