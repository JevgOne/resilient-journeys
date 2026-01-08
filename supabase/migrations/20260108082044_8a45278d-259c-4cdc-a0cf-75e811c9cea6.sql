-- Create enum for membership types
CREATE TYPE public.membership_type AS ENUM ('free', 'basic', 'premium');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  membership_type membership_type NOT NULL DEFAULT 'free',
  membership_started_at TIMESTAMP WITH TIME ZONE,
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create video_categories table
CREATE TABLE public.video_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  month_number INTEGER NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.video_categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  is_free BOOLEAN NOT NULL DEFAULT false,
  min_membership membership_type NOT NULL DEFAULT 'basic',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_magnets table for email signups
CREATE TABLE public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'website'
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for video_categories (public read)
CREATE POLICY "Anyone can view video categories"
  ON public.video_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage video categories"
  ON public.video_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for videos
CREATE POLICY "Anyone can view free videos"
  ON public.videos FOR SELECT
  USING (is_free = true);

CREATE POLICY "Members can view videos based on membership"
  ON public.videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND (
        (videos.min_membership = 'basic' AND profiles.membership_type IN ('basic', 'premium'))
        OR (videos.min_membership = 'premium' AND profiles.membership_type = 'premium')
      )
      AND (profiles.membership_expires_at IS NULL OR profiles.membership_expires_at > now())
    )
  );

CREATE POLICY "Admins can manage all videos"
  ON public.videos FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lead_magnets
CREATE POLICY "Anyone can insert lead magnets"
  ON public.lead_magnets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view lead magnets"
  ON public.lead_magnets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample video categories (12 months program)
INSERT INTO public.video_categories (name, description, month_number, icon) VALUES
  ('Sebepřijetí', 'Základy sebelásky a přijetí vlastní jedinečnosti', 1, 'heart'),
  ('Emoční inteligence', 'Rozpoznávání a práce s emocemi', 2, 'brain'),
  ('Stres management', 'Techniky zvládání stresu a úzkosti', 3, 'shield'),
  ('Kreativní vyjádření', 'Art terapie a kreativní techniky', 4, 'palette'),
  ('Mindfulness', 'Přítomný okamžik a meditace', 5, 'eye'),
  ('Vztahy a hranice', 'Zdravé vztahy a osobní hranice', 6, 'users'),
  ('Vnitřní síla', 'Budování mentální odolnosti', 7, 'zap'),
  ('Adaptace', 'Zvládání změn a nových situací', 8, 'compass'),
  ('Sebeúčinnost', 'Víra ve vlastní schopnosti', 9, 'target'),
  ('Komunita', 'Budování podpůrné sítě', 10, 'globe'),
  ('Vděčnost', 'Praktiky vděčnosti a pozitivity', 11, 'sun'),
  ('Integrace', 'Propojení všech naučených dovedností', 12, 'puzzle');