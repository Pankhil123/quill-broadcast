import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { UserManagement } from '@/components/UserManagement';
import { BannerManagement } from '@/components/BannerManagement';
import { EmailTemplateManagement } from '@/components/EmailTemplateManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const { user, isReporter, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    if (!user || !isReporter) {
      navigate('/auth');
    }
  }, [user, isReporter, navigate]);

  const { data: articles } = useQuery({
    queryKey: ['admin-articles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && isReporter
  });

  if (!user || !isReporter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin Dashboard"
        description="ToadToe admin dashboard - Manage articles, users, banners, and content."
        keywords="admin, dashboard, content management, ToadToe admin"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-news-heading mb-2">Dashboard</h1>
              <p className="text-news-meta">Manage your articles and content</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/admin/editor">
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Link>
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={isAdmin ? "grid w-full grid-cols-4 mb-8" : "grid w-full grid-cols-1 mb-8"}>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              {isAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
              {isAdmin && <TabsTrigger value="banners">Banners</TabsTrigger>}
              {isAdmin && <TabsTrigger value="email-templates">Email Templates</TabsTrigger>}
            </TabsList>

            <TabsContent value="articles">
              <Card>
                <CardHeader>
                  <CardTitle>Your Articles</CardTitle>
                  <CardDescription>
                    View and manage all your published and draft articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {articles && articles.length > 0 ? (
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/admin/editor/${article.id}`}
                          className="block p-4 border border-border rounded-lg hover:bg-news-hover transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-news-heading">
                                  {article.title}
                                </h3>
                                <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                  {article.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-news-meta mb-2 line-clamp-2">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-news-meta">
                                <span>
                                  Created: {format(new Date(article.created_at), 'MMM d, yyyy')}
                                </span>
                                {article.published_at && (
                                  <span>
                                    Published: {format(new Date(article.published_at), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <FileText className="h-5 w-5 text-news-meta flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-news-meta mx-auto mb-4" />
                      <p className="text-news-meta mb-4">
                        You haven't created any articles yet.
                      </p>
                      <Button asChild>
                        <Link to="/admin/editor">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Article
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            )}
            
            {isAdmin && (
              <TabsContent value="banners">
                <BannerManagement />
              </TabsContent>
            )}
            
            {isAdmin && (
              <TabsContent value="email-templates">
                <EmailTemplateManagement />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
