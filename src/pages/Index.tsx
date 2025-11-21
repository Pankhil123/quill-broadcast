import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { CategoryNav } from '@/components/CategoryNav';
import { BannerDisplay } from '@/components/BannerDisplay';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';

const SECTIONS = [
  { id: 'commodities', name: 'Commodities' },
  { id: 'cryptocurrencies', name: 'Cryptocurrencies' },
  { id: 'indices', name: 'Indices' },
  { id: 'equities', name: 'Equities' },
  { id: 'others', name: 'Others' }
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
          section,
          is_sponsored,
          views_count,
          likes_count,
          author_name
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      return data;
    }
  });

  // Group articles by section
  const articlesBySection = articles?.reduce((acc, article) => {
    const section = article.section || 'others';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(article);
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <BannerDisplay type="header" />
      
      <main className="container mx-auto px-4 py-12">
        <BannerDisplay type="hero" />
        
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-bold text-news-heading mb-4">
            Pattern Analysis and Opportunities
          </h1>
          <p className="text-xl text-news-body">
            Stay informed with our latest Patterns and in-depth Analysis
          </p>
        </div>

        <CategoryNav />

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
                        isSponsored={article.is_sponsored || false}
                        viewsCount={article.views_count || 0}
                        likesCount={article.likes_count || 0}
                        authorName={article.author_name || undefined}
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
                   
                   <BannerDisplay type="interstitial" section={section.id} />
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
      
      <Footer />
    </div>
  );
}
