import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://uislatovwezvcthvbnxh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TPEILuJN5h-yDasS4Me3ZQ__vdacf9A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'allieza@notes.com',
    password: 'segales',
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    process.exit(1);
  }

  console.log('Logged in as:', authData.user.id);

  // Read the content
  const contentPath = path.join(__dirname, 'blog_content.md');
  const content = fs.readFileSync(contentPath, 'utf8');

  // Find category
  let { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'cybersecurity')
    .single();

  if (!category) {
    console.log('Category not found. The SQL script probably created it though.');
    process.exit(1);
  }

  console.log('Category ID:', category.id);

  const title = 'When Fast Moves Break Privacy: A Case Study on Secure Design Principles';
  const slug = 'when-fast-moves-break-privacy-case-study';
  const excerpt = 'An analysis of a university project that prioritized speed over security, leading to a major privacy breach. We explore what went wrong and how to fix it using Secure Design Principles.';
  
  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .insert({
      author_id: authData.user.id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url: '/images/blogs/cybersec_cover.jpg',
      category_id: category.id,
      is_published: true,
      is_featured: true,
      reading_time_minutes: 8,
      published_at: new Date().toISOString()
    })
    .select()
    .single();

  if (blogError) {
    console.error('Blog insert error:', blogError);
    process.exit(1);
  }

  console.log('Blog inserted successfully with ID:', blog.id);
}

main();
