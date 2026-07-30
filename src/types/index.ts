// ============================================================
// Notes by Allieza — Shared TypeScript Types
// ============================================================

export interface Profile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  github_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Blog {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  reading_time_minutes: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | null;
  tags?: Tag[];
  author?: Profile | null;
}

export interface BlogWithRelations extends Blog {
  category: Category | null;
  tags: Tag[];
  author: Profile | null;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
}

export interface SearchParams {
  q?: string;
  category?: string;
  tag?: string;
  page?: string;
}

export interface PaginatedBlogs {
  blogs: BlogWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
