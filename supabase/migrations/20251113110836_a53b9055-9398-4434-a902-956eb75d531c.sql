-- Add article_type column to articles table
ALTER TABLE public.articles 
ADD COLUMN article_type TEXT NOT NULL DEFAULT 'free'
CHECK (article_type IN ('free', 'paid'));

-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reader';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'registered_reader';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'paid_reader';

-- Update RLS policy for article viewing to consider article_type
-- Drop existing policy and recreate with new logic
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;

-- Anyone can view published FREE articles
CREATE POLICY "Anyone can view published free articles"
ON public.articles
FOR SELECT
USING (status = 'published' AND article_type = 'free');

-- Paid readers can view all published articles
CREATE POLICY "Paid readers can view all published articles"
ON public.articles
FOR SELECT
USING (status = 'published' AND has_role(auth.uid(), 'paid_reader'));

-- Registered readers can view published free articles (covered by first policy)
-- Admins and reporters can still view all articles (covered by existing policy)