import BlogForm from '@/components/admin/BlogForm';
import { getCategories } from '@/lib/queries/categories';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'New Post' };

export default async function NewBlogPage() {
  const [categories, supabase] = await Promise.all([
    getCategories(),
    createClient(),
  ]);

  const { data: tagsData } = await supabase.from('tags').select('*').order('name');
  const allTags = tagsData || [];

  return <BlogForm mode="create" categories={categories} allTags={allTags} />;
}
