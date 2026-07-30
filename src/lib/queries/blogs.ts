import { createClient } from '@/lib/supabase/server';
import type { BlogWithRelations, PaginatedBlogs } from '@/types';

const PAGE_SIZE = 9;

/** Fetch published blogs with pagination, search, category and tag filters */
export async function getBlogs({
  page = 1,
  search = '',
  category = '',
  tag = '',
}: {
  page?: number;
  search?: string;
  category?: string;
  tag?: string;
} = {}): Promise<PaginatedBlogs> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('blogs')
    .select(
      `
      *,
      category:categories(*),
      author:profiles(*),
      blog_tags(tag:tags(*))
    `,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (category) {
    query = query.eq('categories.slug', category);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  // Flatten blog_tags to tags array
  const blogs = (data || []).map((blog) => ({
    ...blog,
    tags: blog.blog_tags?.map((bt: { tag: unknown }) => bt.tag) ?? [],
  })) as BlogWithRelations[];

  // Filter by tag if provided (post-query filtering since supabase doesn't support deep junction filtering easily)
  const filtered = tag
    ? blogs.filter((b) => b.tags.some((t) => t.slug === tag))
    : blogs;

  return {
    blogs: filtered,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  };
}

/** Fetch a single published blog by slug */
export async function getBlogBySlug(slug: string): Promise<BlogWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blogs')
    .select(
      `
      *,
      category:categories(*),
      author:profiles(*),
      blog_tags(tag:tags(*))
    `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    tags: data.blog_tags?.map((bt: { tag: unknown }) => bt.tag) ?? [],
  } as BlogWithRelations;
}

/** Fetch all blogs for admin (includes drafts) */
export async function getAllBlogsAdmin(): Promise<BlogWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blogs')
    .select(
      `
      *,
      category:categories(*),
      author:profiles(*),
      blog_tags(tag:tags(*))
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((blog) => ({
    ...blog,
    tags: blog.blog_tags?.map((bt: { tag: unknown }) => bt.tag) ?? [],
  })) as BlogWithRelations[];
}

/** Fetch a blog by ID for admin editing */
export async function getBlogByIdAdmin(id: string): Promise<BlogWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blogs')
    .select(
      `
      *,
      category:categories(*),
      author:profiles(*),
      blog_tags(tag:tags(*))
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    tags: data.blog_tags?.map((bt: { tag: unknown }) => bt.tag) ?? [],
  } as BlogWithRelations;
}

/** Fetch related blogs by category, excluding current */
export async function getRelatedBlogs(
  categoryId: string | null,
  excludeSlug: string,
  limit = 3
): Promise<BlogWithRelations[]> {
  if (!categoryId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blogs')
    .select(
      `
      *,
      category:categories(*),
      author:profiles(*),
      blog_tags(tag:tags(*))
    `
    )
    .eq('is_published', true)
    .eq('category_id', categoryId)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data || []).map((blog) => ({
    ...blog,
    tags: blog.blog_tags?.map((bt: { tag: unknown }) => bt.tag) ?? [],
  })) as BlogWithRelations[];
}

/** Get dashboard stats */
export async function getBlogStats() {
  const supabase = await createClient();

  const [{ count: total }, { count: published }, { count: drafts }, { count: featured }] =
    await Promise.all([
      supabase.from('blogs').select('*', { count: 'exact', head: true }),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('is_published', false),
      supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    ]);

  return {
    total: total ?? 0,
    published: published ?? 0,
    drafts: drafts ?? 0,
    featured: featured ?? 0,
  };
}
