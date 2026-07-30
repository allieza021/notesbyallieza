-- 1. Reload the schema cache so Supabase recognizes the new columns
NOTIFY pgrst, 'reload schema';

-- 2. Add any missing columns to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#4f46e5';

-- 3. Add any missing columns to blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 5;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Reload cache again just to be safe
NOTIFY pgrst, 'reload schema';
