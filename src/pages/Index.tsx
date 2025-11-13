import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';

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
          author_id
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Fetch author emails
      const articlesWithAuthors = await Promise.all(
        data.map(async (article) => {
          const { data: userData } = await supabase.auth.admin.getUserById(
            article.author_id
          );
          return {
            ...article,
            authorEmail: userData?.user?.email
          };
        })
      );

      return articlesWithAuthors;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-bold text-news-heading mb-4">
            Latest News & Stories
          </h1>
          <p className="text-xl text-news-body">
            Stay informed with our latest articles and in-depth reporting
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt}
                featuredImage={article.featured_image_url || undefined}
                publishedAt={article.published_at || ''}
                authorEmail={article.authorEmail}
              />
            ))}
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
