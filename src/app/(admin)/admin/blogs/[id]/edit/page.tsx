import { notFound } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import { getBlogByIdAdmin } from '@/lib/queries/blogs';
import { getCategories } from '@/lib/queries/categories';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditBlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogByIdAdmin(id);
  return { title: blog ? `Edit: ${blog.title}` : 'Edit Post' };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  const [blog, categories, supabase] = await Promise.all([
    getBlogByIdAdmin(id),
    getCategories(),
    createClient(),
  ]);

  if (!blog) notFound();

  const { data: tagsData } = await supabase.from('tags').select('*').order('name');
  const allTags = tagsData || [];

  return <BlogForm mode="edit" blog={blog} categories={categories} allTags={allTags} />;
}
