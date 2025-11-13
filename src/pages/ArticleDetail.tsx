import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Fetch author email
      const { data: userData } = await supabase.auth.admin.getUserById(
        data.author_id
      );

      return {
        ...data,
        authorEmail: userData?.user?.email
      };
    },
    enabled: !!slug
  });

  if (error) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to articles
            </Link>
          </Button>

          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-12 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="aspect-video w-full" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : article ? (
            <article>
              <h1 className="text-5xl font-bold text-news-heading mb-6">
                {article.title}
              </h1>

              <div className="flex items-center gap-6 text-news-meta mb-8 pb-8 border-b border-news-divider">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(article.published_at), 'MMMM d, yyyy')}
                </span>
                {article.authorEmail && (
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {article.authorEmail.split('@')[0]}
                  </span>
                )}
              </div>

              {article.featured_image_url && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full"
                  />
                </div>
              )}

              <div className="prose prose-lg max-w-none text-news-body">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </main>
    </div>
  );
}
