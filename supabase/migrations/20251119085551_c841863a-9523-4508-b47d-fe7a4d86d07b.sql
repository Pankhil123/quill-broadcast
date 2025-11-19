-- Add views_count, likes_count, and author_name to articles table
ALTER TABLE public.articles 
ADD COLUMN views_count integer NOT NULL DEFAULT 0,
ADD COLUMN likes_count integer NOT NULL DEFAULT 0,
ADD COLUMN author_name text;