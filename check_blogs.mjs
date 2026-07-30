import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uislatovwezvcthvbnxh.supabase.co';
const supabaseKey = 'sb_publishable_TPEILuJN5h-yDasS4Me3ZQ__vdacf9A'; // anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogs() {
  const { data, count, error } = await supabase
    .from('blogs')
    .select(`
      *,
      category:categories(*),
      author:profiles(*),
      blog_tags(tag:tags(*))
    `, { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs with anon key:', error);
  } else {
    console.log('Blogs with anon key:', JSON.stringify(data, null, 2));
  }
}

checkBlogs();
