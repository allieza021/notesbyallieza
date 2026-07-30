-- ================================================================
-- Notes by Allieza — Supabase SQL Setup
-- Run each block in order in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query)
-- ================================================================

-- ── 1. Profiles Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  github_url TEXT,
  facebook_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Categories Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#4f46e5',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Blogs Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  reading_time_minutes INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Tags Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- ── 5. Blog Tags Junction Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- ── 6. Enable Row Level Security ─────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- ── 7. Profiles RLS Policies ─────────────────────────────────────
-- Anyone can view profiles
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT USING (true);

-- Only the owner can update their own profile
CREATE POLICY "Owner can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Only the owner can insert their own profile
CREATE POLICY "Owner can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 8. Blogs RLS Policies ────────────────────────────────────────
-- Anyone can read published blogs
CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT USING (is_published = TRUE);

-- Authenticated admin can read all blogs (including drafts)
CREATE POLICY "Admin can read all blogs"
  ON blogs FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can insert blogs
CREATE POLICY "Admin can insert blogs"
  ON blogs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update blogs
CREATE POLICY "Admin can update blogs"
  ON blogs FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete blogs
CREATE POLICY "Admin can delete blogs"
  ON blogs FOR DELETE USING (auth.role() = 'authenticated');

-- ── 9. Categories RLS Policies ───────────────────────────────────
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL USING (auth.role() = 'authenticated');

-- ── 10. Tags RLS Policies ────────────────────────────────────────
CREATE POLICY "Public can read tags"
  ON tags FOR SELECT USING (true);

CREATE POLICY "Admin can manage tags"
  ON tags FOR ALL USING (auth.role() = 'authenticated');

-- ── 11. Blog Tags RLS Policies ───────────────────────────────────
CREATE POLICY "Public can read blog_tags"
  ON blog_tags FOR SELECT USING (true);

CREATE POLICY "Admin can manage blog_tags"
  ON blog_tags FOR ALL USING (auth.role() = 'authenticated');

-- ── 12. Auto-create profile on signup ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, full_name)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 13. Seed default categories ──────────────────────────────────
INSERT INTO categories (name, slug, description, color) VALUES
  ('Cybersecurity', 'cybersecurity', 'Security concepts, tools, and techniques', '#dc2626'),
  ('Information Assurance', 'information-assurance', 'IA activities and learning', '#7c3aed'),
  ('Software Development', 'software-development', 'Projects and coding exercises', '#2563eb'),
  ('Programming', 'programming', 'Tutorials and programming concepts', '#059669'),
  ('Reflections', 'reflections', 'School and personal reflections', '#d97706'),
  ('Learning Notes', 'learning-notes', 'Notes and summaries', '#0891b2')
ON CONFLICT (slug) DO NOTHING;

-- ── 14. Storage Buckets ──────────────────────────────────────────
-- Run these in the Supabase Dashboard → Storage → Create Bucket
-- OR run via SQL (requires pg_storage extension):
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-covers', 'blog-covers', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
--
-- Then add Storage Policies:
-- Allow public read on both buckets
-- Allow authenticated users to upload/delete

-- ── Done! ────────────────────────────────────────────────────────
-- Your database is ready. Now:
-- 1. Go to Supabase → Storage → Create two public buckets: 'blog-covers' and 'avatars'
-- 2. Set storage policies to allow public reads
-- 3. Deploy your app and log in to create your profile
