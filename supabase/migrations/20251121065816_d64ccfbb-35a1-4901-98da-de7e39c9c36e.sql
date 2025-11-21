-- Drop existing banner_type enum if it exists
DROP TYPE IF EXISTS public.banner_type CASCADE;

-- Create banner_type enum with new values
CREATE TYPE public.banner_type AS ENUM ('hero', 'header', 'interstitial');

-- Create banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  banner_type public.banner_type NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  section TEXT, -- null means all pages, specific section targets that section
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Admins can manage all banners
CREATE POLICY "Admins can manage banners"
  ON public.banners
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
  ON public.banners
  FOR SELECT
  USING (active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();