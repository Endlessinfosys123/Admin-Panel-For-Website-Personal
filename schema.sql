-- Schema for Tishykumar Patel Admin Panel

-- BLOGS TABLE
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES auth.users(id)
);

-- GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0
);

-- ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE,
  icon TEXT,
  display_order INTEGER DEFAULT 0
);

-- GOALS TABLE
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  deadline DATE
);

-- MESSAGES TABLE (Contact Form)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false
);

-- USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin'
);

-- Trigger to create profile when auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES (Simplified for Admin access)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) full access
CREATE POLICY "Admin full access blogs" ON public.blogs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access gallery" ON public.gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access achievements" ON public.achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access goals" ON public.goals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Allow public read access to most except messages
CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public read goals" ON public.goals FOR SELECT USING (true);

-- FUTURE PLANS TABLE (Roadmap)
CREATE TABLE IF NOT EXISTS public.future_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_completed BOOLEAN DEFAULT false
);

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  action TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  module TEXT
);

-- Enable RLS
ALTER TABLE public.future_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin full access future_plans" ON public.future_plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read audit_logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read future_plans" ON public.future_plans FOR SELECT USING (true);
