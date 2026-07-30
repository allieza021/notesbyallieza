import fs from 'fs';

const content = fs.readFileSync('blog_content.md', 'utf8').replace(/'/g, "''").replace(/’/g, "''");

const sql = `
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

NOTIFY pgrst, 'reload schema';

-- 3. Create category
INSERT INTO categories (name, slug, description, color)
VALUES ('Cybersecurity', 'cybersecurity', 'Posts about cybersecurity and information assurance.', '#10b981')
ON CONFLICT (slug) DO NOTHING;

-- 4. Publish the blog post
INSERT INTO blogs (author_id, title, slug, excerpt, content, category_id, is_published, is_featured, reading_time_minutes, published_at, cover_image_url)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'When Fast Moves Break Privacy: A Case Study on Secure Design Principles',
  'when-fast-moves-break-privacy-case-study',
  'An analysis of a university project that prioritized speed over security, leading to a major privacy breach. We explore what went wrong and how to fix it using Secure Design Principles.',
  '${content}',
  (SELECT id FROM categories WHERE slug = 'cybersecurity' LIMIT 1),
  true,
  true,
  8,
  NOW(),
  '/images/blogs/cybersec_cover.jpg'
);
`;

fs.writeFileSync('publish_blog.sql', sql);
