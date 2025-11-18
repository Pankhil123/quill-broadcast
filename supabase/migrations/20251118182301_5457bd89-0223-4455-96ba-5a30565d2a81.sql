-- Create enum for banner types
CREATE TYPE public.banner_type AS ENUM ('hero', 'top', 'interstitial', 'sidebar');

-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_type public.banner_type NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  section TEXT, -- null means all pages, specific section means only that section
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banners
CREATE POLICY "Anyone can view active banners"
  ON public.banners
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage banners"
  ON public.banners
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add is_sponsored field to articles table
ALTER TABLE public.articles 
ADD COLUMN is_sponsored BOOLEAN NOT NULL DEFAULT false;

-- Create trigger for banners updated_at
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();