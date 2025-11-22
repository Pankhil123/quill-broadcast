-- Create article_likes table to track user likes
CREATE TABLE IF NOT EXISTS public.article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Enable RLS
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all likes
CREATE POLICY "Anyone can view likes"
  ON public.article_likes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own likes
CREATE POLICY "Registered users can like articles"
  ON public.article_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own likes
CREATE POLICY "Users can unlike articles"
  ON public.article_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX idx_article_likes_user_id ON public.article_likes(user_id);