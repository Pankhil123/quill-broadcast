import { useParams, Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';
import { CategoryNav } from '@/components/CategoryNav';
import { Footer } from '@/components/Footer';
import { Calendar, User, ArrowLeft, Lock, Eye, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import defaultImage from '@/assets/default-news-image.jpg';
import { useEffect, useState } from 'react';

const ARTICLE_VIEW_KEY = 'articleViewCount';
const FREE_ARTICLE_LIMIT = 3;

export default function ArticleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [viewCount, setViewCount] = useState(0);

  // Track article views for non-authenticated users
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(ARTICLE_VIEW_KEY);
      const count = stored ? parseInt(stored, 10) : 0;
      setViewCount(count);
    }
  }, [user]);

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      return data?.map(r => r.role) || [];
    },
    enabled: !!user
  });

  const isPaidReader = userRoles?.includes('paid_reader');
  const isRegisteredReader = userRoles?.includes('registered_reader');

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

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

  // Increment view count for non-authenticated users
  useEffect(() => {
    if (article && !user && viewCount < FREE_ARTICLE_LIMIT) {
      const newCount = viewCount + 1;
      localStorage.setItem(ARTICLE_VIEW_KEY, newCount.toString());
      setViewCount(newCount);
    }
  }, [article, user, viewCount]);

  if (error) {
    return <Navigate to="/" />;
  }

  // Determine access level
  const canViewFullArticle = () => {
    // Admins and reporters can see everything
    if (userRoles?.includes('admin') || userRoles?.includes('reporter')) {
      return true;
    }

    // Paid readers can see everything
    if (isPaidReader) {
      return true;
    }

    // Free articles: everyone can see (authenticated or first 3 views for non-authenticated)
    if (article?.article_type === 'free') {
      if (user) return true; // Authenticated users can see all free articles
      return viewCount <= FREE_ARTICLE_LIMIT; // Non-authenticated: first 3 views
    }

    // Paid articles: only paid readers
    return false;
  };

  const showPaywallMessage = () => {
    if (!article) return null;

    const isFreeArticle = article.article_type === 'free';
    const hasExceededLimit = !user && viewCount > FREE_ARTICLE_LIMIT;

    // Show paywall for non-authenticated users who exceeded the limit
    if (hasExceededLimit && isFreeArticle) {
      return (
        <Card className="p-8 text-center bg-muted/50 mt-8">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-4">Create an account to continue reading</h3>
          <p className="text-muted-foreground mb-6">
            You've reached your limit of {FREE_ARTICLE_LIMIT} free articles. Sign up to access unlimited free content.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Sign Up Free</Link>
          </Button>
        </Card>
      );
    }

    // Show paywall for registered readers trying to access paid content
    if (article.article_type === 'paid' && isRegisteredReader && !isPaidReader) {
      return (
        <Card className="p-8 text-center bg-muted/50 mt-8">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-4">This article requires a paid subscription</h3>
          <p className="text-muted-foreground mb-6">
            Upgrade to a paid subscription to access premium content across the website.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Upgrade to Premium</Link>
          </Button>
        </Card>
      );
    }

    // Non-authenticated users trying to access paid content
    if (article.article_type === 'paid' && !user) {
      return (
        <Card className="p-8 text-center bg-muted/50 mt-8">
          <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-4">Premium Article</h3>
          <p className="text-muted-foreground mb-6">
            This is a premium article. Sign up and subscribe to access exclusive content.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Sign Up & Subscribe</Link>
          </Button>
        </Card>
      );
    }

    return null;
  };

  const getArticleContent = () => {
    if (canViewFullArticle()) {
      return article?.content;
    }

    // Show partial content (first 200 characters)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article?.content || '';
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const preview = text.substring(0, 200) + '...';
    return `<p>${preview}</p>`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to articles
            </Link>
          </Button>

          <CategoryNav activeSection={article?.section} />

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

              <div className="flex items-center gap-6 text-news-meta mb-8 pb-8 border-b border-news-divider flex-wrap">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(article.published_at), 'MMMM d, yyyy')}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {(article.views_count || 0).toLocaleString()} views
                </span>
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  {(article.likes_count || 0).toLocaleString()} likes
                </span>
                {article.author_name && (
                  <span className="flex items-center gap-2 italic">
                    <User className="h-5 w-5" />
                    By {article.author_name}
                  </span>
                )}
                {article.article_type === 'paid' && (
                  <span className="flex items-center gap-2 text-primary font-semibold">
                    <Lock className="h-4 w-4" />
                    Premium
                  </span>
                )}
              </div>

            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.featured_image_url || defaultImage}
                alt={article.title}
                className="w-full"
              />
            </div>

              <div 
                className="prose prose-lg max-w-none text-news-body"
                dangerouslySetInnerHTML={{ __html: getArticleContent() }}
              />

              {showPaywallMessage()}
            </article>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
