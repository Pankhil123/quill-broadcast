-- First, drop the old section constraint
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS valid_section;

-- Update existing articles to new section names
UPDATE public.articles SET section = 'commodities' WHERE section = 'business';
UPDATE public.articles SET section = 'others' WHERE section IN ('politics', 'general', 'technology', 'sports', 'entertainment', 'world', 'health', 'opinion');

-- Add new constraint with updated sections
ALTER TABLE public.articles
ADD CONSTRAINT valid_section CHECK (section IN ('commodities', 'cryptocurrencies', 'indices', 'equities', 'others'));