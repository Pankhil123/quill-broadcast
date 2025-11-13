-- Drop the existing app_role type and recreate it with new roles
DROP TYPE IF EXISTS public.app_role CASCADE;

CREATE TYPE public.app_role AS ENUM ('reader', 'registered_reader', 'paid_reader', 'reporter', 'admin');

-- Recreate the user_roles table with the new enum
DROP TABLE IF EXISTS public.user_roles CASCADE;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Update articles table RLS policies
DROP POLICY IF EXISTS "Admins and reporters can create articles" ON public.articles;
DROP POLICY IF EXISTS "Admins and reporters can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Authors and admins can update articles" ON public.articles;
DROP POLICY IF EXISTS "Only admins can delete articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;

CREATE POLICY "Admins and reporters can create articles"
  ON public.articles
  FOR INSERT
  WITH CHECK (
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reporter'))
    AND author_id = auth.uid()
  );

CREATE POLICY "Admins and reporters can view all articles"
  ON public.articles
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reporter'));

CREATE POLICY "Anyone can view published articles"
  ON public.articles
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors and admins can update articles"
  ON public.articles
  FOR UPDATE
  USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete articles"
  ON public.articles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));