import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, CalendarIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ArticleEditor() {
  const { id } = useParams();
  const { user, isReporter } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [section, setSection] = useState<string>('general');
  const [articleType, setArticleType] = useState<'free' | 'paid'>('free');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Word counter helper
  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  };

  const wordCount = getWordCount(content);
  const wordLimit = 2000;

  useEffect(() => {
    if (!user || !isReporter) {
      navigate('/auth');
    }
  }, [user, isReporter, navigate]);

  const { data: article } = useQuery({
    queryKey: ['article-edit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setExcerpt(article.excerpt);
      setContent(article.content);
      setFeaturedImage(article.featured_image_url || '');
      setStatus(article.status as 'draft' | 'published' | 'scheduled');
      setSection(article.section || 'general');
      setArticleType((article.article_type as 'free' | 'paid') || 'free');
      if (article.scheduled_at) {
        setScheduledDate(new Date(article.scheduled_at));
      }
    }
  }, [article]);

  useEffect(() => {
    if (title && !id) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Upload featured image if file is selected
      let imageUrl = featuredImage;
      if (featuredImageFile) {
        const fileExt = featuredImageFile.name.split('.').pop();
        const fileName = `featured-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(fileName, featuredImageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('article-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      // Ensure slug is unique by checking for duplicates
      let uniqueSlug = slug;
      if (!id) {
        const { data: existingArticle } = await supabase
          .from('articles')
          .select('slug')
          .eq('slug', slug)
          .single();

        if (existingArticle) {
          // Append a random suffix to make slug unique
          uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }
      }

      const articleData = {
        title,
        slug: uniqueSlug,
        excerpt,
        content,
        featured_image_url: imageUrl || null,
        status,
        section,
        article_type: articleType,
        author_id: user.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
        scheduled_at: status === 'scheduled' && scheduledDate ? scheduledDate.toISOString() : null
      };

      if (id) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(id ? 'Article updated!' : 'Article created!');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      navigate('/admin');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  if (!user || !isReporter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{id ? 'Edit Article' : 'Create New Article'}</CardTitle>
              <CardDescription>
                Fill in the details below to {id ? 'update' : 'create'} your article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="article-url-slug"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary of the article"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content *</Label>
                    <span className={cn(
                      "text-sm",
                      wordCount > wordLimit ? "text-destructive font-semibold" : "text-muted-foreground"
                    )}>
                      {wordCount} / {wordLimit} words
                    </span>
                  </div>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                  />
                  {wordCount > wordLimit && (
                    <p className="text-sm text-destructive">
                      Article exceeds the recommended word limit of {wordLimit} words.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="image-url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="Enter image URL"
                      type="url"
                    />
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">or</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      {featuredImageFile && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{featuredImageFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFeaturedImageFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFeaturedImageFile(file);
                          setFeaturedImage('');
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section *</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="politics">Politics</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="world">World</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="opinion">Opinion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="articleType">Article Type *</Label>
                  <Select value={articleType} onValueChange={(value: 'free' | 'paid') => setArticleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free - Available to all registered users</SelectItem>
                      <SelectItem value="paid">Paid - Requires paid subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: 'draft' | 'published' | 'scheduled') => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Publish Now</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label>Schedule Date & Time *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, "PPP 'at' p") : "Pick a date and time"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                        {scheduledDate && (
                          <div className="p-3 border-t">
                            <Label className="text-sm">Time</Label>
                            <Input
                              type="time"
                              value={scheduledDate ? format(scheduledDate, 'HH:mm') : ''}
                              onChange={(e) => {
                                if (scheduledDate) {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date(scheduledDate);
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  setScheduledDate(newDate);
                                }
                              }}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : (id ? 'Update Article' : 'Create Article')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
