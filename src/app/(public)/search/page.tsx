import { Search } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import { getBlogs } from '@/lib/queries/blogs';
import type { Metadata } from 'next';
import type { SearchParams } from '@/types';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search posts by title, category, or tag.',
};

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';
  const tag = params.tag || '';

  const { blogs, total } = query || category || tag
    ? await getBlogs({ search: query, category, tag, page: 1 })
    : { blogs: [], total: 0 };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="font-black text-4xl text-foreground mb-3">Search</h1>

        {/* Search Form */}
        <form action="/search" method="GET" className="mb-10 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              name="q"
              id="search-input"
              defaultValue={query}
              placeholder="Search by title, topic, or tag..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
              autoFocus
            />
          </div>
        </form>

        {/* Results */}
        {query || category || tag ? (
          <>
            <p className="text-muted-foreground mb-6 text-sm">
              {total} {total === 1 ? 'result' : 'results'} for{' '}
              {query && <strong className="text-foreground">&ldquo;{query}&rdquo;</strong>}
              {category && <strong className="text-foreground"> in #{category}</strong>}
              {tag && <strong className="text-foreground"> tagged #{tag}</strong>}
            </p>

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">Try different keywords or browse all posts.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Enter a search term above to find posts.</p>
          </div>
        )}
      </div>
    </div>
  );
}

