'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Eye, EyeOff, Trash2, ExternalLink, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatShortDate } from '@/lib/utils';
import type { BlogWithRelations } from '@/types';

interface ManageBlogsClientProps {
  initialBlogs: BlogWithRelations[];
}

export default function ManageBlogsClient({ initialBlogs }: ManageBlogsClientProps) {
  const router = useRouter();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const togglePublish = async (blog: BlogWithRelations) => {
    setLoading(blog.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('blogs')
        .update({
          is_published: !blog.is_published,
          published_at: !blog.is_published ? new Date().toISOString() : null,
        })
        .eq('id', blog.id);
      if (error) throw error;
      setBlogs((prev) =>
        prev.map((b) => b.id === blog.id ? { ...b, is_published: !b.is_published } : b)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const deleteBlog = async (blog: BlogWithRelations) => {
    if (!confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setLoading(blog.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('blogs').delete().eq('id', blog.id);
      if (error) throw error;
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          id="admin-blog-search"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No posts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Title</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((blog) => (
                  <tr key={blog.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-sm text-foreground truncate">{blog.title}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate mt-0.5">/blog/{blog.slug}</div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {blog.category ? (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: blog.category.color || '#4f46e5' }}
                        >
                          {blog.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {formatShortDate(blog.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          blog.is_published
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* View live */}
                        {blog.is_published && (
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title="View live"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {/* Publish toggle */}
                        <button
                          onClick={() => togglePublish(blog)}
                          disabled={loading === blog.id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          title={blog.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {blog.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {/* Edit */}
                        <Link
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => deleteBlog(blog)}
                          disabled={loading === blog.id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
