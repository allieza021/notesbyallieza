-- 1. Reload schema cache just in case
NOTIFY pgrst, 'reload schema';

-- 2. Ensure columns exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#4f46e5';

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 5;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 3. Reload cache again just to be safe
NOTIFY pgrst, 'reload schema';

-- 4. Create category (no messy text here, just simple SQL)
INSERT INTO categories (name, slug, description, color)
VALUES ('Cybersecurity', 'cybersecurity', 'Posts about cybersecurity.', '#10b981')
ON CONFLICT (slug) DO NOTHING;
