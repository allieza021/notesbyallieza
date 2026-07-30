import Link from 'next/link';
import { Search } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { getBlogs } from '@/lib/queries/blogs';
import { getCategories } from '@/lib/queries/categories';
import type { Metadata } from 'next';
import type { SearchParams } from '@/types';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Browse all blog posts — cybersecurity, software development, programming, and more.',
};

export const revalidate = 60;

interface BlogPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.q || '';
  const category = params.category || '';
  const tag = params.tag || '';

  const [{ blogs, total, totalPages }, categories] = await Promise.all([
    getBlogs({ page, search, category, tag }),
    getCategories(),
  ]);

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const p = { page: String(page), q: search, category, tag, ...overrides };
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(p).filter(([, v]) => v && v !== '1'))
    );
    return `/blog${qs.toString() ? '?' + qs.toString() : ''}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-muted/40 to-background border-b border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <h1 className="font-serif font-black text-5xl text-foreground mb-3">Blog</h1>
          <p className="text-muted-foreground text-lg">
            {total} {total === 1 ? 'post' : 'posts'} on cybersecurity, development, and learning
          </p>

          {/* Search */}
          <form action="/blog" method="GET" className="mt-6 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={search}
                placeholder="Search posts..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                id="blog-search-input"
              />
              {category && <input type="hidden" name="category" value={category} />}
            </div>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl py-12">
        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href={buildUrl({ category: '', page: '1' })}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                !category
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              All Posts
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.slug, page: '1' })}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  category === cat.slug
                    ? 'text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                style={
                  category === cat.slug
                    ? { backgroundColor: cat.color || '#4f46e5' }
                    : {}
                }
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Active filters display */}
        {(search || tag) && (
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <span>Filtering by:</span>
            {search && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
                &ldquo;{search}&rdquo;
              </span>
            )}
            {tag && (
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
                #{tag}
              </span>
            )}
            <Link href="/blog" className="text-primary hover:underline ml-1">
              Clear
            </Link>
          </div>
        )}

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, i) => (
                <div
                  key={blog.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link
                    href={buildUrl({ page: String(page - 1) })}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                  >
                    ← Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                      p === page
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'border border-border hover:bg-accent'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={buildUrl({ page: String(page + 1) })}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
              No posts found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try a different search term or category.
            </p>
            <Link
              href="/blog"
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              Clear all filters →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
