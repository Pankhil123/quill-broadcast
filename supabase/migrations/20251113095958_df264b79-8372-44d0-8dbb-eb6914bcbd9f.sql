-- Add section column to articles table
ALTER TABLE public.articles 
ADD COLUMN section text NOT NULL DEFAULT 'general';

-- Add a check constraint to ensure valid sections
ALTER TABLE public.articles
ADD CONSTRAINT valid_section CHECK (section IN ('politics', 'business', 'technology', 'sports', 'entertainment', 'world', 'health', 'opinion', 'general'));