import { FileText, BookOpen, PenSquare, Star, PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getBlogStats, getAllBlogsAdmin } from '@/lib/queries/blogs';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const statCards = [
  { label: 'Total Posts', key: 'total' as const, icon: FileText, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { label: 'Published', key: 'published' as const, icon: BookOpen, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { label: 'Drafts', key: 'drafts' as const, icon: PenSquare, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { label: 'Featured', key: 'featured' as const, icon: Star, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
];

export default async function DashboardPage() {
  const [stats, allBlogs] = await Promise.all([
    getBlogStats(),
    getAllBlogsAdmin(),
  ]);

  const recentBlogs = allBlogs.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Allieza!</p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <PlusCircle className="w-4 h-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, key, icon: Icon, color }) => (
          <div
            key={key}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats[key]}</div>
            <div className="text-sm text-muted-foreground font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="font-bold text-lg text-foreground">Recent Posts</h2>
          <Link
            href="/admin/blogs"
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBlogs.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-bold text-lg text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-5 text-sm">Create your first blog post to get started.</p>
            <Button asChild size="sm">
              <Link href="/admin/blogs/new">
                <PlusCircle className="w-4 h-4" />
                Create First Post
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBlogs.map((blog) => (
              <div key={blog.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 md:px-6 py-4 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{blog.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(blog.created_at)}
                    {blog.category && (
                      <span className="ml-2 font-medium text-primary">· {blog.category.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${
                      blog.is_published
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    href={`/admin/blogs/${blog.id}/edit`}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-4 flex-shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
