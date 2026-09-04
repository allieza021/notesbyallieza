import { getAllBlogsAdmin } from '@/lib/queries/blogs';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { PlusCircle, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ManageBlogsClient from './ManageBlogsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Manage Blogs' };
export const dynamic = 'force-dynamic';

export default async function ManageBlogsPage() {
  const blogs = await getAllBlogsAdmin();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-3xl text-foreground">Manage Posts</h1>
          <p className="text-muted-foreground mt-1 text-sm">{blogs.length} total posts</p>
        </div>
        <Button asChild>
          <Link href="/admin/blogs/new">
            <PlusCircle className="w-4 h-4" />
            New Post
          </Link>
        </Button>
      </div>

      <ManageBlogsClient initialBlogs={blogs} />
    </div>
  );
}
