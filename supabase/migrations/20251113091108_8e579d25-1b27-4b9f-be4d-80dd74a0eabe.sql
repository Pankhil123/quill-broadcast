-- Add scheduled_at column to articles table
ALTER TABLE public.articles 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true);

-- Create policies for article image uploads
CREATE POLICY "Authenticated users can upload article images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view article images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can update their article images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete article images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);